/**
 * UnsubscribePage — Premium editorial design matching the app layout.
 * Automatically unsigns secure tokens inline and logs removal instantly.
 */
import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { MailX, Loader2, CheckCircle, AlertCircle, ArrowLeft } from "lucide-react";
import axios from "axios";
import { ENDPOINTS } from "../constants/api";

export default function UnsubscribePage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState("loading"); // loading | success | error
  const [message, setMessage] = useState(t("unsubscribe.processing"));

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage(t("unsubscribe.missingToken"));
      return;
    }

    const executeUnsubscribe = async () => {
      try {
        const response = await axios.post(ENDPOINTS.NEWSLETTER.UNSUBSCRIBE, { token });
        setStatus("success");
        setMessage(response.data?.message || t("unsubscribe.successDefault"));
      } catch (err) {
        setStatus("error");
        setMessage(err.response?.data?.error || t("unsubscribe.errorDefault"));
      }
    };

    executeUnsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <div className="min-h-screen bg-ivory flex items-center justify-center px-5 py-24 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 right-0 h-64 bg-obsidian z-0" />
      <div className="absolute top-44 left-1/2 -translate-x-1/2 w-[500px] h-[250px] bg-saffron/5 rounded-full blur-3xl pointer-events-none" />

      {/* Main Status Container Box */}
      <div className="relative z-10 w-full max-w-md bg-white rounded-2xl border border-parchment-100 shadow-card-hover p-8 md:p-10 text-center mt-12">
        <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-6 transition-all duration-300">
          {status === "loading" && (
            <div className="w-12 h-12 rounded-xl bg-parchment-50 flex items-center justify-center text-parchment-400">
              <Loader2 className="animate-spin text-parchment-400" size={24} />
            </div>
          )}
          {status === "success" && (
            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500">
              <CheckCircle size={26} />
            </div>
          )}
          {status === "error" && (
            <div className="w-12 h-12 rounded-xl bg-rose-50 flex items-center justify-center text-rose-500">
              <AlertCircle size={26} />
            </div>
          )}
        </div>

        <h1 className="font-display font-semibold text-2xl text-parchment-900 mb-3">
          {status === "loading" && t("unsubscribe.titleLoading")}
          {status === "success" && t("unsubscribe.titleSuccess")}
          {status === "error" && t("unsubscribe.titleError")}
        </h1>

        <p className="font-body text-sm text-parchment-500 leading-relaxed mb-8 px-2">
          {message}
        </p>

        <div className="border-t border-parchment-100 pt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 font-body text-sm font-medium
                       text-parchment-600 hover:text-saffron transition-colors group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
            <span>{t("unsubscribe.returnHome")}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}