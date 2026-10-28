import React, { useState, useEffect } from 'react';
import { useLanguage } from '../i18n/LanguageContext.tsx';
import { api, authStorage } from '../services/api.ts';
import {
  AdminStats,
  BookingRequest,
  Performance,
  EventItem,
  GalleryItem,
  ContactMessage,
  OrganizationSettings
} from '../types/index.ts';
import {
  ShieldCheck, Lock, Mail, LogOut, CheckCircle2, ShieldAlert,
  Calendar, FileText, Image as ImageIcon, MessageSquare, Settings as SettingsIcon,
  Plus, Edit, Trash2, Eye, RefreshCw, Check, X, Sparkles, Clock, MapPin, Users
} from 'lucide-react';

export const AdminPortal: React.FC = () => {
  const { language, t } = useLanguage();

  // Auth State
  const [token, setToken] = useState<string | null>(authStorage.getToken());
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loginEmail, setLoginEmail] = useState('admin@telos.et');
  const [loginPassword, setLoginPassword] = useState('TelosEthiopia2026!');
  const [loggingIn, setLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Active Tab
  const [activeTab, setActiveTab] = useState<'dashboard' | 'bookings' | 'performances' | 'events' | 'gallery' | 'messages' | 'members' | 'settings'>('dashboard');

  // Data States
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [bookings, setBookings] = useState<BookingRequest[]>([]);
  const [performances, setPerformances] = useState<Performance[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [settings, setSettings] = useState<OrganizationSettings | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Modal / Form States
  const [editingBooking, setEditingBooking] = useState<BookingRequest | null>(null);
  const [editingPerformance, setEditingPerformance] = useState<Partial<Performance> | null>(null);
  const [editingEvent, setEditingEvent] = useState<Partial<EventItem> | null>(null);
  const [newGalleryItem, setNewGalleryItem] = useState({
    title_en: '',
    title_am: '',
    category: 'theatre',
    media_type: 'image',
    media_url: '',
    caption_en: '',
    caption_am: '',
    featured: 0
  });
  const [showAddGallery, setShowAddGallery] = useState(false);

  // Verify auth on mount
  useEffect(() => {
    if (token) {
      api.getMe()
        .then((res) => {
          setCurrentUser(res.user);
          loadDashboardData();
        })
        .catch(() => {
          authStorage.clearToken();
          setToken(null);
        });
    }
  }, [token]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [sData, bData, pData, eData, gData, mData, mems, setts] = await Promise.all([
        api.getAdminStats(),
        api.getAdminBookings(),
        api.getPerformances(),
        api.getEvents(),
        api.getGallery(),
        api.getContactMessages(),
        api.getAdminMembers(),
        api.getOrganization(),
      ]);
      setStats(sData);
      setBookings(bData);
      setPerformances(pData);
      setEvents(eData);
      setGallery(gData);
      setMessages(mData);
      setMembers(mems || []);
      setSettings(setts);
    } catch (err: any) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoggingIn(true);
    setLoginError(null);

    try {
      const res = await api.login({ email: loginEmail, password: loginPassword });
      authStorage.setToken(res.token);
      setToken(res.token);
      setCurrentUser(res.user);
    } catch (err: any) {
      setLoginError(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoggingIn(false);
    }
  };

  const handleLogout = () => {
    authStorage.clearToken();
    setToken(null);
    setCurrentUser(null);
  };

  const showNotification = (msg: string) => {
    setActionSuccess(msg);
    setTimeout(() => setActionSuccess(null), 3000);
  };

  // Booking Update
  const handleUpdateBookingStatus = async (id: string, status: string, notes?: string) => {
    try {
      await api.updateBookingStatus(id, { status, adminNotes: notes });
      setEditingBooking(null);
      showNotification(language === 'am' ? 'የቦታ ማስያዣ ሁኔታ ተዘምኗል' : 'Booking status updated');
      loadDashboardData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Save Performance
  const handleSavePerformance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPerformance) return;

    try {
      await api.savePerformance(editingPerformance, editingPerformance.id);
      setEditingPerformance(null);
      showNotification(language === 'am' ? 'የቴአትር ስራ ተቀምጧል' : 'Performance saved successfully');
      loadDashboardData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeletePerformance = async (id: string) => {
    if (!confirm(t('admin.confirmDelete'))) return;
    try {
      await api.deletePerformance(id);
      showNotification(language === 'am' ? 'የቴአትር ስራ ተሰርዟል' : 'Performance deleted');
      loadDashboardData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Save Event
  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvent) return;

    try {
      await api.saveEvent(editingEvent, editingEvent.id);
      setEditingEvent(null);
      showNotification(language === 'am' ? 'ዝግጅቱ ተቀምጧል' : 'Event saved successfully');
      loadDashboardData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (!confirm(t('admin.confirmDelete'))) return;
    try {
      await api.deleteEvent(id);
      showNotification(language === 'am' ? 'ዝግጅቱ ተሰርዟል' : 'Event deleted');
      loadDashboardData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Save Gallery
  const handleAddGalleryItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGalleryItem.media_url || !newGalleryItem.title_en) return;

    try {
      await api.saveGalleryItem(newGalleryItem);
      setShowAddGallery(false);
      setNewGalleryItem({
        title_en: '',
        title_am: '',
        category: 'theatre',
        media_type: 'image',
        media_url: '',
        caption_en: '',
        caption_am: '',
        featured: 0
      });
      showNotification(language === 'am' ? 'ፎቶ/ቪዲዮ ተጨምሯል' : 'Media item added');
      loadDashboardData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteGallery = async (id: string) => {
    if (!confirm(t('admin.confirmDelete'))) return;
    try {
      await api.deleteGalleryItem(id);
      showNotification(language === 'am' ? 'ተሰርዟል' : 'Item deleted');
      loadDashboardData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Toggle Message read
  const handleToggleMessageRead = async (msg: ContactMessage) => {
    try {
      await api.updateContactMessage(msg.id, { is_read: !msg.is_read });
      loadDashboardData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteMessage = async (id: string) => {
    if (!confirm(t('admin.confirmDelete'))) return;
    try {
      await api.deleteContactMessage(id);
      loadDashboardData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Save Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    try {
      await api.updateOrganization(settings);
      showNotification(language === 'am' ? 'ቅንብሮች ተቀምጠዋል' : 'Settings updated');
    } catch (err: any) {
      alert(err.message);
    }
  };

  // ---------------------------------------------------------------------------
  // LOGIN SCREEN
  // ---------------------------------------------------------------------------
  if (!token) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md p-8 sm:p-10 rounded-2xl bg-[#121214] border border-[#26262B] shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 p-1.5 mx-auto flex items-center justify-center shadow-lg overflow-hidden">
              <img src="/logo.png" alt="Telos Kine Tibeb" className="w-full h-full object-contain" />
            </div>
            <h1 className="text-2xl font-bold font-serif text-white">
              {t('admin.loginTitle')}
            </h1>
            <p className="text-xs text-[#A1A1AA]">
              {t('admin.loginSubtitle')}
            </p>
          </div>

          {loginError && (
            <div className="p-3.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs text-[#A1A1AA] flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>{t('admin.emailLabel')}</span>
              </label>
              <input
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#18181B] border border-[#2D2D32] text-xs text-white placeholder-[#71717A] focus:outline-none focus:border-[#D4AF37]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-[#A1A1AA] flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>{t('admin.passwordLabel')}</span>
              </label>
              <input
                type="password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#18181B] border border-[#2D2D32] text-xs text-white placeholder-[#71717A] focus:outline-none focus:border-[#D4AF37]"
              />
            </div>

            <div className="p-3 rounded-lg bg-[#18181B] border border-[#27272A] text-[11px] text-[#A1A1AA]">
              <span className="text-[#D4AF37] font-semibold block mb-0.5">
                {language === 'am' ? 'የመግቢያ መረጃ (Pre-configured)' : 'Initial Administrator Credentials:'}
              </span>
              <span>admin@telos.et / TelosEthiopia2026!</span>
            </div>

            <button
              type="submit"
              disabled={loggingIn}
              className="w-full py-2.5 rounded-lg bg-[#D4AF37] hover:bg-[#E5C158] text-black font-semibold text-xs transition-colors disabled:opacity-50 cursor-pointer shadow-md shadow-[#D4AF37]/20"
            >
              {loggingIn ? t('admin.loggingIn') : t('admin.loginButton')}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // AUTHENTICATED ADMIN DASHBOARD
  // ---------------------------------------------------------------------------
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Admin Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#121214] border border-[#242428]">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 p-1 flex items-center justify-center overflow-hidden">
            <img src="/logo.png" alt="Telos Kine Tibeb" className="w-full h-full object-contain" />
          </div>
          <div>
            <h1 className="text-lg font-bold font-serif text-white">
              {t('admin.portalTitle')}
            </h1>
            <p className="text-xs text-[#A1A1AA]">
              {language === 'am' ? 'እንኳን ደህና መጡ' : 'Signed in as'} <span className="text-[#D4AF37] font-medium">{currentUser?.name || currentUser?.email}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadDashboardData}
            className="p-2 rounded-lg bg-[#18181B] border border-[#2D2D32] text-[#A1A1AA] hover:text-white transition-colors"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#D4AF37]' : ''}`} />
          </button>
          <button
            onClick={handleLogout}
            className="px-3.5 py-1.5 rounded-lg border border-[#3F3F46] hover:bg-[#1E1E22] text-xs font-semibold text-white transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5 text-rose-400" />
            <span>{t('admin.logout')}</span>
          </button>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[#222226] pb-4">
        {[
          { id: 'dashboard', label: t('admin.dashboard'), icon: FileText },
          { id: 'bookings', label: `${t('admin.bookings')} (${bookings.length})`, icon: Calendar },
          { id: 'performances', label: `${t('admin.performances')} (${performances.length})`, icon: Sparkles },
          { id: 'events', label: `${t('admin.events')} (${events.length})`, icon: Clock },
          { id: 'gallery', label: `${t('admin.gallery')} (${gallery.length})`, icon: ImageIcon },
          { id: 'messages', label: `${t('admin.messages')} (${messages.filter(m => !m.is_read).length})`, icon: MessageSquare },
          { id: 'members', label: `${language === 'am' ? 'አባላት (Fayda)' : 'Members (Fayda)'} (${members.length})`, icon: Users },
          { id: 'settings', label: t('admin.settings'), icon: SettingsIcon },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 cursor-pointer ${
                isActive
                  ? 'bg-[#D4AF37] text-black shadow-sm'
                  : 'text-[#A1A1AA] hover:text-white hover:bg-[#18181B]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ===================================================================== */}
      {/* TAB 1: DASHBOARD OVERVIEW */}
      {/* ===================================================================== */}
      {activeTab === 'dashboard' && stats && (
        <div className="space-y-8">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-4">
            <div className="p-5 rounded-xl bg-[#121214] border border-[#242428] space-y-1">
              <span className="text-[11px] text-[#A1A1AA] uppercase tracking-wider">{t('admin.kpiTotalBookings')}</span>
              <div className="text-2xl font-bold font-serif text-white tabular-nums">{stats.totalBookings}</div>
            </div>
            <div className="p-5 rounded-xl bg-[#121214] border border-[#242428] space-y-1">
              <span className="text-[11px] text-amber-400 uppercase tracking-wider">{t('admin.kpiNewBookings')}</span>
              <div className="text-2xl font-bold font-serif text-amber-400 tabular-nums">{stats.newBookings}</div>
            </div>
            <div className="p-5 rounded-xl bg-[#121214] border border-[#242428] space-y-1">
              <span className="text-[11px] text-[#D4AF37] uppercase tracking-wider">{t('admin.kpiPerformances')}</span>
              <div className="text-2xl font-bold font-serif text-[#D4AF37] tabular-nums">{stats.totalPerformances}</div>
            </div>
            <div className="p-5 rounded-xl bg-[#121214] border border-[#242428] space-y-1">
              <span className="text-[11px] text-[#A1A1AA] uppercase tracking-wider">{t('admin.kpiEvents')}</span>
              <div className="text-2xl font-bold font-serif text-white tabular-nums">{stats.totalEvents}</div>
            </div>
            <div className="p-5 rounded-xl bg-[#121214] border border-[#242428] space-y-1">
              <span className="text-[11px] text-blue-400 uppercase tracking-wider">{t('admin.kpiUnreadMessages')}</span>
              <div className="text-2xl font-bold font-serif text-blue-400 tabular-nums">{stats.unreadMessages}</div>
            </div>
            <div className="p-5 rounded-xl bg-[#121214] border border-[#242428] space-y-1">
              <span className="text-[11px] text-[#A1A1AA] uppercase tracking-wider">{t('admin.kpiSubscribers')}</span>
              <div className="text-2xl font-bold font-serif text-white tabular-nums">{stats.totalSubscribers}</div>
            </div>
            <div className="p-5 rounded-xl bg-[#121214] border border-[#242428] space-y-1">
              <span className="text-[11px] text-emerald-400 uppercase tracking-wider">{language === 'am' ? 'አባላት' : 'Members'}</span>
              <div className="text-2xl font-bold font-serif text-emerald-400 tabular-nums">{stats.totalMembers ?? members.length}</div>
            </div>
          </div>

          {/* Recent Inquiries List */}
          <div className="p-6 rounded-2xl bg-[#121214] border border-[#242428] space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold font-serif text-white">
                {language === 'am' ? 'የቅርብ ጊዜ ቦታ ማስያዣዎች' : 'Recent Booking Inquiries'}
              </h3>
              <button
                onClick={() => setActiveTab('bookings')}
                className="text-xs text-[#D4AF37] hover:underline"
              >
                {language === 'am' ? 'ሁሉንም ተመልከት' : 'View All'}
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="text-[#71717A] border-b border-[#222226]">
                  <tr>
                    <th className="py-2.5 font-medium">Code</th>
                    <th className="py-2.5 font-medium">Client</th>
                    <th className="py-2.5 font-medium">Event Date</th>
                    <th className="py-2.5 font-medium">Performance</th>
                    <th className="py-2.5 font-medium">Status</th>
                    <th className="py-2.5 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1C1C20] text-[#D4D4D8]">
                  {bookings.slice(0, 5).map((b) => (
                    <tr key={b.id} className="hover:bg-[#18181B]">
                      <td className="py-3 font-mono text-[#D4AF37]">{b.booking_code}</td>
                      <td className="py-3 font-medium text-white">{b.full_name}</td>
                      <td className="py-3">{b.event_date}</td>
                      <td className="py-3">{b.preferred_performance}</td>
                      <td className="py-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-[#27272A] text-white">
                          {b.status}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => {
                            setEditingBooking(b);
                            setActiveTab('bookings');
                          }}
                          className="px-2.5 py-1 rounded bg-[#27272A] hover:bg-[#D4AF37] text-white hover:text-black transition-colors"
                        >
                          Manage
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 2: BOOKINGS MANAGEMENT */}
      {/* ===================================================================== */}
      {activeTab === 'bookings' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold font-serif text-white">
              {t('admin.bookings')}
            </h2>
          </div>

          <div className="overflow-x-auto rounded-2xl bg-[#121214] border border-[#242428]">
            <table className="w-full text-xs text-left">
              <thead className="text-[#71717A] bg-[#18181B] border-b border-[#222226]">
                <tr>
                  <th className="p-3.5 font-medium">Code</th>
                  <th className="p-3.5 font-medium">Client / Org</th>
                  <th className="p-3.5 font-medium">Phone & Email</th>
                  <th className="p-3.5 font-medium">Event Date & Location</th>
                  <th className="p-3.5 font-medium">Status</th>
                  <th className="p-3.5 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1C1C20] text-[#D4D4D8]">
                {bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-[#161618]">
                    <td className="p-3.5 font-mono text-[#D4AF37] font-semibold">{b.booking_code}</td>
                    <td className="p-3.5">
                      <div className="font-semibold text-white">{b.full_name}</div>
                      {b.organization && <div className="text-[11px] text-[#A1A1AA]">{b.organization}</div>}
                    </td>
                    <td className="p-3.5 text-[11px]">
                      <div>{b.phone}</div>
                      <div className="text-[#71717A]">{b.email}</div>
                    </td>
                    <td className="p-3.5">
                      <div className="font-medium text-white">{b.event_date}</div>
                      <div className="text-[11px] text-[#A1A1AA]">{b.event_location}</div>
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-[#242428] text-white">
                        {b.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => setEditingBooking(b)}
                        className="px-3 py-1.5 rounded-lg bg-[#242428] hover:bg-[#D4AF37] text-white hover:text-black font-semibold transition-colors"
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Booking Edit Modal */}
          {editingBooking && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
              <div className="relative w-full max-w-2xl bg-[#121214] border border-[#2F2F36] rounded-2xl p-6 sm:p-8 space-y-6">
                <div className="flex items-center justify-between border-b border-[#222226] pb-4">
                  <div>
                    <span className="text-xs font-mono text-[#D4AF37]">{editingBooking.booking_code}</span>
                    <h3 className="text-lg font-bold font-serif text-white">
                      {editingBooking.full_name}
                    </h3>
                  </div>
                  <button onClick={() => setEditingBooking(null)} className="p-2 text-[#71717A] hover:text-white">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-[#71717A] block">Email:</span>
                    <span className="text-white font-medium">{editingBooking.email}</span>
                  </div>
                  <div>
                    <span className="text-[#71717A] block">Phone:</span>
                    <span className="text-white font-medium">{editingBooking.phone}</span>
                  </div>
                  <div>
                    <span className="text-[#71717A] block">Event Date:</span>
                    <span className="text-white font-medium">{editingBooking.event_date}</span>
                  </div>
                  <div>
                    <span className="text-[#71717A] block">Audience:</span>
                    <span className="text-white font-medium">{editingBooking.audience_size}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-[#71717A] block">Venue & City:</span>
                    <span className="text-white font-medium">{editingBooking.event_location}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-[#71717A] block">Preferred Performance:</span>
                    <span className="text-white font-medium">{editingBooking.preferred_performance}</span>
                  </div>
                  {editingBooking.additional_requirements && (
                    <div className="col-span-2 p-3 rounded-lg bg-[#18181B] border border-[#26262B]">
                      <span className="text-[#71717A] block mb-1">Client Notes:</span>
                      <p className="text-white leading-relaxed">{editingBooking.additional_requirements}</p>
                    </div>
                  )}
                </div>

                {/* Status Switcher & Admin Notes */}
                <div className="space-y-4 pt-4 border-t border-[#222226]">
                  <div className="space-y-1.5">
                    <label className="text-xs text-[#A1A1AA]">Update Status:</label>
                    <select
                      value={editingBooking.status}
                      onChange={(e) => setEditingBooking({ ...editingBooking, status: e.target.value as any })}
                      className="w-full px-3.5 py-2.5 rounded-lg bg-[#18181B] border border-[#2D2D32] text-xs text-white"
                    >
                      <option value="new">New (Pending)</option>
                      <option value="under_review">Under Review</option>
                      <option value="approved">Approved & Confirmed</option>
                      <option value="rejected">Rejected / Declined</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs text-[#A1A1AA]">Internal Admin Notes:</label>
                    <textarea
                      rows={3}
                      value={editingBooking.admin_notes || ''}
                      onChange={(e) => setEditingBooking({ ...editingBooking, admin_notes: e.target.value })}
                      placeholder="Add negotiation notes, quotes, or rehearsal requirements..."
                      className="w-full px-3.5 py-2.5 rounded-lg bg-[#18181B] border border-[#2D2D32] text-xs text-white"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    onClick={() => setEditingBooking(null)}
                    className="px-4 py-2 rounded-lg border border-[#3F3F46] text-xs text-white"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleUpdateBookingStatus(editingBooking.id, editingBooking.status, editingBooking.admin_notes)}
                    className="px-5 py-2 rounded-lg bg-[#D4AF37] hover:bg-[#E5C158] text-black font-semibold text-xs"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 3: PERFORMANCES CRUD */}
      {/* ===================================================================== */}
      {activeTab === 'performances' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold font-serif text-white">
              {t('admin.performances')}
            </h2>
            <button
              onClick={() =>
                setEditingPerformance({
                  title_en: '',
                  title_am: '',
                  genre_en: 'Historical Drama',
                  genre_am: 'ታሪካዊ ድራማ',
                  description_en: '',
                  description_am: '',
                  synopsis_en: '',
                  synopsis_am: '',
                  director_en: '',
                  director_am: '',
                  playwright_en: '',
                  playwright_am: '',
                  cast_list_en: '',
                  cast_list_am: '',
                  duration_minutes: 90,
                  poster_url: '/src/assets/images/hero_ethiopian_theatre_1793100134111.jpg',
                  status: 'current',
                  featured: 1,
                })
              }
              className="px-4 py-2 rounded-lg bg-[#D4AF37] hover:bg-[#E5C158] text-black text-xs font-semibold flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Production</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {performances.map((perf) => (
              <div
                key={perf.id}
                className="p-5 rounded-xl bg-[#121214] border border-[#242428] space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="aspect-[16/10] rounded-lg overflow-hidden bg-[#18181B]">
                    <img src={perf.poster_url} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold text-[#D4AF37] uppercase">{perf.genre_en}</span>
                    <h3 className="text-base font-bold text-white">{perf.title_en}</h3>
                    <p className="text-xs font-serif text-[#A1A1AA]">{perf.title_am}</p>
                  </div>
                  <p className="text-xs text-[#71717A] line-clamp-2">{perf.description_en}</p>
                </div>

                <div className="pt-3 border-t border-[#1C1C20] flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-stone-400">{perf.status}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEditingPerformance(perf)}
                      className="p-1.5 rounded bg-[#242428] hover:bg-[#D4AF37] text-white hover:text-black transition-colors"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeletePerformance(perf.id)}
                      className="p-1.5 rounded bg-[#242428] hover:bg-rose-500 text-white transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Edit Performance Modal */}
          {editingPerformance && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
              <form
                onSubmit={handleSavePerformance}
                className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-[#121214] border border-[#2F2F36] rounded-2xl p-6 sm:p-8 space-y-5"
              >
                <div className="flex items-center justify-between border-b border-[#222226] pb-3">
                  <h3 className="text-lg font-bold font-serif text-white">
                    {editingPerformance.id ? 'Edit Theatre Production' : 'Create Theatre Production'}
                  </h3>
                  <button type="button" onClick={() => setEditingPerformance(null)} className="p-2 text-[#71717A]">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs text-[#A1A1AA]">Title (English) *</label>
                    <input
                      type="text"
                      required
                      value={editingPerformance.title_en || ''}
                      onChange={(e) => setEditingPerformance({ ...editingPerformance, title_en: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-[#18181B] border border-[#2D2D32] text-xs text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-[#A1A1AA]">Title (አማርኛ) *</label>
                    <input
                      type="text"
                      required
                      value={editingPerformance.title_am || ''}
                      onChange={(e) => setEditingPerformance({ ...editingPerformance, title_am: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-[#18181B] border border-[#2D2D32] text-xs text-white font-amharic"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-[#A1A1AA]">Genre (English)</label>
                    <input
                      type="text"
                      required
                      value={editingPerformance.genre_en || ''}
                      onChange={(e) => setEditingPerformance({ ...editingPerformance, genre_en: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-[#18181B] border border-[#2D2D32] text-xs text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-[#A1A1AA]">Genre (አማርኛ)</label>
                    <input
                      type="text"
                      required
                      value={editingPerformance.genre_am || ''}
                      onChange={(e) => setEditingPerformance({ ...editingPerformance, genre_am: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-[#18181B] border border-[#2D2D32] text-xs text-white font-amharic"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-[#A1A1AA]">Director (English)</label>
                    <input
                      type="text"
                      required
                      value={editingPerformance.director_en || ''}
                      onChange={(e) => setEditingPerformance({ ...editingPerformance, director_en: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-[#18181B] border border-[#2D2D32] text-xs text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-[#A1A1AA]">Director (አማርኛ)</label>
                    <input
                      type="text"
                      required
                      value={editingPerformance.director_am || ''}
                      onChange={(e) => setEditingPerformance({ ...editingPerformance, director_am: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-[#18181B] border border-[#2D2D32] text-xs text-white font-amharic"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-[#A1A1AA]">Duration (Minutes)</label>
                    <input
                      type="number"
                      value={editingPerformance.duration_minutes || 90}
                      onChange={(e) => setEditingPerformance({ ...editingPerformance, duration_minutes: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-lg bg-[#18181B] border border-[#2D2D32] text-xs text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-[#A1A1AA]">Status</label>
                    <select
                      value={editingPerformance.status || 'current'}
                      onChange={(e) => setEditingPerformance({ ...editingPerformance, status: e.target.value as any })}
                      className="w-full px-3 py-2 rounded-lg bg-[#18181B] border border-[#2D2D32] text-xs text-white"
                    >
                      <option value="current">Current Season</option>
                      <option value="upcoming">Upcoming Work</option>
                      <option value="repertoire">Repertoire</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-xs text-[#A1A1AA]">Poster Image Path / URL</label>
                    <input
                      type="text"
                      required
                      value={editingPerformance.poster_url || ''}
                      onChange={(e) => setEditingPerformance({ ...editingPerformance, poster_url: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-[#18181B] border border-[#2D2D32] text-xs text-white"
                    />
                  </div>

                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-xs text-[#A1A1AA]">Synopsis (English)</label>
                    <textarea
                      rows={3}
                      required
                      value={editingPerformance.synopsis_en || ''}
                      onChange={(e) => setEditingPerformance({ ...editingPerformance, synopsis_en: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-[#18181B] border border-[#2D2D32] text-xs text-white"
                    />
                  </div>

                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-xs text-[#A1A1AA]">Synopsis (አማርኛ)</label>
                    <textarea
                      rows={3}
                      required
                      value={editingPerformance.synopsis_am || ''}
                      onChange={(e) => setEditingPerformance({ ...editingPerformance, synopsis_am: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-[#18181B] border border-[#2D2D32] text-xs text-white font-amharic"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-[#222226]">
                  <button type="button" onClick={() => setEditingPerformance(null)} className="px-4 py-2 rounded-lg border border-[#3F3F46] text-xs text-white">
                    Cancel
                  </button>
                  <button type="submit" className="px-5 py-2 rounded-lg bg-[#D4AF37] hover:bg-[#E5C158] text-black font-semibold text-xs">
                    Save Record
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 4: EVENTS CRUD */}
      {/* ===================================================================== */}
      {activeTab === 'events' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold font-serif text-white">
              {t('admin.events')}
            </h2>
            <button
              onClick={() =>
                setEditingEvent({
                  title_en: '',
                  title_am: '',
                  category_en: 'Cultural Showcase',
                  category_am: 'የባህል ትርኢት',
                  description_en: '',
                  description_am: '',
                  event_date: new Date().toISOString().split('T')[0],
                  event_time: '6:30 PM',
                  venue_en: 'Ethiopian National Theatre',
                  venue_am: 'የኢትዮጵያ ብሔራዊ ቴአትር',
                  city_en: 'Addis Ababa',
                  city_am: 'አዲስ አበባ',
                  ticket_info_en: '1,000 ETB',
                  ticket_info_am: '1,000 ብር',
                  poster_url: '/src/assets/images/hero_ethiopian_theatre_1793100134111.jpg',
                  status: 'upcoming',
                })
              }
              className="px-4 py-2 rounded-lg bg-[#D4AF37] hover:bg-[#E5C158] text-black text-xs font-semibold flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Event</span>
            </button>
          </div>

          <div className="overflow-x-auto rounded-2xl bg-[#121214] border border-[#242428]">
            <table className="w-full text-xs text-left">
              <thead className="text-[#71717A] bg-[#18181B] border-b border-[#222226]">
                <tr>
                  <th className="p-3.5 font-medium">Title</th>
                  <th className="p-3.5 font-medium">Date & Time</th>
                  <th className="p-3.5 font-medium">Venue</th>
                  <th className="p-3.5 font-medium">Status</th>
                  <th className="p-3.5 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1C1C20] text-[#D4D4D8]">
                {events.map((ev) => (
                  <tr key={ev.id} className="hover:bg-[#161618]">
                    <td className="p-3.5">
                      <div className="font-semibold text-white">{ev.title_en}</div>
                      <div className="text-[11px] text-[#A1A1AA]">{ev.title_am}</div>
                    </td>
                    <td className="p-3.5">
                      <div>{ev.event_date}</div>
                      <div className="text-[11px] text-[#71717A]">{ev.event_time}</div>
                    </td>
                    <td className="p-3.5">
                      <div>{ev.venue_en}</div>
                      <div className="text-[11px] text-[#71717A]">{ev.city_en}</div>
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-[#242428] text-white">
                        {ev.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setEditingEvent(ev)}
                          className="p-1.5 rounded bg-[#242428] hover:bg-[#D4AF37] text-white hover:text-black transition-colors"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteEvent(ev.id)}
                          className="p-1.5 rounded bg-[#242428] hover:bg-rose-500 text-white transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Edit Event Modal */}
          {editingEvent && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
              <form
                onSubmit={handleSaveEvent}
                className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-[#121214] border border-[#2F2F36] rounded-2xl p-6 sm:p-8 space-y-4"
              >
                <div className="flex items-center justify-between border-b border-[#222226] pb-3">
                  <h3 className="text-lg font-bold font-serif text-white">
                    {editingEvent.id ? 'Edit Event' : 'Create Event'}
                  </h3>
                  <button type="button" onClick={() => setEditingEvent(null)} className="p-2 text-[#71717A]">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs text-[#A1A1AA]">Event Title (EN) *</label>
                    <input
                      type="text"
                      required
                      value={editingEvent.title_en || ''}
                      onChange={(e) => setEditingEvent({ ...editingEvent, title_en: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-[#18181B] border border-[#2D2D32] text-xs text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-[#A1A1AA]">Event Title (አማርኛ) *</label>
                    <input
                      type="text"
                      required
                      value={editingEvent.title_am || ''}
                      onChange={(e) => setEditingEvent({ ...editingEvent, title_am: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-[#18181B] border border-[#2D2D32] text-xs text-white font-amharic"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-[#A1A1AA]">Event Date (YYYY-MM-DD)</label>
                    <input
                      type="date"
                      required
                      value={editingEvent.event_date || ''}
                      onChange={(e) => setEditingEvent({ ...editingEvent, event_date: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-[#18181B] border border-[#2D2D32] text-xs text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-[#A1A1AA]">Time</label>
                    <input
                      type="text"
                      required
                      value={editingEvent.event_time || ''}
                      onChange={(e) => setEditingEvent({ ...editingEvent, event_time: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-[#18181B] border border-[#2D2D32] text-xs text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-[#A1A1AA]">Venue (English)</label>
                    <input
                      type="text"
                      required
                      value={editingEvent.venue_en || ''}
                      onChange={(e) => setEditingEvent({ ...editingEvent, venue_en: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-[#18181B] border border-[#2D2D32] text-xs text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-[#A1A1AA]">Venue (አማርኛ)</label>
                    <input
                      type="text"
                      required
                      value={editingEvent.venue_am || ''}
                      onChange={(e) => setEditingEvent({ ...editingEvent, venue_am: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-[#18181B] border border-[#2D2D32] text-xs text-white font-amharic"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-[#A1A1AA]">Ticket Info (e.g. 800 ETB)</label>
                    <input
                      type="text"
                      value={editingEvent.ticket_info_en || ''}
                      onChange={(e) => setEditingEvent({ ...editingEvent, ticket_info_en: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-[#18181B] border border-[#2D2D32] text-xs text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-[#A1A1AA]">Status</label>
                    <select
                      value={editingEvent.status || 'upcoming'}
                      onChange={(e) => setEditingEvent({ ...editingEvent, status: e.target.value as any })}
                      className="w-full px-3 py-2 rounded-lg bg-[#18181B] border border-[#2D2D32] text-xs text-white"
                    >
                      <option value="upcoming">Upcoming</option>
                      <option value="completed">Completed</option>
                      <option value="sold_out">Sold Out</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-xs text-[#A1A1AA]">Poster URL</label>
                    <input
                      type="text"
                      required
                      value={editingEvent.poster_url || ''}
                      onChange={(e) => setEditingEvent({ ...editingEvent, poster_url: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-[#18181B] border border-[#2D2D32] text-xs text-white"
                    />
                  </div>

                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-xs text-[#A1A1AA]">Description (EN)</label>
                    <textarea
                      rows={2}
                      required
                      value={editingEvent.description_en || ''}
                      onChange={(e) => setEditingEvent({ ...editingEvent, description_en: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-[#18181B] border border-[#2D2D32] text-xs text-white"
                    />
                  </div>
                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-xs text-[#A1A1AA]">Description (አማርኛ)</label>
                    <textarea
                      rows={2}
                      required
                      value={editingEvent.description_am || ''}
                      onChange={(e) => setEditingEvent({ ...editingEvent, description_am: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-[#18181B] border border-[#2D2D32] text-xs text-white font-amharic"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-[#222226]">
                  <button type="button" onClick={() => setEditingEvent(null)} className="px-4 py-2 rounded-lg border border-[#3F3F46] text-xs text-white">
                    Cancel
                  </button>
                  <button type="submit" className="px-5 py-2 rounded-lg bg-[#D4AF37] hover:bg-[#E5C158] text-black font-semibold text-xs">
                    Save Event
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 5: GALLERY MANAGEMENT */}
      {/* ===================================================================== */}
      {activeTab === 'gallery' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold font-serif text-white">
              {t('admin.gallery')}
            </h2>
            <button
              onClick={() => setShowAddGallery(true)}
              className="px-4 py-2 rounded-lg bg-[#D4AF37] hover:bg-[#E5C158] text-black text-xs font-semibold flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Media Photo</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {gallery.map((g) => (
              <div key={g.id} className="group relative rounded-xl overflow-hidden bg-[#18181B] border border-[#26262B]">
                <img src={g.media_url} alt="" className="w-full aspect-[4/3] object-cover" />
                <div className="p-3 bg-[#121214]">
                  <span className="text-[10px] text-[#D4AF37] uppercase font-semibold">{g.category}</span>
                  <p className="text-xs text-white truncate font-medium">{g.title_en}</p>
                </div>
                <button
                  onClick={() => handleDeleteGallery(g.id)}
                  className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/70 hover:bg-rose-600 text-white transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          {/* Add Gallery Item Modal */}
          {showAddGallery && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
              <form
                onSubmit={handleAddGalleryItem}
                className="relative w-full max-w-lg bg-[#121214] border border-[#2F2F36] rounded-2xl p-6 space-y-4"
              >
                <div className="flex items-center justify-between border-b border-[#222226] pb-3">
                  <h3 className="text-base font-bold font-serif text-white">Add Photo to Gallery</h3>
                  <button type="button" onClick={() => setShowAddGallery(false)} className="text-[#71717A]">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="text-[#A1A1AA] block mb-1">Title (English) *</label>
                    <input
                      type="text"
                      required
                      value={newGalleryItem.title_en}
                      onChange={(e) => setNewGalleryItem({ ...newGalleryItem, title_en: e.target.value })}
                      className="w-full px-3 py-2 bg-[#18181B] border border-[#2D2D32] rounded-lg text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[#A1A1AA] block mb-1">Title (አማርኛ)</label>
                    <input
                      type="text"
                      value={newGalleryItem.title_am}
                      onChange={(e) => setNewGalleryItem({ ...newGalleryItem, title_am: e.target.value })}
                      className="w-full px-3 py-2 bg-[#18181B] border border-[#2D2D32] rounded-lg text-white font-amharic"
                    />
                  </div>
                  <div>
                    <label className="text-[#A1A1AA] block mb-1">Category</label>
                    <select
                      value={newGalleryItem.category}
                      onChange={(e) => setNewGalleryItem({ ...newGalleryItem, category: e.target.value as any })}
                      className="w-full px-3 py-2 bg-[#18181B] border border-[#2D2D32] rounded-lg text-white"
                    >
                      <option value="theatre">Theatre Productions</option>
                      <option value="dance">Traditional Dance</option>
                      <option value="rehearsal">Rehearsals & Backstage</option>
                      <option value="events">Event Highlights</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[#A1A1AA] block mb-1">Image URL / Path *</label>
                    <input
                      type="text"
                      required
                      value={newGalleryItem.media_url}
                      onChange={(e) => setNewGalleryItem({ ...newGalleryItem, media_url: e.target.value })}
                      placeholder="/src/assets/images/... or web URL"
                      className="w-full px-3 py-2 bg-[#18181B] border border-[#2D2D32] rounded-lg text-white"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-[#222226]">
                  <button type="button" onClick={() => setShowAddGallery(false)} className="px-4 py-2 rounded-lg border border-[#3F3F46] text-xs text-white">
                    Cancel
                  </button>
                  <button type="submit" className="px-5 py-2 rounded-lg bg-[#D4AF37] hover:bg-[#E5C158] text-black font-semibold text-xs">
                    Save to Gallery
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 6: CONTACT INQUIRIES */}
      {/* ===================================================================== */}
      {activeTab === 'messages' && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold font-serif text-white">
            {t('admin.messages')}
          </h2>

          <div className="space-y-4">
            {messages.length === 0 ? (
              <div className="py-12 text-center text-xs text-[#71717A]">No messages received yet.</div>
            ) : (
              messages.map((m) => (
                <div
                  key={m.id}
                  className={`p-5 rounded-xl border transition-colors ${
                    m.is_read ? 'bg-[#121214] border-[#222226]' : 'bg-[#18181B] border-[#D4AF37]/40'
                  } space-y-3`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white">{m.full_name}</span>
                      <span className="text-[#71717A]">({m.email})</span>
                      {m.phone && <span className="text-[#71717A]">· {m.phone}</span>}
                    </div>
                    <span className="text-[#71717A]">{new Date(m.created_at).toLocaleString()}</span>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-[#D4AF37]">{m.subject}</h4>
                    <p className="text-xs text-[#D4D4D8] mt-1 leading-relaxed">{m.message}</p>
                  </div>

                  <div className="pt-2 border-t border-[#1C1C20] flex items-center justify-between text-xs">
                    <button
                      onClick={() => handleToggleMessageRead(m)}
                      className="text-[#A1A1AA] hover:text-white flex items-center gap-1.5 cursor-pointer"
                    >
                      {m.is_read ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Mark Unread</span>
                        </>
                      ) : (
                        <>
                          <Eye className="w-3.5 h-3.5 text-[#D4AF37]" />
                          <span>Mark Read</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleDeleteMessage(m.id)}
                      className="text-rose-400 hover:text-rose-300"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 7: REGISTERED MEMBERS (FAYDA IDENTIFIED) */}
      {/* ===================================================================== */}
      {activeTab === 'members' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold font-serif text-white">
                {language === 'am' ? 'የተመዘገቡ የባህል አባላት (Fayda)' : 'Registered Cultural Members'}
              </h2>
              <p className="text-xs text-[#A1A1AA] mt-0.5">
                {language === 'am'
                  ? 'በፋይዳ (ብሔራዊ መታወቂያ)፣ በስልክ ቁጥርና በኢሜይል የተመዘገቡ የቴሎስ ማህበር አባላት'
                  : 'Official guild members registered with Ethiopian Fayda National IDs'}
              </p>
            </div>

            <div className="p-2.5 rounded-xl bg-[#161619] border border-[#27272A] flex items-center gap-2 text-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="text-[#D4AF37] font-semibold tabular-nums">{members.length}</span>
              <span className="text-[#A1A1AA]">{language === 'am' ? 'የተረጋገጡ አባላት' : 'Verified Members'}</span>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl bg-[#121214] border border-[#242428]">
            <table className="w-full text-xs text-left">
              <thead className="text-[#71717A] bg-[#18181B] border-b border-[#222226]">
                <tr>
                  <th className="p-3.5 font-medium">Code & Name</th>
                  <th className="p-3.5 font-medium">Fayda National ID</th>
                  <th className="p-3.5 font-medium">Phone & Email</th>
                  <th className="p-3.5 font-medium">City</th>
                  <th className="p-3.5 font-medium">Interest</th>
                  <th className="p-3.5 font-medium text-right">Registered</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1C1C20] text-[#D4D4D8]">
                {members.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-[#71717A]">
                      No registered members yet.
                    </td>
                  </tr>
                ) : (
                  members.map((m) => (
                    <tr key={m.id} className="hover:bg-[#161618]">
                      <td className="p-3.5">
                        <div className="font-semibold text-white">{m.full_name}</div>
                        <div className="font-mono text-[11px] text-[#D4AF37]">{m.membership_code}</div>
                      </td>
                      <td className="p-3.5">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-[11px]">
                          <ShieldCheck className="w-3 h-3" />
                          <span>{m.fayda_id}</span>
                        </span>
                      </td>
                      <td className="p-3.5">
                        <div>{m.phone}</div>
                        <div className="text-[11px] text-[#71717A]">{m.email}</div>
                      </td>
                      <td className="p-3.5 text-[#A1A1AA]">
                        {m.city || 'Addis Ababa'}
                      </td>
                      <td className="p-3.5">
                        <span className="capitalize px-2 py-0.5 rounded bg-[#242428] text-white text-[10px]">
                          {m.preferred_interest || 'both'}
                        </span>
                      </td>
                      <td className="p-3.5 text-right text-[11px] text-[#71717A]">
                        {new Date(m.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 8: ORGANIZATION SETTINGS */}
      {/* ===================================================================== */}
      {activeTab === 'settings' && settings && (
        <form onSubmit={handleSaveSettings} className="p-6 sm:p-8 rounded-2xl bg-[#121214] border border-[#242428] space-y-6">
          <div className="flex items-center justify-between border-b border-[#222226] pb-4">
            <div>
              <h2 className="text-xl font-bold font-serif text-white">
                {t('admin.settings')}
              </h2>
              <p className="text-xs text-[#A1A1AA]">{t('admin.bilingualNotice')}</p>
            </div>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-lg bg-[#D4AF37] hover:bg-[#E5C158] text-black font-semibold text-xs"
            >
              {t('admin.save')}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <label className="text-[#A1A1AA]">Organization Name (EN)</label>
              <input
                type="text"
                value={settings.org_name_en}
                onChange={(e) => setSettings({ ...settings, org_name_en: e.target.value })}
                className="w-full px-3 py-2 bg-[#18181B] border border-[#2D2D32] rounded-lg text-white"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[#A1A1AA]">Organization Name (አማርኛ)</label>
              <input
                type="text"
                value={settings.org_name_am}
                onChange={(e) => setSettings({ ...settings, org_name_am: e.target.value })}
                className="w-full px-3 py-2 bg-[#18181B] border border-[#2D2D32] rounded-lg text-white font-amharic"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[#A1A1AA]">Phone Number</label>
              <input
                type="text"
                value={settings.phone}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                className="w-full px-3 py-2 bg-[#18181B] border border-[#2D2D32] rounded-lg text-white"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[#A1A1AA]">Email Address</label>
              <input
                type="email"
                value={settings.email}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                className="w-full px-3 py-2 bg-[#18181B] border border-[#2D2D32] rounded-lg text-white"
              />
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label className="text-[#A1A1AA]">Booking Inquiry Email</label>
              <input
                type="email"
                value={settings.booking_email}
                onChange={(e) => setSettings({ ...settings, booking_email: e.target.value })}
                className="w-full px-3 py-2 bg-[#18181B] border border-[#2D2D32] rounded-lg text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[#A1A1AA]">Physical Address (EN)</label>
              <input
                type="text"
                value={settings.address_en}
                onChange={(e) => setSettings({ ...settings, address_en: e.target.value })}
                className="w-full px-3 py-2 bg-[#18181B] border border-[#2D2D32] rounded-lg text-white"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[#A1A1AA]">Physical Address (አማርኛ)</label>
              <input
                type="text"
                value={settings.address_am}
                onChange={(e) => setSettings({ ...settings, address_am: e.target.value })}
                className="w-full px-3 py-2 bg-[#18181B] border border-[#2D2D32] rounded-lg text-white font-amharic"
              />
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label className="text-[#A1A1AA]">Main Headline (English)</label>
              <input
                type="text"
                value={settings.headline_en}
                onChange={(e) => setSettings({ ...settings, headline_en: e.target.value })}
                className="w-full px-3 py-2 bg-[#18181B] border border-[#2D2D32] rounded-lg text-white"
              />
            </div>
            <div className="space-y-1 sm:col-span-2">
              <label className="text-[#A1A1AA]">Main Headline (አማርኛ)</label>
              <input
                type="text"
                value={settings.headline_am}
                onChange={(e) => setSettings({ ...settings, headline_am: e.target.value })}
                className="w-full px-3 py-2 bg-[#18181B] border border-[#2D2D32] rounded-lg text-white font-amharic"
              />
            </div>
          </div>
        </form>
      )}
    </div>
  );
};
