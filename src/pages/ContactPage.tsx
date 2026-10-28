import React, { useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext.tsx';
import { api } from '../services/api.ts';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle2, ShieldAlert, Globe } from 'lucide-react';

export const ContactPage: React.FC = () => {
  const { language, t } = useLanguage();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });

  const [sending, setSending] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!formData.fullName.trim() || !formData.email.trim() || !formData.subject.trim() || !formData.message.trim()) {
      setErrorMsg(
        language === 'am'
          ? 'እባክዎ ሁሉንም አስፈላጊ መረጃዎች ይሙሉ'
          : 'Please complete all required fields'
      );
      return;
    }

    setSending(true);
    try {
      const res = await api.submitContact(formData);
      setSuccessMsg(language === 'am' ? res.messageAm : res.messageEn);
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
      });
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to send message.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-semibold text-[#D4AF37] uppercase tracking-widest">
          {language === 'am' ? 'ቀጥታ ግንኙነት' : 'Get in Touch'}
        </span>
        <h1 className="text-3xl sm:text-5xl font-bold font-serif text-white tracking-tight">
          {t('contact.title')}
        </h1>
        <p className="text-sm sm:text-base text-[#A1A1AA] leading-relaxed">
          {t('contact.subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Contact Information & Map Info (5 cols) */}
        <div className="lg:col-span-5 space-y-8">
          <div className="p-8 rounded-2xl bg-[#121214] border border-[#242428] space-y-6">
            <h3 className="text-lg font-bold font-serif text-white">
              {language === 'am' ? 'የእውቂያ ዝርዝሮች' : 'Direct Contacts'}
            </h3>

            <ul className="space-y-5 text-xs text-[#A1A1AA]">
              <li className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-lg bg-[#18181B] border border-[#2D2D32] text-[#D4AF37] shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-white font-medium block text-sm">{t('contact.visitUs')}</span>
                  <p className="mt-0.5 leading-relaxed text-[#D4D4D8]">
                    {language === 'am'
                      ? 'አ.አ ቂርቆስ ክፍለ ከተማ ወረዳ 02 ወጣቶች መገንባ ማዕከል'
                      : 'Kirkos Sub-City, Woreda 02, Youth Recreation & Development Center, Addis Ababa, Ethiopia'}
                  </p>
                </div>
              </li>

              <li className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-lg bg-[#18181B] border border-[#2D2D32] text-[#D4AF37] shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-white font-medium block text-sm">{t('contact.callUs')}</span>
                  <div className="mt-1 flex flex-col gap-1 font-mono text-xs">
                    <a href="tel:+251907161650" className="hover:text-[#D4AF37] text-white transition-colors flex items-center gap-1.5">
                      <span>📞</span>
                      <span>0907161650 (+251 90 716 1650)</span>
                    </a>
                    <a href="tel:+251991784565" className="hover:text-[#D4AF37] text-white transition-colors flex items-center gap-1.5">
                      <span>📞</span>
                      <span>0991784565 (+251 99 178 4565)</span>
                    </a>
                  </div>
                </div>
              </li>

              <li className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-lg bg-[#18181B] border border-[#2D2D32] text-[#D4AF37] shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-white font-medium block text-sm">{t('contact.emailUs')}</span>
                  <div className="mt-1 flex flex-col gap-1 text-xs">
                    <a href="mailto:tdiribu2@gmail.com" className="hover:text-[#D4AF37] text-white transition-colors">
                      tdiribu2@gmail.com
                    </a>
                    <a href="mailto:tesfayediribu8@gmail.com" className="hover:text-[#D4AF37] text-[#D4AF37] transition-colors">
                      tesfayediribu8@gmail.com
                    </a>
                  </div>
                </div>
              </li>

              <li className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-lg bg-[#18181B] border border-[#2D2D32] text-[#D4AF37] shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-white font-medium block text-sm">{t('contact.hours')}</span>
                  <p className="mt-0.5">
                    {language === 'am' ? 'ከሰኞ - ቅዳሜ፡ 3:00 ጠዋት - 12:00 ከሰዓት' : 'Monday - Saturday: 9:00 AM - 6:00 PM'}
                  </p>
                </div>
              </li>
            </ul>
          </div>

          {/* Location Map Preview Graphic */}
          <div className="p-6 rounded-2xl bg-[#121214] border border-[#242428] space-y-3">
            <div className="flex items-center justify-between text-xs text-[#A1A1AA]">
              <span className="font-semibold text-white uppercase tracking-wider">
                {language === 'am' ? 'የድርጅቱ አድራሻና ማዕከል' : 'Recreation & Youth Center'}
              </span>
              <span className="text-[#D4AF37]">Kirkos Sub-City, AA</span>
            </div>
            <div className="relative aspect-[16/9] rounded-xl overflow-hidden bg-[#18181B] border border-[#2D2D32] flex items-center justify-center p-4 text-center">
              <div className="space-y-1.5">
                <MapPin className="w-7 h-7 text-[#D4AF37] mx-auto animate-bounce" />
                <p className="text-xs font-semibold text-white">
                  {language === 'am'
                    ? 'ቂርቆስ ክፍለ ከተማ ወረዳ 02 ወጣቶች መገንባ ማዕከል'
                    : 'Kirkos Sub-City Woreda 02 Youth Center'}
                </p>
                <p className="text-[11px] text-[#A1A1AA]">
                  {language === 'am' ? 'አዲስ አበባ፣ ኢትዮጵያ' : 'Addis Ababa, Ethiopia'}
                </p>
                <div className="pt-1">
                  <a
                    href="https://www.google.com/maps/search/Kirkos+Woreda+02+Youth+Center+Addis+Ababa"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-[11px] text-[#D4AF37] hover:underline"
                  >
                    <span>{language === 'am' ? 'በካርታ ላይ ይመልከቱ' : 'View on Google Maps'}</span>
                    <Globe className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form (7 cols) */}
        <div className="lg:col-span-7">
          <form onSubmit={handleSubmit} className="p-8 sm:p-10 rounded-2xl bg-[#121214] border border-[#242428] space-y-6">
            <div>
              <h3 className="text-xl font-bold font-serif text-white">
                {t('contact.formTitle')}
              </h3>
              <p className="text-xs text-[#A1A1AA] mt-1">
                {language === 'am'
                  ? 'ለአጠቃላይ ጥያቄዎች፣ ኦዲሽኖች ወይም ለትብብር ጥሪዎች ከዚህ በታች ይጻፉልን።'
                  : 'Send inquiries regarding auditions, tours, rehearsals, or collaborative productions.'}
              </p>
            </div>

            {errorMsg && (
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400 flex items-center gap-2.5">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs text-[#A1A1AA]">{t('contact.name')}</label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder={language === 'am' ? 'ሙሉ ስም' : 'Full Name'}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#18181B] border border-[#2D2D32] text-xs text-white placeholder-[#71717A] focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-[#A1A1AA]">{t('contact.email')}</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="name@email.com"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#18181B] border border-[#2D2D32] text-xs text-white placeholder-[#71717A] focus:outline-none focus:border-[#D4AF37]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs text-[#A1A1AA]">{t('contact.phone')}</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+251 9..."
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#18181B] border border-[#2D2D32] text-xs text-white placeholder-[#71717A] focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-[#A1A1AA]">{t('contact.subject')}</label>
                <input
                  type="text"
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder={t('contact.subjectPlaceholder')}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#18181B] border border-[#2D2D32] text-xs text-white placeholder-[#71717A] focus:outline-none focus:border-[#D4AF37]"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-[#A1A1AA]">{t('contact.message')}</label>
              <textarea
                rows={5}
                required
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder={t('contact.messagePlaceholder')}
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#18181B] border border-[#2D2D32] text-xs text-white placeholder-[#71717A] focus:outline-none focus:border-[#D4AF37]"
              />
            </div>

            <button
              type="submit"
              disabled={sending}
              className="px-8 py-3 rounded-lg bg-[#D4AF37] hover:bg-[#E5C158] text-black text-xs font-semibold transition-all shadow-md shadow-[#D4AF37]/20 disabled:opacity-50 cursor-pointer flex items-center gap-2"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{sending ? t('contact.sending') : t('contact.sendButton')}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
