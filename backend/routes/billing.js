// backend/routes/billing.js
// Stripe Billing & Checkout Routes for FableVoice Audio Studio

import express from 'express';
import Stripe from 'stripe';

const router = express.Router();

function getStripeClient() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey || secretKey.trim() === '') {
    return null;
  }
  return new Stripe(secretKey.trim());
}

// Membership Plans Definition
const MEMBERSHIP_PLANS = {
  free: {
    id: 'free',
    name: 'Free Starter',
    price: 0,
    interval: 'forever',
    description: 'Unlimited access to the 30+ language Free Neural Engine',
    features: [
      'Universal Free Neural Engine (30+ Languages)',
      'Free Neural Bidirectional Translation',
      'Free Live Microphone Dictation',
      'Standard MP3 Downloads',
      'Community Support'
    ]
  },
  creator_pro: {
    id: 'creator_pro',
    name: 'Creator Pro',
    price: 15,
    interval: 'month',
    stripePriceId: process.env.STRIPE_PRICE_ID_CREATOR_PRO || 'price_creator_pro_monthly',
    description: 'ElevenLabs Flash HD audio with Exact Time Setter & Music Mixing',
    features: [
      'Everything in Free Starter',
      'ElevenLabs Flash v2.5 HD Voiceover Synthesis',
      'Interactive Exact Time Setter & Story Calibrator',
      'Curated Ambient Soundtracks & Music Ducking',
      '15-Minute Chaptered Bedtime Stories & Video Scripts',
      'Commercial Broadcast License'
    ]
  },
  studio_master: {
    id: 'studio_master',
    name: 'Studio Master',
    price: 39,
    interval: 'month',
    stripePriceId: process.env.STRIPE_PRICE_ID_STUDIO_MASTER || 'price_studio_master_monthly',
    description: 'Full studio power with persistent voice cloning & 30-min master audio',
    features: [
      'Everything in Creator Pro',
      'Custom Voice Cloning (Persistent Bucket Storage)',
      '30-Minute & 60-Minute Long-Form Audio Productions',
      'Multi-track Stem Exports (Voice + Music + Master)',
      'Priority Audio Rendering Queue',
      'Dedicated 24/7 VIP Support'
    ]
  }
};

// GET /api/billing/plans
router.get('/plans', (req, res) => {
  res.json({
    plans: MEMBERSHIP_PLANS,
    stripeEnabled: !!getStripeClient()
  });
});

// POST /api/billing/create-checkout-session
router.post('/create-checkout-session', async (req, res) => {
  try {
    const { planId, userEmail, userId, returnUrl } = req.body;
    const plan = MEMBERSHIP_PLANS[planId];

    if (!plan) {
      return res.status(400).json({ error: 'Invalid plan selected' });
    }

    if (plan.price === 0) {
      return res.json({ success: true, url: '/studio?plan=free' });
    }

    const stripe = getStripeClient();
    const domain = returnUrl || process.env.PUBLIC_URL || 'https://voice-cloner-story-production.up.railway.app';

    // If Stripe is configured in environment
    if (stripe) {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'subscription',
        customer_email: userEmail || undefined,
        client_reference_id: userId || undefined,
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: `FableVoice Studio - ${plan.name}`,
                description: plan.description
              },
              unit_amount: plan.price * 100,
              recurring: {
                interval: 'month'
              }
            },
            quantity: 1
          }
        ],
        success_url: `${domain}?checkout=success&plan=${planId}&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${domain}?checkout=cancelled`
      });

      return res.json({ success: true, url: session.url });
    }

    // Mock / Demo mode when Stripe keys are being configured
    console.log(`[Billing] Stripe keys not set, simulating instant checkout for ${plan.name}`);
    res.json({
      success: true,
      simulated: true,
      url: `/?checkout=success&plan=${planId}`,
      message: `Simulated checkout for ${plan.name} ($${plan.price}/mo). Set STRIPE_SECRET_KEY in Railway to process live payments.`
    });
  } catch (err) {
    console.error('[Billing] Stripe checkout session error:', err);
    res.status(500).json({ error: err.message || 'Could not create checkout session' });
  }
});

// POST /api/billing/webhook
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const stripe = getStripeClient();
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripe || !webhookSecret) {
    return res.json({ received: true, note: 'Stripe webhook listener active' });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error('[Billing] Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      console.log(`[Billing] Payment succeeded for customer: ${session.customer_email}, Plan: ${session.client_reference_id}`);
      break;
    case 'customer.subscription.deleted':
      console.log('[Billing] Subscription cancelled');
      break;
    default:
      console.log(`[Billing] Unhandled event type: ${event.type}`);
  }

  res.json({ received: true });
});

export default router;
