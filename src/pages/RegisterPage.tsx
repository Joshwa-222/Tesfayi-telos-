import React, { useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext.tsx';
import { api, userAuthStorage } from '../services/api.ts';
import { UserMember } from '../types/index.ts';
import {
  ShieldCheck,
  User,
  Phone,
  Mail,
  Lock,
  MapPin,
  Sparkles,
  CreditCard,
  CheckCircle2,
  ShieldAlert,
  ArrowRight,
  Eye,
  EyeOff,
  QrCode
} from 'lucide-react';

interface RegisterPageProps {
  onNavigate: (page: string, params?: any) => void;
  onUserLoginSuccess?: (user: UserMember) => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onNavigate, onUserLoginSuccess }) => {
  const { language, t } = useLanguage();

  const [mode, setMode] = useState<'register' | 'login'>('register');

  // Registration Form State
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    faydaId: '',
    email: '',
    password: '',
    confirmPassword: '',
    city: 'Addis Ababa',
    preferredInterest: 'both' as 'theatre' | 'dance' | 'both',
  });

  // Login Form State
  const [loginData, setLoginData] = useState({
    identifier: '', // Email, Phone, or Fayda ID
    password: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successUser, setSuccessUser] = useState<UserMember | null>(null);

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Validation
    if (!formData.fullName.trim() || !formData.phone.trim() || !formData.faydaId.trim() || !formData.email.trim() || !formData.password) {
      setErrorMsg(
        language === 'am'
          ? 'እባክዎ ሙሉ ስም፣ ስልክ ቁጥር፣ የፋይዳ/ብሔራዊ መታወቂያ፣ ኢሜይል እና የይለፍ ቃል ያስገቡ።'
          : 'Please complete all required fields: Name, Phone, Fayda ID, Email, and Password.'
      );
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMsg(
        language === 'am'
          ? 'የይለፍ ቃሎቹ አይመሳሰሉም። እባክዎ በድጋሚ ያረጋግጡ።'
          : 'Passwords do not match. Please re-enter.'
      );
      return;
    }

    if (formData.password.length < 6) {
      setErrorMsg(
        language === 'am'
          ? 'የይለፍ ቃል ቢያንስ 6 ቁምፊዎች ሊኖሩት ይገባል።'
          : 'Password must be at least 6 characters.'
      );
      return;
    }

    setLoading(true);
    try {
      const res = await api.registerMember({
        fullName: formData.fullName,
        phone: formData.phone,
        faydaId: formData.faydaId,
        email: formData.email,
        password: formData.password,
        city: formData.city,
        preferredInterest: formData.preferredInterest,
      });

      userAuthStorage.setToken(res.token);
      setSuccessUser(res.user);
      if (onUserLoginSuccess) {
        onUserLoginSuccess(res.user);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed. Please check your information.');
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!loginData.identifier.trim() || !loginData.password) {
      setErrorMsg(
        language === 'am'
          ? 'እባክዎ መለያና የይለፍ ቃል ያስገቡ።'
          : 'Please enter your identifier and password.'
      );
      return;
    }

    setLoading(true);
    try {
      const res = await api.loginMember(loginData);
      userAuthStorage.setToken(res.token);
      if (onUserLoginSuccess) {
        onUserLoginSuccess(res.user);
      }
      onNavigate('member-dashboard');
    } catch (err: any) {
      setErrorMsg(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-[#D4AF37]/30 bg-[#121214] text-xs font-medium text-[#D4AF37] uppercase tracking-wider">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>{language === 'am' ? 'የኢትዮጵያ ባህል አባልነት' : 'Ethiopian Cultural Membership'}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold font-serif text-white tracking-tight">
          {mode === 'register' ? t('member.registerTitle') : t('member.loginTitle')}
        </h1>
        <p className="text-xs sm:text-sm text-[#A1A1AA] leading-relaxed">
          {mode === 'register' ? t('member.registerSubtitle') : t('member.loginSubtitle')}
        </p>

        {/* Mode Toggle Button */}
        <div className="pt-2 flex justify-center">
          <div className="p-1 rounded-xl bg-[#121214] border border-[#26262B] inline-flex">
            <button
              onClick={() => { setMode('register'); setErrorMsg(null); }}
              className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                mode === 'register'
                  ? 'bg-[#D4AF37] text-black shadow-sm'
                  : 'text-[#A1A1AA] hover:text-white'
              }`}
            >
              {language === 'am' ? 'አዲስ ምዝገባ' : 'New Registration'}
            </button>
            <button
              onClick={() => { setMode('login'); setErrorMsg(null); }}
              className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                mode === 'login'
                  ? 'bg-[#D4AF37] text-black shadow-sm'
                  : 'text-[#A1A1AA] hover:text-white'
              }`}
            >
              {language === 'am' ? 'የአባላት መግቢያ' : 'Member Sign In'}
            </button>
          </div>
        </div>
      </div>

      {/* Success Registration Screen showing Digital Membership ID Card */}
      {successUser ? (
        <div className="p-6 sm:p-10 rounded-2xl bg-[#121214] border border-[#27272A] space-y-8 animate-in fade-in duration-300">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold font-serif text-white">
              {t('member.welcomeMember')}
            </h2>
            <p className="text-xs text-[#A1A1AA]">
              {language === 'am'
                ? 'የቴሎስ የባህል አባልነት መለያዎ በተሳካ ሁኔታ ተዘጋጅቷል።'
                : 'Your Telos Cultural Member ID has been verified and registered.'}
            </p>
          </div>

          {/* Premium Ethiopian Cultural Digital Membership ID Card */}
          <div className="max-w-md mx-auto rounded-2xl overflow-hidden border border-[#D4AF37]/50 bg-gradient-to-br from-[#1A1A1E] via-[#141416] to-[#0E0E10] shadow-2xl relative p-6 space-y-6">
            {/* Background Tibeb Accent */}
            <div className="h-1.5 w-full tibeb-border-gold absolute top-0 left-0 right-0" />

            <div className="flex items-center justify-between border-b border-[#2B2B32] pb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-white/5 border border-white/10 p-1 flex items-center justify-center overflow-hidden">
                  <img
                    src="/logo.png"
                    alt="Telos Kine Tibeb"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <h3 className="text-xs font-bold font-serif text-white tracking-wide">
                    TELOS KINE TIBEB
                  </h3>
                  <span className="text-[10px] text-[#D4AF37] uppercase tracking-wider block">
                    {language === 'am' ? 'ቴሎስ ኪነ ጥበብ • የክብር አባል' : 'Telos Kine Tibeb • Cultural Patron'}
                  </span>
                </div>
              </div>

              <div className="w-9 h-9 rounded-lg bg-[#242428] border border-[#3A3A40] flex items-center justify-center text-[#D4AF37]">
                <QrCode className="w-5 h-5" />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <span className="text-[10px] text-[#71717A] uppercase tracking-wider block">
                  {language === 'am' ? 'የአባል ስም' : 'Member Name'}
                </span>
                <span className="text-base font-bold text-white font-serif tracking-wide block">
                  {successUser.full_name}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                <div>
                  <span className="text-[10px] text-[#71717A] uppercase tracking-wider block">
                    {t('member.memberCode')}
                  </span>
                  <span className="font-mono text-[#D4AF37] font-semibold text-xs">
                    {successUser.membership_code}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-[#71717A] uppercase tracking-wider block">
                    {t('member.faydaStatus')}
                  </span>
                  <div className="flex items-center gap-1.5 text-emerald-400 font-mono text-xs font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{successUser.fayda_id}</span>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-[#71717A] uppercase tracking-wider block">
                    {language === 'am' ? 'ስልክ ቁጥር' : 'Phone'}
                  </span>
                  <span className="text-white text-xs">{successUser.phone}</span>
                </div>

                <div>
                  <span className="text-[10px] text-[#71717A] uppercase tracking-wider block">
                    {language === 'am' ? 'ከተማ' : 'City'}
                  </span>
                  <span className="text-white text-xs">{successUser.city || 'Addis Ababa'}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[#26262B] flex items-center justify-between text-[10px] text-[#71717A]">
              <span>ETHIOPIAN HERITAGE NETWORK</span>
              <span className="text-[#D4AF37]">{new Date().getFullYear()}</span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button
              onClick={() => onNavigate('member-dashboard')}
              className="px-6 py-2.5 rounded-lg bg-[#D4AF37] hover:bg-[#E5C158] text-black text-xs font-semibold transition-colors cursor-pointer flex items-center gap-2 shadow-md shadow-[#D4AF37]/20"
            >
              <span>{language === 'am' ? 'ወደ አባልነት ገጽ ይሂዱ' : 'Go to Member Dashboard'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onNavigate('booking')}
              className="px-6 py-2.5 rounded-lg border border-[#3F3F46] hover:bg-[#1A1A1E] text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              {t('member.bookPerformanceWithDiscount')}
            </button>
          </div>
        </div>
      ) : mode === 'register' ? (
        /* REGISTRATION FORM */
        <form onSubmit={handleRegisterSubmit} className="p-6 sm:p-10 rounded-2xl bg-[#121214] border border-[#242428] space-y-6">
          <div className="border-b border-[#222226] pb-4">
            <h3 className="text-lg font-bold font-serif text-white">
              {t('member.formTitle')}
            </h3>
            <p className="text-xs text-[#A1A1AA] mt-1">
              {language === 'am'
                ? 'በፋይዳ (ብሔራዊ መታወቂያ) ቁጥርዎ በመመዝገብ በቴአትርና በውዝዋዜ ዝግጅቶች ላይ ቅድሚያ ያግኙ።'
                : 'Join with your Fayda National ID for priority ticket reservations and cultural updates.'}
            </p>
          </div>

          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400 flex items-center gap-2.5">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Step 1: Personal & Fayda Identification */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-xs text-[#A1A1AA] flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>{t('member.fullName')}</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder={t('member.fullNamePlaceholder')}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#18181B] border border-[#2D2D32] text-xs text-white placeholder-[#71717A] focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              {/* Phone Number */}
              <div className="space-y-1.5">
                <label className="text-xs text-[#A1A1AA] flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>{t('member.phone')}</span>
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder={t('member.phonePlaceholder')}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#18181B] border border-[#2D2D32] text-xs text-white placeholder-[#71717A] focus:outline-none focus:border-[#D4AF37]"
                />
              </div>
            </div>

            {/* Fayda National ID - Highlighted Field */}
            <div className="space-y-1.5 p-4 rounded-xl bg-[#161619] border border-[#D4AF37]/30">
              <label className="text-xs font-semibold text-[#D4AF37] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
                <span>{t('member.faydaId')}</span>
              </label>
              <input
                type="text"
                required
                value={formData.faydaId}
                onChange={(e) => setFormData({ ...formData, faydaId: e.target.value })}
                placeholder={t('member.faydaPlaceholder')}
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#1D1D22] border border-[#3E3E48] text-xs text-white placeholder-[#71717A] focus:outline-none focus:border-[#D4AF37] font-mono tracking-wide"
              />
              <p className="text-[11px] text-[#A1A1AA] mt-1">
                {t('member.faydaNotice')}
              </p>
            </div>

            {/* Email Address */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs text-[#A1A1AA] flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>{t('member.email')}</span>
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder={t('member.emailPlaceholder')}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#18181B] border border-[#2D2D32] text-xs text-white placeholder-[#71717A] focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              {/* City */}
              <div className="space-y-1.5">
                <label className="text-xs text-[#A1A1AA] flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>{t('member.city')}</span>
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder={t('member.cityPlaceholder')}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#18181B] border border-[#2D2D32] text-xs text-white placeholder-[#71717A] focus:outline-none focus:border-[#D4AF37]"
                />
              </div>
            </div>

            {/* Passwords */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs text-[#A1A1AA] flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>{t('member.password')}</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder={t('member.passwordPlaceholder')}
                    className="w-full pl-3.5 pr-10 py-2.5 rounded-lg bg-[#18181B] border border-[#2D2D32] text-xs text-white placeholder-[#71717A] focus:outline-none focus:border-[#D4AF37]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#71717A] hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-[#A1A1AA] flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>{t('member.confirmPassword')}</span>
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder={t('member.confirmPasswordPlaceholder')}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#18181B] border border-[#2D2D32] text-xs text-white placeholder-[#71717A] focus:outline-none focus:border-[#D4AF37]"
                />
              </div>
            </div>

            {/* Cultural Interest */}
            <div className="space-y-1.5 pt-2">
              <label className="text-xs text-[#A1A1AA] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>{t('member.interest')}</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { id: 'both', label: t('member.interestBoth') },
                  { id: 'theatre', label: t('member.interestTheatre') },
                  { id: 'dance', label: t('member.interestDance') },
                ].map((item) => (
                  <button
                    type="button"
                    key={item.id}
                    onClick={() => setFormData({ ...formData, preferredInterest: item.id as any })}
                    className={`p-2.5 rounded-lg border text-xs text-center transition-all cursor-pointer ${
                      formData.preferredInterest === item.id
                        ? 'border-[#D4AF37] bg-[#D4AF37]/15 text-[#D4AF37] font-semibold'
                        : 'border-[#2D2D32] bg-[#18181B] text-[#A1A1AA] hover:text-white'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-4 border-t border-[#222226] flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-[#A1A1AA]">
              {t('member.alreadyMember')}{' '}
              <button
                type="button"
                onClick={() => { setMode('login'); setErrorMsg(null); }}
                className="text-[#D4AF37] font-semibold hover:underline ml-1"
              >
                {t('member.signInHere')}
              </button>
            </p>

            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-8 py-3 rounded-lg bg-[#D4AF37] hover:bg-[#E5C158] text-black font-semibold text-xs transition-all shadow-md shadow-[#D4AF37]/20 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{loading ? t('member.registering') : t('member.submitRegister')}</span>
            </button>
          </div>
        </form>
      ) : (
        /* LOGIN FORM */
        <form onSubmit={handleLoginSubmit} className="max-w-md mx-auto p-6 sm:p-8 rounded-2xl bg-[#121214] border border-[#242428] space-y-6">
          <div className="space-y-1">
            <h3 className="text-lg font-bold font-serif text-white">
              {t('member.loginTitle')}
            </h3>
            <p className="text-xs text-[#A1A1AA]">
              {t('member.loginSubtitle')}
            </p>
          </div>

          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs text-[#A1A1AA] flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>{t('member.identifier')}</span>
              </label>
              <input
                type="text"
                required
                value={loginData.identifier}
                onChange={(e) => setLoginData({ ...loginData, identifier: e.target.value })}
                placeholder={t('member.identifierPlaceholder')}
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#18181B] border border-[#2D2D32] text-xs text-white placeholder-[#71717A] focus:outline-none focus:border-[#D4AF37]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-[#A1A1AA] flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>{t('member.password')}</span>
              </label>
              <input
                type="password"
                required
                value={loginData.password}
                onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                placeholder="******"
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#18181B] border border-[#2D2D32] text-xs text-white placeholder-[#71717A] focus:outline-none focus:border-[#D4AF37]"
              />
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg bg-[#D4AF37] hover:bg-[#E5C158] text-black font-semibold text-xs transition-colors disabled:opacity-50 cursor-pointer shadow-md shadow-[#D4AF37]/20"
            >
              {loading ? t('member.loggingIn') : t('member.submitLogin')}
            </button>

            <p className="text-xs text-[#A1A1AA] text-center">
              {t('member.noAccountYet')}{' '}
              <button
                type="button"
                onClick={() => { setMode('register'); setErrorMsg(null); }}
                className="text-[#D4AF37] font-semibold hover:underline ml-1"
              >
                {t('member.registerNow')}
              </button>
            </p>
          </div>
        </form>
      )}
    </div>
  );
};
