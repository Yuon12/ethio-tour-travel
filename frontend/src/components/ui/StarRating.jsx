export default function StarRating({ rating = 0, size = 14 }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} width={size} height={size} viewBox="0 0 20 20">
          <path d="M10 1l2.39 4.84 5.34.78-3.87 3.77.91 5.32L10 13.27l-4.77 2.44.91-5.32L2.27 6.62l5.34-.78L10 1z"
            fill={i < Math.round(rating) ? "#D4A017" : "#E8E0D0"}
            stroke={i < Math.round(rating) ? "#A07810" : "#D0C8B8"}
            strokeWidth="0.5" />
        </svg>
      ))}
    </div>
  );
}


