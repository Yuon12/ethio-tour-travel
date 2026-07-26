import { useEffect, useState, useCallback } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CheckCircle, Clock, XCircle, RefreshCw } from "lucide-react";
import { bookingsApi } from "../api/bookingsApi";
import { paymentApi } from "../api/paymentApi";

export default function BookingSuccessPage() {
  const { t } = useTranslation();
  const { reference } = useParams();
  const [searchParams] = useSearchParams();
  const txRef = searchParams.get("tx_ref");

  const [status, setStatus] = useState("checking");
  const [attempts, setAttempts] = useState(0);

  const checkStatus = useCallback(async () => {
    if (!reference) {
      setStatus("failed");
      return;
    }
    try {
      if (txRef) {
        try {
          await paymentApi.chapaVerify(txRef);
        } catch {
          // Non-fatal fallback
        }
      }

      const { data } = await bookingsApi.getBooking(reference);
      if (data.status === "confirmed") {
        setStatus("confirmed");
      } else if (data.status === "failed" || data.status === "cancelled") {
        setStatus("failed");
      } else {
        setStatus("pending");
      }
    } catch {
      setStatus("failed");
    }
  }, [reference, txRef]);

  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  useEffect(() => {
    if (status !== "pending" || attempts >= 5) return;
    const t = setTimeout(() => {
      setAttempts((a) => a + 1);
      checkStatus();
    }, 3000);
    return () => clearTimeout(t);
  }, [status, attempts, checkStatus]);

  if (status === "checking") {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <RefreshCw size={32} className="text-gray-400 animate-spin mb-4" />
        <p className="text-gray-500">{t("bookingSuccess.confirming", "Confirming your payment…")}</p>
      </div>
    );
  }

  if (status === "confirmed") {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center text-green-600 mb-4">
          <CheckCircle size={36} />
        </div>
        <h1 className="text-2xl font-bold font-serif text-dark-900 mb-2">
          {t("bookingSuccess.successTitle", "Payment Successful!")}
        </h1>
        <p className="text-gray-500 max-w-sm mb-6">
          {t("bookingSuccess.successDesc", { reference, defaultValue: `Thank you! Your tour booking (${reference}) has been confirmed. A confirmation email with details has been sent.` })}
        </p>
        
        <div className="flex flex-wrap justify-center gap-3">
          <Link to="/" className="btn-ghost px-6 py-2.5 rounded-full text-sm">
            {t("bookingSuccess.btnHome", "Return to Home")}
          </Link>
          <Link to="/packages" className="btn-ghost px-6 py-2.5 rounded-full text-sm">
            {t("bookingSuccess.btnBrowse", "Browse Packages")}
          </Link>
          <Link to={`/bookings/${reference}`} className="btn-gold px-6 py-2.5 rounded-full text-sm">
            {t("bookingSuccess.btnView", "View My Booking")}
          </Link>
        </div>
      </div>
    );
  }

  if (status === "pending") {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center text-amber-600 mb-4">
          <Clock size={36} />
        </div>
        <h1 className="text-2xl font-bold font-serif text-dark-900 mb-2">
          {t("bookingSuccess.processingTitle", "Payment Processing")}
        </h1>
        <p className="text-gray-500 max-w-sm mb-6">
          {t("bookingSuccess.processingDesc", { reference, defaultValue: `We're still confirming your payment for booking ${reference}. This can take a minute — you don't need to pay again. We'll email you once it's confirmed.` })}
        </p>
        <div className="flex gap-3">
          <button onClick={checkStatus} className="btn-ghost px-6 py-2.5 rounded-full">
            {t("bookingSuccess.btnCheckAgain", "Check again")}
          </button>
          <Link to={`/bookings/${reference}`} className="btn-gold px-6 py-2.5 rounded-full">
            {t("bookingSuccess.btnView", "View Booking")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center text-red-600 mb-4">
        <XCircle size={36} />
      </div>
      <h1 className="text-2xl font-bold font-serif text-dark-900 mb-2">
        {t("bookingSuccess.failedTitle", "Payment Not Confirmed")}
      </h1>
      <p className="text-gray-500 max-w-sm mb-6">
        {t("bookingSuccess.failedDesc", { reference, defaultValue: `We couldn't confirm your payment for booking ${reference}. If you completed checkout, please wait a moment and check again, or try paying once more.` })}
      </p>
      <div className="flex gap-3">
        <button onClick={checkStatus} className="btn-ghost px-6 py-2.5 rounded-full">
          {t("bookingSuccess.btnCheckAgain", "Check again")}
        </button>
        {reference && (
          <Link to={`/bookings/${reference}`} className="btn-gold px-6 py-2.5 rounded-full">
            {t("bookingSuccess.btnRetry", "Retry Payment")}
          </Link>
        )}
      </div>
    </div>
  );
}