/**
 * Footer — deep obsidian with gold accents.
 */
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Mail, Phone, MapPin, Instagram, Youtube, Facebook, ArrowRight } from "lucide-react";

export default function Footer() {
  const { t } = useTranslation();

  const COL1 = [
    { label: t("nav.destinations", "Destinations"), to: "/destinations" },
    { label: t("nav.tours", "Tour Packages"), to: "/packages" },
    { label: t("nav.gallery", "Gallery"), to: "/gallery" },
    { label: t("nav.blog", "Blog"), to: "/blog" },
  ];

  const COL2 = [
    { label: t("nav.about", "About Us"), to: "/about" },
    { label: t("nav.contact", "Contact"), to: "/contact" },
    { label: t("footer.privacy", "Privacy Policy"), to: "/privacy" },
    { label: t("footer.terms", "Terms"), to: "/terms" },
  ];

  return (
    <footer className="bg-obsidian text-white">
      {/* CTA strip */}
      <div className="border-b border-white/5">
        <div className="max-w-7xl mx-auto px-5 md:px-8 py-14">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <p className="eyebrow mb-2">
                {t("footer.ctaEyebrow", "Start Your Journey")}
              </p>
              <h2 className="font-display font-semibold text-3xl text-white">
                {t("footer.ctaTitle", "Ethiopia is waiting for you")}
              </h2>
            </div>
            <Link to="/packages" className="btn-gold whitespace-nowrap flex items-center gap-2">
              {t("footer.browseTours", "Browse Tours")} <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-5 md:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-full bg-gold-gradient flex items-center justify-center">
                <span className="font-display font-bold text-obsidian text-base">E</span>
              </div>
              <div>
                <p className="font-display font-semibold text-white text-[17px] leading-none">Ethiopia</p>
                <p className="font-body text-[10px] text-saffron tracking-[0.18em] uppercase mt-0.5">Tour & Travel</p>
              </div>
            </Link>
            <p className="text-white/45 text-sm leading-relaxed font-body mb-6">
              {t("footer.tagline", "Expertly guided journeys through East Africa's most extraordinary destination since 2008.")}
            </p>
            <div className="flex gap-2.5">
              {[Facebook, Instagram, Youtube].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-9 h-9 rounded-full border border-white/10 flex items-center justify-center text-white/40 hover:text-saffron hover:border-saffron/40 hover:bg-saffron/5 transition-all duration-200"
                >
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>

          {/* Nav Links Iteration Blocks */}
          <FooterCol title={t("footer.colExplore", "Explore")} links={COL1} />
          <FooterCol title={t("footer.colCompany", "Company")} links={COL2} />

          {/* Contact Details Column */}
          <div>
            <p className="font-body text-xs font-semibold tracking-[0.18em] uppercase text-white/40 mb-4">
              {t("footer.colContact", "Contact")}
            </p>
            <ul className="space-y-3">
              {[
                { Icon: MapPin, text: t("contact.address", "Denbel, Addis Ababa, Ethiopia") },
                { Icon: Phone, text: "+251 945 340 558" },
                { Icon: Mail, text: "info@ethiopiatour.com" },
              ].map(({ Icon, text }) => (
                <li key={text} className="flex items-center gap-2.5 text-sm text-white/50 font-body">
                  <Icon size={14} className="text-saffron flex-shrink-0" />
                  {text}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Legal Settlement Details Bar */}
        <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-white/25 text-xs font-body">
            © {new Date().getFullYear()} Ethiopia Tour & Travel. {t("footer.rights", "All rights reserved.")}
          </p>
          <p className="text-white/20 text-xs font-body">
            {t("footer.secured", "Payments secured by Stripe & Telebirr")}
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }) {
  return (
    <div>
      <p className="font-body text-xs font-semibold tracking-[0.18em] uppercase text-white/40 mb-4">{title}</p>
      <ul className="space-y-2.5">
        {links.map((l) => (
          <li key={l.to}>
            <Link to={l.to} className="text-sm text-white/50 hover:text-saffron font-body transition-colors duration-200">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}