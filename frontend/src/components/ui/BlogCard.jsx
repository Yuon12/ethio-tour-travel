/**
 * BlogCard
 * ========
 * Travel story card with localized date formatting, dynamic read time,
 * category badges, and smooth hover micro-interactions.
 */
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Clock } from "lucide-react";

export default function BlogCard({ post }) {
  const { t, i18n } = useTranslation();

  if (!post) return null;

  // Format date natively using the current active language locale
  const formattedDate = post.published_at
    ? new Date(post.published_at).toLocaleDateString(i18n.language || "en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "";

  return (
    <Link
      to={`/blog/${post.slug || post.id}`}
      className="group block bg-white rounded-2xl overflow-hidden 
                 shadow-card-rest hover:shadow-card-hover hover:-translate-y-1 
                 transition-all duration-300"
    >
      {/* Cover Image */}
      <div className="overflow-hidden h-44 relative bg-parchment-100">
        <img
          src={post.cover_image || "https://images.unsplash.com/photo-1523805009345-7448845a9e53?w=600&q=80"}
          alt={post.title || t("blog.title", "Blog post image")}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
        />
      </div>

      {/* Card Body */}
      <div className="p-5">
        {/* Category Tag */}
        {post.category_name && (
          <span className="tag tag-gold mb-3 inline-block">
            {post.category_name}
          </span>
        )}

        {/* Title */}
        <h3 className="font-display font-semibold text-parchment-900 text-base leading-snug 
                       mb-2 group-hover:text-forest transition-colors line-clamp-2">
          {post.title}
        </h3>

        {/* Excerpt */}
        {post.excerpt && (
          <p className="font-body text-sm text-parchment-500 line-clamp-2 mb-4 leading-relaxed">
            {post.excerpt}
          </p>
        )}

        {/* Footer Meta Details */}
        <div className="flex items-center justify-between text-xs text-parchment-400 font-body pt-2 border-t border-parchment-100">
          <div className="flex items-center gap-1.5 truncate max-w-[60%]">
            {post.author_name && <span className="truncate font-medium">{post.author_name}</span>}
            {post.author_name && formattedDate && <span>•</span>}
            {formattedDate && <span>{formattedDate}</span>}
          </div>

          {post.read_time && (
            <span className="flex items-center gap-1 shrink-0">
              <Clock size={11} className="text-saffron" />
              {t("blog.minRead", {
                count: post.read_time,
                defaultValue: `${post.read_time} min read`,
              })}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}