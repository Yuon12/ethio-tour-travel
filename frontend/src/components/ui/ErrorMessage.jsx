/**
 * ErrorMessage
 * ============
 * Reusable error state display with automatic translation fallbacks
 * and an optional interactive retry button.
 */
import { useTranslation } from "react-i18next";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function ErrorMessage({ 
  message, 
  onRetry,
  title 
}) {
  const { t } = useTranslation();

  const displayMessage = message || t("common.errorMessage", "Something went wrong. Please try again.");
  const displayTitle = title || t("common.errorTitle", "Unable to load data");

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {/* Icon Badge */}
      <div className="w-14 h-14 rounded-full bg-amber-500/10 border border-amber-500/20 
                      flex items-center justify-center mb-4 text-amber-600">
        <AlertTriangle size={26} />
      </div>

      {/* Error Heading & Text */}
      <h4 className="font-display font-semibold text-lg text-parchment-900 mb-1">
        {displayTitle}
      </h4>
      <p className="font-body text-sm text-parchment-600 max-w-md leading-relaxed mb-6">
        {displayMessage}
      </p>

      {/* Optional Retry Button */}
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full
                     bg-parchment-900 hover:bg-forest text-white font-body text-xs font-medium
                     transition-colors duration-200 shadow-sm cursor-pointer"
        >
          <RefreshCw size={14} />
          <span>{t("common.retry", "Try Again")}</span>
        </button>
      )}
    </div>
  );
}