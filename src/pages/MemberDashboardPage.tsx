import React, { useState, useEffect } from 'react';
import { useLanguage } from '../i18n/LanguageContext.tsx';
import { api, userAuthStorage } from '../services/api.ts';
import { UserMember, BookingRequest } from '../types/index.ts';
import {
  ShieldCheck,
  QrCode,
  Calendar,
  LogOut,
  Sparkles,
  MapPin,
  Phone,
  Mail,
  User,
  CheckCircle2,
  Edit2,
  Clock,
  ArrowRight
} from 'lucide-react';

interface MemberDashboardPageProps {
  onNavigate: (page: string, params?: any) => void;
  currentUser?: UserMember | null;
  onLogout?: () => void;
}

export const MemberDashboardPage: React.FC<MemberDashboardPageProps> = ({
  onNavigate,
  currentUser: propUser,
  onLogout,
}) => {
  const { language, t } = useLanguage();

  const [user, setUser] = useState<UserMember | null>(propUser || null);
  const [bookings, setBookings] = useState<BookingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    fullName: '',
    phone: '',
    city: '',
    preferredInterest: 'both',
  });
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await api.getUserProfile();
        setUser(res.user);
        setBookings(res.bookings || []);
        setEditData({
          fullName: res.user.full_name,
          phone: res.user.phone,
          city: res.user.city || 'Addis Ababa',
          preferredInterest: res.user.preferred_interest || 'both',
        });
      } catch (err) {
        console.error('Failed to load profile:', err);
        // If not logged in, redirect to register
        userAuthStorage.clearToken();
        onNavigate('register');
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  const handleLogout = () => {
    userAuthStorage.clearToken();
    if (onLogout) onLogout();
    onNavigate('register');
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.updateUserProfile(editData);
      setUser(res.user);
      setIsEditing(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to update profile');
    }
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

  if (loading) {
    return (
      <div className="py-24 text-center text-xs text-[#71717A]">
        {t('common.loading')}
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-[#121214] border border-[#242428]">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 p-1 flex items-center justify-center overflow-hidden">
            <img src="/logo.png" alt="Telos Kine Tibeb" className="w-full h-full object-contain" />
          </div>
          <div>
            <h1 className="text-xl font-bold font-serif text-white">
              {user.full_name}
            </h1>
            <p className="text-xs text-[#A1A1AA] flex items-center gap-2 mt-0.5">
              <span>{t('member.memberCode')}: <strong className="text-[#D4AF37] font-mono">{user.membership_code}</strong></span>
              <span>·</span>
              <span className="flex items-center gap-1 text-emerald-400">
                <CheckCircle2 className="w-3 h-3" />
                <span>{user.fayda_id}</span>
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('booking', { preferred: user.preferred_interest === 'theatre' ? 'Theatre Show' : 'Traditional Dance' })}
            className="px-4 py-2 rounded-lg bg-[#D4AF37] hover:bg-[#E5C158] text-black text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-md shadow-[#D4AF37]/15"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t('member.bookPerformanceWithDiscount')}</span>
          </button>
          <button
            onClick={handleLogout}
            className="p-2 rounded-lg border border-[#3F3F46] hover:bg-[#1E1E22] text-[#A1A1AA] hover:text-white transition-colors cursor-pointer"
            title={t('member.logout')}
          >
            <LogOut className="w-4 h-4 text-rose-400" />
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{language === 'am' ? 'የመረጃ ለውጡ ተቀምጧል!' : 'Profile updated successfully!'}</span>
        </div>
      )}

      {/* Grid: Left = Membership ID Card, Right = Bookings and Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (5 cols): The Ethiopian Cultural Digital ID Card */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-2xl overflow-hidden border border-[#D4AF37]/50 bg-gradient-to-br from-[#1A1A1E] via-[#141416] to-[#0D0D0F] shadow-2xl relative p-6 sm:p-7 space-y-6">
            {/* Top Tibeb woven border */}
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
                <span className="text-lg font-bold text-white font-serif tracking-wide block">
                  {user.full_name}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[10px] text-[#71717A] uppercase tracking-wider block">
                    {t('member.memberCode')}
                  </span>
                  <span className="font-mono text-[#D4AF37] font-semibold text-xs">
                    {user.membership_code}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-[#71717A] uppercase tracking-wider block">
                    {t('member.faydaStatus')}
                  </span>
                  <div className="flex items-center gap-1 text-emerald-400 font-mono text-xs font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{user.fayda_id}</span>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-[#71717A] uppercase tracking-wider block">
                    {language === 'am' ? 'ስልክ ቁጥር' : 'Phone'}
                  </span>
                  <span className="text-white text-xs">{user.phone}</span>
                </div>

                <div>
                  <span className="text-[10px] text-[#71717A] uppercase tracking-wider block">
                    {language === 'am' ? 'ከተማ' : 'City'}
                  </span>
                  <span className="text-white text-xs">{user.city || 'Addis Ababa'}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[#26262B] flex items-center justify-between text-[10px] text-[#71717A]">
              <span>ETHIOPIAN CULTURAL GUILD</span>
              <span className="text-[#D4AF37] font-mono">FIN VERIFIED</span>
            </div>
          </div>

          {/* Edit Profile Accordion / Box */}
          <div className="p-6 rounded-2xl bg-[#121214] border border-[#242428] space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">
                {language === 'am' ? 'የአባልነት መረጃ አዘምን' : 'Member Profile Details'}
              </h3>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="text-xs text-[#D4AF37] hover:underline flex items-center gap-1"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>{isEditing ? t('common.close') : t('member.editProfile')}</span>
              </button>
            </div>

            {isEditing ? (
              <form onSubmit={handleSaveProfile} className="space-y-3 pt-2 text-xs">
                <div>
                  <label className="text-[#A1A1AA] block mb-1">{t('member.fullName')}</label>
                  <input
                    type="text"
                    required
                    value={editData.fullName}
                    onChange={(e) => setEditData({ ...editData, fullName: e.target.value })}
                    className="w-full px-3 py-2 bg-[#18181B] border border-[#2D2D32] rounded-lg text-white"
                  />
                </div>

                <div>
                  <label className="text-[#A1A1AA] block mb-1">{t('member.phone')}</label>
                  <input
                    type="tel"
                    required
                    value={editData.phone}
                    onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-[#18181B] border border-[#2D2D32] rounded-lg text-white"
                  />
                </div>

                <div>
                  <label className="text-[#A1A1AA] block mb-1">{t('member.city')}</label>
                  <input
                    type="text"
                    value={editData.city}
                    onChange={(e) => setEditData({ ...editData, city: e.target.value })}
                    className="w-full px-3 py-2 bg-[#18181B] border border-[#2D2D32] rounded-lg text-white"
                  />
                </div>

                <div>
                  <label className="text-[#A1A1AA] block mb-1">{t('member.interest')}</label>
                  <select
                    value={editData.preferredInterest}
                    onChange={(e) => setEditData({ ...editData, preferredInterest: e.target.value })}
                    className="w-full px-3 py-2 bg-[#18181B] border border-[#2D2D32] rounded-lg text-white"
                  >
                    <option value="both">{t('member.interestBoth')}</option>
                    <option value="theatre">{t('member.interestTheatre')}</option>
                    <option value="dance">{t('member.interestDance')}</option>
                  </select>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-3 py-1.5 border border-[#3F3F46] rounded-lg text-white text-xs"
                  >
                    {t('admin.cancel')}
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-[#D4AF37] hover:bg-[#E5C158] text-black font-semibold rounded-lg text-xs"
                  >
                    {t('member.saveProfile')}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-2 text-xs text-[#A1A1AA]">
                <div className="flex justify-between py-1 border-b border-[#1C1C20]">
                  <span>Email:</span>
                  <span className="text-white">{user.email}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#1C1C20]">
                  <span>Fayda ID:</span>
                  <span className="text-emerald-400 font-mono">{user.fayda_id}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#1C1C20]">
                  <span>Phone:</span>
                  <span className="text-white">{user.phone}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span>Interest:</span>
                  <span className="text-[#D4AF37] capitalize">{user.preferred_interest}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column (7 cols): My Bookings & Activity */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 sm:p-8 rounded-2xl bg-[#121214] border border-[#242428] space-y-6">
            <div className="flex items-center justify-between border-b border-[#222226] pb-4">
              <div>
                <h2 className="text-lg font-bold font-serif text-white">
                  {t('member.myBookings')}
                </h2>
                <p className="text-xs text-[#A1A1AA] mt-0.5">
                  {language === 'am'
                    ? 'በስልክ ወይም በኢሜይል አድራሻዎ የተመዘገቡ የቦታ ማስያዣ ጥያቄዎች'
                    : 'Performance requests submitted with your member contact details'}
                </p>
              </div>

              <button
                onClick={() => onNavigate('booking')}
                className="px-3.5 py-1.5 rounded-lg border border-[#3F3F46] hover:bg-[#1E1E22] text-xs font-semibold text-white transition-colors"
              >
                + {language === 'am' ? 'አዲስ ጥያቄ' : 'New Request'}
              </button>
            </div>

            {bookings.length === 0 ? (
              <div className="py-12 text-center space-y-3">
                <Calendar className="w-8 h-8 text-[#71717A] mx-auto" />
                <p className="text-xs text-[#A1A1AA]">{t('member.noBookingsYet')}</p>
                <button
                  onClick={() => onNavigate('booking')}
                  className="px-4 py-2 bg-[#D4AF37] hover:bg-[#E5C158] text-black font-semibold text-xs rounded-lg transition-colors cursor-pointer"
                >
                  {t('home.ctaButton')}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.map((b) => {
                  const statusInfo = getStatusBadge(b.status);
                  return (
                    <div
                      key={b.id}
                      className="p-5 rounded-xl bg-[#161619] border border-[#27272A] space-y-3"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono text-[#D4AF37] font-semibold">{b.booking_code}</span>
                        <span className={`px-2.5 py-0.5 rounded-full border text-[11px] font-medium ${statusInfo.color}`}>
                          {statusInfo.label}
                        </span>
                      </div>

                      <div>
                        <h4 className="text-sm font-bold text-white">{b.preferred_performance}</h4>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-[#A1A1AA] mt-1">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-[#D4AF37]" />
                            <span>{b.event_date}</span>
                          </span>
                          <span>·</span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-[#D4AF37]" />
                            <span>{b.event_location}</span>
                          </span>
                        </div>
                      </div>

                      {b.admin_notes && (
                        <div className="p-3 rounded-lg bg-[#1C1C20] border border-[#2E2E34] text-[11px] text-white">
                          <span className="text-[#D4AF37] font-semibold block mb-0.5">
                            {language === 'am' ? 'የአስተባባሪ ማስታወሻ' : 'Coordinator Update'}:
                          </span>
                          <p>{b.admin_notes}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
