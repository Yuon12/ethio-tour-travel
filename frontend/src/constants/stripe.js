/* ── Frontend: src/constants/stripe.js ───────────────────────────────────────
files[f"{src}/constants/stripe.js"] = '''/**
 * Stripe configuration.
 * Set VITE_STRIPE_PUBLISHABLE_KEY in your .env file.
 * Get the key from: https://dashboard.stripe.com/apikeys
 */

export const STRIPE_PUBLISHABLE_KEY =
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "pk_test_placeholder";