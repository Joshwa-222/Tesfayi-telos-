import React, { useState, useEffect } from 'react';
import { useLanguage } from '../i18n/LanguageContext.tsx';
import { api } from '../services/api.ts';
import { Performance } from '../types/index.ts';
import { Search, Clock, User, Film, Sparkles, X, Play, ArrowRight } from 'lucide-react';

interface TheatrePageProps {
  onNavigate: (page: string, params?: any) => void;
  selectedPerformance?: Performance | null;
  onClearSelected?: () => void;
}

export const TheatrePage: React.FC<TheatrePageProps> = ({
  onNavigate,
  selectedPerformance,
  onClearSelected,
}) => {
  const { language, t } = useLanguage();
  const [performances, setPerformances] = useState<Performance[]>([]);
  const [filter, setFilter] = useState<'all' | 'current' | 'upcoming' | 'repertoire'>('all');
  const [search, setSearch] = useState('');
  const [activeModalItem, setActiveModalItem] = useState<Performance | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (selectedPerformance) {
      setActiveModalItem(selectedPerformance);
    }
  }, [selectedPerformance]);

  useEffect(() => {
    async function fetchPerformances() {
      try {
        setLoading(true);
        const data = await api.getPerformances({
          status: filter === 'all' ? undefined : filter,
          search: search.trim() || undefined,
        });
        setPerformances(data);
      } catch (err) {
        console.error('Failed to load performances:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchPerformances();
  }, [filter, search]);

  const closeModal = () => {
    setActiveModalItem(null);
    if (onClearSelected) onClearSelected();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-semibold text-[#D4AF37] uppercase tracking-widest">
          {language === 'am' ? 'የመድረክ ጥበብ' : 'Dramaturgy & Stage'}
        </span>
        <h1 className="text-3xl sm:text-5xl font-bold font-serif text-white tracking-tight">
          {t('theatre.title')}
        </h1>
        <p className="text-sm sm:text-base text-[#A1A1AA] leading-relaxed">
          {t('theatre.subtitle')}
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-2 bg-[#121214] border border-[#242428] rounded-xl">
        {/* Interactive Segmented Filter */}
        <div className="flex flex-wrap items-center gap-1 w-full sm:w-auto">
          {(['all', 'current', 'upcoming', 'repertoire'] as const).map((key) => {
            const labels = {
              all: t('theatre.filterAll'),
              current: t('theatre.filterCurrent'),
              upcoming: t('theatre.filterUpcoming'),
              repertoire: t('theatre.filterRepertoire'),
            };
            const isActive = filter === key;
            return (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-[#D4AF37] text-black font-semibold shadow-sm'
                    : 'text-[#A1A1AA] hover:text-white hover:bg-[#1A1A1E]'
                }`}
              >
                {labels[key]}
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-[#71717A] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('theatre.searchPlaceholder')}
            className="w-full pl-9 pr-3 py-1.5 bg-[#18181B] border border-[#2F2F35] rounded-lg text-xs text-white placeholder-[#71717A] focus:outline-none focus:border-[#D4AF37]"
          />
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="py-20 text-center text-xs text-[#71717A]">
          {t('common.loading')}
        </div>
      ) : performances.length === 0 ? (
        <div className="py-20 text-center text-sm text-[#71717A] bg-[#121214] rounded-xl border border-[#242428]">
          {t('theatre.noResults')}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {performances.map((perf) => (
            <div
              key={perf.id}
              onClick={() => setActiveModalItem(perf)}
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
                    <span className="tabular-nums">{perf.duration_minutes} {t('theatre.minutes')}</span>
                  </div>
                  <span className="text-[#D4AF37] group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                    {language === 'am' ? 'ሙሉ ዝርዝር' : 'Details'}
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Individual Performance Detail Modal */}
      {activeModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-[#121214] border border-[#2F2F36] rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6">
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 p-2 text-[#A1A1AA] hover:text-white rounded-lg bg-[#18181B] hover:bg-[#27272A] transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Poster Header */}
            <div className="relative aspect-[16/9] rounded-xl overflow-hidden bg-[#18181B]">
              <img
                src={activeModalItem.poster_url}
                alt={language === 'am' ? activeModalItem.title_am : activeModalItem.title_en}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#121214] via-[#121214]/40 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <span className="text-xs px-2.5 py-1 rounded bg-[#D4AF37] text-black font-semibold">
                  {language === 'am' ? activeModalItem.genre_am : activeModalItem.genre_en}
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold font-serif text-white mt-2">
                  {language === 'am' ? activeModalItem.title_am : activeModalItem.title_en}
                </h2>
              </div>
            </div>

            {/* Synopsis */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[#D4AF37]">
                {t('theatre.synopsis')}
              </h4>
              <p className="text-sm text-[#D4D4D8] leading-relaxed">
                {language === 'am' ? activeModalItem.synopsis_am : activeModalItem.synopsis_en}
              </p>
            </div>

            {/* Production Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-[#18181B] border border-[#27272A] text-xs">
              <div>
                <span className="text-[#71717A] block">{t('theatre.director')}:</span>
                <span className="text-white font-medium text-sm">
                  {language === 'am' ? activeModalItem.director_am : activeModalItem.director_en}
                </span>
              </div>
              {activeModalItem.playwright_en && (
                <div>
                  <span className="text-[#71717A] block">{t('theatre.playwright')}:</span>
                  <span className="text-white font-medium text-sm">
                    {language === 'am' ? activeModalItem.playwright_am : activeModalItem.playwright_en}
                  </span>
                </div>
              )}
              {activeModalItem.cast_list_en && (
                <div className="sm:col-span-2">
                  <span className="text-[#71717A] block">{t('theatre.cast')}:</span>
                  <span className="text-white font-medium">
                    {language === 'am' ? activeModalItem.cast_list_am : activeModalItem.cast_list_en}
                  </span>
                </div>
              )}
              <div>
                <span className="text-[#71717A] block">{t('theatre.duration')}:</span>
                <span className="text-white font-medium">
                  {activeModalItem.duration_minutes} {t('theatre.minutes')}
                </span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-2 flex flex-wrap items-center justify-end gap-3 border-t border-[#222226]">
              {activeModalItem.trailer_url && (
                <a
                  href={activeModalItem.trailer_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 rounded-lg border border-[#3F3F46] hover:bg-[#1E1E22] text-xs font-semibold text-white transition-colors flex items-center gap-1.5"
                >
                  <Play className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>{t('theatre.watchTrailer')}</span>
                </a>
              )}
              <button
                onClick={() => {
                  closeModal();
                  onNavigate('booking', {
                    preferred: language === 'am' ? activeModalItem.title_am : activeModalItem.title_en,
                  });
                }}
                className="px-5 py-2.5 rounded-lg bg-[#D4AF37] hover:bg-[#E5C158] text-black text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-md shadow-[#D4AF37]/20"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{t('theatre.bookPerformance')}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
