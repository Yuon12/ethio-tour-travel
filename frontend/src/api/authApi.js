import axiosClient from "./axiosClient";
import { ENDPOINTS } from "../constants/api";

export const authApi = {
  register:       (data)           => axiosClient.post(ENDPOINTS.AUTH.REGISTER, data),
  login:          (email, password) => axiosClient.post(ENDPOINTS.AUTH.LOGIN, { email, password }),
  getProfile:     ()               => axiosClient.get(ENDPOINTS.AUTH.PROFILE),
  updateProfile:  (data)           => axiosClient.patch(ENDPOINTS.AUTH.PROFILE, data),
  changePassword: (data)           => axiosClient.post(ENDPOINTS.AUTH.CHANGE_PASSWORD, data),



  // ── Password Reset Additions ───────────────────────────────────────
  
  /**
   * Request a password reset link. 
   * Sends a secure email link if the email is registered.
   * POST /api/v1/auth/forgot-password/
   */
  forgotPassword: (email) => 
    axiosClient.post(ENDPOINTS.AUTH.FORGOT_PASSWORD, { email }),

  /**
   * Pre-validate the secure reset token before displaying the form.
   * GET /api/v1/auth/reset-password/{token}/
   */
  validateResetToken: (token) => 
    axiosClient.get(`${ENDPOINTS.AUTH.RESET_PASSWORD}${token}/`),

  /**
   * Submit the new password using the verified token.
   * POST /api/v1/auth/reset-password/
   */
  resetPassword: (token, newPassword) => 
    axiosClient.post(ENDPOINTS.AUTH.RESET_PASSWORD, { 
      token, 
      new_password: newPassword}),
};
