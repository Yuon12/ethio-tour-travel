/**
 * Payment API — Stripe + Chapa
 * ==============================
 * Stripe: card payments (international) — defaults to USD, can pass "etb"
 *         if you've confirmed ETB is enabled as a presentment currency on
 *         your Stripe account.
 * Chapa:  unified Ethiopian gateway — Telebirr, CBE Birr, Amole, cards.
 *         Defaults to ETB (its native currency — most Chapa accounts don't
 *         have USD payment methods enabled, which is what was crashing
 *         checkout before). Pass "USD" only if you've verified it's enabled.
 */
import axiosClient from "./axiosClient";

export const paymentApi = {
  // ── STRIPE ────────────────────────────────────────────────────────────
  /** Step 1: get client_secret for Stripe.js card confirmation */
  stripeCreateIntent: (booking_reference, currency = "usd") =>
    axiosClient.post("/bookings/payment/stripe/create-intent/", { booking_reference, currency }),

  /** Step 2: backend verifies PaymentIntent after Stripe.js confirms card */
  stripeConfirm: (payment_intent_id, booking_reference) =>
    axiosClient.post("/bookings/payment/stripe/confirm/", {
      payment_intent_id,
      booking_reference,
    }),

  // ── CHAPA ─────────────────────────────────────────────────────────────
  /** Step 1: initialize → receive checkout_url → redirect user there */
  chapaInitialize: (booking_reference, currency = "ETB") =>
    axiosClient.post("/bookings/payment/chapa/initialize/", { booking_reference, currency }),

  /** Step 2: verify tx_ref after user returns from Chapa checkout page */
  chapaVerify: (tx_ref) =>
    axiosClient.get(`/bookings/payment/chapa/verify/${tx_ref}/`),

  // ── SHARED ────────────────────────────────────────────────────────────
  /** Current USD→ETB rate, optionally with a specific booking's ETB total */
  getExchangeRate: (booking_reference) =>
    axiosClient.get("/bookings/payment/exchange-rate/", {
      params: booking_reference ? { booking_reference } : {},
    }),
};

export default paymentApi;