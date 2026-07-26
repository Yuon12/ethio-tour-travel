/**
 * API Constants
 * =============
 * Central place for all API base URLs and endpoint paths.
 */

export const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

export const ENDPOINTS = {
  AUTH: {
    REGISTER:        `${BASE_URL}/auth/register/`,
    LOGIN:           `${BASE_URL}/auth/token/`,
    REFRESH:         `${BASE_URL}/auth/token/refresh/`,
    PROFILE:         `${BASE_URL}/auth/profile/`,
    CHANGE_PASSWORD: `${BASE_URL}/auth/change-password/`,

    // Add these lines:
    FORGOT_PASSWORD: "/auth/forgot-password/",
    RESET_PASSWORD: "/auth/reset-password/", // Trailing slash is handled dynamically
  },
  NEWSLETTER: {
    SUBSCRIBE: `${BASE_URL}/auth/newsletter/subscribe/`,
    UNSUBSCRIBE: `${BASE_URL}/auth/newsletter/unsubscribe/`,
  },

  DESTINATIONS: {
    LIST:     `${BASE_URL}/destinations/`,
    FEATURED: `${BASE_URL}/destinations/featured/`,
    REGIONS:  `${BASE_URL}/destinations/regions/`,
    DETAIL:   (slug) => `${BASE_URL}/destinations/${slug}/`,
  },
  PACKAGES: {
    LIST:         `${BASE_URL}/packages/`,
    FEATURED:     `${BASE_URL}/packages/featured/`,
    DETAIL:       (slug) => `${BASE_URL}/packages/${slug}/`,
    AVAILABILITY: (slug) => `${BASE_URL}/packages/${slug}/availability/`,
  },
  BOOKINGS: {
    LIST_CREATE:     `${BASE_URL}/bookings/`,
    DETAIL:          (ref)  => `${BASE_URL}/bookings/${ref}/`,
    VALIDATE_COUPON: `${BASE_URL}/bookings/validate-coupon/`,
  },
  PAYMENTS: {
    STRIPE_INTENT:  `${BASE_URL}/bookings/payment/stripe/create-intent/`,
    STRIPE_CONFIRM: `${BASE_URL}/bookings/payment/stripe/confirm/`,
    CHAPA_INIT:     `${BASE_URL}/bookings/payment/chapa/initialize/`,
    CHAPA_VERIFY:   (txRef) => `${BASE_URL}/bookings/payment/chapa/verify/${txRef}/`,
    EXCHANGE_RATE:  `${BASE_URL}/bookings/payment/exchange-rate/`,
  },
  BLOG: {
    POSTS:      `${BASE_URL}/blog/`,
    DETAIL:     (slug) => `${BASE_URL}/blog/${slug}/`,
    COMMENT:    (slug) => `${BASE_URL}/blog/${slug}/comment/`,
    CATEGORIES: `${BASE_URL}/blog/categories/`,
    TAGS:       `${BASE_URL}/blog/tags/`,
  },
  GALLERY: {
    ALBUMS:   `${BASE_URL}/gallery/`,
    FEATURED: `${BASE_URL}/gallery/featured/`,
    DETAIL:   (slug) => `${BASE_URL}/gallery/${slug}/`,
  },
  REVIEWS: {
    LIST_CREATE:  `${BASE_URL}/reviews/`,
    TESTIMONIALS: `${BASE_URL}/reviews/testimonials/`,
  },
};