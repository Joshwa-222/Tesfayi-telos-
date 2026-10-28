import React, { useState, useEffect } from 'react';
import { useLanguage } from '../i18n/LanguageContext.tsx';
import { api } from '../services/api.ts';
import { EventItem } from '../types/index.ts';
import { Calendar, Clock, MapPin, Tag, ExternalLink, Ticket } from 'lucide-react';

export const EventsPage: React.FC = () => {
  const { language, t } = useLanguage();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'completed'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEvents() {
      try {
        setLoading(true);
        const data = await api.getEvents(filter === 'all' ? undefined : filter);
        setEvents(data);
      } catch (err) {
        console.error('Failed to load events:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchEvents();
  }, [filter]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'upcoming':
        return { label: t('events.statusUpcoming'), color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' };
      case 'sold_out':
        return { label: t('events.statusSoldOut'), color: 'text-rose-400 bg-rose-400/10 border-rose-400/20' };
      case 'completed':
        return { label: t('events.statusCompleted'), color: 'text-stone-400 bg-stone-400/10 border-stone-400/20' };
      default:
        return { label: status, color: 'text-stone-400 bg-stone-400/10 border-stone-400/20' };
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-semibold text-[#D4AF37] uppercase tracking-widest">
          {language === 'am' ? 'የቀጥታ መድረክ' : 'Live Calendar & Galas'}
        </span>
        <h1 className="text-3xl sm:text-5xl font-bold font-serif text-white tracking-tight">
          {t('events.title')}
        </h1>
        <p className="text-sm sm:text-base text-[#A1A1AA] leading-relaxed">
          {t('events.subtitle')}
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-center">
        <div className="inline-flex p-1 bg-[#121214] border border-[#242428] rounded-xl">
          {(['all', 'upcoming', 'completed'] as const).map((key) => {
            const labels = {
              all: t('events.filterAll'),
              upcoming: t('events.filterUpcoming'),
              completed: t('events.filterCompleted'),
            };
            const isActive = filter === key;
            return (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`px-4 py-2 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-[#D4AF37] text-black font-semibold shadow-sm'
                    : 'text-[#A1A1AA] hover:text-white'
                }`}
              >
                {labels[key]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Events List */}
      {loading ? (
        <div className="py-20 text-center text-xs text-[#71717A]">{t('common.loading')}</div>
      ) : events.length === 0 ? (
        <div className="py-20 text-center text-sm text-[#71717A] bg-[#121214] rounded-xl border border-[#242428]">
          {t('events.noEvents')}
        </div>
      ) : (
        <div className="space-y-6">
          {events.map((ev) => {
            const dateObj = new Date(ev.event_date);
            const statusInfo = getStatusBadge(ev.status);

            return (
              <div
                key={ev.id}
                className="p-6 sm:p-8 rounded-2xl bg-[#121214] border border-[#242428] hover:border-[#D4AF37]/40 transition-all flex flex-col lg:flex-row items-stretch gap-6"
              >
                {/* Poster / Visual */}
                <div className="lg:w-72 aspect-[16/10] lg:aspect-auto rounded-xl overflow-hidden bg-[#18181B] relative shrink-0">
                  <img
                    src={ev.poster_url}
                    alt={language === 'am' ? ev.title_am : ev.title_en}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-3 left-3">
                    <span className={`px-2.5 py-0.5 rounded text-[11px] font-medium border backdrop-blur-md bg-black/60 ${statusInfo.color}`}>
                      {statusInfo.label}
                    </span>
                  </div>
                </div>

                {/* Event Details */}
                <div className="flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-3 text-xs text-[#A1A1AA]">
                      <span className="text-[#D4AF37] font-semibold uppercase tracking-wider">
                        {language === 'am' ? ev.category_am : ev.category_en}
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1.5 text-white font-medium">
                        <Calendar className="w-3.5 h-3.5 text-[#D4AF37]" />
                        <span>{ev.event_date}</span>
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-[#D4AF37]" />
                        <span>{ev.event_time}</span>
                      </span>
                    </div>

                    <h2 className="text-2xl font-bold font-serif text-white">
                      {language === 'am' ? ev.title_am : ev.title_en}
                    </h2>

                    <p className="text-xs sm:text-sm text-[#D4D4D8] leading-relaxed">
                      {language === 'am' ? ev.description_am : ev.description_en}
                    </p>

                    <div className="flex items-center gap-2 text-xs text-[#A1A1AA] pt-2">
                      <MapPin className="w-4 h-4 text-[#D4AF37] shrink-0" />
                      <span className="text-white font-medium">
                        {language === 'am' ? ev.venue_am : ev.venue_en}, {language === 'am' ? ev.city_am : ev.city_en}
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-[#1C1C20] flex flex-wrap items-center justify-between gap-4">
                    {ev.ticket_info_en ? (
                      <div className="flex items-center gap-2 text-xs">
                        <Ticket className="w-4 h-4 text-[#D4AF37]" />
                        <span className="text-white font-semibold">
                          {language === 'am' ? ev.ticket_info_am : ev.ticket_info_en}
                        </span>
                      </div>
                    ) : <div />}

                    {ev.status === 'upcoming' && (
                      ev.ticket_url ? (
                        <a
                          href={ev.ticket_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-5 py-2.5 rounded-lg bg-[#D4AF37] hover:bg-[#E5C158] text-black text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-md shadow-[#D4AF37]/15"
                        >
                          <Ticket className="w-3.5 h-3.5" />
                          <span>{t('events.buyTicket')}</span>
                          <ExternalLink className="w-3 h-3 ml-1" />
                        </a>
                      ) : (
                        <span className="text-xs text-[#A1A1AA] italic">
                          {language === 'am' ? 'በበሩ ላይ ትኬት መቁረጥ ይቻላል' : 'Tickets available at theatre entrance'}
                        </span>
                      )
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
