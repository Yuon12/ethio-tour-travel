/**
 * DestinationDetailPage
 * ======================
 * Premium destination detail layout with an optimized responsive masonry gallery,
 * clean aspect ratios, structural image smoothers, and custom brand-aligned theme modules.
 */
import { useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  MapPin,
  Cloud,
  Clock,
  ChevronRight,
  Compass,
  HardHat,
} from "lucide-react";
import { useDestinationDetail } from "../hooks/useDestinations";
import { usePackages } from "../hooks/usePackages";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import ErrorMessage from "../components/ui/ErrorMessage";
import PackageCard from "../components/ui/PackageCard";

export default function DestinationDetailPage() {
  const { t } = useTranslation();
  const { slug } = useParams();
  const { data: dest, isLoading, isError } = useDestinationDetail(slug);
  const { data: pkgData } = usePackages({ search: dest?.name, page_size: 3 });
  const relatedPkgs = pkgData?.results || [];

  if (isLoading) return <LoadingSpinner />;
  if (isError || !dest)
    return <ErrorMessage message="Destination not found." />;

  const images = dest.images || [];

  return (
    <div className="min-h-screen bg-[#F7F3ED] antialiased selection:bg-[#C9920A] selection:text-[#0D0D12]">
      {/* Premium Hero Banner */}
      <div className="relative h-[55vh] md:h-[65vh] w-full bg-[#0D0D12] overflow-hidden">
        {dest.cover_image && (
          <img
            src={dest.cover_image}
            alt={dest.name}
            style={{ imageRendering: "auto" }}
            className="absolute inset-0 w-full h-full object-cover object-center transform transform-gpu transition-all duration-700 ease-out brightness-[0.72] contrast-[1.02] saturation-105"
          />
        )}

        {/* Multi-layered smooth gradient overlays to mask digital compression and pixel noise */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D12] via-[#0D0D12]/40 to-[#0D0D12]/10" />
        <div className="absolute inset-0 bg-black/10 backdrop-blur-[0.5px]" />

        <div className="absolute bottom-0 left-0 right-0 max-w-7xl mx-auto px-4 sm:px-6 pb-12 text-white z-10">
          {/* Modernized Glassmorphic Breadcrumbs */}
          <nav className="flex items-center gap-2 text-xs md:text-sm text-slate-200/80 mb-4 bg-[#0D0D12]/40 backdrop-blur-md px-3 py-1.5 rounded-full w-fit border border-white/5">
            <Link
              to="/"
              className="hover:text-[#E0A80D] font-medium transition-colors"
            >
              {t("dest.home")}
            </Link>
            <ChevronRight size={14} className="opacity-60" />
            <Link
              to="/destinations"
              className="hover:text-[#E0A80D] font-medium transition-colors"
            >
              {t("dest.destinations")}
            </Link>
            <ChevronRight size={14} className="opacity-60" />
            <span className="text-white font-semibold truncate max-w-[150px] md:max-w-none">
              {dest.name}
            </span>
          </nav>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-emerald-500/20 backdrop-blur-sm border border-emerald-400/30 text-emerald-300 text-xs font-semibold tracking-wide uppercase mb-3">
            <Compass size={13} className="animate-spin-slow" />
            {dest.region?.name || "Ethiopia"}
          </div>

          <h1 className="font-serif text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight mb-3 drop-shadow-md text-white">
            {dest.name}
          </h1>
          {dest.tagline && (
            <p className="text-slate-200/90 text-lg md:text-2xl max-w-2xl font-light tracking-wide drop-shadow-sm">
              {dest.tagline}
            </p>
          )}
        </div>
      </div>

      {/* Main Grid Content Framework */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 lg:py-16">
        <div className="grid lg:grid-cols-3 gap-8 lg:gap-10 items-start">
          {/* Left Main Informational Block */}
          <div className="lg:col-span-2 space-y-8 md:space-y-10">
            {/* Description */}
            <section className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-[#E8E0D0] hover:shadow-md transition-shadow">
              <h2 className="font-serif text-2xl md:text-3xl font-bold text-[#0D0D0D] mb-5 relative pb-2 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-12 after:h-1 after:bg-[#C9920A] after:rounded-full">
                {t("dest.about", { name: dest.name })}
              </h2>
              <p className="text-gray-600 leading-relaxed text-base md:text-lg font-normal whitespace-pre-line">
                {dest.description}
              </p>
            </section>

            {/* History */}
            {dest.history && (
              <section className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-[#E8E0D0]">
                <h2 className="font-serif text-2xl md:text-3xl font-bold text-[#0D0D0D] mb-5 relative pb-2 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-12 after:h-1 after:bg-[#C9920A] after:rounded-full">
                  {t("dest.history")}
                </h2>
                <p className="text-gray-600 leading-relaxed text-base md:text-lg">
                  {dest.history}
                </p>
              </section>
            )}

            {/* Culture */}
            {dest.culture && (
              <section className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-[#E8E0D0]">
                <h2 className="font-serif text-2xl md:text-3xl font-bold text-[#0D0D0D] mb-5 relative pb-2 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-12 after:h-1 after:bg-[#C9920A] after:rounded-full">
                  {t("dest.culture")}
                </h2>
                <p className="text-gray-600 leading-relaxed text-base md:text-lg">
                  {dest.culture}
                </p>
              </section>
            )}

            {/* Photo Gallery Section */}
            {images.length > 0 && (
              <section className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-[#E8E0D0]">
                <h2 className="font-serif text-2xl md:text-3xl font-bold text-[#0D0D0D] mb-2">
                  {t("dest.gallery")}
                </h2>
                <p className="text-sm text-gray-400 mb-6">
                  {t("dest.gallerySub")}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {images.map((img) => (
                    <div
                      key={img.id}
                      className="group relative rounded-xl overflow-hidden aspect-[4/3] bg-slate-100 border border-[#E8E0D0] shadow-sm"
                    >
                      <img
                        src={img.image}
                        alt={img.caption || dest.name}
                        loading="lazy"
                        className="w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-500 ease-out"
                      />
                      {img.caption && (
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 pt-8 transform opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <p className="text-white text-xs truncate font-medium">
                            {img.caption}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Travel Tips Wrapper */}
            {dest.travel_tips && (
              <section className="bg-gradient-to-br from-amber-50/40 via-white to-white rounded-2xl p-6 md:p-8 shadow-sm border border-amber-200/60">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-[#C9920A]/10 text-[#C9920A]">
                    <HardHat size={22} />
                  </div>
                  <h2 className="font-serif text-2xl font-bold text-[#0D0D0D]">
                    {t("dest.tips")}
                  </h2>
                </div>
                <p className="text-gray-600 leading-relaxed text-base">
                  {dest.travel_tips}
                </p>
              </section>
            )}

            {/* Nearby Attractions */}
            {dest.nearby_attractions?.length > 0 && (
              <section className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-[#E8E0D0]">
                <h2 className="font-serif text-2xl md:text-3xl font-bold text-[#0D0D0D] mb-6">
                  {t("dest.hotspots")}
                </h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {dest.nearby_attractions.map((attr) => (
                    <div
                      key={attr.id}
                      className="group flex items-start gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100 hover:bg-white hover:border-[#C9920A]/30 hover:shadow-sm transition-all duration-200"
                    >
                      <div className="p-2 rounded-lg bg-amber-50 text-[#C9920A] group-hover:bg-gradient-to-r group-hover:from-[#C9920A] group-hover:to-[#E0A80D] group-hover:text-[#0D0D12] transition-all mt-0.5 flex-shrink-0">
                        <MapPin size={16} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-[#0D0D0D] text-sm md:text-base truncate">
                          {attr.name}
                        </p>
                        {attr.distance_km && (
                          <span className="inline-block mt-0.5 px-2 py-0.5 bg-slate-200/70 text-slate-600 rounded text-[10px] font-bold tracking-wider uppercase">
                            {t("dest.kmAway", { count: attr.distance_km })}
                          </span>
                        )}
                        {attr.description && (
                          <p className="text-xs text-gray-500 mt-1.5 leading-relaxed line-clamp-2">
                            {attr.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sticky Info & Navigation Sidebar */}
          <div className="space-y-6 lg:sticky lg:top-24">
            {/* Quick Metadata Dashboard Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E8E0D0] space-y-5">
              <h3 className="font-serif font-bold text-lg text-[#0D0D0D] border-b border-slate-100 pb-3">
                {t("dest.params")}
              </h3>

              {dest.best_time && (
                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 rounded-xl bg-slate-50 text-[#C9920A] border border-slate-100">
                    <Clock size={16} />
                  </div>
                  <div>
                    <span className="text-gray-400 text-xs font-medium block mb-0.5">
                      {t("dest.bestTime")}
                    </span>
                    <p className="font-semibold text-gray-800 text-sm">
                      {dest.best_time}
                    </p>
                  </div>
                </div>
              )}

              {dest.altitude_m && (
                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 rounded-xl bg-slate-50 text-[#C9920A] border border-slate-100 text-center text-sm font-bold w-9 h-9 flex items-center justify-center">
                    🏔️
                  </div>
                  <div>
                    <span className="text-gray-400 text-xs font-medium block mb-0.5">
                      {t("dest.altitude")}
                    </span>
                    <p className="font-semibold text-gray-800 text-sm">
                      {t("dest.altitudeVal", { meters: dest.altitude_m })}
                    </p>
                  </div>
                </div>
              )}

              {dest.weather_info && (
                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 rounded-xl bg-slate-50 text-[#C9920A] border border-slate-100">
                    <Cloud size={16} />
                  </div>
                  <div>
                    <span className="text-gray-400 text-xs font-medium block mb-0.5">
                      {t("dest.weather")}
                    </span>
                    <p className="text-gray-600 text-xs font-normal leading-relaxed mt-1 bg-slate-50 rounded-lg p-2.5 border border-slate-100">
                      {dest.weather_info}
                    </p>
                  </div>
                </div>
              )}

              {dest.latitude && dest.longitude && (
                <div className="pt-2 border-t border-slate-100">
                  <a
                    href={`https://www.google.com/maps?q=${dest.latitude},${dest.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full text-center py-2.5 px-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-all"
                  >
                    <MapPin size={14} className="text-rose-500" />{" "}
                    {t("dest.map")}
                  </a>
                </div>
              )}
            </div>

            {/* Premium Tour CTA Card */}
            <div className="relative bg-[#0D0D12] rounded-2xl p-6 text-white shadow-xl shadow-black/10 overflow-hidden group border border-slate-800">
              <div className="absolute -right-16 -top-16 w-32 h-32 bg-[#C9920A]/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -right-10 -bottom-10 text-[#C9920A]/10 pointer-events-none transform group-hover:scale-110 transition-transform duration-500 ease-out">
                <Compass size={160} strokeWidth={1} />
              </div>

              <h3 className="font-serif font-bold text-xl md:text-2xl mb-2 text-white">
                {t("dest.explore", { name: dest.name })}
              </h3>
              <p className="text-slate-400 text-xs md:text-sm leading-relaxed mb-6 font-light max-w-[85%]">
                {t("dest.cta")}
              </p>

              <Link
                to={`/packages?search=${encodeURIComponent(dest.name)}`}
                className="w-full flex items-center justify-center font-bold bg-gradient-to-r from-[#C9920A] to-[#E0A80D] text-[#0D0D12] hover:opacity-90 active:scale-[0.99] shadow-md transition-all py-3 px-4 rounded-xl text-sm tracking-wide text-center"
              >
                {t("dest.find")}
              </Link>
            </div>
          </div>
        </div>

        {/* Dynamic Related Packages Section */}
        {relatedPkgs.length > 0 && (
          <section className="mt-20 border-t border-[#E8E0D0] pt-12">
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mb-8">
              <div>
                <h2 className="font-serif text-2xl md:text-4xl font-bold text-[#0D0D0D]">
                  {t("dest.tours")}
                </h2>
                <p className="text-gray-400 text-sm mt-1">
                  {t("dest.toursSub")}
                </p>
              </div>
              <Link
                to="/packages"
                className="text-sm font-semibold text-[#C9920A] hover:text-[#E0A80D] hover:underline flex items-center gap-1 group"
              >
                {t("dest.viewAll")}{" "}
                <ChevronRight
                  size={14}
                  className="transform group-hover:translate-x-0.5 transition-transform"
                />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedPkgs.map((pkg) => (
                <PackageCard key={pkg.id} pkg={pkg} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
