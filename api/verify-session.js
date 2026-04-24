const Stripe = require('stripe');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { session_id } = req.query;
  if (!session_id) return res.status(400).json({ ok: false, error: 'Missing session_id' });

  if (!process.env.STRIPE_SECRET_KEY) {
    return res.status(500).json({ ok: false, error: 'Stripe not configured' });
  }

  const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

  try {
    const session = await stripe.checkout.sessions.retrieve(session_id, {
      expand: ['subscription'],
    });

    const subStatus = session.subscription?.status;
    const paid =
      session.payment_status === 'paid' ||
      session.status === 'complete' ||
      subStatus === 'active' ||
      subStatus === 'trialing';

    if (!paid) return res.json({ ok: false, error: 'Payment not complete' });

    res.json({
      ok: true,
      email: session.customer_details?.email || null,
      name:  session.customer_details?.name  || null,
      subscription_id: typeof session.subscription === 'string'
        ? session.subscription
        : session.subscription?.id || null,
    });
  } catch (err) {
    console.error('Verify error:', err);
    res.status(400).json({ ok: false, error: 'Invalid or expired session' });
  }
};
