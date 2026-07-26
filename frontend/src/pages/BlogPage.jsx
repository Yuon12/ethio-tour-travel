/**
 * BlogPage.jsx
 * ============
 * Complete responsive blog and travel guide catalog with search, category filtering,
 * featured hero showcase, and dynamic pagination.
 */
import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Search, X, ArrowRight, Clock, User } from "lucide-react";
import { usePosts, useCategories } from "../hooks/useBlog";
import BlogCard       from "../components/ui/BlogCard";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import ErrorMessage   from "../components/ui/ErrorMessage";
import Pagination     from "../components/ui/Pagination";

export default function BlogPage() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchInput, setSearchInput]   = useState(searchParams.get("search") || "");

  const category = searchParams.get("category__slug") || "";
  const search   = searchParams.get("search")         || "";
  const page     = parseInt(searchParams.get("page")  || "1");

  const { data: postsData, isLoading, isError } = usePosts({ category__slug: category, search, page });
  const { data: categories }                    = useCategories();

  const posts      = postsData?.results || postsData || [];
  const totalCount = postsData?.count   || 0;
  const totalPages = Math.ceil(totalCount / 12);

  const setFilter = (key, value) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      value ? next.set(key, value) : next.delete(key);
      next.set("page", "1");
      return next;
    });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setFilter("search", searchInput.trim());
  };

  const clearSearch = () => {
    setSearchInput("");
    setFilter("search", "");
  };

  // First post shown as featured hero if on page 1 with no filters
  const featuredPost  = (!category && !search && page === 1) ? posts[0] : null;
  const gridPosts     = featuredPost ? posts.slice(1) : posts;

  return (
    <div style={{ background: "#F7F3ED", minHeight: "100vh" }}>

      {/* ── Hero ── */}
      <section style={{ background: "#0D0D12", padding: "120px 0 64px" }}>
        <div style={{ maxWidth: "760px", margin: "0 auto", padding: "0 2rem", textAlign: "center" }}>
          <p style={{ fontFamily: "DM Sans", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "#C9920A", marginBottom: "1rem" }}>
            {t("blog.eyebrow", "Travel Stories & Insights")}
          </p>
          <div style={{ width: "3rem", height: "2px", background: "linear-gradient(135deg,#C9920A,#E0A80D,#A07205)", borderRadius: "9999px", margin: "0 auto 1.5rem" }} />
          <h1 style={{ fontFamily: "Cormorant Garamond, serif", fontWeight: 600, fontSize: "clamp(2.4rem,6vw,4rem)", color: "#ffffff", margin: "0 0 1rem" }}>
            {t("blog.title", "Ethiopian Travel Blog")}
          </h1>
          <p style={{ fontFamily: "DM Sans", fontSize: "1.05rem", color: "rgba(255,255,255,0.45)", lineHeight: 1.7, margin: "0 0 2rem" }}>
            {t("blog.subtitle", "Expert tips, guides, and stories from the heart of Africa's most captivating destination.")}
          </p>

          {/* Search */}
          <form onSubmit={handleSearch} style={{ maxWidth: "460px", margin: "0 auto",
            display: "flex", gap: "8px", background: "rgba(255,255,255,0.08)",
            border: "1.5px solid rgba(255,255,255,0.18)", borderRadius: "9999px",
            padding: "6px 6px 6px 20px", backdropFilter: "blur(8px)" }}>
            <Search size={16} style={{ color: "rgba(255,255,255,0.4)", flexShrink: 0, marginTop: "10px" }} />
            <input
              type="text" value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              placeholder={t("blog.searchPlaceholder", "Search articles, guides...")}
              style={{ flex: 1, background: "none", border: "none", outline: "none",
                color: "#fff", fontFamily: "DM Sans", fontSize: "0.9rem", padding: "8px 0" }}
            />
            {searchInput && (
              <button type="button" onClick={clearSearch}
                style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.4)", padding: "0 4px" }}>
                <X size={14} />
              </button>
            )}
            <button type="submit" className="btn-gold" style={{ padding: "9px 22px", borderRadius: "9999px", fontSize: "0.85rem" }}>
              {t("blog.search", "Search")}
            </button>
          </form>
        </div>
      </section>

      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "2.5rem 2rem" }}>

        {/* ── Category tabs ── */}
        {categories && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "2.5rem", justifyContent: "center" }}>
            <CategoryChip label={t("blog.all", "All Posts")} active={!category} onClick={() => setFilter("category__slug", "")} />
            {(categories?.results || categories || []).map(cat => (
              <CategoryChip key={cat.id}
                label={`${cat.name}${cat.post_count ? ` (${cat.post_count})` : ""}`}
                active={category === cat.slug}
                onClick={() => setFilter("category__slug", category === cat.slug ? "" : cat.slug)}
              />
            ))}
          </div>
        )}

        {/* ── Active search label ── */}
        {search && (
          <div style={{ marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontFamily: "DM Sans", fontSize: "0.875rem", color: "#6B6B6B" }}>
              {t("blog.showingResultsFor", "Showing results for")}
            </span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "4px 12px", borderRadius: "9999px", background: "rgba(201,146,10,0.10)", color: "#8A6200", border: "1px solid rgba(201,146,10,0.25)", fontFamily: "DM Sans", fontSize: "0.8rem", fontWeight: 600 }}>
              "{search}"
              <button onClick={clearSearch} style={{ background: "none", border: "none", cursor: "pointer", color: "#8A6200", padding: 0, display: "flex" }}>
                <X size={11} />
              </button>
            </span>
          </div>
        )}

        {isLoading ? <LoadingSpinner /> : isError ? <ErrorMessage /> : posts.length === 0 ? (
          <div style={{ textAlign: "center", padding: "5rem 0" }}>
            <p style={{ fontSize: "3rem", marginBottom: "1rem" }}>📝</p>
            <h3 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "1.6rem", color: "#0D0D0D", marginBottom: "0.5rem" }}>{t("blog.noArticles", "No articles found")}</h3>
            <p style={{ fontFamily: "DM Sans", color: "#6B6B6B", marginBottom: "1.5rem" }}>{t("blog.noArticlesDesc", "Try checking your spelling or clearing filters.")}</p>
            <button onClick={() => { setSearchInput(""); setSearchParams({}); }} className="btn-forest">
              {t("blog.clearAllFilters", "Clear All Filters")}
            </button>
          </div>
        ) : (
          <>
            {/* ── Featured hero post ── */}
            {featuredPost && (
              <Link to={`/blog/${featuredPost.slug}`}
                style={{ display: "grid", gridTemplateColumns: "1fr", gap: "0",
                  background: "#ffffff", borderRadius: "20px", overflow: "hidden",
                  boxShadow: "0 4px 24px rgba(13,13,18,0.08)", marginBottom: "2rem",
                  border: "1px solid #E8E0D0", textDecoration: "none" }}
                className="featured-post-grid">
                {/* Image */}
                <div style={{ height: "320px", overflow: "hidden", position: "relative" }}>
                  <img
                    src={featuredPost.cover_image || "https://images.unsplash.com/photo-1523805009345-7448845a9e53?w=900&q=80"}
                    alt={featuredPost.title}
                    style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.5s" }}
                    className="featured-img"
                  />
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, rgba(13,13,18,0.5), transparent)" }} />
                  <span style={{
                    position: "absolute", top: "1rem", left: "1rem",
                    padding: "4px 12px", borderRadius: "9999px",
                    background: "linear-gradient(135deg,#C9920A,#E0A80D)", color: "#0D0D12",
                    fontFamily: "DM Sans", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em",
                  }}>{t("blog.featured", "Featured")}</span>
                </div>
                {/* Content */}
                <div style={{ padding: "2rem 2.5rem" }}>
                  {featuredPost.category_name && (
                    <span style={{ fontFamily: "DM Sans", fontSize: "0.72rem", fontWeight: 700, color: "#C9920A", textTransform: "uppercase", letterSpacing: "0.15em" }}>
                      {featuredPost.category_name}
                    </span>
                  )}
                  <h2 style={{ fontFamily: "Cormorant Garamond, serif", fontWeight: 600, fontSize: "clamp(1.4rem,3vw,2rem)", color: "#0D0D0D", margin: "0.75rem 0 0.75rem", lineHeight: 1.25 }}>
                    {featuredPost.title}
                  </h2>
                  <p style={{ fontFamily: "DM Sans", fontSize: "0.925rem", color: "#6B6B6B", lineHeight: 1.7, margin: "0 0 1.25rem" }}>
                    {featuredPost.excerpt}
                  </p>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
                    <div style={{ display: "flex", gap: "16px" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: "5px", fontFamily: "DM Sans", fontSize: "0.8rem", color: "#ABABAB" }}>
                        <User size={13} style={{ color: "#C9920A" }} />{featuredPost.author_name}
                      </span>
                      <span style={{ display: "flex", alignItems: "center", gap: "5px", fontFamily: "DM Sans", fontSize: "0.8rem", color: "#ABABAB" }}>
                        <Clock size={13} style={{ color: "#C9920A" }} />{t("blog.minRead", { count: featuredPost.read_time, defaultValue: "{{count}} min read" })}
                      </span>
                    </div>
                    <span style={{ display: "flex", alignItems: "center", gap: "5px", fontFamily: "DM Sans", fontSize: "0.85rem", fontWeight: 600, color: "#C9920A" }}>
                      {t("blog.readArticle", "Read Article")} <ArrowRight size={14} />
                    </span>
                  </div>
                </div>
              </Link>
            )}

            {/* ── Grid ── */}
            {gridPosts.length > 0 && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" }}>
                {gridPosts.map(post => <BlogCard key={post.id} post={post} />)}
              </div>
            )}

            {/* ── Pagination ── */}
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={p => setFilter("page", String(p))}
            />
          </>
        )}
      </div>

      <style>{`
        @media (min-width: 768px) {
          .featured-post-grid { grid-template-columns: 1fr 1fr !important; }
          .featured-post-grid .featured-img { height: 100% !important; }
        }
        .featured-post-grid:hover .featured-img { transform: scale(1.03); }
      `}</style>
    </div>
  );
}

function CategoryChip({ label, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      padding: "8px 18px", borderRadius: "9999px",
      fontFamily: "DM Sans", fontSize: "0.85rem", fontWeight: 600,
      cursor: "pointer", transition: "all 0.2s", border: "1.5px solid",
      borderColor:  active ? "transparent"                     : "#E0DAD0",
      background:   active ? "linear-gradient(135deg,#C9920A,#E0A80D)" : "#ffffff",
      color:        active ? "#0D0D12"                         : "#6B6B6B",
      boxShadow:    active ? "0 0 20px rgba(201,146,10,0.25)"  : "none",
    }}>
      {label}
    </button>
  );
}