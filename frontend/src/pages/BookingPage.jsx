import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import {
  CheckCircle, Loader2, Tag, Calendar, Users,
  ChevronRight, ChevronLeft, CreditCard, Smartphone,
  Lock, AlertCircle, ArrowRight,
} from "lucide-react";
import { usePackageDetail, usePackageAvailability } from "../hooks/usePackages";
import { bookingsApi } from "../api/bookingsApi";
import { paymentApi }  from "../api/paymentApi";
import { useAuth }     from "../context/AuthContext";
import LoadingSpinner  from "../components/ui/LoadingSpinner";
import ErrorMessage    from "../components/ui/ErrorMessage";
import toast from "react-hot-toast";

const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "pk_test_placeholder"
);

const CARD_STYLE = {
  style: {
    base: {
      fontFamily: "DM Sans, system-ui, sans-serif",
      fontSize: "15px",
      color: "#0D0D0D",
      "::placeholder": { color: "#ABABAB" },
      iconColor: "#C9920A",
    },
    invalid: { color: "#EF4444", iconColor: "#EF4444" },
  },
};

const schema = z.object({
  start_date:       z.string().min(1, "Select a departure date"),
  num_adults:       z.coerce.number().min(1, "At least 1 adult required"),
  num_children:     z.coerce.number().min(0).default(0),
  contact_name:     z.string().min(2, "Full name is required"),
  contact_email:    z.string().email("Enter a valid email address"),
  contact_phone:    z.string().min(7, "Enter a valid phone number"),
  special_requests: z.string().optional(),
});

export default function BookingPage() {
  return (
    <Elements stripe={stripePromise}>
      <BookingWizard />
    </Elements>
  );
}

