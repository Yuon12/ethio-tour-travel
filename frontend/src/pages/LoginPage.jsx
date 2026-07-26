import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { Eye, EyeOff, Loader2, Lock } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

export default function LoginPage() {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const from = location.state?.from?.pathname || "/dashboard";

  // Using translation keys for Zod validation messages
  const schema = z.object({
    email: z.string().email(t("auth.validEmail")),
    password: z.string().min(6, t("auth.minChars", { count: 6 })),
  });

  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async ({ email, password }) => {
    setLoading(true);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      if (err?.response?.status === 429) {
        toast.error(t("auth.tooManyRequests"));
      } else {
        toast.error(err?.response?.data?.detail || t("auth.invalidCredentials"));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#F7F3ED", display: "flex", alignItems: "center", justifyContent: "center", padding: "5rem 1rem" }}>
      <div style={{ width: "100%", maxWidth: "440px" }}>
        <div style={{ background: "#ffffff", borderRadius: "20px", padding: "2.5rem", boxShadow: "0 4px 32px rgba(13,13,18,0.10)", border: "1px solid #E8E0D0" }}>

          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <Link to="/" style={{ display: "inline-flex", alignItems: "center", gap: "10px", textDecoration: "none", marginBottom: "1.5rem" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "linear-gradient(135deg,#C9920A,#E0A80D)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontFamily: "Cormorant Garamond, serif", fontWeight: 700, color: "#0D0D12", fontSize: "16px" }}>E</span>
              </div>
              <span style={{ fontFamily: "Cormorant Garamond, serif", fontWeight: 600, color: "#0D0D0D", fontSize: "1.2rem" }}>Ethiopia Tour & Travel</span>
            </Link>
            <h1 style={{ fontFamily: "Cormorant Garamond, serif", fontWeight: 600, fontSize: "1.8rem", color: "#0D0D0D", margin: "0 0 0.4rem" }}>{t("auth.welcomeBack")}</h1>
            <p style={{ fontFamily: "DM Sans", fontSize: "0.9rem", color: "#6B6B6B", margin: 0 }}>{t("auth.signInToManage")}</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
            <div>
              <label className="field-label">{t("auth.emailAddress")}</label>
              <input type="email" {...register("email")} className="field-input" placeholder="you@example.com"
                style={errors.email ? { borderColor: "#EF4444" } : {}} />
              {errors.email && <p style={{ fontFamily: "DM Sans", fontSize: "0.75rem", color: "#EF4444", marginTop: "5px" }}>{errors.email.message}</p>}
            </div>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                <label className="field-label" style={{ margin: 0 }}>{t("auth.password")}</label>
                <Link to="/forgot-password" style={{ fontFamily: "DM Sans", fontSize: "0.75rem", color: "#C9920A", textDecoration: "none" }}>{t("auth.forgotPassword")}</Link>
              </div>
              <div style={{ position: "relative" }}>
                <input type={showPw ? "text" : "password"} {...register("password")} className="field-input"
                  placeholder="••••••••" style={{ paddingRight: "3rem", ...(errors.password ? { borderColor: "#EF4444" } : {}) }} />
                <button type="button" onClick={() => setShowPw(p => !p)}
                  style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#8A8A8A", padding: 0 }}>
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p style={{ fontFamily: "DM Sans", fontSize: "0.75rem", color: "#EF4444", marginTop: "5px" }}>{errors.password.message}</p>}
            </div>
            <button type="submit" disabled={loading} className="btn-forest" style={{ width: "100%", marginTop: "0.5rem", padding: "14px" }}>
              {loading ? <><Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> {t("auth.signingIn")}</> : <><Lock size={15} /> {t("auth.signIn")}</>}
            </button>
          </form>

          <p style={{ textAlign: "center", fontFamily: "DM Sans", fontSize: "0.875rem", color: "#6B6B6B", marginTop: "1.5rem" }}>
            {t("auth.noAccount")}{" "}
            <Link to="/register" style={{ color: "#C9920A", fontWeight: 600, textDecoration: "none" }}>{t("auth.createOneFree")}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}