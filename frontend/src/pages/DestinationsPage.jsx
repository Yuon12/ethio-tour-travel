/**
 * DestinationsPage
 * =================
 * Grid of all Ethiopia destinations with region filter tabs.
 * Refined with an immersive layout and highly responsive micro-interactions.
 */
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useDestinations, useRegions } from "../hooks/useDestinations";
import DestinationCard from "../components/ui/DestinationCard";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import ErrorMessage from "../components/ui/ErrorMessage";
import { Compass, Layers, MapPin } from "lucide-react";

export default function DestinationsPage() {
  const { t } = useTranslation();
  const [activeRegion, setActiveRegion] = useState("");

  const { data: regions } = useRegions();
  const { data, isLoading, isError } = useDestinations(
    activeRegion ? { region__slug: activeRegion } : {},
  );

  const destinations = data?.results || data || [];
  const regionalList = regions?.results || regions || [];

  return (
    <div className="min-h-screen bg-[#F7F3ED] antialiased selection:bg-[#C9920A] selection:text-[#0D0D12]">
      {/* ── IMMERSIVE DARK HERO BANNER ───────────────────────────────── */}
      <div className="bg-[#0D0D12] text-white py-24 md:py-32 relative overflow-hidden border-b border-slate-900">
        {/* Subtle radial ambient glow on the bottom-right corner */}
        <div className="absolute -right-24 -bottom-24 w-96 h-96 bg-[#C9920A]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 text-center relative z-10 space-y-4">
          <span className="inline-flex items-center gap-2 text-[#C9920A] text-xs font-bold tracking-[0.25em] uppercase bg-white/5 px-4 py-1.5 rounded-full border border-white/10 backdrop-blur-sm">
            <Compass size={12} className="animate-spin-slow" />
            {t("destinations.exploreEthiopia")}
          </span>

          <h1 className="font-serif text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight text-white leading-none">
            {t("destinations.title")}
          </h1>

          <p className="text-slate-400 text-sm md:text-lg max-w-2xl mx-auto font-light leading-relaxed pt-2">
            {t("destinations.subtitle")}
          </p>
        </div>
      </div>

      {/* ── MAIN VIEWPORT LAYOUT CONTAINER ──────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        {/* Region Filter Tabs: Sticky Navigation Matrix */}
        {regionalList.length > 0 && (
          <div className="mb-12 sticky top-4 z-40 bg-white/80 backdrop-blur-md p-2.5 rounded-2xl border border-[#E8E0D0] shadow-sm flex items-center justify-center max-w-4xl mx-auto">
            <div className="flex flex-wrap gap-1.5 justify-center w-full">
              <button
                onClick={() => setActiveRegion("")}
                className={`px-5 py-2 rounded-xl text-xs md:text-sm font-semibold tracking-wide transition-all duration-200 ${
                  !activeRegion
                    ? "bg-[#0D0D12] text-white shadow-md shadow-black/10"
                    : "text-slate-600 hover:bg-slate-100 hover:text-[#0D0D0D]"
                }`}
              >
                {t("destinations.allRegions")}
              </button>

              {regionalList.map((region) => {
                const isSelected = activeRegion === region.slug;
                return (
                  <button
                    key={region.id}
                    onClick={() =>
                      setActiveRegion(isSelected ? "" : region.slug)
                    }
                    className={`px-5 py-2 rounded-xl text-xs md:text-sm font-semibold tracking-wide transition-all duration-200 flex items-center gap-2 ${
                      isSelected
                        ? "bg-gradient-to-r from-[#C9920A] to-[#E0A80D] text-[#0D0D12] font-bold shadow-md shadow-[#C9920A]/10"
                        : "text-slate-600 hover:bg-slate-100 hover:text-[#0D0D0D]"
                    }`}
                  >
                    <span>{region.name}</span>
                    {region.destination_count > 0 && (
                      <span
                        className={`inline-flex items-center justify-center px-1.5 py-0.5 rounded-md text-[10px] font-bold ${
                          isSelected
                            ? "bg-[#0D0D12]/20 text-[#0D0D12]"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {region.destination_count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── CORE CONTENT RENDER ENGINE ────────────────────────────── */}
        {isLoading ? (
          <div className="py-32 flex justify-center">
            <LoadingSpinner />
          </div>
        ) : isError ? (
          <div className="py-16">
            <ErrorMessage message={t("destinations.loadFailed")} />
          </div>
        ) : (
          <div className="space-y-8">
            {/* Minimalist result metrics indicator */}
            <div className="flex items-center justify-between border-b border-[#E8E0D0] pb-4">
              <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                <Layers size={15} className="text-slate-400" />
                <span>
                  {t("destinations.foundCount", { count: destinations.length })}
                </span>
              </div>
            </div>

            {/* High-fidelity Discovery Card Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {destinations.map((dest) => (
                <div
                  key={dest.id}
                  className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-[#E8E0D0] hover:border-[#C9920A]/30 hover:shadow-xl hover:-translate-y-1 transform transition-all duration-300 ease-out flex flex-col h-full"
                >
                  <DestinationCard destination={dest} />
                </div>
              ))}
            </div>

            {/* Premium Empty State Illustration */}
            {destinations.length === 0 && (
              <div className="text-center py-24 bg-white border border-dashed border-[#E8E0D0] rounded-3xl max-w-xl mx-auto px-6 space-y-4 shadow-sm">
                <div className="w-12 h-12 rounded-full bg-amber-50 text-[#C9920A] flex items-center justify-center mx-auto">
                  <MapPin size={22} />
                </div>
                <div className="space-y-1">
                  <p className="font-serif font-bold text-[#0D0D0D] text-xl">
                    {t("destinations.noneRegistered")}
                  </p>
                  <p className="text-slate-400 text-sm max-w-xs mx-auto">
                    {t("destinations.noneRegisteredDesc")}
                  </p>
                </div>
                <button
                  onClick={() => setActiveRegion("")}
                  className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all"
                >
                  {t("destinations.clearFilters")}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
