/**
 * RegisterPage.jsx
 * ================
 * User registration form with validation, password visibility toggles, and full i18n support.
 */
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

export default function RegisterPage() {
  const { t } = useTranslation();
  const { register: registerUser } = useAuth();
  const navigate   = useNavigate();
  const [showPw, setShowPw]   = useState(false);
  const [loading, setLoading] = useState(false);

  const schema = z.object({
    first_name: z.string().min(2, t("auth.firstNameRequired")),
    last_name:  z.string().min(2, t("auth.lastNameRequired")),
    email:      z.string().email(t("auth.validEmail")),
    password:   z.string().min(8, t("auth.minChars", { count: 8 })),
    password2:  z.string(),
  }).refine(d => d.password === d.password2, { message: t("auth.passwordsDoNotMatch"), path: ["password2"] });

  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await registerUser(data);
      navigate("/login");
    } catch (err) {
      const msg = err?.response?.data;
      if (typeof msg === "object") Object.values(msg).flat().forEach(m => toast.error(String(m)));
      else toast.error(t("auth.registrationFailed"));
    } finally { setLoading(false); }
  };

  const F = ({ label, name, type = "text", placeholder, err }) => (
    <div>
      <label className="field-label">{label}</label>
      <input type={type} {...register(name)} className="field-input" placeholder={placeholder}
        style={err ? { borderColor: "#EF4444" } : {}} />
      {err && <p style={{ fontFamily: "DM Sans", fontSize: "0.75rem", color: "#EF4444", marginTop: "5px" }}>{err.message}</p>}
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#F7F3ED", display: "flex", alignItems: "center", justifyContent: "center", padding: "5rem 1rem" }}>
      <div style={{ width: "100%", maxWidth: "460px" }}>
        <div style={{ background: "#ffffff", borderRadius: "20px", padding: "2.5rem", boxShadow: "0 4px 32px rgba(13,13,18,0.10)", border: "1px solid #E8E0D0" }}>
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <Link to="/" style={{ display: "inline-flex", alignItems: "center", gap: "10px", textDecoration: "none", marginBottom: "1.5rem" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "linear-gradient(135deg,#C9920A,#E0A80D)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontFamily: "Cormorant Garamond, serif", fontWeight: 700, color: "#0D0D12", fontSize: "16px" }}>E</span>
              </div>
              <span style={{ fontFamily: "Cormorant Garamond, serif", fontWeight: 600, color: "#0D0D0D", fontSize: "1.2rem" }}>Ethiopia Tour & Travel</span>
            </Link>
            <h1 style={{ fontFamily: "Cormorant Garamond, serif", fontWeight: 600, fontSize: "1.8rem", color: "#0D0D0D", margin: "0 0 0.4rem" }}>{t("auth.createAccount")}</h1>
            <p style={{ fontFamily: "DM Sans", fontSize: "0.9rem", color: "#6B6B6B", margin: 0 }}>{t("auth.startPlanning")}</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <F label={t("auth.firstName")} name="first_name" placeholder="Abebe"  err={errors.first_name} />
              <F label={t("auth.lastName")}  name="last_name"  placeholder="Bikila" err={errors.last_name} />
            </div>
            <F label={t("auth.emailAddress")} name="email" type="email" placeholder="you@example.com" err={errors.email} />
            <div>
              <label className="field-label">{t("auth.password")}</label>
              <div style={{ position: "relative" }}>
                <input type={showPw ? "text" : "password"} {...register("password")} className="field-input"
                  placeholder={t("auth.min8Chars")} style={{ paddingRight: "3rem", ...(errors.password ? { borderColor: "#EF4444" } : {}) }} />
                <button type="button" onClick={() => setShowPw(p => !p)}
                  style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#8A8A8A", padding: 0 }}>
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p style={{ fontFamily: "DM Sans", fontSize: "0.75rem", color: "#EF4444", marginTop: "5px" }}>{errors.password.message}</p>}
            </div>
            <div>
              <label className="field-label">{t("auth.confirmPassword")}</label>
              <input type="password" {...register("password2")} className="field-input" placeholder={t("auth.reEnterPassword")}
                style={errors.password2 ? { borderColor: "#EF4444" } : {}} />
              {errors.password2 && <p style={{ fontFamily: "DM Sans", fontSize: "0.75rem", color: "#EF4444", marginTop: "5px" }}>{errors.password2.message}</p>}
            </div>
            <button type="submit" disabled={loading} className="btn-gold" style={{ width: "100%", marginTop: "0.5rem", padding: "14px" }}>
              {loading ? <><Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> {t("auth.creatingAccount")}</> : t("auth.createAccount")}
            </button>
          </form>
          <p style={{ textAlign: "center", fontFamily: "DM Sans", fontSize: "0.875rem", color: "#6B6B6B", marginTop: "1.5rem" }}>
            {t("auth.alreadyHaveAccount")}{" "}
            <Link to="/login" style={{ color: "#C9920A", fontWeight: 600, textDecoration: "none" }}>{t("auth.signIn")}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}