/**
 * PackageDetailPage
 * ==================
 * Full tour package detail with internationalized UI components.
 */
import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Clock, Users, BarChart3, Globe, Utensils, Car,
  CheckCircle, XCircle, ChevronDown, ChevronUp
} from "lucide-react";
import { usePackageDetail, usePackageAvailability } from "../hooks/usePackages";
import { useReviews }      from "../hooks/useReviews";
import { useAuth }         from "../context/AuthContext";
import LoadingSpinner      from "../components/ui/LoadingSpinner";
import ErrorMessage        from "../components/ui/ErrorMessage";
import StarRating          from "../components/ui/StarRating";

export default function PackageDetailPage() {
  const { t } = useTranslation();
  const { slug }        = useParams();
  const { isAuthenticated } = useAuth();
  const [activeDay, setActiveDay] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  const { data: pkg,         isLoading, isError } = usePackageDetail(slug);
  const { data: availability }                    = usePackageAvailability(slug);
  const { data: reviewsData }                     = useReviews({ package: slug });
  const reviews = reviewsData?.results || reviewsData || [];

  if (isLoading) return <LoadingSpinner />;
  if (isError || !pkg) return <ErrorMessage message={t("packageDetail.notFound", "Tour package not found.")} />;

  const inclusions = pkg.inclusions_list || [];
  const exclusions = pkg.exclusions_list || [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Hero ── */}
      <div className="relative h-[60vh] bg-dark-900">
        {pkg.cover_image && (
          <img src={pkg.cover_image} alt={pkg.title} className="absolute inset-0 w-full h-full object-cover opacity-80" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-dark-900/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 max-w-7xl mx-auto px-4 pb-8 text-white">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="badge badge-green capitalize">{t(`packages.categories.${pkg.category}`, pkg.category)}</span>
            <span className="badge badge-gold capitalize">{t(`packages.difficulties.${pkg.difficulty}`, pkg.difficulty)}</span>
          </div>
          <h1 className="font-serif text-3xl md:text-5xl font-bold mb-2 drop-shadow">{pkg.title}</h1>
          {pkg.tagline && <p className="text-white/80 text-lg">{pkg.tagline}</p>}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* ── Main Content ── */}
          <div className="flex-1 min-w-0 space-y-8">

            {/* Quick facts bar */}
            <div className="bg-white rounded-2xl p-5 shadow-sm grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {[
                { 
                  Icon: Clock,     
                  label: t("packageDetail.duration", "Duration"),   
                  value: `${pkg.duration_days} ${t("packageDetail.days", "Days")} / ${pkg.duration_nights} ${t("packageDetail.nights", "Nights")}` 
                },
                { 
                  Icon: Users,    
                  label: t("packageDetail.groupSize", "Group Size"), 
                  value: `${t("packageDetail.maxGroupPrefix", "Max")} ${pkg.max_group_size} ${t("packageDetail.people", "people")}` 
                },
                { 
                  Icon: BarChart3, 
                  label: t("packageDetail.difficulty", "Difficulty"), 
                  value: t(`packages.difficulties.${pkg.difficulty}`, pkg.difficulty), 
                  extra: "capitalize" 
                },
                { 
                  Icon: Globe,    
                  label: t("packageDetail.languages", "Languages"),  
                  value: pkg.languages 
                },
              ].map(({ Icon, label, value, extra }) => (
                <div key={label} className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-primary-50 flex items-center justify-center flex-shrink-0">
                    <Icon size={16} className="text-primary-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">{label}</p>
                    <p className={`text-sm font-semibold text-dark-900 ${extra || ""}`}>{value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Tabs */}
            <div className="flex gap-1 border-b border-gray-200">
              {["overview", "itinerary", "gallery", "reviews"].map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2.5 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${
                    activeTab === tab ? "border-primary-600 text-primary-600" : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >{t(`packageDetail.tabs.${tab}`, tab)}</button>
              ))}
            </div>

            {/* Overview tab */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <h2 className="font-serif text-xl font-bold text-dark-900 mb-4">{t("packageDetail.overviewTitle", "Tour Overview")}</h2>
                  <p className="text-gray-600 leading-relaxed">{pkg.overview}</p>
                </div>

                {/* Meals & transport */}
                {(pkg.meals || pkg.transportation || pkg.accommodation) && (
                  <div className="bg-white rounded-2xl p-6 shadow-sm">
                    <h2 className="font-serif text-xl font-bold text-dark-900 mb-4">{t("packageDetail.includedServices", "Included Services")}</h2>
                    <div className="space-y-4">
                      {pkg.meals && <InfoRow Icon={Utensils} label={t("packageDetail.meals", "Meals")} value={pkg.meals} />}
                      {pkg.transportation && <InfoRow Icon={Car} label={t("packageDetail.transportation", "Transportation")} value={pkg.transportation} />}
                    </div>
                  </div>
                )}

                {/* Inclusions / Exclusions */}
                {(inclusions.length > 0 || exclusions.length > 0) && (
                  <div className="grid md:grid-cols-2 gap-6">
                    {inclusions.length > 0 && (
                      <div className="bg-white rounded-2xl p-6 shadow-sm">
                        <h3 className="font-semibold text-dark-900 mb-4 flex items-center gap-2">
                          <CheckCircle size={18} className="text-primary-600" /> {t("packageDetail.whatsIncluded", "What's Included")}
                        </h3>
                        <ul className="space-y-2">
                          {inclusions.map((item, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                              <CheckCircle size={14} className="text-primary-500 mt-0.5 flex-shrink-0" /> {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {exclusions.length > 0 && (
                      <div className="bg-white rounded-2xl p-6 shadow-sm">
                        <h3 className="font-semibold text-dark-900 mb-4 flex items-center gap-2">
                          <XCircle size={18} className="text-red-500" /> {t("packageDetail.notIncluded", "Not Included")}
                        </h3>
                        <ul className="space-y-2">
                          {exclusions.map((item, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                              <XCircle size={14} className="text-red-400 mt-0.5 flex-shrink-0" /> {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Itinerary tab */}
            {activeTab === "itinerary" && (
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h2 className="font-serif text-xl font-bold text-dark-900 mb-6">{t("packageDetail.itineraryTitle", "Day-by-Day Itinerary")}</h2>
                <div className="space-y-3">
                  {(pkg.itinerary || []).map((day) => (
                    <div key={day.day_number} className="border border-gray-100 rounded-xl overflow-hidden">
                      <button
                        onClick={() => setActiveDay(activeDay === day.day_number ? null : day.day_number)}
                        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors text-left"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 rounded-full bg-primary-600 text-white text-sm font-bold flex items-center justify-center flex-shrink-0">
                            {day.day_number}
                          </span>
                          <span className="font-medium text-dark-900">{day.title}</span>
                        </div>
                        {activeDay === day.day_number ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                      </button>
                      {activeDay === day.day_number && (
                        <div className="px-4 pb-4 border-t border-gray-100 bg-gray-50">
                          <p className="text-sm text-gray-600 leading-relaxed mt-3">{day.description}</p>
                          {day.meals && <p className="text-xs text-gray-400 mt-2"><Utensils size={11} className="inline mr-1"/>{t("packageDetail.mealsLabel", "Meals")}: {day.meals}</p>}
                          {day.accommodation && <p className="text-xs text-gray-400 mt-1">🏨 {day.accommodation}</p>}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Gallery tab */}
            {activeTab === "gallery" && (
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h2 className="font-serif text-xl font-bold text-dark-900 mb-4">{t("packageDetail.galleryTitle", "Photo Gallery")}</h2>
                {pkg.images?.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {pkg.images.map((img) => (
                      <div key={img.id} className="rounded-xl overflow-hidden h-40">
                        <img src={img.image} alt={img.caption || pkg.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                      </div>
                    ))}
                  </div>
                ) : <p className="text-gray-400 text-sm">{t("packageDetail.noImages", "No gallery images yet.")}</p>}
              </div>
            )}

            {/* Reviews tab */}
            {activeTab === "reviews" && (
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h2 className="font-serif text-xl font-bold text-dark-900 mb-6">{t("packageDetail.reviewsTitle", "Customer Reviews")}</h2>
                {reviews.length === 0 ? (
                  <p className="text-gray-400 text-sm">{t("packageDetail.noReviews", "No reviews yet. Be the first!")}</p>
                ) : (
                  <div className="space-y-5">
                    {reviews.map(r => (
                      <div key={r.id} className="border-b border-gray-100 pb-5 last:border-0">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-sm">
                            {r.author_name?.[0] || "T"}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-dark-900">{r.author_name}</p>
                            <StarRating rating={r.rating} size={13} />
                          </div>
                        </div>
                        <h4 className="font-semibold text-dark-900 text-sm mb-1">{r.title}</h4>
                        <p className="text-sm text-gray-500 leading-relaxed">{r.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── Sticky Booking Sidebar ── */}
          <div className="lg:w-80 flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
              {/* Price */}
              <div className="mb-5">
                {pkg.is_on_sale && <p className="text-sm text-gray-400 line-through">${pkg.price_usd} USD</p>}
                <p className="text-3xl font-bold text-primary-600">
                  ${pkg.effective_price}
                  <span className="text-sm font-normal text-gray-400"> {t("packageDetail.perPerson", "/ person")}</span>
                </p>
                {pkg.is_on_sale && <span className="badge badge-red mt-1">{t("packageDetail.limitedOffer", "Limited Offer")}</span>}
              </div>

              {/* Key facts */}
              <div className="space-y-2.5 mb-6 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span className="text-gray-400">{t("packageDetail.duration", "Duration")}</span>
                  <span className="font-medium">{pkg.duration_days} {t("packageDetail.days", "Days")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">{t("packageDetail.groupSize", "Group Size")}</span>
                  <span className="font-medium">{t("packageDetail.maxGroupPrefix", "Max")} {pkg.max_group_size}</span>
                </div>
                <div className="flex justify-between capitalize">
                  <span className="text-gray-400">{t("packageDetail.difficulty", "Difficulty")}</span>
                  <span className="font-medium capitalize">{t(`packages.difficulties.${pkg.difficulty}`, pkg.difficulty)}</span>
                </div>
              </div>

              {/* Availability */}
              {availability?.length > 0 && (
                <div className="mb-5">
                  <p className="text-sm font-semibold text-dark-900 mb-2">{t("packageDetail.availableDepartures", "Available Departures")}</p>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {availability.filter(a => a.is_available).map(a => (
                      <div key={a.id} className="flex justify-between items-center text-xs p-2 bg-green-50 rounded-lg">
                        <span className="text-gray-600">{a.start_date} → {a.end_date}</span>
                        <span className="text-primary-700 font-medium">{a.available_seats} {t("packageDetail.seats", "seats")}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* CTA */}
              {isAuthenticated ? (
                <Link to={`/book/${pkg.slug}`} className="btn-gold w-full justify-center text-center block">
                  {t("packageDetail.bookTour", "Book This Tour")}
                </Link>
              ) : (
                <Link to="/login" state={{ from: { pathname: `/book/${pkg.slug}` } }}
                  className="btn-gold w-full justify-center text-center block">
                  {t("packageDetail.loginToBook", "Login to Book")}
                </Link>
              )}
              <p className="text-center text-xs text-gray-400 mt-3">{t("packageDetail.freeCancellation", "Free cancellation up to 7 days before")}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <Icon size={15} className="text-primary-500 mt-0.5 flex-shrink-0" />
      <div><span className="text-xs text-gray-400">{label}: </span><span className="text-sm text-gray-700">{value}</span></div>
    </div>
  );
}