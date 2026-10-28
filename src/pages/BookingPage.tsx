import React, { useState, useEffect } from 'react';
import { useLanguage } from '../i18n/LanguageContext.tsx';
import { api } from '../services/api.ts';
import { Sparkles, CheckCircle2, ShieldAlert, Calendar, Clock, MapPin, Users, Copy, Check, Search } from 'lucide-react';

interface BookingPageProps {
  initialPreferred?: string;
}

export const BookingPage: React.FC<BookingPageProps> = ({ initialPreferred }) => {
  const { language, t } = useLanguage();

  const [activeTab, setActiveTab] = useState<'new' | 'track'>('new');

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    organization: '',
    eventType: 'cultural_celebration',
    eventDate: '',
    eventLocation: '',
    audienceSize: '100-300',
    preferredPerformance: initialPreferred || '',
    additionalRequirements: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successResult, setSuccessResult] = useState<{
    bookingCode: string;
    messageEn: string;
    messageAm: string;
  } | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  // Tracking state
  const [trackCode, setTrackCode] = useState('');
  const [trackLoading, setTrackLoading] = useState(false);
  const [trackResult, setTrackResult] = useState<any>(null);
  const [trackError, setTrackError] = useState<string | null>(null);

  useEffect(() => {
    if (initialPreferred) {
      setFormData((prev) => ({ ...prev, preferredPerformance: initialPreferred }));
    }
  }, [initialPreferred]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Validation
    if (!formData.fullName.trim() || !formData.phone.trim() || !formData.email.trim() || !formData.eventDate || !formData.eventLocation.trim()) {
      setErrorMsg(
        language === 'am'
          ? 'እባክዎ ምልክት የተደረገባቸውን ሁሉንም አስፈላጊ መረጃዎች በትክክል ይሙሉ'
          : 'Please fill in all required fields indicated with an asterisk (*)'
      );
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.submitBooking(formData);
      setSuccessResult(res);
      window.scrollTo({ top: 100, behavior: 'smooth' });
    } catch (err: any) {
      setErrorMsg(err.message || 'Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleTrackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackCode.trim()) return;

    setTrackLoading(true);
    setTrackError(null);
    setTrackResult(null);

    try {
      const res = await api.checkBookingStatus(trackCode);
      setTrackResult(res);
    } catch (err: any) {
      setTrackError(
        language === 'am'
          ? 'የቦታ ማስያዣ ቁጥሩ አልተገኘም። እባክዎ እንደገና ያረጋግጡ።'
          : 'Booking reference code not found. Please verify your reference.'
      );
    } finally {
      setTrackLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return { label: t('booking.statusNew'), color: 'text-amber-400 bg-amber-400/10 border-amber-400/30' };
      case 'under_review':
        return { label: t('booking.statusUnderReview'), color: 'text-blue-400 bg-blue-400/10 border-blue-400/30' };
      case 'approved':
        return { label: t('booking.statusApproved'), color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30' };
      case 'rejected':
        return { label: t('booking.statusRejected'), color: 'text-rose-400 bg-rose-400/10 border-rose-400/30' };
      case 'completed':
        return { label: t('booking.statusCompleted'), color: 'text-stone-400 bg-stone-400/10 border-stone-400/30' };
      default:
        return { label: status, color: 'text-stone-400 bg-stone-400/10 border-stone-400/30' };
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-semibold text-[#D4AF37] uppercase tracking-widest">
          {language === 'am' ? 'የቦታ ማስያዣ አገልግሎት' : 'Artistic Booking Services'}
        </span>
        <h1 className="text-3xl sm:text-5xl font-bold font-serif text-white tracking-tight">
          {t('booking.title')}
        </h1>
        <p className="text-sm sm:text-base text-[#A1A1AA] leading-relaxed">
          {t('booking.subtitle')}
        </p>

        {/* Tab switch */}
        <div className="pt-4 flex justify-center">
          <div className="p-1 bg-[#121214] border border-[#242428] rounded-xl inline-flex">
            <button
              onClick={() => setActiveTab('new')}
              className={`px-4 py-2 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                activeTab === 'new'
                  ? 'bg-[#D4AF37] text-black font-semibold'
                  : 'text-[#A1A1AA] hover:text-white'
              }`}
            >
              {t('booking.formTitle')}
            </button>
            <button
              onClick={() => setActiveTab('track')}
              className={`px-4 py-2 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                activeTab === 'track'
                  ? 'bg-[#D4AF37] text-black font-semibold'
                  : 'text-[#A1A1AA] hover:text-white'
              }`}
            >
              {t('booking.checkStatusTab')}
            </button>
          </div>
        </div>
      </div>

      {/* Main Tab 1: New Booking Request */}
      {activeTab === 'new' && (
        <div>
          {successResult ? (
            <div className="p-8 sm:p-12 rounded-2xl bg-[#121214] border border-[#2F2F36] space-y-6 text-center animate-in fade-in duration-300">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl sm:text-3xl font-bold font-serif text-white">
                  {t('booking.successTitle')}
                </h2>
                <p className="text-sm text-[#A1A1AA] max-w-xl mx-auto">
                  {language === 'am' ? successResult.messageAm : successResult.messageEn}
                </p>
              </div>

              {/* Booking Reference Box */}
              <div className="p-6 rounded-xl bg-[#18181B] border border-[#D4AF37]/40 max-w-md mx-auto space-y-3">
                <span className="text-xs text-[#A1A1AA] block">{t('booking.yourCodeIs')}</span>
                <div className="flex items-center justify-center gap-3">
                  <span className="text-2xl font-bold font-mono text-[#D4AF37] tracking-wider">
                    {successResult.bookingCode}
                  </span>
                  <button
                    onClick={() => copyToClipboard(successResult.bookingCode)}
                    className="p-2 rounded-lg bg-[#27272A] hover:bg-[#3F3F46] text-[#D4AF37] transition-colors"
                    title="Copy code"
                  >
                    {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#1A1A1E] border border-[#26262B] max-w-xl mx-auto text-xs text-[#A1A1AA] leading-relaxed">
                <p className="font-semibold text-white mb-1">{t('booking.saveCodeNote')}</p>
                <p className="text-amber-400/90">{t('booking.reviewNotice')}</p>
              </div>

              <div className="pt-4 flex justify-center gap-4">
                <button
                  onClick={() => {
                    setSuccessResult(null);
                    setFormData({
                      fullName: '',
                      phone: '',
                      email: '',
                      organization: '',
                      eventType: 'cultural_celebration',
                      eventDate: '',
                      eventLocation: '',
                      audienceSize: '100-300',
                      preferredPerformance: '',
                      additionalRequirements: '',
                    });
                  }}
                  className="px-6 py-2.5 rounded-lg border border-[#3F3F46] hover:bg-[#1E1E22] text-xs font-semibold text-white transition-colors"
                >
                  {t('booking.anotherBooking')}
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-6 sm:p-10 rounded-2xl bg-[#121214] border border-[#242428] space-y-8">
              {errorMsg && (
                <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400 flex items-center gap-2.5">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Section 1: Contact Details */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-[#D4AF37] uppercase tracking-wider">
                  1. {language === 'am' ? 'የአስያዥ መረጃ' : 'Client & Organization Details'}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs text-[#A1A1AA]">{t('booking.fullName')}</label>
                    <input
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      placeholder={t('booking.fullNamePlaceholder')}
                      className="w-full px-3.5 py-2.5 rounded-lg bg-[#18181B] border border-[#2D2D32] text-xs text-white placeholder-[#71717A] focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs text-[#A1A1AA]">{t('booking.phone')}</label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder={t('booking.phonePlaceholder')}
                      className="w-full px-3.5 py-2.5 rounded-lg bg-[#18181B] border border-[#2D2D32] text-xs text-white placeholder-[#71717A] focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs text-[#A1A1AA]">{t('booking.email')}</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder={t('booking.emailPlaceholder')}
                      className="w-full px-3.5 py-2.5 rounded-lg bg-[#18181B] border border-[#2D2D32] text-xs text-white placeholder-[#71717A] focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs text-[#A1A1AA]">{t('booking.organization')}</label>
                    <input
                      type="text"
                      value={formData.organization}
                      onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                      placeholder={t('booking.organizationPlaceholder')}
                      className="w-full px-3.5 py-2.5 rounded-lg bg-[#18181B] border border-[#2D2D32] text-xs text-white placeholder-[#71717A] focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Event Details */}
              <div className="space-y-4 pt-4 border-t border-[#1F1F24]">
                <h3 className="text-sm font-semibold text-[#D4AF37] uppercase tracking-wider">
                  2. {language === 'am' ? 'የዝግጅቱ ዝርዝር' : 'Event Schedule & Venue'}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs text-[#A1A1AA]">{t('booking.eventType')}</label>
                    <select
                      value={formData.eventType}
                      onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-lg bg-[#18181B] border border-[#2D2D32] text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                    >
                      <option value="traditional_dance">{t('booking.typeDance')}</option>
                      <option value="theatre_production">{t('booking.typeTheatre')}</option>
                      <option value="cultural_celebration">{t('booking.typeWedding')}</option>
                      <option value="public_festival">{t('booking.typeFestival')}</option>
                      <option value="corporate_diplomatic">{t('booking.typeCorporate')}</option>
                      <option value="educational_school">{t('booking.typeSchool')}</option>
                      <option value="custom_performance">{t('booking.typeCustom')}</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs text-[#A1A1AA]">{t('booking.eventDate')}</label>
                    <input
                      type="date"
                      required
                      value={formData.eventDate}
                      onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-lg bg-[#18181B] border border-[#2D2D32] text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs text-[#A1A1AA]">{t('booking.audienceSize')}</label>
                    <select
                      value={formData.audienceSize}
                      onChange={(e) => setFormData({ ...formData, audienceSize: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-lg bg-[#18181B] border border-[#2D2D32] text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                    >
                      <option value="<100">{t('booking.audUnder100')}</option>
                      <option value="100-300">{t('booking.aud100To300')}</option>
                      <option value="300-500">{t('booking.aud300To500')}</option>
                      <option value="500+">{t('booking.aud500Plus')}</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-1.5">
                    <label className="text-xs text-[#A1A1AA]">{t('booking.eventLocation')}</label>
                    <input
                      type="text"
                      required
                      value={formData.eventLocation}
                      onChange={(e) => setFormData({ ...formData, eventLocation: e.target.value })}
                      placeholder={t('booking.eventLocationPlaceholder')}
                      className="w-full px-3.5 py-2.5 rounded-lg bg-[#18181B] border border-[#2D2D32] text-xs text-white placeholder-[#71717A] focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs text-[#A1A1AA]">{t('booking.preferredPerformance')}</label>
                    <input
                      type="text"
                      value={formData.preferredPerformance}
                      onChange={(e) => setFormData({ ...formData, preferredPerformance: e.target.value })}
                      placeholder={t('booking.preferredPlaceholder')}
                      className="w-full px-3.5 py-2.5 rounded-lg bg-[#18181B] border border-[#2D2D32] text-xs text-white placeholder-[#71717A] focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Technical & Notes */}
              <div className="space-y-2 pt-4 border-t border-[#1F1F24]">
                <label className="text-xs text-[#A1A1AA]">{t('booking.additionalRequirements')}</label>
                <textarea
                  rows={4}
                  value={formData.additionalRequirements}
                  onChange={(e) => setFormData({ ...formData, additionalRequirements: e.target.value })}
                  placeholder={t('booking.additionalPlaceholder')}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#18181B] border border-[#2D2D32] text-xs text-white placeholder-[#71717A] focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              {/* Disclaimer */}
              <div className="p-3.5 rounded-lg bg-[#18181B] border border-[#27272A] text-[11px] text-[#A1A1AA]">
                <p className="text-amber-400 font-medium">{t('booking.reviewNotice')}</p>
              </div>

              {/* Submit */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-lg bg-[#D4AF37] hover:bg-[#E5C158] text-black font-semibold text-xs transition-all shadow-lg shadow-[#D4AF37]/20 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{submitting ? t('booking.submitting') : t('booking.submitButton')}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Main Tab 2: Track Existing Booking */}
      {activeTab === 'track' && (
        <div className="p-6 sm:p-10 rounded-2xl bg-[#121214] border border-[#242428] space-y-6">
          <div className="space-y-2 text-center max-w-xl mx-auto">
            <h3 className="text-xl font-bold font-serif text-white">
              {t('booking.checkStatusTab')}
            </h3>
            <p className="text-xs text-[#A1A1AA]">
              {t('home.trackBookingDesc')}
            </p>
          </div>

          <form onSubmit={handleTrackSubmit} className="max-w-md mx-auto flex gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#71717A] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={trackCode}
                onChange={(e) => setTrackCode(e.target.value)}
                placeholder="TELOS-2026-XXXX"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-[#18181B] border border-[#333338] text-xs text-white placeholder-[#71717A] focus:outline-none focus:border-[#D4AF37]"
              />
            </div>
            <button
              type="submit"
              disabled={trackLoading}
              className="px-6 py-2.5 bg-[#D4AF37] hover:bg-[#E5C158] text-black text-xs font-semibold rounded-lg transition-colors disabled:opacity-50 cursor-pointer shrink-0"
            >
              {trackLoading ? t('common.loading') : t('home.trackButton')}
            </button>
          </form>

          {trackResult && (
            <div className="max-w-lg mx-auto p-6 rounded-xl bg-[#18181B] border border-[#2F2F36] space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-semibold text-[#D4AF37]">{trackResult.booking_code}</span>
                <span className={`text-xs px-2.5 py-0.5 rounded-full border ${getStatusBadge(trackResult.status).color}`}>
                  {getStatusBadge(trackResult.status).label}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs pt-3 border-t border-[#26262B]">
                <div>
                  <span className="text-[#71717A] block">{t('booking.fullName')}</span>
                  <span className="text-white font-medium">{trackResult.full_name}</span>
                </div>
                <div>
                  <span className="text-[#71717A] block">{t('booking.eventDate')}</span>
                  <span className="text-white font-medium">{trackResult.event_date}</span>
                </div>
                <div>
                  <span className="text-[#71717A] block">{t('booking.eventLocation')}</span>
                  <span className="text-white font-medium">{trackResult.event_location}</span>
                </div>
                <div>
                  <span className="text-[#71717A] block">{language === 'am' ? 'የጥያቄው ቀን' : 'Submission Date'}</span>
                  <span className="text-white font-medium">{new Date(trackResult.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          )}

          {trackError && (
            <p className="text-xs text-rose-400 text-center flex items-center justify-center gap-2">
              <ShieldAlert className="w-4 h-4" />
              {trackError}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
