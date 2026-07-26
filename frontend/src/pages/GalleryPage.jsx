/* COMPLETE GalleryPage.jsx */
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { X, Play, ZoomIn } from "lucide-react";
import { galleryApi } from "../api/galleryApi";
import LoadingSpinner from "../components/ui/LoadingSpinner";

export default function GalleryPage() {
  const { t } = useTranslation();
  const [activeAlbum, setActiveAlbum] = useState(null);
  const [lightbox,    setLightbox]    = useState(null);

  const { data: albums,   isLoading: albumsLoading } = useQuery({
    queryKey: ["albums"],
    queryFn:  () => galleryApi.getAlbums().then(r => r.data),
    staleTime: 10 * 60 * 1000,
  });

  const { data: featured, isLoading: featLoading } = useQuery({
    queryKey: ["gallery-featured"],
    queryFn:  () => galleryApi.getFeatured().then(r => r.data),
    staleTime: 10 * 60 * 1000,
  });

  const { data: albumDetail } = useQuery({
    queryKey: ["album", activeAlbum],
    queryFn:  () => galleryApi.getAlbum(activeAlbum).then(r => r.data),
    enabled:  !!activeAlbum,
    staleTime: 5 * 60 * 1000,
  });

  const allAlbums  = albums?.results  || albums  || [];
  const mediaItems = activeAlbum
    ? (albumDetail?.media_items || [])
    : (featured?.results || featured || []);

  // Prevent body scroll when lightbox is open
  if (lightbox) document.body.style.overflow = "hidden";
  else          document.body.style.overflow = "";

  return (
    <div style={{ background: "#0D0D12", minHeight: "100vh" }}>

      {/* ── Hero ── */}
      <section style={{ padding: "120px 0 60px", textAlign: "center" }}>
        <div style={{ maxWidth: "640px", margin: "0 auto", padding: "0 2rem" }}>
          <p style={{ fontFamily: "DM Sans", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "#C9920A", marginBottom: "1rem" }}>
            {t("gallery.eyebrow")}
          </p>
          <div style={{ width: "3rem", height: "2px", background: "linear-gradient(135deg,#C9920A,#E0A80D,#A07205)", borderRadius: "9999px", margin: "0 auto 1.5rem" }} />
          <h1 style={{ fontFamily: "Cormorant Garamond,serif", fontWeight: 600, fontSize: "clamp(2.8rem,7vw,5rem)", color: "#ffffff", margin: "0 0 1rem", lineHeight: 1.05 }}>
            {t("gallery.title")}
          </h1>
          <p style={{ fontFamily: "DM Sans", fontSize: "1.05rem", color: "rgba(255,255,255,0.45)", lineHeight: 1.7, margin: 0 }}>
            {t("gallery.subtitle")}
          </p>
        </div>
      </section>

      {/* ── Album tabs ── */}
      {!albumsLoading && allAlbums.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "8px", padding: "0 2rem 2.5rem" }}>
          <AlbumChip
            label={t("gallery.featured")}
            active={!activeAlbum}
            onClick={() => setActiveAlbum(null)}
          />
          {allAlbums.map(album => (
            <AlbumChip
              key={album.id}
              label={`${album.name}${album.media_count > 0 ? ` (${album.media_count})` : ""}`}
              active={activeAlbum === album.slug}
              onClick={() => setActiveAlbum(activeAlbum === album.slug ? null : album.slug)}
            />
          ))}
        </div>
      )}

      {/* ── Masonry grid ── */}
      <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 1.5rem 5rem" }}>
        {(featLoading && !activeAlbum) ? <LoadingSpinner /> : (
          mediaItems.length === 0 ? (
            <p style={{ textAlign: "center", color: "rgba(255,255,255,0.3)", padding: "4rem 0", fontFamily: "DM Sans" }}>
              {t("gallery.noPhotos")}
            </p>
          ) : (
            <div style={{
              columns: "2",
              columnGap: "12px",
              /* CSS multi-column masonry — best browser support */
            }}
              className="masonry-grid">
              {mediaItems.map(item => (
                <div key={item.id}
                  className="masonry-item"
                  onClick={() => (item.image || item.video_url) && setLightbox(item)}
                  style={{
                    breakInside: "avoid",
                    marginBottom: "12px",
                    borderRadius: "12px",
                    overflow: "hidden",
                    cursor: "pointer",
                    position: "relative",
                    display: "block",
                  }}>

                  {item.image ? (
                    <div style={{ position: "relative", display: "block" }}>
                      <img
                        src={item.image}
                        alt={item.title || "Ethiopia"}
                        style={{ width: "100%", display: "block", borderRadius: "12px" }}
                        loading="lazy"
                      />
                      {/* Hover overlay */}
                      <div className="gallery-hover-overlay" style={{
                        position: "absolute", inset: 0, borderRadius: "12px",
                        background: "rgba(13,13,18,0)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        transition: "background 0.3s",
                      }}>
                        <ZoomIn size={28} style={{ color: "rgba(255,255,255,0)", transition: "color 0.3s" }} />
                      </div>
                      {item.title && (
                        <div style={{
                          position: "absolute", bottom: 0, left: 0, right: 0,
                          background: "linear-gradient(to top, rgba(13,13,18,0.85), transparent)",
                          padding: "1.5rem 1rem 0.75rem", borderRadius: "0 0 12px 12px",
                        }}>
                          <p style={{ fontFamily: "DM Sans", fontSize: "0.8rem", color: "rgba(255,255,255,0.8)", margin: 0 }}>
                            {item.title}
                          </p>
                          {item.location && (
                            <p style={{ fontFamily: "DM Sans", fontSize: "0.7rem", color: "rgba(255,255,255,0.45)", margin: "2px 0 0" }}>
                              📍 {item.location}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ) : item.video_url ? (
                    <div style={{
                      aspectRatio: "16/9",
                      background: "#16161F",
                      borderRadius: "12px",
                      display: "flex", flexDirection: "column",
                      alignItems: "center", justifyContent: "center", gap: "12px",
                    }}>
                      <div style={{
                        width: "56px", height: "56px", borderRadius: "50%",
                        background: "rgba(201,146,10,0.15)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        border: "2px solid rgba(201,146,10,0.3)",
                      }}>
                        <Play size={22} style={{ color: "#C9920A", marginLeft: "3px" }} />
                      </div>
                      <p style={{ fontFamily: "DM Sans", fontSize: "0.85rem", color: "rgba(255,255,255,0.6)", margin: 0 }}>
                        {item.title || t("gallery.watchVideo")}
                      </p>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          )
        )}
      </div>

      {/* ── Lightbox ── */}
      {lightbox && (
        <div
          onClick={() => setLightbox(null)}
          style={{
            position: "fixed", inset: 0, zIndex: 100,
            background: "rgba(0,0,0,0.95)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "2rem",
          }}>
          {/* Close button */}
          <button
            onClick={() => setLightbox(null)}
            style={{
              position: "absolute", top: "1.5rem", right: "1.5rem",
              width: "44px", height: "44px", borderRadius: "50%",
              background: "rgba(255,255,255,0.1)", border: "none",
              cursor: "pointer", color: "#fff",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
            <X size={20} />
          </button>

          {lightbox.image ? (
            <div onClick={e => e.stopPropagation()} style={{ maxWidth: "90vw", maxHeight: "90vh" }}>
              <img
                src={lightbox.image}
                alt={lightbox.title || t("gallery.photoAlt")}
                style={{ maxWidth: "100%", maxHeight: "85vh", objectFit: "contain", borderRadius: "12px" }}
              />
              {(lightbox.title || lightbox.location) && (
                <div style={{ textAlign: "center", marginTop: "1rem" }}>
                  {lightbox.title && (
                    <p style={{ fontFamily: "Cormorant Garamond,serif", fontSize: "1.2rem", color: "#fff", margin: "0 0 4px" }}>
                      {lightbox.title}
                    </p>
                  )}
                  {lightbox.location && (
                    <p style={{ fontFamily: "DM Sans", fontSize: "0.8rem", color: "rgba(255,255,255,0.4)", margin: 0 }}>
                      📍 {lightbox.location}
                    </p>
                  )}
                </div>
              )}
            </div>
          ) : lightbox.video_url ? (
            <div onClick={e => e.stopPropagation()} style={{ width: "80vw", maxWidth: "900px" }}>
              <div style={{ aspectRatio: "16/9", background: "#000", borderRadius: "12px", overflow: "hidden" }}>
                <iframe
                  src={lightbox.video_url.replace("watch?v=", "embed/")}
                  style={{ width: "100%", height: "100%", border: "none" }}
                  allowFullScreen
                  title={lightbox.title || t("gallery.videoTitle")}
                />
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* Responsive columns + hover effect CSS */}
      <style>{`
        @media (min-width: 640px)  { .masonry-grid { columns: 3 !important; } }
        @media (min-width: 1024px) { .masonry-grid { columns: 4 !important; } }
        .masonry-item:hover .gallery-hover-overlay { background: rgba(13,13,18,0.35) !important; }
        .masonry-item:hover .gallery-hover-overlay svg { color: rgba(255,255,255,0.9) !important; }
      `}</style>
    </div>
  );
}

function AlbumChip({ label, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      padding: "8px 18px", borderRadius: "9999px",
      fontFamily: "DM Sans", fontSize: "0.85rem", fontWeight: 600,
      cursor: "pointer", transition: "all 0.2s", border: "none",
      background: active ? "linear-gradient(135deg,#C9920A,#E0A80D)" : "rgba(255,255,255,0.07)",
      color:      active ? "#0D0D12" : "rgba(255,255,255,0.6)",
      boxShadow:  active ? "0 0 20px rgba(201,146,10,0.3)" : "none",
    }}>
      {label}
    </button>
  );
}