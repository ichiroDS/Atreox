const Stripe = require('stripe');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  if (!process.env.STRIPE_SECRET_KEY) {
    return res.status(500).json({ error: 'Stripe is not configured.' });
  }

  const { code } = req.body || {};
  if (!code || !code.trim()) {
    return res.status(400).json({ valid: false, error: 'Please enter a discount code.' });
  }

  const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

  try {
    const results = await stripe.promotionCodes.list({
      code: code.trim().toUpperCase(),
      active: true,
      limit: 1,
    });

    if (!results.data.length) {
      return res.json({ valid: false, error: 'Invalid or expired discount code.' });
    }

    const promoCode = results.data[0];
    const coupon = promoCode.coupon;

    res.json({
      valid: true,
      promoCodeId: promoCode.id,
      coupon: {
        name: coupon.name || code.trim().toUpperCase(),
        percentOff: coupon.percent_off || null,
        amountOff: coupon.amount_off || null,
      },
    });
  } catch (err) {
    console.error('Stripe promo error:', err);
    res.status(500).json({ valid: false, error: 'Could not validate code. Please try again.' });
  }
};
