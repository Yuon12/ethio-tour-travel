/**
 * HomePage — editorial premium design.
 * Hero: full-bleed video-like parallax with animated golden arc divider.
 * Sections: Destinations → Packages → Why Us → Testimonials → Newsletter (Dynamic States Fixed)
 */
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Search, ArrowRight, Shield, Award, Globe, Headphones, Loader2, Check } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";
import { useFeaturedDestinations } from "../hooks/useDestinations";
import { useFeaturedPackages }     from "../hooks/usePackages";
import { useTestimonials }         from "../hooks/useReviews";
import DestinationCard from "../components/ui/DestinationCard";
import PackageCard     from "../components/ui/PackageCard";
import SectionHeader   from "../components/ui/SectionHeader";
import LoadingSpinner  from "../components/ui/LoadingSpinner";
import StarRating      from "../components/ui/StarRating";

// Quick chips mapped to specific package slugs
const QUICK_PACKAGES = [
  {
    slug: "danakil-depression-extreme-expedition",
    labelKey: "home.quick.danakilExpedition",
    defaultLabel: "Danakil Depression Extreme Expedition",
  },
  {
    slug: "northern-historic-route-monolithic-splendors",
    labelKey: "home.quick.northernRoute",
    defaultLabel: "Northern Historic Route & Monolithic Splendors",
  },
  {
    slug: "lalibela-rock-hewn-churches",
    labelKey: "home.quick.lalibela",
    defaultLabel: "Lalibela",
  },
  {
    slug: "simien-mountains-trekking",
    labelKey: "home.quick.simien",
    defaultLabel: "Simien Mountains",
  },
];

