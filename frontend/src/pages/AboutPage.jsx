/**
 * AboutPage.jsx
 * =============
 * Company story, mission, core values, and team showcase with full i18n support.
 */
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Shield, Award, Heart, Globe } from "lucide-react";

export default function AboutPage() {
  const { t } = useTranslation();

  const TEAM = [
    { name: t("about.team.yonas.name", "Yonas wen"), role: t("about.team.yonas.role", "Founder & CEO"), bio: t("about.team.yonas.bio", "20 years guiding travelers through Ethiopia's highlands and historical sites.") },
    { name: t("about.team.selam.name", "Selam Bekele"), role: t("about.team.selam.role", "Head of Operations"), bio: t("about.team.selam.bio", "Ensuring every tour runs smoothly and every traveler feels cared for.") },
    { name: t("about.team.yuonah.name", "Yuonah alep"), role: t("about.team.yuonah.role", "Lead Tour Guide"), bio: t("about.team.yuonah.bio", "An expert in the northern historical circuit with deep local knowledge.") },
    { name: t("about.team.meron.name", "Meron Tesfaye"), role: t("about.team.meron.role", "Customer Relations"), bio: t("about.team.meron.bio", "Dedicated to making every traveler feel welcome from first contact.") },
  ];

  const VALUES = [
    { Icon: Shield, title: t("about.values.safety.title", "Safety First"), desc: t("about.values.safety.desc", "All tours are fully insured and led by certified, experienced guides.") },
    { Icon: Heart,  title: t("about.values.community.title", "Community Impact"), desc: t("about.values.community.desc", "We support local guides, artisans, and communities at every destination.") },
    { Icon: Award,  title: t("about.values.excellence.title", "Excellence"), desc: t("about.values.excellence.desc", "500+ five-star reviews and consistent recognition by tourism bodies.") },
    { Icon: Globe,  title: t("about.values.global.title", "Global Reach"), desc: t("about.values.global.desc", "Serving travelers from 40+ countries who trust us to show them Ethiopia.") },
  ];

  const STATS = [
    { value: "15+", label: t("about.stats.years", "Years Operating") },
    { value: "500+", label: t("about.stats.travelers", "Happy Travelers") },
    { value: "50+", label: t("about.stats.packages", "Tour Packages") },
    { value: "30+", label: t("about.stats.destinations", "Destinations") },
  ];

  return (
    <div style={{ background: "#F7F3ED" }}>

      {/* ── Hero: DARK BACKGROUND → WHITE TEXT ── */}
      <section style={{
        background: "linear-gradient(135deg, #0D0D12 0%, #1a1410 100%)",
        padding: "120px 0 80px",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Subtle warm texture */}
        <div style={{
          position: "absolute", inset: 0, opacity: 0.04,
          backgroundImage: "radial-gradient(circle at 30% 50%, #C9920A 0%, transparent 60%), radial-gradient(circle at 70% 50%, #5C3317 0%, transparent 60%)",
        }} />
        <div style={{ position: "relative", maxWidth: "720px", margin: "0 auto", padding: "0 2rem" }}>
          <p style={{
            fontFamily: "DM Sans", fontSize: "0.7rem", fontWeight: 700,
            letterSpacing: "0.2em", textTransform: "uppercase", color: "#C9920A",
            marginBottom: "1rem",
          }}>{t("about.eyebrow", "Our Story")}</p>
          <div style={{ width: "3rem", height: "2px", background: "linear-gradient(135deg,#C9920A,#E0A80D,#A07205)", borderRadius: "9999px", margin: "0 auto 1.5rem" }} />
          <h1 style={{
            fontFamily: "Cormorant Garamond, Georgia, serif",
            fontWeight: 600, fontSize: "clamp(2.4rem,6vw,4.2rem)",
            color: "#ffffff",
            lineHeight: 1.1, margin: "0 0 1.25rem",
          }}>{t("about.title", "About Ethiopia Tour & Travel")}</h1>
          <p style={{
            fontFamily: "DM Sans", fontSize: "1.1rem",
            color: "rgba(255,255,255,0.6)",
            lineHeight: 1.7, margin: 0,
          }}>
            {t("about.subtitle", "Founded in Addis Ababa by passionate local guides, we've spent over 15 years sharing Ethiopia's extraordinary story with the world.")}
          </p>
        </div>
      </section>

      {/* ── Mission section: WHITE BG → DARK TEXT ── */}
      <section style={{ background: "#ffffff", padding: "80px 0" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 2rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "60px", alignItems: "start" }}>
            <div>
              <p style={{ fontFamily: "DM Sans", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "#C9920A", marginBottom: "0.5rem" }}>{t("about.missionEyebrow", "Our Mission")}</p>
              <h2 style={{ fontFamily: "Cormorant Garamond, serif", fontWeight: 600, fontSize: "clamp(1.8rem,4vw,2.8rem)", color: "#0D0D0D", lineHeight: 1.15, marginBottom: "1.25rem" }}>
                {t("about.missionTitle", "Connecting the World to Ethiopia's Soul")}
              </h2>
              <p style={{ fontFamily: "DM Sans", fontSize: "0.95rem", color: "#4A4A4A", lineHeight: 1.8, marginBottom: "1rem" }}>
                {t("about.missionP1", "Ethiopia is not just a destination — it's a living museum of human civilization. Home to the oldest human fossil, the magnificent rock-hewn churches of Lalibela, the ancient Axumite obelisks, and over 80 unique ethnic groups.")}
              </p>
              <p style={{ fontFamily: "DM Sans", fontSize: "0.95rem", color: "#4A4A4A", lineHeight: 1.8 }}>
                {t("about.missionP2", "Our mission: design unforgettable journeys that respect Ethiopia's culture, support its communities, and leave our travelers with memories that last a lifetime.")}
              </p>
            </div>

            {/* Stats grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              {STATS.map(({ value, label }) => (
                <div key={label} style={{
                  background: "#F7F3ED", borderRadius: "16px", padding: "28px 20px",
                  textAlign: "center", border: "1px solid #E8E0D0",
                }}>
                  <p style={{ fontFamily: "Cormorant Garamond, serif", fontWeight: 700, fontSize: "2.4rem", color: "#C9920A", margin: "0 0 4px" }}>{value}</p>
                  <p style={{ fontFamily: "DM Sans", fontSize: "0.8rem", color: "#6B6B6B", margin: 0 }}>{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Values: LIGHT IVORY BG → DARK TEXT ── */}
      <section style={{ background: "#F7F3ED", padding: "80px 0" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 2rem" }}>
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <p style={{ fontFamily: "DM Sans", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "#C9920A", marginBottom: "0.75rem" }}>{t("about.valuesEyebrow", "What we stand for")}</p>
            <h2 style={{ fontFamily: "Cormorant Garamond, serif", fontWeight: 600, fontSize: "clamp(1.8rem,4vw,2.8rem)", color: "#0D0D0D", margin: 0 }}>{t("about.valuesTitle", "Our Values")}</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px" }}>
            {VALUES.map(({ Icon, title, desc }) => (
              <div key={title} style={{
                background: "#ffffff", borderRadius: "16px", padding: "32px 24px",
                border: "1px solid #E8E0D0", textAlign: "center",
                transition: "box-shadow 0.3s, transform 0.3s",
              }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 12px 40px rgba(13,13,18,0.10)"; e.currentTarget.style.transform = "translateY(-4px)"; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "none"; }}>
                <div style={{
                  width: "48px", height: "48px", borderRadius: "12px",
                  background: "rgba(201,146,10,0.10)", display: "flex",
                  alignItems: "center", justifyContent: "center", margin: "0 auto 1rem",
                }}>
                  <Icon size={22} style={{ color: "#C9920A" }} />
                </div>
                <h3 style={{ fontFamily: "Cormorant Garamond, serif", fontWeight: 600, fontSize: "1.2rem", color: "#0D0D0D", margin: "0 0 0.5rem" }}>{title}</h3>
                <p style={{ fontFamily: "DM Sans", fontSize: "0.875rem", color: "#6B6B6B", lineHeight: 1.7, margin: 0 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Team: WHITE BG → DARK TEXT ── */}
      <section style={{ background: "#ffffff", padding: "80px 0" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 2rem" }}>
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <p style={{ fontFamily: "DM Sans", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "#C9920A", marginBottom: "0.75rem" }}>{t("about.teamEyebrow", "The people behind your journey")}</p>
            <h2 style={{ fontFamily: "Cormorant Garamond, serif", fontWeight: 600, fontSize: "clamp(1.8rem,4vw,2.8rem)", color: "#0D0D0D", margin: 0 }}>{t("about.teamTitle", "Meet the Team")}</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "28px" }}>
            {TEAM.map(({ name, role, bio }) => (
              <div key={name} style={{ textAlign: "center" }}>
                <div style={{
                  width: "72px", height: "72px", borderRadius: "50%",
                  background: "linear-gradient(135deg, #C9920A, #E0A80D)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  margin: "0 auto 14px",
                  fontFamily: "Cormorant Garamond, serif", fontWeight: 700, fontSize: "1.6rem", color: "#0D0D12",
                }}>{name[0]}</div>
                <h3 style={{ fontFamily: "Cormorant Garamond, serif", fontWeight: 600, fontSize: "1.1rem", color: "#0D0D0D", margin: "0 0 4px" }}>{name}</h3>
                <p style={{ fontFamily: "DM Sans", fontSize: "0.75rem", fontWeight: 600, color: "#C9920A", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 8px" }}>{role}</p>
                <p style={{ fontFamily: "DM Sans", fontSize: "0.85rem", color: "#6B6B6B", lineHeight: 1.7, margin: 0 }}>{bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA: DARK BG → WHITE TEXT ── */}
      <section style={{ background: "#0D0D12", padding: "80px 0", textAlign: "center" }}>
        <div style={{ maxWidth: "600px", margin: "0 auto", padding: "0 2rem" }}>
          <h2 style={{ fontFamily: "Cormorant Garamond, serif", fontWeight: 600, fontSize: "clamp(2rem,5vw,3rem)", color: "#ffffff", margin: "0 0 1rem" }}>
            {t("about.ctaTitle", "Ready to Explore Ethiopia?")}
          </h2>
          <p style={{ fontFamily: "DM Sans", color: "rgba(255,255,255,0.55)", fontSize: "1.05rem", lineHeight: 1.7, margin: "0 0 2rem" }}>
            {t("about.ctaSub", "Browse our handcrafted tour packages and start planning your journey today.")}
          </p>
          <Link to="/packages" className="btn-gold">{t("about.ctaBtn", "View Tour Packages")}</Link>
        </div>
      </section>
    </div>
  );
}