import React, { useState, useEffect } from 'react';
import { useLanguage } from '../i18n/LanguageContext.tsx';
import { api } from '../services/api.ts';
import { GalleryItem } from '../types/index.ts';
import { Play, X, Maximize2, Sparkles } from 'lucide-react';

export const GalleryPage: React.FC = () => {
  const { language, t } = useLanguage();
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchGallery() {
      try {
        setLoading(true);
        const data = await api.getGallery(filter === 'all' ? undefined : filter);
        setItems(data);
      } catch (err) {
        console.error('Failed to load gallery:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchGallery();
  }, [filter]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-semibold text-[#D4AF37] uppercase tracking-widest">
          {language === 'am' ? 'የመድረክ ምስሎች' : 'Visual Chronicle'}
        </span>
        <h1 className="text-3xl sm:text-5xl font-bold font-serif text-white tracking-tight">
          {t('gallery.title')}
        </h1>
        <p className="text-sm sm:text-base text-[#A1A1AA] leading-relaxed">
          {t('gallery.subtitle')}
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-center">
        <div className="flex flex-wrap items-center justify-center gap-1 p-1 bg-[#121214] border border-[#242428] rounded-xl">
          {[
            { id: 'all', label: t('gallery.filterAll') },
            { id: 'theatre', label: t('gallery.filterTheatre') },
            { id: 'dance', label: t('gallery.filterDance') },
            { id: 'rehearsal', label: t('gallery.filterRehearsal') },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-4 py-2 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                filter === tab.id
                  ? 'bg-[#D4AF37] text-black font-semibold shadow-sm'
                  : 'text-[#A1A1AA] hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Gallery Grid */}
      {loading ? (
        <div className="py-20 text-center text-xs text-[#71717A]">{t('common.loading')}</div>
      ) : items.length === 0 ? (
        <div className="py-20 text-center text-sm text-[#71717A] bg-[#121214] rounded-xl border border-[#242428]">
          {t('common.noData')}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedItem(item)}
              className="group relative aspect-[4/3] rounded-xl overflow-hidden bg-[#18181B] border border-[#26262B] hover:border-[#D4AF37]/50 transition-all cursor-pointer"
            >
              <img
                src={item.media_url}
                alt={language === 'am' ? item.title_am : item.title_en}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5">
                <span className="text-[11px] font-semibold uppercase text-[#D4AF37] tracking-wider">
                  {item.category}
                </span>
                <h3 className="text-sm font-bold font-serif text-white">
                  {language === 'am' ? item.title_am : item.title_en}
                </h3>
                {item.caption_en && (
                  <p className="text-xs text-[#D4D4D8] line-clamp-2 mt-1">
                    {language === 'am' ? item.caption_am : item.caption_en}
                  </p>
                )}
                <div className="pt-2 flex items-center gap-1.5 text-xs text-[#D4AF37]">
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>{t('gallery.viewFull')}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative max-w-4xl w-full bg-[#121214] border border-[#2F2F36] rounded-2xl overflow-hidden shadow-2xl">
            <button
              onClick={() => setSelectedItem(null)}
              className="absolute top-4 right-4 z-10 p-2 text-white bg-black/60 hover:bg-black/80 rounded-full transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="relative aspect-[16/10] bg-black">
              <img
                src={selectedItem.media_url}
                alt={language === 'am' ? selectedItem.title_am : selectedItem.title_en}
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="p-6 space-y-2 border-t border-[#222226]">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded bg-[#D4AF37]/20 border border-[#D4AF37]/30 text-xs font-semibold text-[#D4AF37] uppercase">
                  {selectedItem.category}
                </span>
              </div>
              <h3 className="text-xl font-bold font-serif text-white">
                {language === 'am' ? selectedItem.title_am : selectedItem.title_en}
              </h3>
              {(selectedItem.caption_en || selectedItem.caption_am) && (
                <p className="text-xs sm:text-sm text-[#D4D4D8] leading-relaxed">
                  {language === 'am' ? selectedItem.caption_am : selectedItem.caption_en}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
