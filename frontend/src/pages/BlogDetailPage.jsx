/**
 * BlogDetailPage.jsx
 * =================
 * Full blog post with content, author, tags, comment form, and full i18n support.
 */
import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Clock, User, Tag, ChevronRight } from "lucide-react";
import { usePost } from "../hooks/useBlog";
import { blogApi } from "../api/blogApi";
import { useAuth }  from "../context/AuthContext";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import ErrorMessage   from "../components/ui/ErrorMessage";
import toast from "react-hot-toast";

export default function BlogDetailPage() {
  const { t, i18n } = useTranslation();
  const { slug }        = useParams();
  const { isAuthenticated } = useAuth();
  const { data: post, isLoading, isError } = usePost(slug);
  const [commentBody, setCommentBody]   = useState("");
  const [guestName,   setGuestName]     = useState("");
  const [guestEmail,  setGuestEmail]    = useState("");
  const [submitting,  setSubmitting]    = useState(false);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentBody.trim()) return;
    setSubmitting(true);
    try {
      await blogApi.postComment(slug, {
        post: post.id,
        body: commentBody,
        guest_name:  isAuthenticated ? "" : guestName,
        guest_email: isAuthenticated ? "" : guestEmail,
      });
      toast.success(t("blogDetail.commentSuccess", "Comment submitted for review. Thank you!"));
      setCommentBody(""); setGuestName(""); setGuestEmail("");
    } catch {
      toast.error(t("blogDetail.commentError", "Failed to submit comment. Please try again."));
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) return <LoadingSpinner />;
  if (isError || !post) return <ErrorMessage message={t("blogDetail.notFound", "Article not found.")} />;

  // Map i18n language code for native date formatting
  const localeMap = { am: "am-ET", fr: "fr-FR", en: "en-US" };
  const currentLocale = localeMap[i18n.language] || "en-US";

  const date = post.published_at
    ? new Date(post.published_at).toLocaleDateString(currentLocale, { day: "numeric", month: "long", year: "numeric" })
    : "";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      {post.cover_image && (
        <div className="relative h-80 md:h-[50vh] bg-dark-900 overflow-hidden">
          <img src={post.cover_image} alt={post.title} className="absolute inset-0 w-full h-full object-cover opacity-80" />
          <div className="absolute inset-0 bg-gradient-to-t from-dark-900 to-transparent" />
        </div>
      )}

      <div className="max-w-3xl mx-auto px-4 py-10">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1 text-sm text-gray-400 mb-6">
          <Link to="/" className="hover:text-primary-600">{t("blogDetail.home", "Home")}</Link>
          <ChevronRight size={14} />
          <Link to="/blog" className="hover:text-primary-600">{t("blogDetail.blog", "Blog")}</Link>
          <ChevronRight size={14} />
          <span className="text-gray-700 line-clamp-1">{post.title}</span>
        </nav>

        {/* Category */}
        {post.category && (
          <span className="badge badge-green mb-4">{post.category.name}</span>
        )}

        {/* Title */}
        <h1 className="font-serif text-3xl md:text-5xl font-bold text-dark-900 mb-4 leading-tight">{post.title}</h1>

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 mb-8 pb-6 border-b border-gray-200">
          <span className="flex items-center gap-1.5"><User size={14} />{post.author_name}</span>
          <span className="flex items-center gap-1.5"><Clock size={14} />{t("blog.minRead", { count: post.read_time, defaultValue: "{{count}} min read" })}</span>
          {date && <span>{date}</span>}
        </div>

        {/* Content */}
        <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed mb-10"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Tags */}
        {post.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-10 pt-6 border-t border-gray-200">
            <Tag size={14} className="text-gray-400 mt-0.5" />
            {post.tags.map(tag => (
              <Link key={tag.id} to={`/blog?tags__slug=${tag.slug}`}
                className="text-xs px-3 py-1 bg-gray-100 text-gray-600 rounded-full hover:bg-primary-50 hover:text-primary-700 transition-colors">
                {tag.name}
              </Link>
            ))}
          </div>
        )}

        {/* Comments */}
        <section className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="font-serif text-xl font-bold text-dark-900 mb-5">
            {t("blogDetail.commentsCount", { count: post.comments?.length || 0, defaultValue: "Comments ({{count}})" })}
          </h3>

          {/* Existing comments */}
          {post.comments?.length > 0 ? (
            <div className="space-y-5 mb-8">
              {post.comments.map(c => (
                <div key={c.id} className="border-b border-gray-100 pb-4 last:border-0">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-7 h-7 rounded-full bg-primary-100 text-primary-700 text-xs font-bold flex items-center justify-center">
                      {(c.author_name || c.guest_name || "A")[0]}
                    </div>
                    <span className="text-sm font-medium text-dark-900">{c.author_name || c.guest_name || t("blogDetail.anonymous", "Anonymous")}</span>
                  </div>
                  <p className="text-sm text-gray-500 leading-relaxed ml-9">{c.body}</p>
                </div>
              ))}
            </div>
          ) : <p className="text-sm text-gray-400 mb-6">{t("blogDetail.noComments", "No approved comments yet. Be the first!")}</p>}

          {/* Comment form */}
          <h4 className="font-semibold text-dark-900 mb-4">{t("blogDetail.leaveComment", "Leave a Comment")}</h4>
          <form onSubmit={handleCommentSubmit} className="space-y-4">
            {!isAuthenticated && (
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="label">{t("blogDetail.name", "Name")}</label>
                  <input type="text" value={guestName} onChange={e => setGuestName(e.target.value)}
                    className="input" placeholder={t("blogDetail.namePlaceholder", "Your name")} required />
                </div>
                <div>
                  <label className="label">{t("blogDetail.email", "Email")}</label>
                  <input type="email" value={guestEmail} onChange={e => setGuestEmail(e.target.value)}
                    className="input" placeholder="your@email.com" required />
                </div>
              </div>
            )}
            <div>
              <label className="label">{t("blogDetail.comment", "Comment")}</label>
              <textarea value={commentBody} onChange={e => setCommentBody(e.target.value)}
                rows={4} className="input resize-none" placeholder={t("blogDetail.commentPlaceholder", "Share your thoughts…")} required />
            </div>
            <button type="submit" disabled={submitting} className="btn-gold">
              {submitting ? t("blogDetail.submitting", "Submitting…") : t("blogDetail.postComment", "Post Comment")}
            </button>
            <p className="text-xs text-gray-400">{t("blogDetail.reviewNotice", "Comments are reviewed before appearing publicly.")}</p>
          </form>
        </section>
      </div>
    </div>
  );
}