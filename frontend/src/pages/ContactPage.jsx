/* pages/ContactPage.jsx */
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { MapPin, Phone, Mail, Clock, MessageCircle, Loader2, CheckCircle } from "lucide-react";
import axiosClient from "../api/axiosClient";
import toast from "react-hot-toast";

export default function ContactPage() {
  const { t } = useTranslation();

  const CONTACT_INFO = [
    { Icon: MapPin, label: t("contact.address"), value: "Bole Road, Addis Ababa, Ethiopia" },
    { Icon: Phone,  label: t("contact.phone"),   value: "+251 945 340 558" },
    { Icon: Mail,   label: t("contact.email"),   value: "info@ethiopiatour.com" },
    { Icon: Clock,  label: t("contact.hours"),   value: t("contact.hoursValue") },
  ];

  const [form, setForm]       = useState({ name: "", email: "", subject: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [sent, setSent]       = useState(false);

  const onChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.subject || !form.message) {
      toast.error(t("contact.fillAllFields"));
      return;
    }
    setLoading(true);
    try {
      await axiosClient.post("/contact/", form);
      setSent(true);
      toast.success(t("contact.messageSentToast"));
    } catch (err) {
      const msg = err?.response?.data?.error || t("contact.sendFailed");
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#F7F3ED] antialiased">
      {/* Hero */}
      <section className="bg-[#0D0D12] pt-28 pb-16 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(circle_at_50%_120%,#C9920A,transparent_70%)]" />
        <div className="max-w-2xl mx-auto px-6 relative z-10">
          <p className="font-sans text-[10px] md:text-xs font-bold tracking-widest uppercase text-[#C9920A] mb-3">
            {t("contact.getInTouch")}
          </p>
          <div className="w-12 h-0.5 bg-gradient-to-r from-[#C9920A] via-[#E0A80D] to-[#A07205] rounded-full mx-auto mb-6" />
          <h1 className="font-serif font-semibold text-3xl md:text-5xl text-white mb-4 leading-tight">
            {t("contact.title")}
          </h1>
          <p className="font-sans text-sm md:text-base text-white/60 max-w-xl mx-auto leading-relaxed">
            {t("contact.subtitle")}
          </p>
        </div>
      </section>

      {/* Main Core View Area */}
      <main className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Info Side Column Layout */}
          <div className="flex flex-col gap-3.5 lg:col-span-1">
            {CONTACT_INFO.map(({ Icon, label, value }) => (
              <div
                key={label}
                className="bg-white rounded-2xl p-5 flex items-center gap-4 border border-[#E8E0D0] shadow-xs transition-shadow duration-200 hover:shadow-md"
              >
                <div className="w-10 h-10 rounded-xl bg-[#C9920A]/10 flex items-center justify-center shrink-0 text-[#C9920A]">
                  <Icon size={18} />
                </div>
                <div>
                  <p className="font-sans text-[10px] font-bold tracking-wider text-gray-400 uppercase mb-0.5">
                    {label}
                  </p>
                  <p className="font-sans text-xs md:text-sm font-medium text-[#0D0D0D]">
                    {value}
                  </p>
                </div>
              </div>
            ))}

            {/* WhatsApp CTA Anchor Card */}
            <a
              href="https://wa.me/251945340558"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 bg-[#25D366] hover:bg-[#20ba5a] rounded-2xl p-5 text-white transition-colors duration-200 shadow-sm"
            >
              <MessageCircle size={22} className="shrink-0 text-white fill-white" />
              <div>
                <p className="font-sans font-bold text-sm text-white">
                  {t("contact.whatsappTitle")}
                </p>
                <p className="font-sans text-xs text-white/90 mt-0.5">
                  {t("contact.whatsappSub")}
                </p>
              </div>
            </a>
          </div>

          {/* Secure Form Block Wrapper */}
          <div className="bg-white rounded-2xl p-8 border border-[#E8E0D0] shadow-xs lg:col-span-2">
            {sent ? (
              /* Success Complete View Screen Context */
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-5 text-emerald-800">
                  <CheckCircle size={32} />
                </div>
                <h3 className="font-serif font-semibold text-2xl text-[#0D0D0D] mb-3">
                  {t("contact.messageSentTitle")}
                </h3>
                <p className="font-sans text-xs md:text-sm text-gray-500 leading-relaxed max-w-md mx-auto mb-6">
                  {t("contact.messageSentBody1")}{" "}
                  <strong className="text-[#0D0D0D] font-semibold">{form.email}</strong>.{" "}
                  {t("contact.messageSentBody2")}
                </p>
                <button
                  onClick={() => {
                    setSent(false);
                    setForm({ name: "", email: "", subject: "", message: "" });
                  }}
                  className="font-sans text-xs font-bold px-6 py-2.5 rounded-full border border-gray-300 hover:bg-gray-50 text-gray-700 transition duration-150 cursor-pointer"
                >
                  {t("contact.sendAnother")}
                </button>
              </div>
            ) : (
              /* Standard Input Form Workspace */
              <>
                <h2 className="font-serif font-semibold text-xl md:text-2xl text-[#0D0D0D] mb-1">
                  {t("contact.sendMessage")}
                </h2>
                <p className="font-sans text-xs text-gray-400 mb-6 leading-relaxed">
                  {t("contact.formIntro")}
                </p>

                <form onSubmit={onSubmit} className="flex flex-col gap-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-sans text-[10px] font-bold text-gray-700 uppercase tracking-wider mb-2">
                        {t("contact.yourName")}
                      </label>
                      <input
                        name="name"
                        type="text"
                        value={form.name}
                        onChange={onChange}
                        className="w-full font-sans text-xs md:text-sm bg-[#F7F3ED] text-dark-900 px-4 py-3 rounded-xl border border-[#E8E0D0] focus:outline-none focus:border-[#C9920A] transition-colors"
                        placeholder="Abebe Bikila"
                        required
                      />
                    </div>
                    <div>
                      <label className="block font-sans text-[10px] font-bold text-gray-700 uppercase tracking-wider mb-2">
                        {t("auth.emailAddress")}
                      </label>
                      <input
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={onChange}
                        className="w-full font-sans text-xs md:text-sm bg-[#F7F3ED] text-dark-900 px-4 py-3 rounded-xl border border-[#E8E0D0] focus:outline-none focus:border-[#C9920A] transition-colors"
                        placeholder="you@example.com"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-sans text-[10px] font-bold text-gray-700 uppercase tracking-wider mb-2">
                      {t("contact.subject")}
                    </label>
                    <input
                      name="subject"
                      type="text"
                      value={form.subject}
                      onChange={onChange}
                      className="w-full font-sans text-xs md:text-sm bg-[#F7F3ED] text-dark-900 px-4 py-3 rounded-xl border border-[#E8E0D0] focus:outline-none focus:border-[#C9920A] transition-colors"
                      placeholder={t("contact.subjectPlaceholder")}
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-sans text-[10px] font-bold text-gray-700 uppercase tracking-wider mb-2">
                      {t("contact.message")}
                    </label>
                    <textarea
                      name="message"
                      value={form.message}
                      onChange={onChange}
                      rows={5}
                      className="w-full font-sans text-xs md:text-sm bg-[#F7F3ED] text-dark-900 px-4 py-3 rounded-xl border border-[#E8E0D0] focus:outline-none focus:border-[#C9920A] transition-colors resize-y"
                      placeholder={t("contact.messagePlaceholder")}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full font-sans text-xs font-bold bg-[#E0A80D] text-[#0D0D12] py-3.5 rounded-xl transition duration-150 hover:bg-[#C9920A] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {loading ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        {t("contact.sending")}
                      </>
                    ) : (
                      t("contact.sendMessage")
                    )}
                  </button>

                  <p className="font-sans text-[10px] text-gray-400 text-center mt-1">
                    {t("contact.autoConfirmNote")}
                  </p>
                </form>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}