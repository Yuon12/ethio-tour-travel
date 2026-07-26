/**
 * DestinationCard
 * ===============
 * High-contrast image card featuring dynamic region overlays, localized meta tags,
 * smooth hover zoom micro-interactions, and an animated gold base accent.
 */
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { MapPin, ArrowUpRight } from "lucide-react";

export default function DestinationCard({ destination }) {
  const { t } = useTranslation();

  if (!destination) return null;

  return (
    <Link 
      to={`/destinations/${destination.slug || destination.id}`}
      className="group relative block rounded-2xl overflow-hidden h-80
                 shadow-card-rest hover:shadow-card-hover transition-all duration-300"
    >
      {/* Background Image */}
      <img
        src={destination.cover_image || "https://images.unsplash.com/photo-1523805009345-7448845a9e53?w=600&q=80"}
        alt={destination.name || t("destinations.title", "Destination")}
        loading="lazy"
        className="absolute inset-0 w-full h-full object-cover
                   group-hover:scale-105 transition-transform duration-700 ease-out"
      />
      
      {/* Dark gradient overlay for text legibility */}
      <div className="absolute inset-0 bg-card-gradient" />

      {/* Hover Arrow Icon */}
      <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm
                      border border-white/20 flex items-center justify-center
                      opacity-0 group-hover:opacity-100 -translate-y-1 group-hover:translate-y-0
                      transition-all duration-300 z-10">
        <ArrowUpRight size={14} className="text-white" />
      </div>

      {/* Content Overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-5 z-10">
        {destination.region_name && (
          <p className="flex items-center gap-1 text-white/70 text-xs font-body mb-1.5">
            <MapPin size={11} className="text-saffron shrink-0" />
            <span>{destination.region_name}</span>
          </p>
        )}

        <h3 className="font-display font-semibold text-2xl text-white
                       group-hover:text-saffron transition-colors duration-300 line-clamp-1">
          {destination.name}
        </h3>

        {destination.best_time && (
          <p className="text-white/60 text-xs font-body mt-1">
            <span className="font-medium">{t("dest.bestTime", "Best")}:</span> {destination.best_time}
          </p>
        )}
      </div>

      {/* Signature Gold Accent Line on Hover */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold-gradient
                      scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500 z-20" />
    </Link>
  );
}