function BookingWizard() {
  const { t } = useTranslation();
  const { slug }    = useParams();
  const { user }    = useAuth();
  const stripe      = useStripe();
  const elements    = useElements();

  const STEPS = [
    t("bookingWizard.stepDates", "Dates & Guests"), 
    t("bookingWizard.stepDetails", "Your Details"), 
    t("bookingWizard.stepPayment", "Payment"), 
    t("bookingWizard.stepConfirmed", "Confirmed")
  ];

  const [step, setStep]                   = useState(0);
  const [payMethod, setPayMethod]         = useState("chapa");
  const [selectedAvail, setSelectedAvail] = useState(null);
  const [couponCode, setCouponCode]       = useState("");
  const [couponResult, setCouponResult]   = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [createdBooking, setCreatedBooking] = useState(null);
  const [paying, setPaying]               = useState(false);
  const [cardError, setCardError]         = useState(null);
  const [cardReady, setCardReady]         = useState(false);
  
  const etbTotal = createdBooking?.total_price_etb ?? null;

  const { data: pkg, isLoading, isError } = usePackageDetail(slug);
  const { data: availability }            = usePackageAvailability(slug);

  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      contact_name:  user ? `${user.first_name} ${user.last_name}` : "",
      contact_email: user?.email || "",
      num_adults:    1,
      num_children:  0,
    },
  });

  const chooseAvailability = (avail) => {
    setSelectedAvail(avail);
    setValue("start_date", avail.start_date, { shouldValidate: true });
  };

  const onInvalid = (formErrors) => {
    const firstMessage = Object.values(formErrors)[0]?.message;
    toast.error(firstMessage || "Please check the form and try again.");
  };

  const numAdults   = Number(watch("num_adults")   || 1);
  const numChildren = Number(watch("num_children") || 0);
  const totalGuests = numAdults + numChildren;
  const unitPrice   = Number(pkg?.effective_price  || 0);
  const subtotal    = unitPrice * totalGuests;
  const discount    = couponResult?.discount_amount || 0;
  const total       = subtotal - discount;

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    try {
      const { data } = await bookingsApi.validateCoupon(couponCode.toUpperCase(), subtotal);
      setCouponResult(data);
      toast.success(`Coupon applied — saving $${data.discount_amount}!`);
    } catch (err) {
      toast.error(err?.response?.data?.error || "Invalid coupon code.");
      setCouponResult(null);
    } finally {
      setCouponLoading(false);
    }
  };

  const onCreateBooking = async (formData) => {
    try {
      const payload = {
        ...formData,
        tour_package: pkg.id,
        availability: selectedAvail?.id   || null,
        end_date:     selectedAvail?.end_date || formData.start_date,
        coupon:       couponResult ? couponCode.toUpperCase() : undefined,
      };
      const { data } = await bookingsApi.createBooking(payload);
      setCreatedBooking(data);
      setStep(2);
      toast.success("Details saved! Complete your payment below.");
    } catch (err) {
      const msgs = err?.response?.data;
      if (msgs && typeof msgs === "object") {
        Object.values(msgs).flat().forEach(m => toast.error(String(m)));
      } else {
        toast.error("Could not save booking. Please try again.");
      }
    }
  };

  const handleStripePayment = async () => {
    if (!stripe || !elements || !createdBooking) return;
    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      toast.error("Card field isn't ready yet — please wait a moment and try again.");
      return;
    }

    setPaying(true);
    setCardError(null);

    try {
      const { data: intentData } = await paymentApi.stripeCreateIntent(createdBooking.reference);
      const { error, paymentIntent } = await stripe.confirmCardPayment(
        intentData.client_secret,
        {
          payment_method: {
            card: cardElement,
            billing_details: {
              name:  createdBooking.contact_name,
              email: createdBooking.contact_email,
            },
          },
        }
      );

      if (error) {
        const isStaleElement = /could not retrieve data from the specified element/i.test(error.message || "");
        const friendlyMessage = isStaleElement
          ? "The card field needs to reload. Please refresh the page and try again."
          : error.message;
        setCardError(friendlyMessage);
        toast.error(friendlyMessage);
        return;
      }

      if (paymentIntent.status === "succeeded") {
        await paymentApi.stripeConfirm(paymentIntent.id, createdBooking.reference);
        setStep(3);
        toast.success("Payment successful! Your tour is confirmed. 🎉");
      }
    } catch (err) {
      toast.error(err?.response?.data?.error || "Payment failed. Please try again.");
    } finally {
      setPaying(false);
    }
  };

  const handleChapaPayment = async () => {
    if (!createdBooking) return;
    setPaying(true);
    try {
      const { data } = await paymentApi.chapaInitialize(createdBooking.reference);
      toast.success("Redirecting to Chapa checkout…");
      window.location.href = data.checkout_url;
    } catch (err) {
      toast.error(err?.response?.data?.error || "Chapa checkout failed. Please try again.");
      setPaying(false);
    }
  };

  const handlePay = () => {
    if (payMethod === "stripe") handleStripePayment();
    else                        handleChapaPayment();
  };

  if (isLoading) return <LoadingSpinner />;
  if (isError || !pkg) return <ErrorMessage message="Tour package not found." />;

  const cardStyle = {
    background: "#ffffff", borderRadius: "20px", padding: "2rem",
    border: "1px solid #E8E0D0", boxShadow: "0 4px 24px rgba(13,13,18,0.07)",
  };

  return (
    <div style={{ background: "#F7F3ED", minHeight: "100vh", paddingTop: "88px" }}>
      <div style={{ maxWidth: "980px", margin: "0 auto", padding: "3rem 1.5rem" }}>
        
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <p style={{ fontFamily: "DM Sans", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "#C9920A", marginBottom: "0.5rem" }}>
            {t("bookingWizard.secureCheckout", "Secure Checkout")}
          </p>
          <h1 style={{ fontFamily: "Cormorant Garamath,serif", fontWeight: 600, fontSize: "clamp(1.8rem,4vw,2.6rem)", color: "#0D0D0D", margin: "0 0 0.4rem" }}>
            {step === 3 ? t("bookingWizard.confirmedTitle", "Booking Confirmed! 🎉") : t("bookingWizard.completeTitle", "Complete Your Booking")}
          </h1>
          {step < 3 && <p style={{ fontFamily: "DM Sans", fontSize: "0.9rem", color: "#6B6B6B", margin: 0 }}>{pkg.title}</p>}
        </div>

        {step < 3 && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "2.5rem", gap: "4px" }}>
            {STEPS.slice(0, 3).map((label, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div style={{
                    width: "32px", height: "32px", borderRadius: "50%",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontFamily: "DM Sans", fontSize: "13px", fontWeight: 700,
                    transition: "all 0.3s",
                    background: i < step  ? "linear-gradient(135deg,#C9920A,#E0A80D)" :
                                i === step ? "#14532D"  : "#E8E0D0",
                    color:      i < step  ? "#0D0D12"  :
                                i === step ? "#ffffff"  : "#8A8A8A",
                    boxShadow:  i < step  ? "0 0 14px rgba(201,146,10,0.35)" :
                                i === step ? "0 0 0 4px rgba(20,83,45,0.15)" : "none",
                  }}>
                    {i < step ? <CheckCircle size={15} /> : i + 1}
                  </div>
                  <span style={{
                    fontFamily: "DM Sans", fontSize: "0.8rem", fontWeight: 600,
                    color: i === step ? "#0D0D0D" : "#ABABAB",
                    display: "none",
                  }} className="step-label">{label}</span>
                </div>
                {i < 2 && (
                  <div style={{
                    width: "48px", height: "2px", margin: "0 6px",
                    background: i < step ? "linear-gradient(135deg,#C9920A,#E0A80D)" : "#E8E0D0",
                    borderRadius: "1px", transition: "background 0.3s",
                  }} />
                )}
              </div>
            ))}
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "20px" }} className="booking-grid">
          <div>
            {step === 0 && (
              <div style={cardStyle}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "1.75rem" }}>
                  <div style={{ width: "38px", height: "38px", borderRadius: "10px", background: "rgba(201,146,10,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Calendar size={18} style={{ color: "#C9920A" }} />
                  </div>
                  <h2 style={{ fontFamily: "Cormorant Garamath,serif", fontWeight: 600, fontSize: "1.35rem", color: "#0D0D0D", margin: 0 }}>
                    {t("bookingWizard.selectDateGuests", "Select Date & Guests")}
                  </h2>
                </div>

                {availability?.filter(a => a.is_available).length > 0 ? (
                  <div style={{ marginBottom: "1.5rem" }}>
                    <label className="field-label">{t("bookingWizard.chooseDeparture", "Choose Departure Date")}</label>
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxHeight: "240px", overflowY: "auto" }}>
                      {availability.filter(a => a.is_available).map(avail => (
                        <label key={avail.id}
                          onClick={() => chooseAvailability(avail)}
                          style={{
                            display: "flex", alignItems: "center", justifyContent: "space-between",
                            padding: "14px 16px", borderRadius: "12px", cursor: "pointer",
                            border: `2px solid ${selectedAvail?.id === avail.id ? "#C9920A" : "#E8E0D0"}`,
                            background: selectedAvail?.id === avail.id ? "rgba(201,146,10,0.04)" : "#F7F3ED",
                            transition: "all 0.2s",
                          }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            <div style={{
                              width: "18px", height: "18px", borderRadius: "50%", flexShrink: 0,
                              border: `2px solid ${selectedAvail?.id === avail.id ? "#C9920A" : "#D0C8B8"}`,
                              display: "flex", alignItems: "center", justifyContent: "center",
                            }}>
                              {selectedAvail?.id === avail.id && (
                                <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#C9920A" }} />
                              )}
                            </div>
                            <div>
                              <p style={{ fontFamily: "DM Sans", fontWeight: 600, fontSize: "0.9rem", color: "#0D0D0D", margin: 0 }}>
                                {avail.start_date} → {avail.end_date}
                              </p>
                              <p style={{ fontFamily: "DM Sans", fontSize: "0.78rem", color: "#8A8A8A", margin: "2px 0 0" }}>
                                {t("bookingWizard.seatsRemaining", { count: avail.available_seats, defaultValue: `${avail.available_seats} seats remaining` })}
                              </p>
                            </div>
                          </div>
                          {avail.price_override && (
                            <span style={{ fontFamily: "Cormorant Garamath,serif", fontWeight: 700, fontSize: "1.1rem", color: "#14532D" }}>
                              ${avail.price_override}
                            </span>
                          )}
                        </label>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div style={{ marginBottom: "1.5rem" }}>
                    <label className="field-label">{t("bookingWizard.preferredStart", "Preferred Start Date")}</label>
                    <input type="date" {...register("start_date")}
                      min={new Date().toISOString().split("T")[0]}
                      className="field-input"
                      style={errors.start_date ? { borderColor: "#EF4444" } : {}} />
                    {errors.start_date && (
                      <p style={{ color: "#EF4444", fontSize: "0.75rem", fontFamily: "DM Sans", marginTop: "4px" }}>
                        {errors.start_date.message}
                      </p>
                    )}
                  </div>
                )}

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "1.75rem" }}>
                  <div>
                    <label className="field-label" style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                      <Users size={11} /> {t("bookingWizard.adultsLabel", "Adults (12+)")}
                    </label>
                    <input type="number" min={1} max={pkg.max_group_size}
                      {...register("num_adults")} className="field-input" />
                    {errors.num_adults && (
                      <p style={{ color: "#EF4444", fontSize: "0.75rem", fontFamily: "DM Sans", marginTop: "4px" }}>
                        {errors.num_adults.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="field-label">{t("bookingWizard.childrenLabel", "Children (under 12)")}</label>
                    <input type="number" min={0} {...register("num_children")} className="field-input" />
                  </div>
                </div>

                <p style={{ fontFamily: "DM Sans", fontSize: "0.8rem", color: "#8A8A8A", marginBottom: "1.5rem" }}>
                  {t("bookingWizard.maxGroupSize", { size: pkg.max_group_size, defaultValue: `Maximum group size for this tour: ${pkg.max_group_size} people` })}
                </p>

                <button type="button" onClick={() => {
                    const usingSlots = availability?.filter(a => a.is_available).length > 0;
                    if (usingSlots && !selectedAvail) {
                      toast.error("Please choose a departure date.");
                      return;
                    }
                    setStep(1);
                  }} className="btn-forest"
                  style={{ width: "100%", padding: "14px", borderRadius: "12px", fontSize: "0.95rem" }}>
                  {t("bookingWizard.btnContinue", "Continue")} <ChevronRight size={17} />
                </button>
              </div>
            )}

            {step === 1 && (
              <form onSubmit={handleSubmit(onCreateBooking, onInvalid)}>
                <div style={cardStyle}>
                  <h2 style={{ fontFamily: "Cormorant Garamath,serif", fontWeight: 600, fontSize: "1.35rem", color: "#0D0D0D", margin: "0 0 1.5rem" }}>
                    {t("bookingWizard.stepDetails", "Your Details")}
                  </h2>

                  <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    <div>
                      <label className="field-label">{t("bookingDetail.nameLabel", "Name")}</label>
                      <input {...register("contact_name")} className="field-input"
                        placeholder="Abebe Bikila"
                        style={errors.contact_name ? { borderColor: "#EF4444" } : {}} />
                      {errors.contact_name && <ErrMsg msg={errors.contact_name.message} />}
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                      <div>
                        <label className="field-label">{t("bookingDetail.emailLabel", "Email")}</label>
                        <input type="email" {...register("contact_email")} className="field-input"
                          style={errors.contact_email ? { borderColor: "#EF4444" } : {}} />
                        {errors.contact_email && <ErrMsg msg={errors.contact_email.message} />}
                      </div>
                      <div>
                        <label className="field-label">Phone</label>
                        <input {...register("contact_phone")} className="field-input"
                          placeholder="+251 911 000 000"
                          style={errors.contact_phone ? { borderColor: "#EF4444" } : {}} />
                        {errors.contact_phone && <ErrMsg msg={errors.contact_phone.message} />}
                      </div>
                    </div>

                    <div>
                      <label className="field-label">
                        {t("bookingWizard.specialRequests", "Special Requests")}{" "}
                        <span style={{ textTransform: "none", fontWeight: 400, color: "#ABABAB" }}>(optional)</span>
                      </label>
                      <textarea {...register("special_requests")} rows={3}
                        className="field-input" style={{ resize: "vertical" }}
                        placeholder="Dietary requirements, accessibility needs, room preferences…" />
                    </div>

                    <div>
                      <label className="field-label" style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                        <Tag size={11} /> Coupon Code <span style={{ textTransform: "none", fontWeight: 400, color: "#ABABAB" }}>(optional)</span>
                      </label>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <input
                          value={couponCode}
                          onChange={e => setCouponCode(e.target.value.toUpperCase())}
                          className="field-input" style={{ flex: 1 }}
                          placeholder="e.g. SAVE20"
                        />
                        <button type="button" onClick={applyCoupon} disabled={couponLoading}
                          className="btn-ghost" style={{ padding: "12px 20px", borderRadius: "10px", whiteSpace: "nowrap" }}>
                          {couponLoading ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : "Apply"}
                        </button>
                      </div>
                      {couponResult?.valid && (
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "6px", color: "#14532D", fontFamily: "DM Sans", fontSize: "0.8rem" }}>
                          <CheckCircle size={13} /> {t("bookingWizard.couponDiscount", "Coupon discount")} ${couponResult.discount_amount} USD
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "10px", marginTop: "1.75rem" }}>
                    <button type="button" onClick={() => setStep(0)} className="btn-ghost"
                      style={{ flex: 1, padding: "13px", borderRadius: "12px" }}>
                      <ChevronLeft size={16} /> {t("bookingWizard.btnBack", "Back")}
                    </button>
                    <button type="submit" disabled={isSubmitting} className="btn-forest"
                      style={{ flex: 2, padding: "13px", borderRadius: "12px", fontSize: "0.95rem" }}>
                      {isSubmitting
                        ? <><Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> {t("bookingWizard.saving", "Saving…")}</>
                        : <>{t("bookingWizard.continuePayment", "Continue to Payment")} <ChevronRight size={17} /></>
                      }
                    </button>
                  </div>
                </div>
              </form>
            )}

            {step === 2 && createdBooking && (
              <div style={cardStyle}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "1.75rem" }}>
                  <Lock size={16} style={{ color: "#14532D" }} />
                  <h2 style={{ fontFamily: "Cormorant Garamath,serif", fontWeight: 600, fontSize: "1.35rem", color: "#0D0D0D", margin: 0 }}>
                    {t("bookingWizard.securePayment", "Secure Payment")}
                  </h2>
                  <span style={{ marginLeft: "auto", fontFamily: "DM Sans", fontSize: "0.72rem", color: "#8A8A8A", padding: "3px 10px", background: "#F7F3ED", borderRadius: "6px" }}>
                    {t("bookingWizard.sslBadge", "256-bit SSL")}
                  </span>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "1.5rem" }}>
                  {[
                    {
                      id:    "stripe",
                      label: t("bookingWizard.stripeCard", "Card Payment"),
                      sub:   t("bookingWizard.stripeCardSub", "Visa, Mastercard, Amex"),
                      logo:  "💳",
                    },
                    {
                      id:    "chapa",
                      label: t("bookingWizard.chapaCheckout", "Chapa Checkout"),
                      sub:   t("bookingWizard.chapaCheckoutSub", "Telebirr · CBE Birr · Amole · Card"),
                      logo:  "🇪🇹",
                    },
                  ].map(({ id, label, sub, logo }) => (
                    <button key={id} type="button" onClick={() => setPayMethod(id)}
                      style={{
                        display: "flex", alignItems: "center", gap: "12px",
                        padding: "14px 16px", borderRadius: "14px", cursor: "pointer",
                        border: `2px solid ${payMethod === id ? "#C9920A" : "#E8E0D0"}`,
                        background: payMethod === id ? "rgba(201,146,10,0.04)" : "#F7F3ED",
                        transition: "all 0.2s", textAlign: "left",
                        boxShadow: payMethod === id ? "0 0 0 3px rgba(201,146,10,0.12)" : "none",
                      }}>
                      <div style={{
                        width: "42px", height: "42px", borderRadius: "10px", flexShrink: 0,
                        display: "flex", alignItems: "center", justifyContext: "center", fontSize: "1.3rem",
                        background: payMethod === id ? "rgba(201,146,10,0.15)" : "#E8E0D0",
                        transition: "background 0.2s",
                      }}>
                        {logo}
                      </div>
                      <div>
                        <p style={{ fontFamily: "DM Sans", fontWeight: 700, fontSize: "0.875rem", color: "#0D0D0D", margin: 0 }}>
                          {label}
                        </p>
                        <p style={{ fontFamily: "DM Sans", fontSize: "0.72rem", color: "#8A8A8A", margin: "2px 0 0" }}>
                          {sub}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>

                <div style={{ marginBottom: "1.25rem", display: payMethod === "stripe" ? "block" : "none" }}>
                  <label className="field-label">{t("bookingDetail.cardDetails", "Card Details")}</label>
                  <div className="StripeElement">
                    <CardElement
                      options={CARD_STYLE}
                      onReady={() => setCardReady(true)}
                      onChange={e => setCardError(e.error?.message || null)}
                    />
                  </div>
                  {cardError && (
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "8px", color: "#EF4444", fontFamily: "DM Sans", fontSize: "0.78rem" }}>
                      <AlertCircle size={13} /> {cardError}
                    </div>
                  )}
                  <p style={{ fontFamily: "DM Sans", fontSize: "0.72rem", color: "#8A8A8A", marginTop: "8px", display: "flex", alignItems: "center", gap: "5px" }}>
                    <Lock size={11} style={{ color: "#14532D" }} />
                    {t("bookingWizard.stripeEncrypted", "Card details are encrypted and sent directly to Stripe. We never store your card number.")}
                  </p>
                </div>

                {payMethod === "chapa" && (
                  <div style={{
                    padding: "14px 16px", borderRadius: "12px", marginBottom: "1.25rem",
                    background: "rgba(20,83,45,0.05)", border: "1px solid rgba(20,83,45,0.15)",
                  }}>
                    <p style={{ fontFamily: "DM Sans", fontWeight: 700, fontSize: "0.875rem", color: "#14532D", margin: "0 0 4px" }}>
                      {t("bookingWizard.chapaInfoTitle", "Pay via Chapa")}
                    </p>
                    <p style={{ fontFamily: "DM Sans", fontSize: "0.82rem", color: "#2E5840", lineHeight: 1.6, margin: 0 }}>
                      {t("bookingWizard.chapaInfoDesc", "You will be redirected to Chapa's secure checkout page where you can pay using Telebirr, CBE Birr, Amole, Awash Bank, Dashen Bank, or a bank card. After payment you will be returned here automatically.")}
                    </p>
                    <p style={{ fontFamily: "DM Sans", fontSize: "0.95rem", fontWeight: 700, color: "#14532D", margin: "10px 0 0" }}>
                      {etbTotal
                        ? t("bookingWizard.chapaChargeEtb", { price: Number(etbTotal).toLocaleString() })
                        : t("bookingWizard.chapaChargeEtbFallback", "Amount will be charged in ETB")}
                    </p>
                  </div>
                )}

                <div style={{ background: "#F7F3ED", borderRadius: "12px", padding: "14px 16px", marginBottom: "1.5rem" }}>
                  <p style={{ fontFamily: "DM Sans", fontWeight: 700, fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "#8A8A8A", margin: "0 0 10px" }}>
                    {t("bookingWizard.orderSummary", "Order Summary")}
                  </p>
                  <SummaryRow label={t("bookingWizard.guestCountSummary", { count: totalGuests, price: `$${unitPrice}`, count_plural: `${totalGuests} guests` })} value={`$${subtotal.toFixed(2)}`} />
                  {discount > 0 && (
                    <SummaryRow label={t("bookingWizard.couponDiscount", "Coupon discount")} value={`−$${discount.toFixed(2)}`} green />
                  )}
                  <div style={{ borderTop: "1px solid #E8E0D0", marginTop: "10px", paddingTop: "10px", display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontFamily: "DM Sans", fontWeight: 700, fontSize: "0.9rem", color: "#0D0D0D" }}>{t("bookingWizard.total", "Total")}</span>
                    <div style={{ textAlign: "right" }}>
                      <span style={{ fontFamily: "Cormorant Garamath,serif", fontWeight: 700, fontSize: "1.2rem", color: "#0D0D0D" }}>
                        ${total.toFixed(2)} USD
                      </span>
                      {payMethod === "chapa" && etbTotal && (
                        <p style={{ fontFamily: "DM Sans", fontSize: "0.75rem", color: "#8A8A8A", margin: "2px 0 0" }}>
                          ≈ {Number(etbTotal).toLocaleString()} ETB
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "10px" }}>
                  <button type="button" onClick={() => setStep(1)} className="btn-ghost"
                    style={{ flex: 1, padding: "13px", borderRadius: "12px" }}>
                    <ChevronLeft size={16} /> {t("bookingWizard.btnBack", "Back")}
                  </button>
                  <button type="button" onClick={handlePay}
                    disabled={paying || (payMethod === "stripe" && !cardReady)}
                    className="btn-gold"
                    style={{ flex: 2, padding: "13px", borderRadius: "12px", fontSize: "0.95rem" }}>
                    {paying ? (
                      <><Loader2 size={17} style={{ animation: "spin 1s linear infinite" }} /> {t("bookingWizard.processing", "Processing…")}</>
                    ) : payMethod === "chapa" ? (
                      <>{t("bookingWizard.payWithChapa", "Pay with Chapa")} <ArrowRight size={16} /></>
                    ) : (
                      <><Lock size={16} /> {t("bookingWizard.payUsd", { price: total.toFixed(2) })}</>
                    )}
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div style={{ ...cardStyle, textAlign: "center", padding: "3rem 2rem" }}>
                <div style={{
                  width: "80px", height: "80px", borderRadius: "50%",
                  background: "rgba(20,83,45,0.08)", border: "2px solid rgba(20,83,45,0.2)",
                  display: "flex", alignItems: "center", justifyContext: "center",
                  margin: "0 auto 1.5rem",
                }}>
                  <CheckCircle size={38} style={{ color: "#14532D" }} />
                </div>

                <h2 style={{ fontFamily: "Cormorant Garamath,serif", fontWeight: 600, fontSize: "2rem", color: "#0D0D0D", margin: "0 0 0.75rem" }}>
                  {t("bookingWizard.successMessage", "You're all set!")}
                </h2>
                <p style={{ fontFamily: "DM Sans", color: "#6B6B6B", marginBottom: "1.75rem", lineHeight: 1.7 }}>
                  {t("bookingWizard.successDesc", { email: createdBooking?.contact_email, defaultValue: `Your booking is confirmed and a receipt has been sent to ${createdBooking?.contact_email}.` })}
                </p>

                <div style={{
                  display: "inline-flex", alignItems: "center", gap: "12px",
                  padding: "16px 28px", borderRadius: "14px",
                  background: "#F7F3ED", border: "1px solid #E8E0D0", marginBottom: "2rem",
                }}>
                  <div>
                    <p style={{ fontFamily: "DM Sans", fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.15em", color: "#8A8A8A", margin: "0 0 4px" }}>
                      {t("bookingWizard.bookingRef", "Booking Reference")}
                    </p>
                    <p style={{ fontFamily: "JetBrains Mono, Courier New, monospace", fontWeight: 700, fontSize: "1.3rem", color: "#0D0D0D", letterSpacing: "0.15em", margin: 0 }}>
                      {createdBooking?.reference}
                    </p>
                  </div>
                </div>

                <p style={{ fontFamily: "DM Sans", fontSize: "0.875rem", color: "#8A8A8A", marginBottom: "2rem", maxWidth: "360px", margin: "0 auto 2rem", lineHeight: 1.7 }}>
                  {t("bookingWizard.followUpNotice", "Our team will contact you within 24 hours with full trip details, pickup information, and packing recommendations.")}
                </p>

                <div style={{ display: "flex", gap: "12px", justifyContext: "center", flexWrap: "wrap" }}>
                  <Link to="/dashboard" className="btn-forest" style={{ padding: "12px 28px" }}>
                    {t("bookingWizard.viewMyBookings", "View My Bookings")}
                  </Link>
                  <Link to="/packages" className="btn-ghost" style={{ padding: "12px 28px" }}>
                    {t("bookingWizard.browseMoreTours", "Browse More Tours")}
                  </Link>
                </div>
              </div>
            )}
          </div>

          {step < 3 && (
            <div className="booking-sidebar">
              <div style={{ background: "#ffffff", borderRadius: "20px", padding: "1.5rem", border: "1px solid #E8E0D0", position: "sticky", top: "96px" }}>
                {pkg.cover_image && (
                  <img src={pkg.cover_image} alt={pkg.title}
                    style={{ width: "100%", height: "130px", objectFit: "cover", borderRadius: "12px", marginBottom: "1rem" }} />
                )}
                <h3 style={{ fontFamily: "Cormorant Garamath,serif", fontWeight: 600, fontSize: "1rem", color: "#0D0D0D", margin: "0 0 4px", lineHeight: 1.3 }}>
                  {pkg.title}
                </h3>
                <p style={{ fontFamily: "DM Sans", fontSize: "0.78rem", color: "#8A8A8A", margin: "0 0 1.25rem" }}>
                  {pkg.duration_days} Days · {pkg.duration_nights} Nights · {pkg.difficulty}
                </p>

                <div style={{ borderTop: "1px solid #E8E0D0", paddingTop: "1rem", display: "flex", flexDirection: "column", gap: "8px" }}>
                  <SummaryRow label={t("bookingWizard.pricePerson", "Price/person")} value={`$${unitPrice}`} />
                  <SummaryRow label={t("bookingWizard.guests", "Guests")} value={`${totalGuests} person${totalGuests > 1 ? "s" : ""}`} />
                  <SummaryRow label={t("bookingWizard.subtotal", "Subtotal")} value={`$${subtotal.toFixed(2)}`} />
                  {discount > 0 && <SummaryRow label={t("bookingWizard.coupon", "Coupon")} value={`−$${discount.toFixed(2)}`} green />}
                  <div style={{ borderTop: "1px solid #E8E0D0", paddingTop: "10px", display: "flex", justifyContent: "space-between", marginTop: "4px" }}>
                    <span style={{ fontFamily: "DM Sans", fontSize: "0.875rem", color: "#6B6B6B" }}>{t("bookingWizard.total", "Total")}</span>
                    <span style={{ fontFamily: "Cormorant Garamath,serif", fontWeight: 700, fontSize: "1.2rem", color: "#0D0D0D" }}>
                      ${total.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div style={{ marginTop: "1.25rem", padding: "10px 12px", background: "rgba(20,83,45,0.05)", borderRadius: "10px", display: "flex", alignItems: "flex-start", gap: "8px" }}>
                  <Lock size={12} style={{ color: "#14532D", marginTop: "2px", flexShrink: 0 }} />
                  <p style={{ fontFamily: "DM Sans", fontSize: "0.72rem", color: "#2E5840", lineHeight: 1.6, margin: 0 }}>
                    {t("bookingWizard.cancellationNotice", "Free cancellation up to 7 days before departure. All payments processed securely via Stripe or Chapa.")}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media (min-width: 768px) {
          .booking-grid { grid-template-columns: 1fr 320px !important; }
          .step-label   { display: inline !important; }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

function ErrMsg({ msg }) {
  return (
    <p style={{ color: "#EF4444", fontSize: "0.75rem", fontFamily: "DM Sans", marginTop: "4px" }}>
      {msg}
    </p>
  );
}

function SummaryRow({ label, value, green }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between" }}>
      <span style={{ fontFamily: "DM Sans", fontSize: "0.82rem", color: "#8A8A8A" }}>{label}</span>
      <span style={{ fontFamily: "DM Sans", fontSize: "0.82rem", fontWeight: 600, color: green ? "#14532D" : "#0D0D0D" }}>
        {value}
      </span>
    </div>
  );
}