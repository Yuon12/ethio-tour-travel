/**
 * Pagination
 * ==========
 * Accessible pagination controller featuring dynamic page truncation (ellipsis),
 * keyboard/screen reader support, and brand-aligned active page highlights.
 */
import { useTranslation } from "react-i18next";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  const { t } = useTranslation();

  if (totalPages <= 1) return null;

  // Generates page numbers array with dynamic truncation (e.g., [1, '...', 4, 5, 6, '...', 10])
  const getPageNumbers = () => {
    const delta = 1; // Number of pages around the current page
    const range = [];
    const rangeWithDots = [];

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, "...");
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push("...", totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  return (
    <nav 
      aria-label={t("pagination.label", "Pagination Navigation")}
      className="flex items-center justify-center gap-2 mt-14"
    >
      {/* Previous Page Button */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label={t("pagination.previous", "Previous Page")}
        className="w-9 h-9 rounded-full border border-parchment-100 text-parchment-500
                   hover:border-saffron hover:text-saffron disabled:opacity-30 
                   disabled:hover:border-parchment-100 disabled:hover:text-parchment-500
                   disabled:cursor-not-allowed flex items-center justify-center 
                   transition-colors cursor-pointer"
      >
        <ChevronLeft size={16} />
      </button>

      {/* Page Numbers */}
      {getPageNumbers().map((item, idx) => {
        if (item === "...") {
          return (
            <span
              key={`ellipsis-${idx}`}
              className="w-8 text-center text-sm text-parchment-400 font-body select-none"
            >
              …
            </span>
          );
        }

        const isCurrent = item === currentPage;

        return (
          <button
            key={item}
            onClick={() => onPageChange(item)}
            aria-current={isCurrent ? "page" : undefined}
            aria-label={t("pagination.page", { page: item, defaultValue: `Page ${item}` })}
            className={`w-9 h-9 rounded-full font-body text-sm font-medium transition-all cursor-pointer ${
              isCurrent
                ? "bg-gold-gradient text-obsidian shadow-gold-glow"
                : "border border-parchment-100 text-parchment-500 hover:border-saffron hover:text-saffron"
            }`}
          >
            {item}
          </button>
        );
      })}

      {/* Next Page Button */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label={t("pagination.next", "Next Page")}
        className="w-9 h-9 rounded-full border border-parchment-100 text-parchment-500
                   hover:border-saffron hover:text-saffron disabled:opacity-30 
                   disabled:hover:border-parchment-100 disabled:hover:text-parchment-500
                   disabled:cursor-not-allowed flex items-center justify-center 
                   transition-colors cursor-pointer"
      >
        <ChevronRight size={16} />
      </button>
    </nav>
  );
}