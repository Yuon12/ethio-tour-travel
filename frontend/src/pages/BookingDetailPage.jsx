import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { 
  CreditCard, Wallet, Loader2, Calendar, Users, DollarSign, 
  MapPin, CheckCircle2, AlertCircle, Lock, Compass, ArrowRight,
  Info, Sparkles, Tag
} from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { STRIPE_PUBLISHABLE_KEY } from "../constants/stripe";
import { bookingsApi } from "../api/bookingsApi";
import { paymentApi } from "../api/paymentApi";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import ErrorMessage from "../components/ui/ErrorMessage";

const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);

const STATUS = {
  PENDING:   "pending",
  CONFIRMED: "confirmed",
};

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: "15px",
      color: "#1A1208",
      "::placeholder": { color: "#B8A888" },
    },
    invalid: { color: "#EF4444", iconColor: "#EF4444" },
  },
};

export default function BookingDetailPage() {
  return (
    <Elements stripe={stripePromise}>
      <BookingDetailInner />
    </Elements>
  );
}

function BookingDetailInner() {
  const { t } = useTranslation();
  const { reference } = useParams();
  const stripe = useStripe();
  const elements = useElements();

  const [booking, setBooking] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [paymentMethod, setPaymentMethod] = useState("chapa");
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  const [cardError, setCardError] = useState(null);
  const [cardComplete, setCardComplete] = useState(false);

  const loadBooking = () => {
    setIsLoading(true);
    bookingsApi
      .getBooking(reference)        
      .then(({ data }) => {
        setBooking(data);
        setError(null);
      })
      .catch(() => setError("Booking details could not be retrieved."))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    if (reference) {
      loadBooking();
    }
  }, [reference]);

  const handleStripePayment = async () => {
    if (!stripe || !elements) return;
    setPaymentError(null);
    setCardError(null);
    setIsProcessing(true);
    
    try {
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        setPaymentError("Card form is not ready.");
        setIsProcessing(false);
        return;
      }

      const { data: intentData } = await paymentApi.stripeCreateIntent(reference);

      const { error, paymentIntent } = await stripe.confirmCardPayment(
        intentData.client_secret,
        {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: booking.contact_name,
              email: booking.contact_email,
            },
          },
        }
      );

      if (error) {
        setCardError(error.message);
        setPaymentError(error.message);
        return;
      }

      if (paymentIntent?.status === "succeeded") {
        await paymentApi.stripeConfirm(paymentIntent.id, reference);
        loadBooking();
      } else {
        setPaymentError("Payment not completed. Please try again.");
      }
    } catch (err) {
      setPaymentError(err?.response?.data?.error || "Payment failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleChapaPayment = async () => {
    setPaymentError(null);
    setIsProcessing(true);
    try {
      const { data } = await paymentApi.chapaInitialize(reference);
      if (!data || !data.checkout_url) {
        throw new Error("Failed to generate Chapa checkout link.");
      }
      window.location.href = data.checkout_url;
    } catch (err) {
      setPaymentError(err?.response?.data?.error || err.message || "Chapa connection failed.");
      setIsProcessing(false);
    }
  };

  const handlePaymentSubmit = () => {
    if (paymentMethod === "stripe") return handleStripePayment();
    return handleChapaPayment();
  };

  if (isLoading) return <LoadingSpinner />;
  if (error || !booking) return <ErrorMessage message={error || "Invalid Booking Reference."} />;

  const isPending = booking.status === STATUS.PENDING;
  const isConfirmed = booking.status === STATUS.CONFIRMED;

  return (
    <div className="max-w-5xl mx-auto my-12 px-4">
      <div className="bg-[#0D0D12] text-white rounded-3xl p-6 sm:p-8 shadow-xl mb-8 border border-neutral-800 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 opacity-5 pointer-events-none">
          <Compass size={240} className="text-white" />
        </div>
        
        <div className="relative flex flex-wrap items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center flex-wrap gap-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#E0A80D] bg-[#E0A80D]/10 px-2.5 py-1 rounded-md border border-[#E0A80D]/20">
                {t("bookingDetail.itineraryFile", "Itinerary File")}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-neutral-600" />
              <span className="text-xs font-semibold text-neutral-300 tracking-wide">
                {t("bookingDetail.createdSecurely", "Created Securely")}
              </span>
            </div>
            
            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold font-serif tracking-tight text-white flex flex-wrap items-center gap-x-2 gap-y-3">
              <span>{t("bookingDetail.refLabel", "Booking Ref:")}</span> 
              <span className="font-mono text-[#E0A80D] bg-[#E0A80D]/10 px-3 py-1 rounded-xl border border-[#E0A80D]/20 shadow-inner text-lg sm:text-2xl">
                {reference}
              </span>
            </h1>
          </div>

          <div className="flex flex-col sm:items-end gap-2.5">
            <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm flex items-center gap-1.5 ${
              isPending 
                ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" 
                : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
            }`}>
              <span className={`w-2 h-2 rounded-full ${isPending ? "bg-amber-400 animate-pulse" : "bg-emerald-400"}`} />
              {isPending ? t("bookingDetail.statusAwaiting", "Awaiting Payment Verification") : t("bookingDetail.statusConfirmed", "Fully Confirmed")}
            </span>
            <p className="text-xs font-medium text-neutral-400 tracking-wide">
              {t("bookingDetail.ownerContext", "Owner Context:")} <span className="text-neutral-200 font-bold ml-1">{booking.contact_name || t("bookingDetail.guestUser", "Guest User")}</span>
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100 transition-all hover:shadow-md">
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4 flex items-center gap-2 border-b border-gray-100 pb-3">
              <Compass size={18} className="text-[#E0A80D]" /> {t("bookingDetail.destProfile", "Tour Destination Profile")}
            </h2>
            <h3 className="text-2xl font-bold text-dark-900 mb-3 font-serif">
              {booking.tour_package?.title}
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed mb-4">
              {booking.tour_package?.overview}
            </p>
            <div className="inline-flex items-center gap-2 text-xs font-medium text-[#E0A80D] bg-[#E0A80D]/5 px-3 py-1.5 rounded-lg border border-[#E0A80D]/10">
              <Sparkles size={12} /> {t("bookingDetail.guideNotice", "Includes standard guide allocations, verified transport parameters & transfers.")}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4 flex items-center gap-2 border-b border-gray-100 pb-3">
              <Users size={18} className="text-[#E0A80D]" /> {t("bookingDetail.logisticsTitle", "Logistics & Occupancy Configuration")}
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-start gap-3 bg-gray-50/60 p-4 rounded-xl">
                <Calendar className="text-[#E0A80D] mt-0.5" size={18} />
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{t("bookingDetail.travelWindows", "Target Travel Windows")}</p>
                  <p className="text-sm font-bold text-dark-900 mt-1 flex items-center gap-1.5">
                    {booking.start_date} <ArrowRight size={12} className="text-gray-400" /> {booking.end_date}
                  </p>
                  <span className="text-xs text-gray-400 block mt-1">
                    {t("bookingDetail.durationAlloc", { days: booking.tour_package?.duration_days, nights: booking.tour_package?.duration_nights, defaultValue: `${booking.tour_package?.duration_days} Days / ${booking.tour_package?.duration_nights} Nights Allocation` })}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-gray-50/60 p-4 rounded-xl">
                <Users className="text-[#E0A80D] mt-0.5" size={18} />
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{t("bookingDetail.guestMatrices", "Guest Breakdown Matrices")}</p>
                  <p className="text-lg font-extrabold text-dark-900 mt-0.5">
                    {booking.guests_count || booking.total_guests} <span className="text-xs font-normal text-gray-500">{t("bookingDetail.totalTravelers", "Total Travelers")}</span>
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs px-2 py-0.5 bg-white border border-gray-200 text-gray-600 rounded-md font-medium">
                      {t("bookingDetail.adultCount", { count: booking.num_adults || booking.guests_count || booking.total_guests || 1 })}
                    </span>
                    {booking.num_children > 0 && (
                      <span className="text-xs px-2 py-0.5 bg-white border border-gray-200 text-gray-600 rounded-md font-medium">
                        {t("bookingDetail.childCount", { count: booking.num_children })}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {booking.special_requests && (
              <div className="mt-4 p-4 border border-amber-100 bg-amber-50/30 rounded-xl flex gap-2.5">
                <Info size={16} className="text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider">{t("bookingDetail.specialRequests", "Special Requests / Requirements")}</h4>
                  <p className="text-xs text-amber-700 mt-1 leading-relaxed">{booking.special_requests}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 sticky top-6">
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-1.5">
              <DollarSign size={14} /> {t("bookingDetail.settlementTitle", "Settlement Breakdown")}
            </h2>

            <div className="space-y-3 text-sm border-b border-gray-100 pb-4 mb-4">
              <div className="flex justify-between text-gray-500">
                <span>{t("bookingDetail.baseSubtotal", "Base Subtotal")}</span>
                <span className="font-medium font-mono">${booking.total_price_usd}</span>
              </div>
              {booking.coupon && (
                <div className="flex justify-between text-emerald-600 text-xs bg-emerald-50 p-2 rounded-lg">
                  <span className="flex items-center gap-1 font-medium"><Tag size={12}/> {t("bookingDetail.couponCodeLabel", "Code:")} {booking.coupon.code}</span>
                  <span className="font-mono">-{booking.coupon.discount_percent}%</span>
                </div>
              )}
              <div className="flex justify-between text-dark-900 font-bold text-base pt-1">
                <span>{t("bookingDetail.totalDue", "Total Amount Due")}</span>
                <span className="text-[#E0A80D] font-mono">${booking.total_price_usd} USD</span>
              </div>
            </div>

            {isPending && (
              <>
                <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2.5">{t("bookingDetail.selectMethod", "Select Payment Method")}</h3>
                <div className="space-y-2 mb-4">
                  <label className={`flex items-center justify-between p-3.5 border-2 rounded-xl cursor-pointer transition-all ${paymentMethod === "chapa" ? "border-[#E0A80D] bg-[#E0A80D]/5" : "border-gray-100 hover:border-gray-200"}`}>
                    <div className="flex items-center gap-3">
                      <input type="radio" checked={paymentMethod === "chapa"} onChange={() => setPaymentMethod("chapa")} className="text-[#E0A80D] focus:ring-[#E0A80D]" />
                      <div>
                        <span className="text-sm font-bold text-dark-900 block">{t("bookingDetail.chapaTitle", "Chapa Secure Gateway")}</span>
                        <span className="text-xs text-gray-400 block mt-0.5">{t("bookingDetail.chapaSub", "Telebirr, CBE Birr, Amole, Cards")}</span>
                      </div>
                    </div>
                    <Wallet size={18} className="text-gray-400" />
                  </label>

                  <label className={`flex items-center justify-between p-3.5 border-2 rounded-xl cursor-pointer transition-all ${paymentMethod === "stripe" ? "border-[#E0A80D] bg-[#E0A80D]/5" : "border-gray-100 hover:border-gray-200"}`}>
                    <div className="flex items-center gap-3">
                      <input type="radio" checked={paymentMethod === "stripe"} onChange={() => setPaymentMethod("stripe")} className="text-[#E0A80D] focus:ring-[#E0A80D]" />
                      <div>
                        <span className="text-sm font-bold text-dark-900 block">{t("bookingDetail.stripeTitle", "Stripe Processing")}</span>
                        <span className="text-xs text-gray-400 block mt-0.5">{t("bookingDetail.stripeSub", "International Visa, Mastercard, Amex")}</span>
                      </div>
                    </div>
                    <CreditCard size={18} className="text-gray-400" />
                  </label>
                </div>

                {paymentMethod === "stripe" && (
                  <div className="mb-4">
                    <div className="border border-gray-200 rounded-xl p-3.5 bg-gray-50/50 focus-within:border-[#E0A80D] transition-all">
                      <CardElement 
                        options={CARD_ELEMENT_OPTIONS} 
                        onChange={(e) => {
                          setCardError(e.error?.message || null);
                          setCardComplete(e.complete);
                        }} 
                      />
                    </div>
                    {cardError && (
                      <div className="flex items-center gap-2 mt-2 text-red-500 text-xs bg-red-50 p-2 rounded-lg">
                        <AlertCircle size={12} /> {cardError}
                      </div>
                    )}
                    <p className="flex items-center gap-1.5 text-[11px] text-gray-400 mt-2">
                      <Lock size={11} /> {t("bookingDetail.stripeSecurity", "Encrypted and processed securely via Stripe.")}
                    </p>
                  </div>
                )}

                {paymentError && (
                  <div className="flex items-center gap-2 mb-4 text-red-600 text-xs bg-red-50 p-2.5 rounded-xl border border-red-100">
                    <AlertCircle size={14} className="shrink-0" /> {paymentError}
                  </div>
                )}

                <button
                  onClick={handlePaymentSubmit}
                  disabled={isProcessing || (paymentMethod === "stripe" && (!stripe || !elements || !cardComplete))}
                  className="w-full bg-[#E0A80D] text-dark-900 rounded-xl py-3.5 font-bold hover:bg-[#C9920A] transition-all flex items-center justify-center gap-2 disabled:bg-gray-100 disabled:text-gray-400 shadow-md hover:shadow-lg shadow-[#E0A80D]/10 disabled:shadow-none cursor-pointer"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>{t("bookingDetail.verifyingTokens", "Verifying Security Tokens...")}</span>
                    </>
                  ) : (
                    t("bookingDetail.authorizeBtn", { price: `$${booking.total_price_usd}`, defaultValue: `Authorize Payment $${booking.total_price_usd}` })
                  )}
                </button>
              </>
            )}

            {isConfirmed && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-emerald-800 bg-emerald-50/80 border border-emerald-100 p-3.5 rounded-xl justify-center text-sm font-bold">
                  <CheckCircle2 size={18} className="text-emerald-600" /> {t("bookingDetail.settledBadge", "Authorized & Fully Settled")}
                </div>
                <Link to="/packages" className="w-full block text-center border border-gray-200 text-gray-600 rounded-xl py-2.5 text-xs font-semibold hover:bg-gray-50 transition-colors">
                  {t("bookingDetail.planAnother", "Plan Another Journey")}
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}