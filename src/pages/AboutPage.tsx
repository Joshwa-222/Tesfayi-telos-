import React from 'react';
import { useLanguage } from '../i18n/LanguageContext.tsx';
import { Shield, Sparkles, Award, Users, Compass, Music, BookmarkCheck } from 'lucide-react';

export const AboutPage: React.FC = () => {
  const { language, t } = useLanguage();

  const leaders = [
    {
      name: language === 'am' ? 'መኮንን ታደሰ' : 'Mekonnen Tadesse',
      role: t('about.directorRole'),
      bio: language === 'am'
        ? 'በአዲስ አበባ ዩኒቨርሲቲ የቴአትር ጥበባት ተመራቂና ከ15 ዓመታት በላይ ታሪካዊ ድራማዎችን በመድረክ ላይ የመሩ አንጋፋ ዳይሬክተር።'
        : 'Senior theatre director with over 15 years directing acclaimed historical dramas and cultural productions.',
    },
    {
      name: language === 'am' ? 'ሰላማዊት አለሙ' : 'Selamawit Alemu',
      role: t('about.choreographerRole'),
      bio: language === 'am'
        ? 'የኢትዮጵያ ብሔረሰቦችን ባህላዊ ውዝዋዜዎች በዋናነት የመረመሩና ያቀነባበሩ ታዋቂ የባህል ኮሪዮግራፈር።'
        : 'Distinguished choreographer specializing in regional Ethiopian dance forms, shoulder rhythms, and acrobatic folk staging.',
    },
    {
      name: language === 'am' ? 'ታደለ ገብረኪዳን' : 'Tadele Gebrekidan',
      role: t('about.musicDirectorRole'),
      bio: language === 'am'
        ? 'የባህላዊ የሙዚቃ መሳሪያዎች (ክራር፣ መሰንቆ፣ በገና፣ ከበሮ) መምህርና የቀጥታ ኦርኬስትራ መሪ።'
        : 'Master of indigenous Ethiopian instruments including Kirar, Masenqo, Begena, and Kebero percussion.',
    },
    {
      name: language === 'am' ? 'አስቴር ብርሃኑ' : 'Aster Berhanu',
      role: t('about.costumeRole'),
      bio: language === 'am'
        ? 'የነገስታት ካባዎችን፣ የሀበሻ ጥልፍ አልባሳትንና የየክልሉን የውዝዋዜ ጌጦች የሚያዘጋጁ የፈጠራ ባለሙያ።'
        : 'Costume scenographer researching imperial capes, hand-loomed Habesha Kemis, and regional ornaments.',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-20">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-semibold text-[#D4AF37] uppercase tracking-widest">
          {language === 'am' ? 'ማንነታችንና ጉዟችን' : 'Our Legacy & Purpose'}
        </span>
        <h1 className="text-3xl sm:text-5xl font-bold font-serif text-white tracking-tight">
          {t('about.title')}
        </h1>
        <p className="text-sm sm:text-base text-[#A1A1AA] leading-relaxed">
          {t('about.subtitle')}
        </p>
      </div>

      {/* Hero Visual */}
      <div className="relative aspect-[21/9] rounded-2xl overflow-hidden bg-[#18181B] border border-[#242428]">
        <img
          src="/src/assets/images/traditional_dance_troupe_1793100135241.jpg"
          alt="Telos Tiyator & Cultural Dance Troupe"
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0C] via-transparent to-transparent opacity-70" />
      </div>

      {/* Story Narrative */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <span className="text-xs font-semibold text-[#D4AF37] uppercase tracking-widest">
            {t('about.ourStory')}
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold font-serif text-white">
            {language === 'am'
              ? 'የኢትዮጵያን ጥንታዊ ታሪክና ኪነ-ጥበብ በህያው መድረክ ማቅረብ'
              : 'Preserving Ancient Narratives on Living Stages'}
          </h2>
          <p className="text-sm text-[#D4D4D8] leading-relaxed">
            {t('about.ourStoryP1')}
          </p>
          <p className="text-sm text-[#A1A1AA] leading-relaxed">
            {t('about.ourStoryP2')}
          </p>
        </div>

        {/* Mission & Vision Cards */}
        <div className="space-y-6">
          <div className="p-6 rounded-xl bg-[#121214] border border-[#242428] space-y-3">
            <div className="flex items-center gap-2.5 text-[#D4AF37]">
              <Compass className="w-5 h-5" />
              <h3 className="text-base font-bold font-serif text-white">{t('about.missionTitle')}</h3>
            </div>
            <p className="text-xs sm:text-sm text-[#A1A1AA] leading-relaxed">
              {t('about.missionText')}
            </p>
          </div>

          <div className="p-6 rounded-xl bg-[#121214] border border-[#242428] space-y-3">
            <div className="flex items-center gap-2.5 text-[#D4AF37]">
              <Award className="w-5 h-5" />
              <h3 className="text-base font-bold font-serif text-white">{t('about.visionTitle')}</h3>
            </div>
            <p className="text-xs sm:text-sm text-[#A1A1AA] leading-relaxed">
              {t('about.visionText')}
            </p>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="space-y-8 pt-8 border-t border-[#222226]">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-semibold text-[#D4AF37] uppercase tracking-widest">
            {language === 'am' ? 'መሰረቶቻችን' : 'Guiding Principles'}
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold font-serif text-white">
            {t('about.valuesTitle')}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-xl bg-[#121214] border border-[#242428] space-y-3">
            <div className="w-10 h-10 rounded-lg bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37]">
              <BookmarkCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold font-serif text-white">{t('about.val1Title')}</h3>
            <p className="text-xs text-[#A1A1AA] leading-relaxed">{t('about.val1Desc')}</p>
          </div>

          <div className="p-6 rounded-xl bg-[#121214] border border-[#242428] space-y-3">
            <div className="w-10 h-10 rounded-lg bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37]">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold font-serif text-white">{t('about.val2Title')}</h3>
            <p className="text-xs text-[#A1A1AA] leading-relaxed">{t('about.val2Desc')}</p>
          </div>

          <div className="p-6 rounded-xl bg-[#121214] border border-[#242428] space-y-3">
            <div className="w-10 h-10 rounded-lg bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37]">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold font-serif text-white">{t('about.val3Title')}</h3>
            <p className="text-xs text-[#A1A1AA] leading-relaxed">{t('about.val3Desc')}</p>
          </div>
        </div>
      </section>

      {/* Leadership Team */}
      <section className="space-y-8 pt-8 border-t border-[#222226]">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-semibold text-[#D4AF37] uppercase tracking-widest">
            {language === 'am' ? 'የጥበብ መሪዎች' : 'Artistic Direction'}
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold font-serif text-white">
            {t('about.teamTitle')}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {leaders.map((leader, i) => (
            <div
              key={i}
              className="p-6 rounded-xl bg-[#121214] border border-[#242428] space-y-3"
            >
              <div className="w-12 h-12 rounded-full bg-[#18181B] border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37] font-bold font-serif text-lg">
                {leader.name.charAt(0)}
              </div>
              <div>
                <h3 className="text-base font-bold font-serif text-white">{leader.name}</h3>
                <span className="text-[11px] text-[#D4AF37] font-medium block">{leader.role}</span>
              </div>
              <p className="text-xs text-[#A1A1AA] leading-relaxed">{leader.bio}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
