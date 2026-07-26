/**
 * PackagesPage
 * =================
 * High-contrast tour packages catalog with live filtering, sorting, and responsive drawer support.
 */
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { usePackages }     from "../hooks/usePackages";
import PackageCard        from "../components/ui/PackageCard";
import LoadingSpinner     from "../components/ui/LoadingSpinner";
import ErrorMessage       from "../components/ui/ErrorMessage";
import Pagination         from "../components/ui/Pagination";

const CATEGORIES   = ["adventure", "luxury", "family", "wildlife", "historical", "trekking", "birdwatch"];
const DIFFICULTIES = ["easy", "moderate", "hard", "extreme"];

const S = {
  hero:        { background: "#0D0D12", padding: "110px 0 60px", textAlign: "center" },
  eyebrow:     { fontFamily: "DM Sans, sans-serif", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "#C9920A", marginBottom: "0.75rem" },
  heroTitle:   { fontFamily: "Cormorant Garamond, serif", fontWeight: 600, fontSize: "clamp(2.4rem,6vw,4rem)", color: "#ffffff", margin: "0 0 1rem" },
  heroSub:     { fontFamily: "DM Sans, sans-serif", fontSize: "1rem", color: "rgba(255,255,255,0.55)", lineHeight: 1.7, margin: 0 },
  sidebar:     { background: "#ffffff", borderRadius: "16px", padding: "24px", border: "1px solid #E8E0D0" },
  filterTitle: { fontFamily: "DM Sans, sans-serif", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#6B6B6B", marginBottom: "12px" },
  radioLabel:  { display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontFamily: "DM Sans, sans-serif", fontSize: "0.875rem", color: "#2E2E2E", padding: "6px 0" },
  resultText:  { fontFamily: "DM Sans, sans-serif", fontSize: "0.875rem", color: "#6B6B6B" },
};

export default function PackagesPage() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [sidebarOpen, setSidebarOpen]   = useState(false);

  const search     = searchParams.get("search")     || "";
  const category   = searchParams.get("category")   || "";
  const difficulty = searchParams.get("difficulty") || "";
  const minPrice   = searchParams.get("min_price")  || "";
  const maxPrice   = searchParams.get("max_price")  || "";
  const page       = parseInt(searchParams.get("page") || "1", 10);
  const ordering   = searchParams.get("ordering")   || "-created_at";

  const [searchInput, setSearchInput] = useState(search);

  // Sync internal search input state when URL parameters update
  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  const { data, isLoading, isError } = usePackages({ 
    search, 
    category, 
    difficulty, 
    min_price: minPrice, 
    max_price: maxPrice, 
    ordering, 
    page 
  });

  const packages   = data?.results || [];
  const totalPages = Math.ceil((data?.count || 0) / 12);

  const setFilter = (key, value) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      if (value) {
        next.set(key, value);
      } else {
        next.delete(key);
      }
      next.set("page", "1");
      return next;
    });
  };

  const clearAll = () => { 
    setSearchParams({}); 
    setSearchInput(""); 
  };

  const hasFilters = Boolean(search || category || difficulty || minPrice || maxPrice);

  const renderFilterContent = () => (
    <>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
        <h3 style={{ fontFamily: "DM Sans, sans-serif", fontWeight: 700, fontSize: "0.9rem", color: "#0D0D0D", margin: 0 }}>
          {t("packages.filters", "Filters")}
        </h3>
        {hasFilters && (
          <button onClick={clearAll} style={{ fontFamily: "DM Sans, sans-serif", fontSize: "0.75rem", color: "#EF4444", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>
            {t("packages.clearAll", "Clear all")}
          </button>
        )}
      </div>

      {/* Category */}
      <div style={{ marginBottom: "24px" }}>
        <p style={S.filterTitle}>{t("packages.category", "Category")}</p>
        {CATEGORIES.map(cat => (
          <label key={cat} style={S.radioLabel} onClick={() => setFilter("category", category === cat ? "" : cat)}>
            <div style={{ 
              width: "16px", height: "16px", borderRadius: "50%", 
              border: `2px solid ${category === cat ? "#C9920A" : "#D0D0D0"}`,
              background: category === cat ? "#C9920A" : "transparent", flexShrink: 0, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center" 
            }}>
              {category === cat && <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#0D0D12" }} />}
            </div>
            <span>{t(`packages.categories.${cat}`, cat.charAt(0).toUpperCase() + cat.slice(1))}</span>
          </label>
        ))}
      </div>

      {/* Difficulty */}
      <div style={{ marginBottom: "24px" }}>
        <p style={S.filterTitle}>{t("packages.difficulty", "Difficulty")}</p>
        {DIFFICULTIES.map(d => (
          <label key={d} style={S.radioLabel} onClick={() => setFilter("difficulty", difficulty === d ? "" : d)}>
            <div style={{ 
              width: "16px", height: "16px", borderRadius: "50%", 
              border: `2px solid ${difficulty === d ? "#C9920A" : "#D0D0D0"}`,
              background: difficulty === d ? "#C9920A" : "transparent", flexShrink: 0, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center" 
            }}>
              {difficulty === d && <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#0D0D12" }} />}
            </div>
            <span>{t(`packages.difficulties.${d}`, d.charAt(0).toUpperCase() + d.slice(1))}</span>
          </label>
        ))}
      </div>

      {/* Price */}
      <div>
        <p style={S.filterTitle}>{t("packages.priceRange", "Price Range (USD)")}</p>
        <div style={{ display: "flex", gap: "8px" }}>
          <input 
            type="number" 
            placeholder={t("packages.min", "Min")} 
            key={`min-${minPrice}`}
            defaultValue={minPrice}
            onBlur={e => setFilter("min_price", e.target.value)} 
            className="field-input"
            style={{ width: "100%", fontSize: "0.8rem", padding: "10px 12px" }} 
          />
          <input 
            type="number" 
            placeholder={t("packages.max", "Max")} 
            key={`max-${maxPrice}`}
            defaultValue={maxPrice}
            onBlur={e => setFilter("max_price", e.target.value)} 
            className="field-input"
            style={{ width: "100%", fontSize: "0.8rem", padding: "10px 12px" }} 
          />
        </div>
      </div>
    </>
  );

  return (
    <div style={{ background: "#F7F3ED", minHeight: "100vh" }}>

      {/* Hero */}
      <section style={S.hero}>
        <div style={{ maxWidth: "640px", margin: "0 auto", padding: "0 2rem" }}>
          <p style={S.eyebrow}>{t("packages.eyebrow", "Explore Ethiopia")}</p>
          <h1 style={S.heroTitle}>{t("packages.title", "Tour Packages")}</h1>
          <p style={S.heroSub}>{t("packages.subtitle", "From single-day adventures to multi-week expeditions — find the perfect journey.")}</p>

          {/* Search bar */}
          <div style={{ 
            maxWidth: "460px", margin: "2rem auto 0", display: "flex", gap: "8px",
            background: "rgba(255,255,255,0.08)", border: "1.5px solid rgba(255,255,255,0.2)",
            borderRadius: "9999px", padding: "6px 6px 6px 20px", backdropFilter: "blur(8px)" 
          }}>
            <Search size={16} style={{ color: "rgba(255,255,255,0.4)", flexShrink: 0, marginTop: "10px" }} />
            <input 
              type="text" 
              value={searchInput} 
              onChange={e => setSearchInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && setFilter("search", searchInput)}
              placeholder={t("packages.searchPlaceholder", "Search packages, destinations…")}
              style={{ flex: 1, background: "none", border: "none", outline: "none", color: "#fff", fontFamily: "DM Sans, sans-serif", fontSize: "0.9rem", padding: "8px 0" }} 
            />
            <button onClick={() => setFilter("search", searchInput)} className="btn-gold" style={{ padding: "10px 22px", borderRadius: "9999px", fontSize: "0.85rem", border: "none", cursor: "pointer" }}>
              {t("packages.search", "Search")}
            </button>
          </div>
        </div>
      </section>

      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "2.5rem 2rem" }}>
        <div style={{ display: "flex", gap: "28px", alignItems: "flex-start" }}>

          {/* ── Desktop Sidebar ── */}
          <aside style={{ width: "240px", flexShrink: 0, position: "sticky", top: "88px" }} className="pkg-sidebar-desktop">
            <div style={S.sidebar}>
              {renderFilterContent()}
            </div>
          </aside>

          {/* ── Mobile Drawer Overlay ── */}
          {sidebarOpen && (
            <div className="pkg-mobile-drawer-overlay" onClick={() => setSidebarOpen(false)}>
              <div className="pkg-mobile-drawer" onClick={e => e.stopPropagation()}>
                <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "8px" }}>
                  <button onClick={() => setSidebarOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#0D0D0D" }}>
                    <X size={20} />
                  </button>
                </div>
                {renderFilterContent()}
              </div>
            </div>
          )}

          {/* ── Grid Area ── */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Top bar */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
              <p style={S.resultText}>
                {isLoading 
                  ? t("packages.loading", "Loading…") 
                  : t("packages.foundCount", { count: data?.count || 0, defaultValue: `Found ${data?.count || 0} packages` })
                }
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <button onClick={() => setSidebarOpen(true)} className="pkg-mobile-filter-btn"
                  style={{ display: "flex", alignItems: "center", gap: "6px", fontFamily: "DM Sans, sans-serif", fontSize: "0.85rem", color: "#4A4A4A",
                    padding: "8px 14px", border: "1.5px solid #E0DAD0", borderRadius: "9999px", background: "#fff", cursor: "pointer" }}>
                  <SlidersHorizontal size={14} /> {t("packages.filtersBtn", "Filters")}
                </button>
                <select value={ordering} onChange={e => setFilter("ordering", e.target.value)}
                  style={{ fontFamily: "DM Sans, sans-serif", fontSize: "0.85rem", color: "#2E2E2E",
                    padding: "8px 14px", border: "1.5px solid #E0DAD0", borderRadius: "9999px",
                    background: "#fff", cursor: "pointer", outline: "none" }}>
                  <option value="-created_at">{t("packages.sortNewest", "Newest First")}</option>
                  <option value="price_usd">{t("packages.sortPriceAsc", "Price: Low → High")}</option>
                  <option value="-price_usd">{t("packages.sortPriceDesc", "Price: High → Low")}</option>
                  <option value="duration_days">{t("packages.sortDuration", "Shortest First")}</option>
                </select>
              </div>
            </div>

            {/* Active chips */}
            {hasFilters && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "18px" }}>
                {search     && <Chip label={`"${search}"`}                             onRemove={() => { setFilter("search", ""); setSearchInput(""); }} />}
                {category   && <Chip label={t(`packages.categories.${category}`, category)} onRemove={() => setFilter("category", "")} />}
                {difficulty && <Chip label={t(`packages.difficulties.${difficulty}`, difficulty)} onRemove={() => setFilter("difficulty", "")} />}
                {minPrice   && <Chip label={`Min $${minPrice}`}                       onRemove={() => setFilter("min_price", "")} />}
                {maxPrice   && <Chip label={`Max $${maxPrice}`}                       onRemove={() => setFilter("max_price", "")} />}
              </div>
            )}

            {isLoading ? (
              <LoadingSpinner />
            ) : isError ? (
              <ErrorMessage />
            ) : packages.length === 0 ? (
              <div style={{ textAlign: "center", padding: "80px 0" }}>
                <p style={{ fontSize: "3rem", marginBottom: "1rem" }}>🔍</p>
                <h3 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "1.5rem", color: "#0D0D0D", marginBottom: "0.5rem" }}>
                  {t("packages.noPackages", "No packages found")}
                </h3>
                <p style={{ fontFamily: "DM Sans, sans-serif", color: "#6B6B6B", marginBottom: "1.5rem" }}>
                  {t("packages.noPackagesSub", "Try adjusting or clearing your filters.")}
                </p>
                <button onClick={clearAll} className="btn-forest">{t("packages.clearAllFilters", "Clear All Filters")}</button>
              </div>
            ) : (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "20px" }}>
                  {packages.map(pkg => <PackageCard key={pkg.id} pkg={pkg} />)}
                </div>
                <Pagination currentPage={page} totalPages={totalPages} onPageChange={p => setFilter("page", String(p))} />
              </>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 1023px) { 
          .pkg-sidebar-desktop { display: none !important; } 
          .pkg-mobile-filter-btn { display: flex !important; }
        }
        @media (min-width: 1024px) { 
          .pkg-sidebar-desktop { display: block !important; }
          .pkg-mobile-filter-btn { display: none !important; } 
        }

        .pkg-mobile-drawer-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          z-index: 999;
          display: flex;
          justify-content: flex-end;
        }

        .pkg-mobile-drawer {
          background: #ffffff;
          width: 300px;
          max-width: 85vw;
          height: 100%;
          padding: 20px;
          overflow-y: auto;
          box-shadow: -4px 0 16px rgba(0, 0, 0, 0.15);
        }
      `}</style>
    </div>
  );
}

function Chip({ label, onRemove }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: "6px",
      padding: "5px 12px", borderRadius: "9999px",
      background: "rgba(201,146,10,0.10)", color: "#8A6200",
      border: "1px solid rgba(201,146,10,0.25)",
      fontFamily: "DM Sans, sans-serif", fontSize: "0.75rem", fontWeight: 600,
    }}>
      {label}
      <button onClick={onRemove} style={{ background: "none", border: "none", cursor: "pointer", color: "#8A6200", padding: 0, display: "flex" }}>
        <X size={11} />
      </button>
    </span>
  );
}