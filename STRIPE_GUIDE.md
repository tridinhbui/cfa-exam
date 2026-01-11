# Stripe Integration Guide

This guide explains how to set up the Stripe payment integration for MentisAI.

## 1. Prerequisites

Ensure you have a Stripe account created at [stripe.com](https://stripe.com).

## 2. Environment Variables

Create or update your `.env` or `.env.local` file with the following keys:

```env
# Stripe Secret Key (from Dashboard -> Developers -> API keys)
STRIPE_SECRET_KEY=sk_test_...

# Stripe Publishable Key (optional, for client-side elements if needed)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Stripe Webhook Secret (from Dashboard -> Developers -> Webhooks)
# You get this after running the webhook CLI or setting up a webhook endpoint.
STRIPE_WEBHOOK_SECRET=whsec_...

# Return URL base
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 3. Stripe Products

You need to create the following products/prices in your Stripe Dashboard and map them in `src/app/api/stripe/checkout/route.ts`.

| Plan | Type | Price | Interval |
| :--- | :--- | :--- | :--- |
| 1 Month | Recurring | $3.99 | Monthly |
| 6 Months | Recurring | $37.99 | Every 6 months |
| 1 Year | Recurring | $69.99 | Yearly |
| Lifetime | One-time | $119.99 | N/A |

**Update `PLANS` object in `src/app/api/stripe/checkout/route.ts` with your actual price IDs (`price_...`).**

## 4. Webhook Setup (Crucial for activating subscriptions)

You need to listen for the `checkout.session.completed` event to update the user's subscription in the database.

1.  **Local Testing**:
    *   Install Stripe CLI.
    *   Run: `stripe listen --forward-to localhost:3000/api/stripe/webhook`
    *   Copy the webhook signing secret output (`whsec_...`) to your `.env` file.

2.  **Production**:
    *   Add an endpoint in Stripe Dashboard -> Webhooks pointing to `https://your-domain.com/api/stripe/webhook`.
    *   Select events: `checkout.session.completed`, `invoice.payment_succeeded`.

## 5. Testing

1.  Go to the Pricing page.
2.  Click a plan.
3.  You should be redirected to Stripe Checkout.
4.  Complete payment (use test card `4242 4242 ...`).
5.  Check your database; the User's `subscription` should be updated to `PRO`.
