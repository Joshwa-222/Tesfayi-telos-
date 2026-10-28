import React, { useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext.tsx';
import { api } from '../services/api.ts';
import { Mail, Phone, MapPin, Send, CheckCircle2, ShieldCheck } from 'lucide-react';

interface FooterProps {
  onNavigate: (page: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const { language, t } = useLanguage();
  const [email, setEmail] = useState('');
  const [subscribing, setSubscribing] = useState(false);
  const [subscribeMsg, setSubscribeMsg] = useState<{ text: string; error?: boolean } | null>(null);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;

    setSubscribing(true);
    setSubscribeMsg(null);
    try {
      const res = await api.subscribeNewsletter(email);
      setSubscribeMsg({ text: language === 'am' ? res.messageAm : res.messageEn });
      setEmail('');
    } catch (err: any) {
      setSubscribeMsg({ text: err.message || 'Subscription failed', error: true });
    } finally {
      setSubscribing(false);
    }
  };

  return (
    <footer className="bg-[#080809] border-t border-[#222226] text-[#A1A1AA] pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Col 1: Brand & Tagline */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-white/5 border border-white/10 p-1 flex items-center justify-center overflow-hidden">
                <img
                  src="/logo.png"
                  alt="Telos Kine Tibeb"
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-lg font-bold font-serif text-white tracking-wide">
                {language === 'am' ? 'ቴሎስ ኪነ ጥበብ' : 'TELOS KINE TIBEB'}
              </span>
            </div>
            <p className="text-xs leading-relaxed text-[#8E8E93]">
              {t('footer.tagline')}
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs text-[#D4AF37]">
              <span>🇪🇹</span>
              <span>{language === 'am' ? 'አዲስ አበባ፣ ኢትዮጵያ' : 'Addis Ababa, Ethiopia'}</span>
            </div>
          </div>

          {/* Col 2: Navigation Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white">
              {t('footer.quickLinks')}
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onNavigate('theatre')}
                  className="hover:text-[#D4AF37] transition-colors text-left"
                >
                  {t('nav.theatre')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('dance')}
                  className="hover:text-[#D4AF37] transition-colors text-left"
                >
                  {t('nav.dance')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('events')}
                  className="hover:text-[#D4AF37] transition-colors text-left"
                >
                  {t('nav.events')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('gallery')}
                  className="hover:text-[#D4AF37] transition-colors text-left"
                >
                  {t('nav.gallery')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('booking')}
                  className="hover:text-[#D4AF37] transition-colors text-left"
                >
                  {t('nav.booking')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('about')}
                  className="hover:text-[#D4AF37] transition-colors text-left"
                >
                  {t('nav.about')}
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Contact Info */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white">
              {t('footer.contactInfo')}
            </h4>
            <ul className="space-y-2.5 text-xs text-[#8E8E93]">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                <span className="leading-relaxed">
                  {language === 'am'
                    ? 'አ.አ ቂርቆስ ክ/ከተማ ወረዳ 02 ወጣቶች መገንባ ማዕከል'
                    : 'Kirkos Sub-City, Woreda 02 Youth Center, Addis Ababa'}
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#D4AF37] shrink-0" />
                <div className="flex flex-col gap-0.5">
                  <a href="tel:+251907161650" className="hover:text-white transition-colors">
                    0907161650
                  </a>
                  <a href="tel:+251991784565" className="hover:text-white transition-colors">
                    0991784565
                  </a>
                </div>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#D4AF37] shrink-0" />
                <div className="flex flex-col gap-0.5">
                  <a href="mailto:tdiribu2@gmail.com" className="hover:text-white transition-colors">
                    tdiribu2@gmail.com
                  </a>
                  <a href="mailto:tesfayediribu8@gmail.com" className="hover:text-[#D4AF37] transition-colors">
                    tesfayediribu8@gmail.com
                  </a>
                </div>
              </li>
            </ul>
          </div>

          {/* Col 4: Newsletter */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white">
              {t('footer.newsletterTitle')}
            </h4>
            <p className="text-xs text-[#8E8E93] leading-relaxed">
              {t('footer.newsletterDesc')}
            </p>
            <form onSubmit={handleSubscribe} className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@email.com"
                  required
                  className="flex-1 px-3 py-2 bg-[#141416] border border-[#2D2D32] rounded-lg text-xs text-white placeholder-[#71717A] focus:outline-none focus:border-[#D4AF37]"
                />
                <button
                  type="submit"
                  disabled={subscribing}
                  className="px-3.5 py-2 bg-[#D4AF37] hover:bg-[#E5C158] text-black rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer flex items-center justify-center shrink-0"
                  aria-label="Subscribe"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
              {subscribeMsg && (
                <p className={`text-[11px] flex items-center gap-1.5 ${subscribeMsg.error ? 'text-red-400' : 'text-emerald-400'}`}>
                  {!subscribeMsg.error && <CheckCircle2 className="w-3.5 h-3.5" />}
                  {subscribeMsg.text}
                </p>
              )}
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-[#1C1C20] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#71717A]">
          <p>© {new Date().getFullYear()} {t('footer.rights')}</p>
          <div className="flex items-center gap-6">
            <button
              onClick={() => onNavigate('admin')}
              className="hover:text-[#D4AF37] transition-colors flex items-center gap-1.5"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{t('nav.admin')}</span>
            </button>
            <button
              onClick={() => onNavigate('contact')}
              className="hover:text-white transition-colors"
            >
              {t('nav.contact')}
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
