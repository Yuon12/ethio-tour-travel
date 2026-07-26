/**
 * Navbar.jsx
 * ==========
 * Navigation bar component featuring route links, language switching, currency selection, and authenticated user dropdown with i18n support.
 */
import { useState, useEffect, useRef } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Menu, X, ChevronDown, User, LogOut, LayoutDashboard, Globe, DollarSign } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
// import { useCurrency } from "../../context/CurrencyContext"; // Uncomment when currency context is available

export default function Navbar() {
  const { t, i18n } = useTranslation();
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [currOpen, setCurrOpen] = useState(false);
  
  // Local currency state (can be replaced by useCurrency() hook if implemented globally)
  const [currentCurrency, setCurrentCurrency] = useState("USD");
  
  const langDropdownRef = useRef(null);
  const currDropdownRef = useRef(null);

  const LINKS = [
    { to: "/",             label: t("nav.home") },
    { to: "/destinations", label: t("nav.destinations") },
    { to: "/packages",     label: t("nav.tours") },
    { to: "/gallery",      label: t("nav.gallery") },
    { to: "/blog",         label: t("nav.blog") },
    { to: "/about",        label: t("nav.about") },
    { to: "/contact",      label: t("nav.contact") },
  ];

  const LANGUAGES = [
    { code: "en", label: t("language.en", "English") },
    { code: "am", label: t("language.am", "Amharic") },
    { code: "fr", label: t("language.fr", "French") },
  ];

  const CURRENCIES = [
    { code: "USD", symbol: "$", label: "USD ($)" },
    { code: "ETB", symbol: "Br", label: "ETB (Br)" },
    { code: "EUR", symbol: "€", label: "EUR (€)" },
  ];

  const currentLanguage = LANGUAGES.find((lang) => lang.code === i18n.language) || LANGUAGES[0];
  const activeCurrency = CURRENCIES.find((c) => c.code === currentCurrency) || CURRENCIES[0];

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (langDropdownRef.current && !langDropdownRef.current.contains(event.target)) {
        setLangOpen(false);
      }
      if (currDropdownRef.current && !currDropdownRef.current.contains(event.target)) {
        setCurrOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-md transition-all duration-300 ${
        scrolled 
          ? "bg-[#0D0D12]/95 border-b border-white/5 shadow-lg shadow-black/40" 
          : "bg-[#0D0D12]/85 border-b border-transparent"
      }`}
    >
      <nav className="max-w-7xl mx-auto px-6 h-[70px] flex items-center justify-between">
        
        {/* Brand Identity Branding Logo */}
        <Link to="/" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#C9920A] via-[#E0A80D] to-[#A07205] flex items-center justify-center shadow-xs">
            <span className="font-serif font-bold text-dark-900 text-base">E</span>
          </div>
          <div className="leading-none">
            <p className="font-serif font-semibold text-white text-lg">Ethiopia</p>
            <p className="font-sans font-bold text-[#C9920A] text-[9px] tracking-widest uppercase mt-0.5">
              Tour &amp; Travel
            </p>
          </div>
        </Link>

        {/* Desktop Route Connections */}
        <ul className="hidden lg:flex items-center gap-1">
          {LINKS.map((l) => (
            <li key={l.to}>
              <NavLink
                to={l.to}
                className={({ isActive }) =>
                  `px-3.5 py-2 rounded-full font-sans text-xs md:text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "text-[#C9920A] bg-[#C9920A]/10"
                      : "text-white/70 hover:text-white hover:bg-white/5"
                  }`
                }
              >
                {l.label}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Desktop Actions, Currency, Language & Auth Switchers */}
        <div className="hidden lg:flex items-center gap-3">
          
          {/* Desktop Currency Switcher */}
          <div className="relative inline-block text-left" ref={currDropdownRef}>
            <button
              onClick={() => { setCurrOpen(!currOpen); setLangOpen(false); }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-full border border-white/10 bg-white/5 text-white/80 font-sans text-xs font-medium hover:bg-white/10 transition-all cursor-pointer select-none"
            >
              <DollarSign size={13} className="text-[#C9920A]" />
              <span>{activeCurrency.code}</span>
              <ChevronDown size={12} className={`transition-transform duration-200 ${currOpen ? "rotate-180" : ""}`} />
            </button>

            {currOpen && (
              <div className="absolute right-0 mt-2 w-32 bg-[#16161F] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="py-1">
                  {CURRENCIES.map((curr) => (
                    <button
                      key={curr.code}
                      onClick={() => {
                        setCurrentCurrency(curr.code);
                        setCurrOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 font-sans text-xs font-medium transition-colors cursor-pointer block ${
                        currentCurrency === curr.code
                          ? "text-[#C9920A] bg-[#C9920A]/10"
                          : "text-white/60 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      {curr.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Desktop Language Switcher */}
          <div className="relative inline-block text-left" ref={langDropdownRef}>
            <button
              onClick={() => { setLangOpen(!langOpen); setCurrOpen(false); }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-full border border-white/10 bg-white/5 text-white/80 font-sans text-xs font-medium hover:bg-white/10 transition-all cursor-pointer select-none"
            >
              <Globe size={14} className="text-[#C9920A]" />
              <span className="uppercase">{currentLanguage.code}</span>
              <ChevronDown size={12} className={`transition-transform duration-200 ${langOpen ? "rotate-180" : ""}`} />
            </button>

            {langOpen && (
              <div className="absolute right-0 mt-2 w-32 bg-[#16161F] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="py-1">
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        i18n.changeLanguage(lang.code);
                        setLangOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 font-sans text-xs font-medium transition-colors cursor-pointer block ${
                        i18n.language === lang.code
                          ? "text-[#C9920A] bg-[#C9920A]/10"
                          : "text-white/60 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      {lang.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Separation Line */}
          <div className="w-px h-5 bg-white/10" />

          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setDropOpen((p) => !p)}
                className="flex items-center gap-2 px-3.5 py-2 rounded-full border border-white/20 bg-white/5 text-white/90 font-sans text-sm font-medium hover:bg-white/10 transition-all cursor-pointer select-none"
              >
                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-[#C9920A] to-[#E0A80D] flex items-center justify-center text-[10px] font-bold text-[#0D0D12]">
                  {user?.first_name?.[0]}
                </div>
                <span>{user?.first_name}</span>
                <ChevronDown 
                  size={13} 
                  className={`transition-transform duration-200 ${dropOpen ? "rotate-180" : ""}`} 
                />
              </button>

              {/* Profile Portal Overlay Menu */}
              {dropOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-[#16161F] border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                  <div className="p-4 border-b border-white/5">
                    <p className="text-white text-xs font-semibold font-sans truncate">
                      {user?.first_name} {user?.last_name}
                    </p>
                    <p className="text-white/40 text-[11px] font-sans truncate mt-0.5">
                      {user?.email}
                    </p>
                  </div>
                  
                  <div className="py-1">
                    <Link
                      to="/dashboard"
                      onClick={() => setDropOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 font-sans text-xs font-medium text-white/60 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      <LayoutDashboard size={14} className="text-[#C9920A]" />
                      {t("nav.myBookings")}
                    </Link>
                    <Link
                      to="/profile"
                      onClick={() => setDropOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 font-sans text-xs font-medium text-white/60 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      <User size={14} className="text-[#C9920A]" />
                      {t("nav.profile")}
                    </Link>
                  </div>

                  <div className="border-t border-white/5 py-1">
                    <button
                      onClick={() => {
                        logout();
                        setDropOpen(false);
                        navigate("/");
                      }}
                      className="flex items-center gap-2.5 w-full px-4 py-2.5 font-sans text-xs font-medium text-rose-400 hover:bg-rose-500/10 text-left cursor-pointer"
                    >
                      <LogOut size={14} />
                      {t("nav.logout")}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <Link to="/login" className="btn-outline-white text-xs px-5 py-2">
                {t("nav.login")}
              </Link>
              <Link to="/register" className="btn-gold text-xs px-5 py-2">
                {t("nav.getStarted")}
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Trigger */}
        <button
          onClick={() => setMenuOpen((p) => !p)}
          className="lg:hidden w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white cursor-pointer hover:bg-white/10 transition-colors"
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {/* Mobile Drawer Block Dropdown */}
      {menuOpen && (
        <div className="lg:hidden bg-[#0D0D12]/98 border-t border-white/5 animate-in slide-in-from-top-4 duration-200">
          <div className="px-6 pt-3 pb-2 space-y-0.5">
            {LINKS.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `block px-4 py-3 rounded-xl font-sans text-sm font-medium transition-colors ${
                    isActive
                      ? "text-[#C9920A] bg-[#C9920A]/10"
                      : "text-white/80 hover:bg-white/5"
                  }`
                }
              >
                {l.label}
              </NavLink>
            ))}

            {isAuthenticated && (
              <>
                <NavLink
                  to="/dashboard"
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-4 py-3 rounded-xl font-sans text-sm font-medium transition-colors ${
                      isActive ? "text-[#C9920A] bg-[#C9920A]/10" : "text-white/80 hover:bg-white/5"
                    }`
                  }
                >
                  <LayoutDashboard size={16} />
                  {t("nav.myBookings")}
                </NavLink>
                <NavLink
                  to="/profile"
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-4 py-3 rounded-xl font-sans text-sm font-medium transition-colors ${
                      isActive ? "text-[#C9920A] bg-[#C9920A]/10" : "text-white/80 hover:bg-white/5"
                    }`
                  }
                >
                  <User size={16} />
                  {t("nav.profile")}
                </NavLink>
              </>
            )}
          </div>

          {/* Mobile Currency Selector Inline Strip */}
          <div className="mx-6 my-1 py-2 px-3 flex items-center justify-between bg-white/5 rounded-xl border border-white/5">
            <span className="font-sans text-xs text-white/60">Currency</span>
            <div className="flex gap-1.5">
              {CURRENCIES.map((curr) => (
                <button
                  key={curr.code}
                  onClick={() => {
                    setCurrentCurrency(curr.code);
                  }}
                  className={`font-sans text-xs font-bold px-2.5 py-1 rounded-md transition-all ${
                    currentCurrency === curr.code
                      ? "text-[#0D0D12] bg-[#E0A80D]"
                      : "text-white/60 hover:text-white"
                  }`}
                >
                  {curr.code}
                </button>
              ))}
            </div>
          </div>

          {/* Mobile Language Selector Inline Strip */}
          <div className="mx-6 my-2 py-3 flex items-center justify-around bg-white/5 rounded-xl border border-white/5">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  i18n.changeLanguage(lang.code);
                  setMenuOpen(false);
                }}
                className={`font-sans text-xs font-bold px-3 py-1 rounded-md transition-all ${
                  i18n.language === lang.code
                    ? "text-[#0D0D12] bg-[#E0A80D]"
                    : "text-white/60 hover:text-white"
                }`}
              >
                {lang.code.toUpperCase()}
              </button>
            ))}
          </div>

          <div className="px-6 py-4 flex gap-3 border-t border-white/5 mt-2">
            {isAuthenticated ? (
              <button
                onClick={() => {
                  logout();
                  setMenuOpen(false);
                  navigate("/");
                }}
                className="w-full text-center font-sans text-xs font-bold border border-rose-500/30 text-rose-400 py-3 rounded-xl hover:bg-rose-500/10 transition-colors cursor-pointer"
              >
                {t("nav.logout")}
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMenuOpen(false)}
                  className="flex-1 text-center font-sans text-xs font-bold border border-white/20 text-white py-3 rounded-xl hover:bg-white/5 transition-colors"
                >
                  {t("nav.login")}
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMenuOpen(false)}
                  className="flex-1 text-center font-sans text-xs font-bold bg-[#E0A80D] text-[#0D0D12] py-3 rounded-xl hover:bg-[#C9920A] transition-colors"
                >
                  {t("nav.getStarted")}
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}