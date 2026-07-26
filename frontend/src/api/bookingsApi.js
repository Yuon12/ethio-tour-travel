/**
 * Bookings API
 * ============
 * All requests get the JWT Bearer header and silent token-refresh
 * behaviour automatically from axiosClient's interceptors.
 */
import axiosClient from "./axiosClient";

export const bookingsApi = {
  /** Create a new booking. POST /bookings/ */
  createBooking: (payload) => axiosClient.post("/bookings/", payload),

  /**
   * List the current user's bookings. GET /bookings/
   */
  listBookings: () => axiosClient.get("/bookings/"),

  /**
   * Alias for listBookings to resolve the method name mismatch in Dashboard.
   * Fetches the current user's bookings list. GET /bookings/
   */
  getMyBookings: () => axiosClient.get("/bookings/"),

  /**
   * Fetch a single booking by reference. GET /bookings/{ref}/
   * Used by BookingDetailPage (pay-later flow) and BookingSuccessPage
   * (to confirm real payment status instead of assuming success).
   */
  getBooking: (reference) => axiosClient.get(`/bookings/${reference}/`),

  /** Validate a coupon code against a subtotal. POST /bookings/validate-coupon/ */
  validateCoupon: (code, subtotal) =>
    axiosClient.post("/bookings/validate-coupon/", { code, subtotal }),
};

export default bookingsApi;