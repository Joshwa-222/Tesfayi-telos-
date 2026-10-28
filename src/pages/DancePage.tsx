import React, { useState, useEffect } from 'react';
import { useLanguage } from '../i18n/LanguageContext.tsx';
import { api } from '../services/api.ts';
import { DanceCategory } from '../types/index.ts';
import { Sparkles, Music, MapPin, Shirt, CheckCircle2, ArrowRight } from 'lucide-react';

interface DancePageProps {
  onNavigate: (page: string, params?: any) => void;
}

export const DancePage: React.FC<DancePageProps> = ({ onNavigate }) => {
  const { language, t } = useLanguage();
  const [dances, setDances] = useState<DanceCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDances() {
      try {
        const data = await api.getDanceCategories();
        setDances(data);
      } catch (err) {
        console.error('Failed to load dance categories:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchDances();
  }, []);

  const packages = [
    {
      id: 'wedding',
      title: t('dance.weddingPackageTitle'),
      desc: t('dance.weddingPackageDesc'),
      highlight: language === 'am' ? 'ለሰርግ እና ለቤተሰብ ክብር' : 'Popular for Habesha Weddings',
      features: [
        language === 'am' ? 'የሙሽሮች ባህላዊ አቀባበል በከበሮ' : 'Kebero-led bridal entrance march',
        language === 'am' ? 'የእስክስታና የጉራጊኛ ደማቅ ውዝዋዜ' : 'Eskista & Gurage energetic routines',
        language === 'am' ? 'የተሟላ የባህል አልባሳት' : 'Full traditional regalia attire',
      ],
    },
    {
      id: 'festival',
      title: t('dance.festivalPackageTitle'),
      desc: t('dance.festivalPackageDesc'),
      highlight: language === 'am' ? 'ለህዝባዊ በዓላትና ፌስቲቫሎች' : 'High-Impact Stage Presence',
      features: [
        language === 'am' ? 'የ8 ክልሎች ሙሉ ሜድሊ' : '8-region panoramic medley',
        language === 'am' ? 'ቀጥታ የባህል ሙዚቀኞች (ክራር፣ መሰንቆ፣ ከበሮ)' : 'Live traditional ensemble',
        language === 'am' ? 'የአክሮባትና የጋሻ ትርኢት' : 'Acrobatic leaps and ceremonial shields',
      ],
    },
    {
      id: 'diplomatic',
      title: t('dance.diplomaticPackageTitle'),
      desc: t('dance.diplomaticPackageDesc'),
      highlight: language === 'am' ? 'ለዲፕሎማቲክና አለም አቀፍ እንግዶች' : 'Cultural Diplomacy Standard',
      features: [
        language === 'am' ? 'የእንግሊዝኛና የአማርኛ መግለጫ' : 'Bilingual artistic narrative introductions',
        language === 'am' ? 'የተጣራ የድምጽና የብርሃን አቀራረብ' : 'Refined staging & acoustic elegance',
        language === 'am' ? 'የኢትዮጵያ ታሪካዊ ቅርስ ማስተዋወቂያ' : 'Heritage education & guest interaction',
      ],
    },
    {
      id: 'custom',
      title: t('dance.customPackageTitle'),
      desc: t('dance.customPackageDesc'),
      highlight: language === 'am' ? 'እንደ ፍላጎትዎ የተበጀ' : 'Tailored Choreography',
      features: [
        language === 'am' ? 'የተመረጡ ክልሎች ብቻ' : 'Selection of specific regions',
        language === 'am' ? 'ልዩ የኮሪዮግራፊ ቅንብር' : 'Bespoke choreography storylines',
        language === 'am' ? 'ተለዋዋጭ የሰዓትና የቦታ ምርጫ' : 'Flexible duration and touring options',
      ],
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-20">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-semibold text-[#D4AF37] uppercase tracking-widest">
          {language === 'am' ? 'የኢትዮጵያ ቅርስ' : 'Living Heritage & Rhythms'}
        </span>
        <h1 className="text-3xl sm:text-5xl font-bold font-serif text-white tracking-tight">
          {t('dance.title')}
        </h1>
        <p className="text-sm sm:text-base text-[#A1A1AA] leading-relaxed">
          {t('dance.subtitle')}
        </p>
      </div>

      {/* Regional Dance Categories Showcase */}
      {loading ? (
        <div className="py-20 text-center text-xs text-[#71717A]">{t('common.loading')}</div>
      ) : (
        <div className="space-y-12">
          {dances.map((dance, index) => {
            const isReversed = index % 2 === 1;
            return (
              <div
                key={dance.id}
                className={`p-6 sm:p-8 rounded-2xl bg-[#121214] border border-[#242428] flex flex-col ${
                  isReversed ? 'lg:flex-row-reverse' : 'lg:flex-row'
                } items-stretch gap-8 hover:border-[#D4AF37]/40 transition-colors`}
              >
                {/* Media Image */}
                <div className="lg:w-1/2 rounded-xl overflow-hidden relative aspect-[16/10] bg-[#18181B] shrink-0">
                  <img
                    src={dance.image_url}
                    alt={language === 'am' ? dance.name_am : dance.name_en}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0C] via-transparent to-transparent opacity-60" />
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 rounded bg-[#0B0B0C]/80 backdrop-blur-md border border-[#3F3F46] text-xs font-semibold text-[#D4AF37]">
                      {language === 'am' ? dance.region_am : dance.region_en}
                    </span>
                  </div>
                </div>

                {/* Details */}
                <div className="lg:w-1/2 flex flex-col justify-between space-y-6">
                  <div className="space-y-4">
                    <h2 className="text-2xl font-bold font-serif text-white">
                      {language === 'am' ? dance.name_am : dance.name_en}
                    </h2>
                    <p className="text-sm text-[#D4D4D8] leading-relaxed">
                      {language === 'am' ? dance.description_am : dance.description_en}
                    </p>

                    {/* Costumes & Rhythms */}
                    <div className="space-y-3 pt-2 text-xs">
                      <div className="p-3.5 rounded-lg bg-[#18181B] border border-[#26262B] space-y-1">
                        <span className="text-[#D4AF37] font-semibold flex items-center gap-1.5">
                          <Shirt className="w-3.5 h-3.5" />
                          <span>{t('dance.costumes')}</span>
                        </span>
                        <p className="text-[#A1A1AA]">
                          {language === 'am' ? dance.costumes_am : dance.costumes_en}
                        </p>
                      </div>

                      <div className="p-3.5 rounded-lg bg-[#18181B] border border-[#26262B] space-y-1">
                        <span className="text-[#D4AF37] font-semibold flex items-center gap-1.5">
                          <Music className="w-3.5 h-3.5" />
                          <span>{t('dance.rhythms')}</span>
                        </span>
                        <p className="text-[#A1A1AA]">
                          {language === 'am' ? dance.rhythm_am : dance.rhythm_en}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-[#1C1C20] flex items-center justify-between">
                    <span className="text-xs text-emerald-400 flex items-center gap-1.5 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{t('dance.availableForBooking')}</span>
                    </span>
                    <button
                      onClick={() =>
                        onNavigate('booking', {
                          preferred: language === 'am' ? dance.name_am : dance.name_en,
                        })
                      }
                      className="px-4 py-2 rounded-lg bg-[#D4AF37] hover:bg-[#E5C158] text-black text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-md shadow-[#D4AF37]/15"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{t('dance.bookThisDance')}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Booking Packages Section */}
      <section className="space-y-10 pt-10 border-t border-[#222226]">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-semibold text-[#D4AF37] uppercase tracking-widest">
            {language === 'am' ? 'የአገልግሎት አማራጮች' : 'Customizable Packages'}
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold font-serif text-white">
            {t('dance.packagesTitle')}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              className="p-6 rounded-xl bg-[#121214] border border-[#242428] hover:border-[#D4AF37]/50 transition-all flex flex-col justify-between space-y-6"
            >
              <div className="space-y-4">
                <span className="text-[11px] font-semibold text-[#D4AF37] uppercase tracking-wider block">
                  {pkg.highlight}
                </span>
                <h3 className="text-lg font-bold font-serif text-white">
                  {pkg.title}
                </h3>
                <p className="text-xs text-[#A1A1AA] leading-relaxed">
                  {pkg.desc}
                </p>

                <ul className="space-y-2 pt-2 border-t border-[#1C1C20]">
                  {pkg.features.map((feat, i) => (
                    <li key={i} className="text-xs text-[#D4D4D8] flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#D4AF37] shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => onNavigate('booking', { preferred: pkg.title })}
                className="w-full py-2.5 rounded-lg border border-[#3F3F46] hover:bg-[#D4AF37] text-white hover:text-black text-xs font-semibold transition-all cursor-pointer text-center"
              >
                {t('hero.bookGroup')}
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
