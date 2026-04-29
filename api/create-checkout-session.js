const Stripe = require('stripe');

// Stripe Price IDs — set these as Vercel environment variables.
// Find each price ID in your Stripe dashboard under the product's Pricing tab.
const PRICE_IDS = {
  // Course — one-time $79 payment ("Photoreal Influencer Blueprint: Flux — WAN Video (ComfyUI)")
  course: process.env.STRIPE_PRICE_COURSE,

  // Z-Image Turbo LoRA ($49 exclusive / ~$24 open)
  lora_exclusive: process.env.STRIPE_PRICE_LORA_EXCLUSIVE,
  lora_open:      process.env.STRIPE_PRICE_LORA_OPEN,

  // Flux Fine-tune Model ($99 exclusive / ~$49 open)
  model_exclusive: process.env.STRIPE_PRICE_FLUX_EXCLUSIVE,
  model_open:      process.env.STRIPE_PRICE_FLUX_OPEN,

  // WAN Video LoRA ($149 exclusive / ~$74 open)
  wan_exclusive: process.env.STRIPE_PRICE_WAN_EXCLUSIVE,
  wan_open:      process.env.STRIPE_PRICE_WAN_OPEN,

  // Add-ons
  anatomy_lora:    process.env.STRIPE_PRICE_ANATOMY_LORA, // $49 — NSFW Workflow + Anatomy LoRA
  runpod_standard: process.env.STRIPE_PRICE_RUNPOD_30,    // $30 — RunPod Setup (Options 1–3)
  runpod_complete: process.env.STRIPE_PRICE_RUNPOD_15,    // $15 — RunPod Setup (Option 4, discounted)
};

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  if (!process.env.STRIPE_SECRET_KEY) {
    return res.status(500).json({ error: 'Stripe is not configured. Add STRIPE_SECRET_KEY to your environment variables.' });
  }

  const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

  const baseUrl = process.env.SITE_URL
    || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null)
    || req.headers.origin
    || 'http://localhost:3000';

  try {
    const { email, name, promoCodeId, cart } = req.body || {};
    const isPackage = cart?.type === 'package';
    const isComplete = cart?.productId === 'complete';

    let line_items = [];

    if (isPackage) {
      if (isComplete) {
        // ── Option 4: Complete Package ──
        // Use price_data so "Anatomy LoRA included" appears in the Stripe checkout description.
        // Anatomy LoRA is NOT added as a separate line item — it is bundled free.
        const unitAmount = cart.licenseType === 'open' ? 15000 : 29900; // $150 open / $299 exclusive
        line_items.push({
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Complete Package — ${cart.licenseType === 'open' ? 'Open License' : 'Exclusive License'}`,
              description: 'Flux + Z-Image LoRA + WAN LoRA + workflow + custom nodes. Anatomy LoRA included.',
            },
            unit_amount: unitAmount,
          },
          quantity: 1,
        });

        // RunPod for Option 4 — $15 discounted price
        if (cart.runpodEnabled) {
          const runpodId = PRICE_IDS.runpod_complete;
          if (!runpodId) throw new Error('Missing Vercel env var: STRIPE_PRICE_RUNPOD_15');
          line_items.push({ price: runpodId, quantity: 1 });
        }

      } else {
        // ── Options 1–3: Z-Image LoRA, Flux Model, WAN Video ──
        const priceKey = `${cart.productId}_${cart.licenseType}`;
        const priceId = PRICE_IDS[priceKey];
        if (!priceId) throw new Error(`Missing Vercel env var for: ${priceKey.toUpperCase().replace('_', '_PRICE_')}`);
        line_items.push({ price: priceId, quantity: 1 });

        // RunPod — standard $30 price
        if (cart.runpodEnabled) {
          const runpodId = PRICE_IDS.runpod_standard;
          if (!runpodId) throw new Error('Missing Vercel env var: STRIPE_PRICE_RUNPOD_30');
          line_items.push({ price: runpodId, quantity: 1 });
        }

        // Anatomy LoRA — add at regular $49 price only if selected
        if (cart.nsfwEnabled) {
          const anatomyId = PRICE_IDS.anatomy_lora;
          if (!anatomyId) throw new Error('Missing Vercel env var: STRIPE_PRICE_ANATOMY_LORA');
          line_items.push({ price: anatomyId, quantity: 1 });
        }
      }

    } else {
      // ── Course — one-time $79 payment ──
      if (PRICE_IDS.course) {
        line_items = [{ price: PRICE_IDS.course, quantity: 1 }];
      } else {
        // Fallback if STRIPE_PRICE_COURSE env var is not set yet
        line_items = [{
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Photoreal Influencer Blueprint',
              description: 'Flux · SDXL · WAN Video · ComfyUI — 4 new lessons added every month',
            },
            unit_amount: 7900, // $79.00
          },
          quantity: 1,
        }];
      }
    }

    const sessionParams = {
      mode: 'payment',
      payment_method_types: ['card'],
      line_items,
      success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${baseUrl}/`,
    };

    if (promoCodeId) {
      sessionParams.discounts = [{ promotion_code: promoCodeId }];
    } else {
      sessionParams.allow_promotion_codes = true;
    }

    if (email) sessionParams.customer_email = email;

    const session = await stripe.checkout.sessions.create(sessionParams);
    res.json({ url: session.url });
  } catch (err) {
    console.error('Stripe error:', err);
    res.status(500).json({ error: err.message });
  }
};
