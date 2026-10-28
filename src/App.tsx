/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { LanguageProvider } from './i18n/LanguageContext.tsx';
import { Navbar } from './components/Navbar.tsx';
import { Footer } from './components/Footer.tsx';
import { HomePage } from './pages/HomePage.tsx';
import { TheatrePage } from './pages/TheatrePage.tsx';
import { DancePage } from './pages/DancePage.tsx';
import { EventsPage } from './pages/EventsPage.tsx';
import { GalleryPage } from './pages/GalleryPage.tsx';
import { AboutPage } from './pages/AboutPage.tsx';
import { BookingPage } from './pages/BookingPage.tsx';
import { ContactPage } from './pages/ContactPage.tsx';
import { AdminPortal } from './pages/AdminPortal.tsx';
import { RegisterPage } from './pages/RegisterPage.tsx';
import { MemberDashboardPage } from './pages/MemberDashboardPage.tsx';
import { Performance, UserMember } from './types/index.ts';

export default function App() {
  const [currentPage, setCurrentPage] = useState<string>(() => {
    const hash = window.location.hash.replace('#', '');
    return hash || 'home';
  });

  const [bookingPreferred, setBookingPreferred] = useState<string | undefined>(undefined);
  const [selectedPerformance, setSelectedPerformance] = useState<Performance | null>(null);
  const [loggedInUser, setLoggedInUser] = useState<UserMember | null>(null);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash) {
        setCurrentPage(hash);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleNavigate = (page: string, params?: any) => {
    if (params?.preferred) {
      setBookingPreferred(params.preferred);
    }
    setCurrentPage(page);
    window.location.hash = page;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectPerformance = (perf: Performance) => {
    setSelectedPerformance(perf);
    setCurrentPage('theatre');
    window.location.hash = 'theatre';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <LanguageProvider>
      <div className="min-h-screen bg-[#0B0B0C] text-[#F3F4F6] flex flex-col font-sans selection:bg-[#D4AF37]/30 selection:text-white">
        <Navbar currentPage={currentPage} onNavigate={handleNavigate} />

        <main className="flex-1">
          {currentPage === 'home' && (
            <HomePage
              onNavigate={handleNavigate}
              onSelectPerformance={handleSelectPerformance}
            />
          )}

          {currentPage === 'theatre' && (
            <TheatrePage
              onNavigate={handleNavigate}
              selectedPerformance={selectedPerformance}
              onClearSelected={() => setSelectedPerformance(null)}
            />
          )}

          {currentPage === 'dance' && <DancePage onNavigate={handleNavigate} />}

          {currentPage === 'events' && <EventsPage />}

          {currentPage === 'gallery' && <GalleryPage />}

          {currentPage === 'about' && <AboutPage />}

          {currentPage === 'booking' && (
            <BookingPage initialPreferred={bookingPreferred} />
          )}

          {currentPage === 'contact' && <ContactPage />}

          {currentPage === 'register' && (
            <RegisterPage
              onNavigate={handleNavigate}
              onUserLoginSuccess={(u) => {
                setLoggedInUser(u);
                setCurrentPage('member-dashboard');
                window.location.hash = 'member-dashboard';
              }}
            />
          )}

          {currentPage === 'member-dashboard' && (
            <MemberDashboardPage
              onNavigate={handleNavigate}
              currentUser={loggedInUser}
              onLogout={() => setLoggedInUser(null)}
            />
          )}

          {currentPage === 'admin' && <AdminPortal />}
        </main>

        <Footer onNavigate={handleNavigate} />
      </div>
    </LanguageProvider>
  );
}
