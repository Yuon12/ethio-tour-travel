/**
 * PackageCard
 * ===========
 * Premium tour package card featuring dynamic i18n localization,
 * localized price formatting, and edge-lit gold hover interactions.
 */
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Clock, Users } from "lucide-react";

const DIFFICULTY_COLOR = {
  easy: "text-green-500 bg-green-500/10",
  moderate: "text-amber-500 bg-amber-500/10",
  hard: "text-orange-500 bg-orange-500/10",
  extreme: "text-red-500 bg-red-500/10",
};

export default function PackageCard({ pkg }) {
  const { t, i18n } = useTranslation();

  if (!pkg) return null;

  const categoryKey = pkg.category ? pkg.category.toLowerCase() : "";
  const difficultyKey = pkg.difficulty ? pkg.difficulty.toLowerCase() : "";

  // Dynamic price formatter adhering to active locale
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat(i18n.language || "en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const effectivePrice = pkg.effective_price ?? pkg.price_usd ?? 0;

  return (
    <Link
      to={`/packages/${pkg.slug || pkg.id}`}
      className="group relative block bg-white rounded-2xl overflow-hidden
                 shadow-card-rest hover:shadow-card-hover hover:-translate-y-1.5
                 transition-all duration-300"
    >
      {/* Gold edge-light — signature hover glow */}
      <div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100
                   transition-opacity duration-300 pointer-events-none z-10"
        style={{
          boxShadow:
            "inset 0 -2px 0 0 #D4A017, inset -1px 0 0 0 rgba(212,160,23,0.3)",
        }}
      />

      {/* Image Container */}
      <div className="relative overflow-hidden h-52 bg-parchment-100">
        <img
          src={
            pkg.cover_image ||
            "https://images.unsplash.com/photo-1523805009345-7448845a9e53?w=600&q=80"
          }
          alt={pkg.title || t("packages.card.defaultAlt", "Tour package image")}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
        />
        <div className="absolute inset-0 bg-card-gradient opacity-60" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
          {pkg.category && (
            <span className="tag tag-white capitalize backdrop-blur-sm">
              {t(`packages.categories.${categoryKey}`, pkg.category)}
            </span>
          )}
          {pkg.is_on_sale && (
            <span className="tag bg-red-500/90 text-white border-transparent backdrop-blur-sm font-semibold">
              {t("packages.card.sale", "Sale")}
            </span>
          )}
        </div>

        {/* Duration Overlay */}
        <div className="absolute bottom-3 left-3 z-10">
          <span className="flex items-center gap-1.5 text-white text-xs font-body font-medium drop-shadow-sm">
            <Clock size={12} />
            {t("packages.card.durationFormat", {
              days: pkg.duration_days || 1,
              nights: pkg.duration_nights || 0,
              defaultValue: `${pkg.duration_days || 1}D / ${
                pkg.duration_nights || 0
              }N`,
            })}
          </span>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-5">
        <h3
          className="font-display font-semibold text-parchment-900 text-lg leading-snug
                       mb-3 group-hover:text-forest transition-colors line-clamp-2"
        >
          {pkg.title}
        </h3>

        {/* Meta details */}
        <div className="flex items-center gap-3 mb-4">
          {pkg.max_group_size && (
            <span className="flex items-center gap-1 text-xs text-parchment-500 font-body">
              <Users size={11} className="text-saffron shrink-0" />
              {t("packages.card.maxGroup", {
                count: pkg.max_group_size,
                defaultValue: `${pkg.max_group_size} max`,
              })}
            </span>
          )}

          {pkg.difficulty && (
            <span
              className={`text-xs font-body font-medium px-2 py-0.5 rounded-full capitalize ${
                DIFFICULTY_COLOR[difficultyKey] || "text-gray-500 bg-gray-100"
              }`}
            >
              {t(`packages.difficulties.${difficultyKey}`, pkg.difficulty)}
            </span>
          )}
        </div>

        {/* Pricing & CTA */}
        <div className="flex items-end justify-between pt-3 border-t border-parchment-100">
          <div>
            {pkg.is_on_sale && pkg.price_usd && (
              <p className="text-xs text-parchment-300 line-through font-body">
                {formatCurrency(pkg.price_usd)}
              </p>
            )}
            <p className="font-display font-semibold text-xl text-parchment-900">
              {formatCurrency(effectivePrice)}
              <span className="text-xs font-body font-normal text-parchment-400 ml-1">
                {t("packages.card.perPerson", {
                  defaultValue: t("packageDetail.perPerson", "/ person"),
                })}
              </span>
            </p>
          </div>

          {/* Action Arrow */}
          <div
            className="w-9 h-9 rounded-full bg-gold-gradient flex items-center justify-center
                       opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0
                       transition-all duration-300 shadow-gold-glow"
          >
            <span className="text-obsidian text-sm font-bold">→</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
