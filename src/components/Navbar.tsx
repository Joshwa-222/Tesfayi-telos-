import React, { useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext.tsx';
import { userAuthStorage } from '../services/api.ts';
import { Menu, X, Globe, Sparkles, ShieldCheck, User } from 'lucide-react';

interface NavbarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPage, onNavigate }) => {
  const { language, toggleLanguage, t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const hasUserToken = Boolean(userAuthStorage.getToken());

  const navLinks = [
    { id: 'home', label: t('nav.home') },
    { id: 'theatre', label: t('nav.theatre') },
    { id: 'dance', label: t('nav.dance') },
    { id: 'events', label: t('nav.events') },
    { id: 'gallery', label: t('nav.gallery') },
    { id: 'about', label: t('nav.about') },
    { id: 'contact', label: t('nav.contact') },
  ];

  const handleNavClick = (pageId: string) => {
    onNavigate(pageId);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-50 bg-[#0B0B0C]/90 backdrop-blur-md border-b border-[#26262B] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-8">
          {/* Zone 1: Single text element wordmark with official logo */}
          <button
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-3 text-left group whitespace-nowrap shrink-0 cursor-pointer focus:outline-none"
            aria-label="Telos Kine Tibeb Home"
          >
            <div className="h-12 w-12 rounded-xl bg-white/5 border border-white/10 p-1.5 flex items-center justify-center shadow-lg shadow-black/40 overflow-hidden group-hover:border-[#D4AF37]/50 transition-colors">
              <img
                src="/logo.png"
                alt="Telos Kine Tibeb Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-lg lg:text-xl font-bold tracking-tight text-white group-hover:text-[#D4AF37] transition-colors font-serif">
                {language === 'am' ? 'ቴሎስ ኪነ ጥበብ' : 'TELOS KINE TIBEB'}
              </span>
              <span className="text-[11px] text-[#A1A1AA] tracking-wider uppercase font-medium">
                {language === 'am' ? 'የቴአትርና የባህል ውዝዋዜ' : 'Theatre & Cultural Dance'}
              </span>
            </div>
          </button>

          {/* Zone 2: Clean single-line text navigation links */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-8 text-sm font-medium text-[#D4D4D8]">
            {navLinks.map((link) => {
              const isActive = currentPage === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link.id)}
                  className={`relative py-1 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    isActive ? 'text-[#D4AF37] font-semibold' : 'text-[#D4D4D8] hover:text-white'
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#D4AF37] rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: 1 primary action + Language Switcher + Member Portal + Admin */}
          <div className="hidden sm:flex items-center gap-3 shrink-0">
            {/* Member Register / Portal Button */}
            <button
              onClick={() => handleNavClick(hasUserToken ? 'member-dashboard' : 'register')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
                currentPage === 'register' || currentPage === 'member-dashboard'
                  ? 'border-[#D4AF37] bg-[#D4AF37]/15 text-[#D4AF37] font-semibold'
                  : 'border-[#3F3F46] bg-[#18181B] text-[#D4D4D8] hover:text-white hover:border-[#D4AF37]/50'
              }`}
              title={hasUserToken ? t('nav.memberPortal') : t('nav.register')}
            >
              <User className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>{hasUserToken ? t('nav.memberPortal') : t('nav.register')}</span>
            </button>

            {/* Bilingual Switcher */}
            <button
              onClick={toggleLanguage}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#3F3F46] bg-[#18181B] hover:bg-[#27272A] text-xs font-medium text-[#F4F4F5] transition-all cursor-pointer shadow-sm hover:border-[#D4AF37]/50"
              title={language === 'am' ? 'Switch to English' : 'ወደ አማርኛ ቀይር'}
              aria-label="Toggle language"
            >
              <Globe className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span className="font-semibold">{language === 'am' ? 'English' : 'አማርኛ'}</span>
            </button>

            {/* Admin shortcut button */}
            <button
              onClick={() => handleNavClick('admin')}
              className={`p-2 rounded-lg border transition-all cursor-pointer ${
                currentPage === 'admin'
                  ? 'border-[#D4AF37] bg-[#D4AF37]/10 text-[#D4AF37]'
                  : 'border-[#3F3F46] bg-[#18181B] text-[#A1A1AA] hover:text-white hover:border-[#71717A]'
              }`}
              title={t('nav.admin')}
              aria-label="Admin Portal"
            >
              <ShieldCheck className="w-4 h-4" />
            </button>

            {/* Primary CTA */}
            <button
              onClick={() => handleNavClick('booking')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold text-black bg-[#D4AF37] hover:bg-[#E5C158] transition-all cursor-pointer shadow-md shadow-[#D4AF37]/20 whitespace-nowrap"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t('nav.bookNow')}</span>
            </button>
          </div>

          {/* Mobile hamburger button */}
          <div className="flex sm:hidden items-center gap-2">
            <button
              onClick={toggleLanguage}
              className="px-2.5 py-1 text-xs font-medium rounded border border-[#3F3F46] bg-[#18181B] text-[#D4AF37]"
            >
              {language === 'am' ? 'EN' : 'አማ'}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-[#A1A1AA] hover:text-white hover:bg-[#18181B] rounded-lg transition-colors focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="sm:hidden bg-[#121214] border-b border-[#26262B] px-4 pt-2 pb-6 space-y-2 animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="flex flex-col space-y-1">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                className={`text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  currentPage === link.id
                    ? 'bg-[#D4AF37]/15 text-[#D4AF37] font-semibold'
                    : 'text-[#D4D4D8] hover:bg-[#18181B] hover:text-white'
                }`}
              >
                {link.label}
              </button>
            ))}
            <button
              onClick={() => handleNavClick(hasUserToken ? 'member-dashboard' : 'register')}
              className={`text-left px-3 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 ${
                currentPage === 'register' || currentPage === 'member-dashboard'
                  ? 'bg-[#D4AF37]/15 text-[#D4AF37] font-semibold'
                  : 'text-[#D4D4D8] hover:bg-[#18181B] hover:text-white'
              }`}
            >
              <User className="w-4 h-4 text-[#D4AF37]" />
              <span>{hasUserToken ? t('nav.memberPortal') : t('nav.register')}</span>
            </button>
            <button
              onClick={() => handleNavClick('admin')}
              className={`text-left px-3 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 ${
                currentPage === 'admin'
                  ? 'bg-[#D4AF37]/15 text-[#D4AF37]'
                  : 'text-[#A1A1AA] hover:bg-[#18181B] hover:text-white'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
              <span>{t('nav.admin')}</span>
            </button>
          </div>

          <div className="pt-3 border-t border-[#26262B] flex flex-col gap-2">
            <button
              onClick={() => handleNavClick('booking')}
              className="w-full py-2.5 text-center text-xs font-semibold text-black bg-[#D4AF37] hover:bg-[#E5C158] rounded-lg transition-colors"
            >
              {t('nav.bookNow')}
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
