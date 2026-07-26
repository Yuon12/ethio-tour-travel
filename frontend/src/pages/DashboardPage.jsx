/* pages/DashboardPage.jsx */

import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Calendar, Users, ChevronRight, Package } from "lucide-react";
import { bookingsApi } from "../api/bookingsApi";
import { useAuth }     from "../context/AuthContext";
import { useCurrency } from "../context/CurrencyContext";
import LoadingSpinner  from "../components/ui/LoadingSpinner";
import ErrorMessage    from "../components/ui/ErrorMessage";

export default function DashboardPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { format } = useCurrency();

  const STATUS = {
    pending:   { bg: "#FEF9C3", text: "#854D0E", label: t("booking.pendingPayment") },
    confirmed: { bg: "#DCFCE7", text: "#14532D", label: t("booking.confirmed") },
    cancelled: { bg: "#FEE2E2", text: "#991B1B", label: t("dashboard.cancelled") },
    completed: { bg: "#DBEAFE", text: "#1E40AF", label: t("dashboard.completed") },
    refunded:  { bg: "#F3F4F6", text: "#374151", label: t("dashboard.refunded") },
  };

  const { data, isLoading, isError } = useQuery({
    queryKey: ["my-bookings"],
    queryFn:  () => bookingsApi.getMyBookings().then(r => r.data),
  });
  const bookings = data?.results || data || [];

  return (
    <div style={{ background: "#F7F3ED", minHeight: "100vh", paddingTop: "88px" }}>
      <div style={{ maxWidth: "860px", margin: "0 auto", padding: "3rem 2rem" }}>

        {/* Header */}
        <div style={{ marginBottom: "2.5rem" }}>
          <p style={{ fontFamily: "DM Sans", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "#C9920A", marginBottom: "0.5rem" }}>
            {t("dashboard.myAccount")}
          </p>
          <h1 style={{ fontFamily: "Cormorant Garamond, serif", fontWeight: 600, fontSize: "2.5rem", color: "#0D0D0D", margin: "0 0 0.4rem" }}>
            {t("nav.myBookings")}
          </h1>
          <p style={{ fontFamily: "DM Sans", color: "#6B6B6B", margin: 0 }}>
            {t("dashboard.welcomeBack")}, <strong style={{ color: "#0D0D0D" }}>{user?.first_name}</strong>! {t("dashboard.hereAreBookings")}
          </p>
        </div>

        {isLoading ? <LoadingSpinner /> : isError ? <ErrorMessage /> : bookings.length === 0 ? (
          <div style={{ background: "#fff", borderRadius: "20px", padding: "5rem 2rem", textAlign: "center", border: "1px solid #E8E0D0" }}>
            <p style={{ fontSize: "3rem", marginBottom: "1rem" }}>🧳</p>
            <h3 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "1.7rem", color: "#0D0D0D", margin: "0 0 0.5rem" }}>{t("dashboard.noBookingsYet")}</h3>
            <p style={{ fontFamily: "DM Sans", color: "#6B6B6B", marginBottom: "2rem" }}>{t("dashboard.startExploring")}</p>
            <Link to="/packages" className="btn-gold">{t("dashboard.browsePackages")}</Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {bookings.map(b => {
              const st = STATUS[b.status] || STATUS.pending;
              return (
                <div key={b.id} style={{
                  background: "#ffffff", borderRadius: "16px", padding: "20px 24px",
                  border: "1px solid #E8E0D0", boxShadow: "0 2px 10px rgba(13,13,18,0.05)",
                  display: "flex", alignItems: "center", gap: "20px",
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px", flexWrap: "wrap" }}>
                      <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "0.75rem", background: "#F7F3ED", color: "#6B6B6B", padding: "3px 10px", borderRadius: "6px", border: "1px solid #E8E0D0" }}>
                        {b.reference}
                      </span>
                      <span style={{ fontFamily: "DM Sans", fontSize: "0.72rem", fontWeight: 700, padding: "3px 10px", borderRadius: "9999px", background: st.bg, color: st.text }}>
                        {st.label}
                      </span>
                    </div>
                    <h3 style={{ fontFamily: "Cormorant Garamond, serif", fontWeight: 600, fontSize: "1.1rem", color: "#0D0D0D", margin: "0 0 8px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {b.package_title}
                    </h3>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "14px" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: "5px", fontFamily: "DM Sans", fontSize: "0.8rem", color: "#6B6B6B" }}>
                        <Calendar size={13} style={{ color: "#C9920A" }} />{b.start_date} → {b.end_date}
                      </span>
                      <span style={{ display: "flex", alignItems: "center", gap: "5px", fontFamily: "DM Sans", fontSize: "0.8rem", color: "#6B6B6B" }}>
                        <Users size={13} style={{ color: "#C9920A" }} />{b.total_guests} {b.total_guests !== 1 ? t("dashboard.guestsPlural") : t("dashboard.guestSingular")}
                      </span>
                    </div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <p style={{ fontFamily: "Cormorant Garamond, serif", fontWeight: 700, fontSize: "1.4rem", color: "#0D0D0D", margin: "0 0 2px" }}>{format(b.total_price_usd)}</p>
                    <Link to={`/bookings/${b.reference}`}
                      style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontFamily: "DM Sans", fontSize: "0.78rem", fontWeight: 600, color: "#C9920A", textDecoration: "none" }}>
                      {t("dashboard.details")} <ChevronRight size={13} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}