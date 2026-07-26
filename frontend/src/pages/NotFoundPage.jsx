/* FIXED NotFoundPage.jsx */
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function NotFoundPage() {
  const { t } = useTranslation();
  return (
    <div style={{ minHeight: "100vh", background: "#F7F3ED", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
      <div style={{ textAlign: "center", maxWidth: "480px" }}>
        <p style={{ fontSize: "5rem", marginBottom: "1rem" }}>🌍</p>
        <h1 style={{ fontFamily: "Cormorant Garamond, serif", fontWeight: 700, fontSize: "5rem", color: "#0D0D0D", margin: "0 0 0.5rem", lineHeight: 1 }}>404</h1>
        <h2 style={{ fontFamily: "Cormorant Garamond, serif", fontWeight: 600, fontSize: "1.8rem", color: "#0D0D0D", margin: "0 0 1rem" }}>{t("notFound.title")}</h2>
        <p style={{ fontFamily: "DM Sans", color: "#6B6B6B", lineHeight: 1.7, marginBottom: "2rem" }}>
          {t("notFound.desc")}
        </p>
        <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
          <Link to="/"        className="btn-forest">{t("notFound.backHome")}</Link>
          <Link to="/packages" className="btn-ghost">{t("notFound.browseTours")}</Link>
        </div>
      </div>
    </div>
  );
}