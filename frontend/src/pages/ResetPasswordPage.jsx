/**
 * ResetPasswordPage.jsx
 * =====================
 * Password reset form with token verification, strength validation, and full i18n support.
 */
import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { authApi } from "../api/authApi";

export default function ResetPasswordPage() {
  const { t } = useTranslation();
  const { token } = useParams(); // Grabs token from URL path
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isValidating, setIsValidating] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tokenError, setTokenError] = useState("");
  const [formError, setFormError] = useState("");
  const [success, setSuccess] = useState(false);

  // 1. Verify token status as soon as the page loads
  useEffect(() => {
    const checkToken = async () => {
      try {
        const response = await authApi.validateResetToken(token);
        if (!response.data.valid) {
          setTokenError(response.data.error || t("auth.resetLinkInvalid"));
        }
      } catch (err) {
        setTokenError(t("auth.resetLinkValidateFailed"));
      } finally {
        setIsValidating(false);
      }
    };
    checkToken();
  }, [token, t]);

  // 2. Submit the new password
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (newPassword !== confirmPassword) {
      setFormError(t("auth.passwordsDoNotMatch"));
      return;
    }

    setIsSubmitting(true);
    try {
      await authApi.resetPassword(token, newPassword);
      setSuccess(true);
    } catch (err) {
      // Handles strength validations returned by Django's validate_password
      const backendError = err.response?.data?.error;
      if (Array.isArray(backendError)) {
        setFormError(backendError.join(" "));
      } else {
        setFormError(backendError || t("auth.passwordUpdateFailed"));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F3ED]">
        <p className="text-gray-500 font-semibold animate-pulse text-lg">{t("auth.validatingToken")}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F7F3ED] px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 border border-[#E8E0D0]">

        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#C9920A] to-[#E0A80D] flex items-center justify-center mx-auto mb-4">
            <span className="text-[#0D0D12] font-bold text-xl">E</span>
          </div>
          <h2 className="text-2xl font-bold text-[#0D0D0D]">{t("auth.setNewPassword")}</h2>
        </div>

        {tokenError ? (
          <div className="space-y-6">
            <div className="bg-red-50 border border-red-200 text-red-800 text-sm p-4 rounded-xl text-center">
              {tokenError}
            </div>
            <Link
              to="/forgot-password"
              className="block text-center w-full bg-gradient-to-r from-[#C9920A] to-[#E0A80D] text-[#0D0D12] font-bold py-3 rounded-xl transition duration-200 hover:opacity-90"
            >
              {t("auth.requestNewLink")}
            </Link>
          </div>
        ) : success ? (
          <div className="space-y-6">
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm p-4 rounded-xl text-center">
              {t("auth.passwordUpdatedSuccess")}
            </div>
            <Link
              to="/login"
              className="block text-center w-full bg-gradient-to-r from-[#C9920A] to-[#E0A80D] text-[#0D0D12] font-bold py-3 rounded-xl transition duration-200 hover:opacity-90"
            >
              {t("auth.logIn")}
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {formError && (
              <div className="bg-red-50 border border-red-200 text-red-800 text-sm p-4 rounded-xl">
                {formError}
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t("auth.newPassword")}
              </label>
              <input
                type="password"
                required
                disabled={isSubmitting}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder={t("auth.minChars", { count: 8 })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C9920A] focus:border-transparent transition"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t("auth.confirmNewPassword")}
              </label>
              <input
                type="password"
                required
                disabled={isSubmitting}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder={t("auth.verifyPasswordMatch")}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C9920A] focus:border-transparent transition"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-[#C9920A] to-[#E0A80D] text-[#0D0D12] font-bold py-3 rounded-xl transition duration-200 hover:opacity-90 disabled:opacity-50 flex items-center justify-center"
            >
              {isSubmitting ? t("auth.updating") : t("auth.updatePassword")}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}