export default function HomePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  
  // Newsletter States
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubscribed, setHasSubscribed] = useState(false); 

  const { data: destinations, isLoading: dL } = useFeaturedDestinations();
  const { data: packages,     isLoading: pL } = useFeaturedPackages();
  const { data: testimonials }                = useTestimonials();

  const destList = destinations?.results || destinations || [];
  const pkgList  = packages?.results     || packages     || [];
  const testList = testimonials?.results || testimonials || [];

  // Hardened Async Network Subscription Engine
  const handleSubscribe = async (e) => {
    e.preventDefault();
    
    if (hasSubscribed) return; 

    if (!email || typeof email !== "string" || !email.trim()) {
      toast.error("Please enter a valid email address.");
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    setIsSubmitting(true);
    
    try {
      const response = await axios.post("http://localhost:8000/api/v1/auth/newsletter/subscribe/", {
        email: cleanEmail
      });
      
      if (response.status === 200) {
        toast.success(response.data?.message || "You are already in our travel network!", {
          icon: '✉️'
        });
      } else {
        toast.success(response.data?.message || "Welcome aboard! Check your inbox for updates.");
      }
      
      setHasSubscribed(true); 
    } catch (err) {
      console.error("Newsletter Subscription Failure:", err);
      
      if (err.response) {
        if (err.response.status === 429) {
          toast.error("Submitting too fast. Please wait a moment.");
        } else {
          toast.error(err.response.data?.error || err.response.data?.detail || "Subscription failed.");
        }
      } else {
        toast.error("Connection error. Is your Django server active on port 8000?");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-ivory">

      {/* ═══════════════════════════ HERO ═══════════════════════════ */}
      <section className="relative min-h-screen flex items-end overflow-hidden bg-obsidian">
        {/* Background */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1523805009345-7448845a9e53?w=1920&q=85"
            alt="Lalibela, Ethiopia"
            className="w-full h-full object-cover opacity-55"
          />
          <div className="absolute inset-0 bg-hero-gradient" />
          <div className="absolute inset-0 opacity-20"
            style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=\"0 0 256 256\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cfilter id=\"noise\"%3E%3CfeTurbulence type=\"fractalNoise\" baseFrequency=\"0.9\" numOctaves=\"4\" stitchTiles=\"stitch\"/%3E%3C/filter%3E%3Crect width=\"100%25\" height=\"100%25\" filter=\"url(%23noise)\" opacity=\"0.4\"/%3E%3C/svg%3E')" }} />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-5 md:px-8 pb-24 pt-40 w-full">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="gold-rule" />
              <p className="eyebrow">{t("home.heroEyebrow")}</p>
            </div>

            <h1 className="font-display text-display-2xl font-semibold text-white mb-6 leading-[1.05]">
              {t("home.heroTitle").split(" ").slice(0, 3).join(" ")}<br />
              <em className="not-italic text-saffron">{t("home.heroTitle").split(" ").slice(3).join(" ")}</em>
            </h1>

            <p className="font-body text-lg text-white/60 mb-10 max-w-xl leading-relaxed">
              {t("home.heroSub")}
            </p>

            {/* Search */}
            <div className="flex flex-col sm:flex-row gap-3 max-w-xl mb-8">
              <div className="flex-1 flex items-center gap-3 bg-white/10 backdrop-blur-md
                            border border-white/20 rounded-full px-5 py-3.5
                            focus-within:border-saffron/60 focus-within:bg-white/15 transition-all">
                <Search size={16} className="text-white/40 flex-shrink-0" />
                <input type="text" value={query} onChange={e => setQuery(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && query && navigate(`/packages?search=${encodeURIComponent(query)}`)}
                  placeholder={t("home.searchPlaceholder")}
                  className="bg-transparent text-white text-sm placeholder:text-white/35 outline-none w-full font-body" />
              </div>
              <button onClick={() => query && navigate(`/packages?search=${encodeURIComponent(query)}`)}
                className="btn-gold px-7 py-3.5 rounded-full whitespace-nowrap">
                {t("home.exploreBtn")}
              </button>
            </div>

            {/* Quick chips */}
            <div className="flex flex-wrap gap-2">
              {QUICK_PACKAGES.map(({ slug, labelKey, defaultLabel }) => (
                <button
                key={slug}
                onClick={() => navigate(`/packages/${slug}`)}
                className="tag tag-white hover:bg-white/20 hover:border-white/40 transition-all cursor-pointer">
                  {t(labelKey, defaultLabel)}
                  </button>
                ))}
            </div>
          </div>

          {/* Stats row */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-px bg-white/5 rounded-2xl overflow-hidden
                        border border-white/5 backdrop-blur-sm">
            {[
              { value: "500+", label: t("home.stats.travelers") },
              { value: "50+",  label: t("home.stats.packages") },
              { value: "15+",  label: t("home.stats.experience") },
              { value: "30+",  label: t("home.stats.destinations") },
            ].map(({ value, label }) => (
              <div key={label} className="bg-white/[0.03] px-6 py-5 text-center">
                <p className="font-display text-3xl font-semibold text-saffron">{value}</p>
                <p className="font-body text-xs text-white/40 mt-1 tracking-wide">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Gold arc divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 80 C360 20 1080 20 1440 80 L1440 80 L0 80Z" fill="#F5F0E8" />
            <path d="M0 80 C360 20 1080 20 1440 80" stroke="url(#goldGrad)" strokeWidth="2" fill="none" />
            <defs>
              <linearGradient id="goldGrad" x1="0" y1="0" x2="1440" y2="0" gradientUnits="userSpaceOnUse">
                <stop offset="0%"   stopColor="#A07810" stopOpacity="0" />
                <stop offset="30%"  stopColor="#D4A017" />
                <stop offset="70%"  stopColor="#E8C042" />
                <stop offset="100%" stopColor="#A07810" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </section>

      {/* ═══════════════════════ DESTINATIONS ═══════════════════════ */}
      <section className="py-24 bg-ivory">
        <div className="max-w-7xl mx-auto px-5 md:px-8">
          <div className="flex items-end justify-between mb-14">
            <SectionHeader 
              centered={false} 
              eyebrow={t("home.destinationsEyebrow", "ወደ የት መሄድ ይፈልጋሉ")} 
              title={t("home.destinationsTitle")} 
            />
            <Link to="/destinations" className="hidden md:flex items-center gap-2 font-body text-sm font-medium
                                                text-parchment-500 hover:text-saffron transition-colors group">
              {t("home.allDestinations")}
              <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          {dL ? <LoadingSpinner /> : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {destList.slice(0, 6).map(d => <DestinationCard key={d.id} destination={d} />)}
            </div>
          )}
        </div>
      </section>

      {/* ═══════════════════════ PACKAGES ════════════════════════════ */}
      <section className="py-24 bg-ivory-warm">
        <div className="max-w-7xl mx-auto px-5 md:px-8">
          <div className="flex items-end justify-between mb-14">
            <SectionHeader 
              centered={false} 
              eyebrow={t("home.packagesEyebrow", "በልዩ ሁኔታ የተዘጋጁ ጉዞዎች")} 
              title={t("home.packagesTitle")} 
            />
            <Link to="/packages" className="hidden md:flex items-center gap-2 font-body text-sm font-medium
                                        text-parchment-500 hover:text-saffron transition-colors group">
              {t("home.viewAllPackages")} <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          {pL ? <LoadingSpinner /> : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {pkgList.map(p => <PackageCard key={p.id} pkg={p} />)}
            </div>
          )}
        </div>
      </section>

      {/* ═══════════════════════ WHY US ══════════════════════════════ */}
      <section className="py-24 bg-obsidian relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                          w-[600px] h-[400px] bg-saffron/3 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-5 md:px-8">
          <SectionHeader 
            light 
            centered 
            eyebrow={t("home.whyEyebrow", "የእኛ ቃል ኪዳን")} 
            title={t("home.whyTitle")}
            subtitle={t("home.whySubtitle")} 
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-4">
            {[
              { Icon: Shield,    ...t("home.whyItems.licensed", { returnObjects: true }) },
              { Icon: Award,     ...t("home.whyItems.guides", { returnObjects: true }) },
              { Icon: Globe,     ...t("home.whyItems.access", { returnObjects: true }) },
              { Icon: Headphones, ...t("home.whyItems.reach", { returnObjects: true }) },
            ].map(({ Icon, title, desc }) => (
              <div key={title}
                className="card-dark p-7 group hover:-translate-y-1 hover:border-saffron/40
                           transition-all duration-300">
                <div className="w-11 h-11 rounded-xl bg-saffron/10 flex items-center justify-center mb-5
                               group-hover:bg-saffron/20 transition-colors">
                  <Icon size={20} className="text-saffron" />
                </div>
                <h3 className="font-display font-semibold text-white text-lg mb-2">{title}</h3>
                <p className="font-body text-sm text-white/40 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════ TESTIMONIALS ════════════════════════ */}
      {testList.length > 0 && (
        <section className="py-24 bg-ivory">
          <div className="max-w-7xl mx-auto px-5 md:px-8">
            <SectionHeader 
              eyebrow={t("home.testimonialsEyebrow", "የተጓዦች ታሪክ")} 
              title={t("home.testimonialsTitle")} 
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {testList.slice(0, 3).map(r => (
                <div key={r.id} className="bg-white rounded-2xl p-7 shadow-card-rest
                                        hover:shadow-card-hover transition-all duration-300
                                        border border-parchment-100 hover:border-saffron/20">
                  <StarRating rating={r.rating} />
                  <h4 className="font-display font-semibold text-parchment-900 text-lg mt-4 mb-2">{r.title}</h4>
                  <p className="font-body text-sm text-parchment-500 leading-relaxed line-clamp-4">{r.content}</p>
                  <div className="flex items-center gap-3 mt-5 pt-5 border-t border-parchment-100">
                    <div className="w-9 h-9 rounded-full bg-gold-gradient flex items-center justify-center text-obsidian font-bold text-sm">
                      {r.author_name?.[0] || "T"}
                    </div>
                    <div>
                      <p className="font-body text-sm font-medium text-parchment-900">{r.author_name}</p>
                      <p className="font-body text-xs text-parchment-400 line-clamp-1">{r.package_title}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════════════ NEWSLETTER ══════════════════════════ */}
      <section className="py-24 bg-coffee relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-coffee-dark via-coffee to-coffee-light opacity-80" />
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 60px, rgba(212,160,23,0.3) 60px, rgba(212,160,23,0.3) 61px)" }} />
        </div>
        <div className="relative max-w-2xl mx-auto px-5 text-center">
          <p className="eyebrow mb-4">{t("home.newsletter.eyebrow")}</p>
          <h2 className="font-display font-semibold text-4xl md:text-5xl text-white mb-4">
            {t("home.newsletter.title")}
          </h2>
          <p className="font-body text-white/60 text-lg mb-10">
            {t("home.newsletter.subtitle")}
          </p>
          
          <form onSubmit={handleSubscribe} className="flex gap-2 max-w-md mx-auto">
            <input 
              type="email" 
              required
              disabled={isSubmitting || hasSubscribed}
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder={hasSubscribed ? t("home.newsletter.subscribed") : t("home.newsletter.placeholder")}
              className="flex-1 px-5 py-3.5 rounded-full bg-white/10 border border-white/20
                         text-white text-sm placeholder:text-white/35 font-body
                         focus:outline-none focus:border-white/50 focus:bg-white/15 transition-all 
                         disabled:opacity-60 disabled:cursor-not-allowed" 
            />
            
            <button 
              type="submit"
              disabled={isSubmitting || !email || hasSubscribed}
              className={`px-6 py-3.5 rounded-full whitespace-nowrap flex items-center justify-center gap-2 min-w-[140px] font-body text-sm font-medium transition-all duration-300 ${
                hasSubscribed 
                  ? "bg-transparent border border-saffron text-saffron opacity-100 cursor-default" 
                  : "btn-gold text-obsidian disabled:opacity-50"
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>{t("home.newsletter.submitting")}</span>
                </>
              ) : hasSubscribed ? (
                <>
                  <Check size={16} className="text-saffron" />
                  <span>{t("home.newsletter.subscribed")}</span>
                </>
              ) : (
                t("home.newsletter.subscribe")
              )}
            </button>
          </form>
          
          <p className="font-body text-white/30 text-xs mt-4">{t("home.newsletter.noSpam")}</p>
        </div>
      </section>
    </div>
  );
}