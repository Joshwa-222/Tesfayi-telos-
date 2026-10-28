import React, { useState, useEffect } from 'react';
import { useLanguage } from '../i18n/LanguageContext.tsx';
import { api } from '../services/api.ts';
import { Performance, DanceCategory, EventItem, Testimonial } from '../types/index.ts';
import { Sparkles, Calendar, MapPin, ArrowRight, Play, CheckCircle2, Search, Clock, Users, ShieldAlert } from 'lucide-react';

interface HomePageProps {
  onNavigate: (page: string, params?: any) => void;
  onSelectPerformance: (p: Performance) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate, onSelectPerformance }) => {
  const { language, t } = useLanguage();
  const [performances, setPerformances] = useState<Performance[]>([]);
  const [dances, setDances] = useState<DanceCategory[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  // Booking tracker state
  const [trackingCode, setTrackingCode] = useState('');
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [trackingResult, setTrackingResult] = useState<any>(null);
  const [trackingError, setTrackingError] = useState<string | null>(null);

  useEffect(() => {
    async function loadHomeData() {
      try {
        const [pData, dData, eData, tData] = await Promise.all([
          api.getPerformances({ featured: true }),
          api.getDanceCategories(),
          api.getEvents('upcoming'),
          api.getTestimonials(),
        ]);
        setPerformances(pData);
        setDances(dData.slice(0, 3));
        setEvents(eData.slice(0, 3));
        setTestimonials(tData);
      } catch (err) {
        console.error('Error fetching home data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadHomeData();
  }, []);

  const handleTrackBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingCode.trim()) return;

    setTrackingLoading(true);
    setTrackingError(null);
    setTrackingResult(null);

    try {
      const res = await api.checkBookingStatus(trackingCode);
      setTrackingResult(res);
    } catch (err: any) {
      setTrackingError(
        language === 'am'
          ? 'የቦታ ማስያዣ ቁጥሩ አልተገኘም። እባክዎ እንደገና ያረጋግጡ።'
          : 'Booking reference code not found. Please verify your reference.'
      );
    } finally {
      setTrackingLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return { label: language === 'am' ? 'አዲስ (በመጠባበቅ ላይ)' : 'New (Pending)', color: 'text-amber-400 bg-amber-400/10 border-amber-400/20' };
      case 'under_review':
        return { label: language === 'am' ? 'በግምገማ ላይ' : 'Under Review', color: 'text-blue-400 bg-blue-400/10 border-blue-400/20' };
      case 'approved':
        return { label: language === 'am' ? 'ተረጋግጧል / ጸድቋል' : 'Approved & Confirmed', color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' };
      case 'rejected':
        return { label: language === 'am' ? 'ውድቅ ተደርጓል' : 'Declined', color: 'text-rose-400 bg-rose-400/10 border-rose-400/20' };
      default:
        return { label: status, color: 'text-stone-400 bg-stone-400/10 border-stone-400/20' };
    }
  };

  return (
    <div className="space-y-24 pb-20">
      {/* Cinematic Hero Section */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden border-b border-[#222226]">
        {/* Background Image with Measured Scrim */}
        <div className="absolute inset-0 z-0">
          <img
            src="/src/assets/images/hero_ethiopian_theatre_1793100134111.jpg"
            alt="Ethiopian Cultural Theatre by Telos"
            className="w-full h-full object-cover object-center filter brightness-90"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0C] via-[#0B0B0C]/75 to-black/50" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(11,11,12,0.85)_100%)]" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-20 pb-16 space-y-8">
          {/* Subtle Ethiopian Tibeb / Tagline kicker */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-[#D4AF37]/30 bg-[#121214]/80 backdrop-blur-sm text-xs font-medium text-[#D4AF37] tracking-wider uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
            <span>{t('hero.tagline')}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold font-serif text-white tracking-tight leading-[1.15] text-balance">
            {t('hero.headline')}
          </h1>

          <p className="max-w-3xl mx-auto text-base sm:text-lg text-[#D4D4D8] leading-relaxed font-light">
            {t('hero.subheadline')}
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button
              onClick={() => onNavigate('theatre')}
              className="px-6 py-3 rounded-lg text-sm font-semibold text-black bg-[#D4AF37] hover:bg-[#E5C158] transition-all shadow-lg shadow-[#D4AF37]/20 flex items-center gap-2 cursor-pointer"
            >
              <span>{t('hero.explorePerformances')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigate('booking')}
              className="px-6 py-3 rounded-lg text-sm font-semibold text-white bg-[#1A1A1E] hover:bg-[#27272C] border border-[#3F3F46] transition-all flex items-center gap-2 cursor-pointer hover:border-[#D4AF37]/50"
            >
              <Sparkles className="w-4 h-4 text-[#D4AF37]" />
              <span>{t('hero.bookGroup')}</span>
            </button>
            <button
              onClick={() => onNavigate('gallery')}
              className="px-6 py-3 rounded-lg text-sm font-medium text-[#A1A1AA] hover:text-white hover:bg-white/5 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Play className="w-4 h-4" />
              <span>{t('hero.watchGallery')}</span>
            </button>
          </div>

          {/* Cultural Heritage Proof KPI Strip (4-column) */}
          <div className="pt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
            <div className="p-4 rounded-xl bg-[#121214]/70 border border-[#27272A] backdrop-blur-sm">
              <div className="text-2xl sm:text-3xl font-bold font-serif text-[#D4AF37] tabular-nums">12+</div>
              <div className="text-xs text-[#A1A1AA] mt-1">{t('hero.yearsLegacy')}</div>
            </div>
            <div className="p-4 rounded-xl bg-[#121214]/70 border border-[#27272A] backdrop-blur-sm">
              <div className="text-2xl sm:text-3xl font-bold font-serif text-[#D4AF37] tabular-nums">40+</div>
              <div className="text-xs text-[#A1A1AA] mt-1">{t('hero.proPerformances')}</div>
            </div>
            <div className="p-4 rounded-xl bg-[#121214]/70 border border-[#27272A] backdrop-blur-sm">
              <div className="text-2xl sm:text-3xl font-bold font-serif text-[#D4AF37] tabular-nums">8+</div>
              <div className="text-xs text-[#A1A1AA] mt-1">{t('hero.regionalDances')}</div>
            </div>
            <div className="p-4 rounded-xl bg-[#121214]/70 border border-[#27272A] backdrop-blur-sm">
              <div className="text-2xl sm:text-3xl font-bold font-serif text-[#D4AF37] tabular-nums">150K+</div>
              <div className="text-xs text-[#A1A1AA] mt-1">{t('hero.audienceReached')}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Theatre Productions */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10 pb-4 border-b border-[#222226]">
          <div>
            <span className="text-xs font-semibold text-[#D4AF37] uppercase tracking-widest">
              {language === 'am' ? 'የመድረክ ስራዎች' : 'Theatrical Repertoire'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold font-serif text-white mt-1">
              {t('home.featuredTitle')}
            </h2>
            <p className="text-sm text-[#A1A1AA] mt-1">
              {t('home.featuredSubtitle')}
            </p>
          </div>
          <button
            onClick={() => onNavigate('theatre')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#D4AF37] hover:text-[#E5C158] transition-colors whitespace-nowrap cursor-pointer"
          >
            <span>{t('home.viewAllTheatre')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {performances.map((perf) => (
            <div
              key={perf.id}
              onClick={() => onSelectPerformance(perf)}
              className="group bg-[#121214] border border-[#242428] rounded-xl overflow-hidden hover:border-[#D4AF37]/50 transition-all cursor-pointer flex flex-col"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-[#18181B]">
                <img
                  src={perf.poster_url}
                  alt={language === 'am' ? perf.title_am : perf.title_en}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#121214] via-transparent to-transparent opacity-80" />
                <div className="absolute top-3 left-3">
                  <span className="px-2.5 py-1 rounded bg-[#0B0B0C]/80 backdrop-blur-md border border-[#3F3F46] text-[11px] font-medium text-[#D4AF37]">
                    {language === 'am' ? perf.genre_am : perf.genre_en}
                  </span>
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="text-lg font-bold font-serif text-white group-hover:text-[#D4AF37] transition-colors">
                    {language === 'am' ? perf.title_am : perf.title_en}
                  </h3>
                  <p className="text-xs text-[#A1A1AA] mt-2 line-clamp-3 leading-relaxed">
                    {language === 'am' ? perf.description_am : perf.description_en}
                  </p>
                </div>

                <div className="pt-4 border-t border-[#1F1F23] flex items-center justify-between text-xs text-[#71717A]">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span className="tabular-nums">{perf.duration_minutes} {language === 'am' ? 'ደቂቃ' : 'mins'}</span>
                  </div>
                  <span className="text-[#D4AF37] group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                    {language === 'am' ? 'ዝርዝር ይመልከቱ' : 'Details'}
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Traditional Dance Spotlight */}
      <section className="bg-[#0E0E10] border-y border-[#222226] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10 pb-4 border-b border-[#222226]">
            <div>
              <span className="text-xs font-semibold text-[#D4AF37] uppercase tracking-widest">
                {language === 'am' ? 'የብሔረሰቦች ውዝዋዜ' : 'Cultural Heritage'}
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold font-serif text-white mt-1">
                {t('home.danceTitle')}
              </h2>
              <p className="text-sm text-[#A1A1AA] mt-1">
                {t('home.danceSubtitle')}
              </p>
            </div>
            <button
              onClick={() => onNavigate('dance')}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#D4AF37] hover:text-[#E5C158] transition-colors whitespace-nowrap cursor-pointer"
            >
              <span>{t('home.viewAllDance')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {dances.map((dance) => (
              <div
                key={dance.id}
                className="group bg-[#141416] border border-[#26262B] rounded-xl overflow-hidden hover:border-[#D4AF37]/50 transition-all flex flex-col"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-[#18181B]">
                  <img
                    src={dance.image_url}
                    alt={language === 'am' ? dance.name_am : dance.name_en}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#141416] via-transparent to-transparent opacity-90" />
                  <div className="absolute bottom-3 left-4">
                    <span className="text-xs text-[#D4AF37] font-medium tracking-wide">
                      {language === 'am' ? dance.region_am : dance.region_en}
                    </span>
                    <h3 className="text-lg font-bold font-serif text-white">
                      {language === 'am' ? dance.name_am : dance.name_en}
                    </h3>
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <p className="text-xs text-[#A1A1AA] leading-relaxed line-clamp-3">
                    {language === 'am' ? dance.description_am : dance.description_en}
                  </p>

                  <div className="pt-4 border-t border-[#1F1F23] flex items-center justify-between">
                    <button
                      onClick={() => onNavigate('dance')}
                      className="text-xs text-[#D4D4D8] hover:text-[#D4AF37] transition-colors cursor-pointer"
                    >
                      {language === 'am' ? 'ስለ ውዝዋዜው አንብብ' : 'Learn Traditions'}
                    </button>
                    <button
                      onClick={() => onNavigate('booking', { preferred: language === 'am' ? dance.name_am : dance.name_en })}
                      className="px-3 py-1.5 rounded bg-[#D4AF37]/15 hover:bg-[#D4AF37] text-[#D4AF37] hover:text-black text-xs font-semibold transition-all cursor-pointer"
                    >
                      {t('dance.bookThisDance')}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Upcoming Events Calendar Highlight */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10 pb-4 border-b border-[#222226]">
          <div>
            <span className="text-xs font-semibold text-[#D4AF37] uppercase tracking-widest">
              {language === 'am' ? 'የመድረክ ቀጠሮዎች' : 'Upcoming Stage Shows'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold font-serif text-white mt-1">
              {t('home.upcomingEventsTitle')}
            </h2>
            <p className="text-sm text-[#A1A1AA] mt-1">
              {t('home.upcomingEventsSubtitle')}
            </p>
          </div>
          <button
            onClick={() => onNavigate('events')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#D4AF37] hover:text-[#E5C158] transition-colors whitespace-nowrap cursor-pointer"
          >
            <span>{t('home.viewAllEvents')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-4">
          {events.map((ev) => (
            <div
              key={ev.id}
              className="p-6 bg-[#121214] border border-[#242428] rounded-xl hover:border-[#38383E] transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <div className="flex items-start gap-5">
                {/* Event Date Box */}
                <div className="w-16 h-16 rounded-lg bg-[#1A1A1E] border border-[#2D2D32] flex flex-col items-center justify-center shrink-0">
                  <span className="text-xs uppercase text-[#D4AF37] font-semibold">
                    {new Date(ev.event_date).toLocaleString(language === 'am' ? 'am-ET' : 'en-US', { month: 'short' })}
                  </span>
                  <span className="text-xl font-bold text-white tabular-nums">
                    {new Date(ev.event_date).getDate()}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-[#D4AF37] uppercase tracking-wider font-medium">
                      {language === 'am' ? ev.category_am : ev.category_en}
                    </span>
                    <span className="text-zinc-600">·</span>
                    <span className="text-[11px] text-[#A1A1AA] flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[#D4AF37]" />
                      <span>{ev.event_time}</span>
                    </span>
                  </div>
                  <h3 className="text-lg font-bold font-serif text-white">
                    {language === 'am' ? ev.title_am : ev.title_en}
                  </h3>
                  <div className="flex items-center gap-4 text-xs text-[#A1A1AA]">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#D4AF37]" />
                      <span>{language === 'am' ? ev.venue_am : ev.venue_en}, {language === 'am' ? ev.city_am : ev.city_en}</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 self-end md:self-center">
                {ev.ticket_info_en && (
                  <span className="text-xs text-[#D4AF37] font-medium hidden sm:inline-block">
                    {language === 'am' ? ev.ticket_info_am : ev.ticket_info_en}
                  </span>
                )}
                <button
                  onClick={() => onNavigate('events')}
                  className="px-4 py-2 rounded-lg bg-[#1E1E22] hover:bg-[#D4AF37] text-white hover:text-black border border-[#3A3A40] text-xs font-semibold transition-all cursor-pointer"
                >
                  {t('events.buyTicket')}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Interactive Booking Status Tracker Bar */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="p-8 rounded-2xl bg-gradient-to-b from-[#141416] to-[#0E0E10] border border-[#27272A] shadow-xl space-y-6">
          <div className="text-center space-y-2">
            <h3 className="text-xl font-bold font-serif text-white">
              {t('home.trackBookingTitle')}
            </h3>
            <p className="text-xs text-[#A1A1AA]">
              {t('home.trackBookingDesc')}
            </p>
          </div>

          <form onSubmit={handleTrackBooking} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#71717A] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={trackingCode}
                onChange={(e) => setTrackingCode(e.target.value)}
                placeholder={t('home.trackInputPlaceholder')}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-[#18181B] border border-[#333338] text-sm text-white placeholder-[#71717A] focus:outline-none focus:border-[#D4AF37]"
              />
            </div>
            <button
              type="submit"
              disabled={trackingLoading}
              className="px-6 py-2.5 bg-[#D4AF37] hover:bg-[#E5C158] text-black font-semibold text-xs rounded-lg transition-colors disabled:opacity-50 cursor-pointer shrink-0"
            >
              {trackingLoading ? t('common.loading') : t('home.trackButton')}
            </button>
          </form>

          {/* Tracking Result View */}
          {trackingResult && (
            <div className="p-4 rounded-xl bg-[#1A1A1E] border border-[#2F2F36] space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-[#D4AF37]">{trackingResult.booking_code}</span>
                <span className={`text-xs px-2.5 py-0.5 rounded-full border ${getStatusBadge(trackingResult.status).color}`}>
                  {getStatusBadge(trackingResult.status).label}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs pt-2 border-t border-[#26262B]">
                <div>
                  <span className="text-[#71717A] block">{language === 'am' ? 'አስያዥ' : 'Client'}:</span>
                  <span className="text-white font-medium">{trackingResult.full_name}</span>
                </div>
                <div>
                  <span className="text-[#71717A] block">{language === 'am' ? 'የዝግጅቱ ቀን' : 'Date'}:</span>
                  <span className="text-white font-medium">{trackingResult.event_date}</span>
                </div>
                <div>
                  <span className="text-[#71717A] block">{language === 'am' ? 'ቦታ' : 'Location'}:</span>
                  <span className="text-white font-medium">{trackingResult.event_location}</span>
                </div>
              </div>
            </div>
          )}

          {trackingError && (
            <p className="text-xs text-rose-400 text-center flex items-center justify-center gap-2">
              <ShieldAlert className="w-4 h-4" />
              {trackingError}
            </p>
          )}
        </div>
      </section>

      {/* Genuine Testimonials */}
      {testimonials.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <span className="text-xs font-semibold text-[#D4AF37] uppercase tracking-widest">
              {language === 'am' ? 'ምስክርነቶች' : 'Cultural Recognition'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold font-serif text-white">
              {t('home.testimonialsTitle')}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {testimonials.map((tItem) => (
              <div
                key={tItem.id}
                className="p-8 rounded-xl bg-[#121214] border border-[#242428] relative flex flex-col justify-between space-y-6"
              >
                <p className="text-sm text-[#D4D4D8] italic leading-relaxed">
                  "{language === 'am' ? tItem.quote_am : tItem.quote_en}"
                </p>

                <div className="flex items-center gap-3 pt-4 border-t border-[#1C1C20]">
                  <div className="w-10 h-10 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37] font-bold font-serif text-sm">
                    {tItem.author_en.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">
                      {language === 'am' ? tItem.author_am : tItem.author_en}
                    </h4>
                    <p className="text-xs text-[#A1A1AA]">
                      {language === 'am' ? tItem.role_am : tItem.role_en} · {language === 'am' ? tItem.organization_am : tItem.organization_en}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Booking CTA Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-[#17171A] via-[#121214] to-[#1E1210] border border-[#2E2E35] p-8 sm:p-14 text-center space-y-6">
          <div className="max-w-3xl mx-auto space-y-4">
            <h2 className="text-2xl sm:text-4xl font-bold font-serif text-white text-balance">
              {t('home.ctaTitle')}
            </h2>
            <p className="text-sm sm:text-base text-[#D4D4D8] leading-relaxed">
              {t('home.ctaSubtitle')}
            </p>
          </div>

          <div className="pt-2">
            <button
              onClick={() => onNavigate('booking')}
              className="px-8 py-3.5 rounded-lg text-sm font-semibold text-black bg-[#D4AF37] hover:bg-[#E5C158] transition-all shadow-xl shadow-[#D4AF37]/20 cursor-pointer"
            >
              {t('home.ctaButton')}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
