/*  SectionHeader.jsx ───────────*/
export default function SectionHeader({ eyebrow, title, subtitle, light = false, centered = true }) {
  const titleColor    = light ? "#ffffff"              : "#0D0D0D";
  const subtitleColor = light ? "rgba(255,255,255,0.5)" : "#6B6B6B";

  return (
    <div style={{ textAlign: centered ? "center" : "left", marginBottom: "3rem" }}>
      {eyebrow && (
        <p style={{
          fontFamily: "DM Sans, sans-serif", fontSize: "0.7rem", fontWeight: 700,
          letterSpacing: "0.2em", textTransform: "uppercase", color: "#C9920A",
          marginBottom: "0.75rem",
        }}>{eyebrow}</p>
      )}
      <div style={{
        width: "3rem", height: "2px",
        background: "linear-gradient(135deg, #C9920A 0%, #E0A80D 50%, #A07205 100%)",
        borderRadius: "9999px",
        margin: centered ? "0 auto 1rem" : "0 0 1rem",
      }} />
      <h2 style={{
        fontFamily: "Cormorant Garamond, Georgia, serif",
        fontWeight: 600,
        fontSize: "clamp(1.7rem, 3.5vw, 2.6rem)",
        color: titleColor,
        lineHeight: 1.2,
        margin: 0,
        whiteSpace: "pre-line",
      }}>{title}</h2>
      {subtitle && (
        <p style={{
          fontFamily: "DM Sans, sans-serif", fontSize: "1.05rem",
          color: subtitleColor, lineHeight: 1.7, marginTop: "1rem",
          maxWidth: "38rem",
          margin: centered ? "1rem auto 0" : "1rem 0 0",
        }}>{subtitle}</p>
      )}
    </div>
  );
}
