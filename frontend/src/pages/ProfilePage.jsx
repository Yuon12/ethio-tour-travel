/**
 * ProfilePage.jsx
 * ===============
 * User profile management, personal information form, and password updates with full i18n support.
 */
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { Loader2, User, Lock, CheckCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { authApi } from "../api/authApi";
import toast from "react-hot-toast";

export default function ProfilePage() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPw,      setSavingPw]      = useState(false);
  const [activeTab,     setActiveTab]     = useState("profile");

  const profileSchema = z.object({
    first_name:  z.string().min(2, t("auth.firstNameRequired")),
    last_name:   z.string().min(2, t("auth.lastNameRequired")),
    phone:       z.string().optional(),
    nationality: z.string().optional(),
    bio:         z.string().optional(),
  });

  const passwordSchema = z.object({
    old_password: z.string().min(1, t("profile.currentPasswordRequired")),
    new_password: z.string().min(8, t("auth.minChars", { count: 8 })),
    confirm_password: z.string(),
  }).refine(d => d.new_password === d.confirm_password, {
    message: t("auth.passwordsDoNotMatch"), path: ["confirm_password"],
  });

  const profileForm = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      first_name:  user?.first_name  || "",
      last_name:   user?.last_name   || "",
      phone:       user?.phone       || "",
      nationality: user?.nationality || "",
      bio:         user?.bio         || "",
    },
  });

  const passwordForm = useForm({ resolver: zodResolver(passwordSchema) });

  const onSaveProfile = async (data) => {
    setSavingProfile(true);
    try {
      await authApi.updateProfile(data);
      toast.success(t("profile.updateSuccess"));
    } catch (err) {
      toast.error(t("profile.updateFailed"));
    } finally {
      setSavingProfile(false);
    }
  };

  const onChangePassword = async (data) => {
    setSavingPw(true);
    try {
      await authApi.changePassword({
        old_password: data.old_password,
        new_password: data.new_password,
      });
      toast.success(t("profile.passwordChangedRelogin"));
      setTimeout(() => logout(), 1500);
    } catch (err) {
      const msg = err?.response?.data?.old_password?.[0] || t("profile.passwordChangeFailed");
      toast.error(msg);
    } finally {
      setSavingPw(false);
    }
  };

  const ROLE_COLORS = {
    admin:   { bg: "#F3E8FF", text: "#7C3AED", label: t("profile.roleAdmin") },
    guide:   { bg: "#DBEAFE", text: "#1D4ED8", label: t("profile.roleGuide") },
    tourist: { bg: "#DCFCE7", text: "#15803D", label: t("profile.roleTraveler") },
  };
  const role = ROLE_COLORS[user?.role] || ROLE_COLORS.tourist;

  return (
    <div style={{ background: "#F7F3ED", minHeight: "100vh", paddingTop: "88px" }}>
      <div style={{ maxWidth: "760px", margin: "0 auto", padding: "3rem 2rem" }}>

        {/* ── Header card ── */}
        <div style={{
          background: "#ffffff", borderRadius: "20px", padding: "2rem",
          border: "1px solid #E8E0D0", boxShadow: "0 2px 16px rgba(13,13,18,0.06)",
          display: "flex", alignItems: "center", gap: "1.5rem", marginBottom: "1.5rem",
          flexWrap: "wrap",
        }}>
          {/* Avatar */}
          <div style={{ position: "relative" }}>
            <div style={{
              width: "72px", height: "72px", borderRadius: "50%",
              background: "linear-gradient(135deg,#C9920A,#E0A80D)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "Cormorant Garamond,serif", fontWeight: 700,
              fontSize: "1.8rem", color: "#0D0D12",
            }}>
              {user?.first_name?.[0]}{user?.last_name?.[0]}
            </div>
          </div>

          <div style={{ flex: 1 }}>
            <h1 style={{
              fontFamily: "Cormorant Garamond,serif", fontWeight: 600,
              fontSize: "1.6rem", color: "#0D0D0D", margin: "0 0 4px",
            }}>
              {user?.first_name} {user?.last_name}
            </h1>
            <p style={{ fontFamily: "DM Sans", fontSize: "0.875rem", color: "#6B6B6B", margin: "0 0 8px" }}>
              {user?.email}
            </p>
            <span style={{
              display: "inline-block", padding: "3px 12px", borderRadius: "9999px",
              background: role.bg, color: role.text,
              fontFamily: "DM Sans", fontSize: "0.72rem", fontWeight: 700,
              textTransform: "uppercase", letterSpacing: "0.1em",
            }}>{role.label}</span>
          </div>
        </div>

        {/* ── Tab switcher ── */}
        <div style={{
          display: "flex", background: "#E8E0D0", borderRadius: "12px",
          padding: "4px", marginBottom: "1.5rem", gap: "4px",
        }}>
          {[
            { id: "profile", Icon: User,  label: t("profile.personalInfo") },
            { id: "password",Icon: Lock,  label: t("profile.changePassword") },
          ].map(({ id, Icon, label }) => (
            <button key={id} onClick={() => setActiveTab(id)} style={{
              flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
              gap: "6px", padding: "10px 16px", borderRadius: "8px",
              fontFamily: "DM Sans", fontSize: "0.875rem", fontWeight: 600,
              border: "none", cursor: "pointer", transition: "all 0.2s",
              background: activeTab === id ? "#ffffff" : "transparent",
              color:      activeTab === id ? "#0D0D0D"  : "#6B6B6B",
              boxShadow:  activeTab === id ? "0 2px 8px rgba(13,13,18,0.08)" : "none",
            }}>
              <Icon size={15} style={{ color: activeTab === id ? "#C9920A" : "#ABABAB" }} />
              {label}
            </button>
          ))}
        </div>

        {/* ── Profile tab ── */}
        {activeTab === "profile" && (
          <div style={{ background: "#ffffff", borderRadius: "20px", padding: "2rem", border: "1px solid #E8E0D0" }}>
            <h2 style={{ fontFamily: "Cormorant Garamond,serif", fontWeight: 600, fontSize: "1.4rem", color: "#0D0D0D", margin: "0 0 1.5rem" }}>
              {t("profile.personalInfo")}
            </h2>
            <form onSubmit={profileForm.handleSubmit(onSaveProfile)}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                <div>
                  <label className="field-label">{t("auth.firstName")}</label>
                  <input {...profileForm.register("first_name")} className="field-input"
                    style={profileForm.formState.errors.first_name ? { borderColor: "#EF4444" } : {}} />
                  {profileForm.formState.errors.first_name && (
                    <p style={{ color: "#EF4444", fontSize: "0.75rem", fontFamily: "DM Sans", marginTop: "4px" }}>
                      {profileForm.formState.errors.first_name.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="field-label">{t("auth.lastName")}</label>
                  <input {...profileForm.register("last_name")} className="field-input"
                    style={profileForm.formState.errors.last_name ? { borderColor: "#EF4444" } : {}} />
                  {profileForm.formState.errors.last_name && (
                    <p style={{ color: "#EF4444", fontSize: "0.75rem", fontFamily: "DM Sans", marginTop: "4px" }}>
                      {profileForm.formState.errors.last_name.message}
                    </p>
                  )}
                </div>
              </div>

              <div style={{ marginBottom: "1rem" }}>
                <label className="field-label">{t("auth.emailAddress")}</label>
                <input type="email" value={user?.email || ""} disabled className="field-input"
                  style={{ background: "#F7F3ED", color: "#8A8A8A", cursor: "not-allowed" }} />
                <p style={{ fontFamily: "DM Sans", fontSize: "0.72rem", color: "#ABABAB", marginTop: "4px" }}>
                  {t("profile.emailCannotChange")}
                </p>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                <div>
                  <label className="field-label">{t("profile.phoneNumber")}</label>
                  <input {...profileForm.register("phone")} className="field-input" placeholder="+251 911 000 000" />
                </div>
                <div>
                  <label className="field-label">{t("profile.nationality")}</label>
                  <input {...profileForm.register("nationality")} className="field-input" placeholder={t("profile.nationalityPlaceholder")} />
                </div>
              </div>

              <div style={{ marginBottom: "1.5rem" }}>
                <label className="field-label">{t("profile.bio")} <span style={{ textTransform: "none", fontWeight: 400, color: "#ABABAB" }}>({t("common.optional")})</span></label>
                <textarea {...profileForm.register("bio")} rows={3}
                  className="field-input" style={{ resize: "vertical" }}
                  placeholder={t("profile.bioPlaceholder")} />
              </div>

              <button type="submit" disabled={savingProfile} className="btn-gold" style={{ padding: "13px 28px" }}>
                {savingProfile
                  ? <><Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> {t("common.saving")}</>
                  : <><CheckCircle size={16} /> {t("profile.saveChanges")}</>
                }
              </button>
            </form>
          </div>
        )}

        {/* ── Password tab ── */}
        {activeTab === "password" && (
          <div style={{ background: "#ffffff", borderRadius: "20px", padding: "2rem", border: "1px solid #E8E0D0" }}>
            <h2 style={{ fontFamily: "Cormorant Garamond,serif", fontWeight: 600, fontSize: "1.4rem", color: "#0D0D0D", margin: "0 0 0.5rem" }}>
              {t("profile.changePassword")}
            </h2>
            <p style={{ fontFamily: "DM Sans", fontSize: "0.875rem", color: "#6B6B6B", marginBottom: "1.5rem" }}>
              {t("profile.changePasswordNote")}
            </p>

            <form onSubmit={passwordForm.handleSubmit(onChangePassword)} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {[
                { name: "old_password",      label: t("profile.currentPassword"),  placeholder: t("profile.currentPasswordPlaceholder") },
                { name: "new_password",      label: t("auth.newPassword"),      placeholder: t("auth.min8Chars") },
                { name: "confirm_password",  label: t("auth.confirmNewPassword"), placeholder: t("auth.reEnterNewPassword") },
              ].map(({ name, label, placeholder }) => (
                <div key={name}>
                  <label className="field-label">{label}</label>
                  <input type="password" {...passwordForm.register(name)} className="field-input"
                    placeholder={placeholder}
                    style={passwordForm.formState.errors[name] ? { borderColor: "#EF4444" } : {}} />
                  {passwordForm.formState.errors[name] && (
                    <p style={{ color: "#EF4444", fontSize: "0.75rem", fontFamily: "DM Sans", marginTop: "4px" }}>
                      {passwordForm.formState.errors[name].message}
                    </p>
                  )}
                </div>
              ))}

              <button type="submit" disabled={savingPw} className="btn-forest" style={{ padding: "13px 28px", marginTop: "0.5rem" }}>
                {savingPw
                  ? <><Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> {t("profile.updating")}</>
                  : <><Lock size={16} /> {t("auth.updatePassword")}</>
                }
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}