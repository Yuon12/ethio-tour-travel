/**
 * ForgotPasswordPage.jsx
 * ======================
 * Password recovery request form with email validation, error handling, and full i18n support.
 */
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { authApi } from "../api/authApi";

export default function ForgotPasswordPage() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");
    setError("");

    try {
      const response = await authApi.forgotPassword(email);
      setMessage(response.data.message);
    } catch (err) {
      if (err.response?.status === 429) {
        setError(t("auth.tooManyRequests"));
      } else {
        setError(err.response?.data?.error || t("auth.genericError"));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F7F3ED] px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 border border-[#E8E0D0]">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#C9920A] to-[#E0A80D] flex items-center justify-center mx-auto mb-4">
            <span className="text-[#0D0D12] font-bold text-xl">E</span>
          </div>
          <h2 className="text-2xl font-bold text-[#0D0D0D]">{t("auth.forgotPasswordTitle")}</h2>
          <p className="text-sm text-gray-500 mt-2">
            {t("auth.forgotPasswordDesc")}
          </p>
        </div>

        {message ? (
          <div className="space-y-6">
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm p-4 rounded-xl text-center">
              {message}
            </div>
            <Link
              to="/login"
              className="block text-center w-full bg-gradient-to-r from-[#C9920A] to-[#E0A80D] text-[#0D0D12] font-bold py-3 rounded-xl transition duration-200 hover:opacity-90"
            >
              {t("auth.backToLogin")}
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 text-sm p-4 rounded-xl">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                {t("auth.emailAddress")}
              </label>
              <input
                id="email"
                type="email"
                required
                disabled={isLoading}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C9920A] focus:border-transparent transition"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-[#C9920A] to-[#E0A80D] text-[#0D0D12] font-bold py-3 rounded-xl transition duration-200 hover:opacity-90 disabled:opacity-50 flex items-center justify-center"
            >
              {isLoading ? t("auth.sending") : t("auth.sendResetLink")}
            </button>

            <div className="text-center mt-6">
              <Link to="/login" className="text-sm text-[#C9920A] hover:underline font-semibold">
                {t("auth.backToLoginLower")}
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}