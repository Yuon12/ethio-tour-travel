/**
 * LoadingSpinner
 * ==============
 * Accessible loading indicator supporting size variants, full-page centering,
 * and localized screen reader tags.
 */
import { useTranslation } from "react-i18next";

const SIZE_MAP = {
  sm: "h-5 w-5 border-2",
  md: "h-10 w-10 border-2",
  lg: "h-14 w-14 border-[3px]",
};

export default function LoadingSpinner({ 
  size = "md", 
  fullPage = false, 
  className = "" 
}) {
  const { t } = useTranslation();
  const sizeClasses = SIZE_MAP[size] || SIZE_MAP.md;

  const containerClasses = fullPage
    ? "min-h-[60vh] flex flex-col items-center justify-center p-8"
    : `flex flex-col items-center justify-center py-20 ${className}`;

  return (
    <div 
      className={containerClasses}
      role="status"
      aria-label={t("common.loading", "Loading...")}
    >
      <div 
        className={`${sizeClasses} rounded-full border-parchment-100 border-t-saffron animate-spin`} 
      />
      <span className="sr-only">
        {t("common.loading", "Loading...")}
      </span>
    </div>
  );
}