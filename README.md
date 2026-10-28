# Telos Tiyator & Cultural Dance Group (ቴሎስ ቲያትር እና የባህል ውዝዋዜ ቡድን)

A modern, production-grade full-stack web application for **Telos Tiyator & Dance Group**, an Ethiopian traditional theatre and cultural dance ensemble based in Addis Ababa, Ethiopia.

---

## 🎭 Overview & Cultural Mission

Telos Tiyator & Dance Group brings centuries of Ethiopian storytelling, historical drama, and vibrant regional folk rhythms (Eskista, Guragigna, Oromiffa, Wolaita, Tigrigna, Wollo Ambassel) to national and international audiences.

### Key Capabilities
- **Complete Bilingual Experience**: Seamless toggle between **Amharic (አማርኛ)** and **English** with full Unicode support, `Noto Sans Ethiopic` typography, and localized content throughout.
- **Theatre Productions Catalog**: Repertoire management, cast and director credits, synopses, duration, posters, and trailers.
- **Traditional Dance Showcase**: Regional dance styles, authentic costume documentation (Habesha Kemis, Tibeb, Wandabo, Zuria), rhythm structures, and specialized booking packages.
- **Live Event Calendar**: Performance schedules, venues (National Theatre, Hager Fikir), and ticketing information.
- **Comprehensive Booking System**: Full validation, unique reference generation (`TELOS-2026-XXXX`), persistent database storage, and a live tracking tool for clients.
- **Secure Admin Portal**: Protected dashboard with real-time statistics, review workflow (New ➔ Under Review ➔ Approved ➔ Completed), CRUD operations for productions, events, gallery, and organization settings.
- **Real Full-Stack Persistence**: Backed by a transactional relational SQLite database (`better-sqlite3`) and an Express REST API.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend Framework** | React 19, TypeScript, Vite |
| **Styling & Design** | Tailwind CSS v4, Lucide Icons, Ethiopic & Serif Typography |
| **Backend API** | Node.js, Express 4, TypeScript (`tsx`) |
| **Database** | SQLite via `better-sqlite3` with automated schema migrations & seed data |
| **Security & Auth** | Node.js native crypto PBKDF2/scrypt password hashing & HMAC-SHA256 session tokens |
| **Internationalization** | Complete bilingual dictionary (Amharic & English) with localStorage persistence |

---

## 📁 Project Structure

```
├── data/
│   └── telos.db                     # SQLite relational database (auto-created on startup)
├── server/
│   └── db.ts                        # Database schema, migrations, seed data, and auth helpers
├── server.ts                        # Express server entry point mounting REST API & Vite middlewares
├── src/
│   ├── assets/
│   │   └── images/                  # High-fidelity Ethiopian theatre & dance photography
│   ├── components/
│   │   ├── Navbar.tsx               # Top Bar Contract navigation with bilingual switcher
│   │   └── Footer.tsx               # Cultural footer with newsletter subscription
│   ├── i18n/
│   │   ├── LanguageContext.tsx      # Bilingual React context & toggle handler
│   │   └── translations.ts          # Comprehensive English & Amharic translation dictionaries
│   ├── pages/
│   │   ├── HomePage.tsx             # Cinematic hero, featured productions, dance spotlight, tracker
│   │   ├── TheatrePage.tsx          # Theatre productions, filters, and detail modal
│   │   ├── DancePage.tsx            # Regional dance styles and booking packages
│   │   ├── EventsPage.tsx           # Upcoming and past events calendar
│   │   ├── GalleryPage.tsx          # Performance photography & lightbox viewer
│   │   ├── AboutPage.tsx            # Founding story, mission, values, and leadership bios
│   │   ├── BookingPage.tsx          # Professional booking request form & code tracker
│   │   ├── ContactPage.tsx          # Contact messages with database persistence
│   │   └── AdminPortal.tsx          # Protected administration console with stats & CRUD
│   ├── services/
│   │   └── api.ts                   # Client REST API service & token manager
│   ├── types/
│   │   └── index.ts                 # Shared TypeScript models
│   ├── App.tsx                      # Root component with state routing
│   ├── index.css                    # Tailwind CSS v4 setup & cultural pattern utilities
│   └── main.tsx                     # React client mounting entry
├── index.html                       # HTML5 entry with Noto Sans Ethiopic and Cinzel fonts
├── metadata.json                    # AI Studio metadata
├── package.json                     # Scripts & dependencies
├── tsconfig.json                    # TypeScript compiler configuration
└── vite.config.ts                   # Vite configuration
```

---

## 🗄️ Database Schema

The database defines the following relational tables in `data/telos.db`:

1. `admin_users`: `id`, `email`, `password_hash`, `name`, `role`, `created_at`
2. `organization_settings`: `id`, `org_name_en`, `org_name_am`, `headline_en`, `headline_am`, `subheadline_en`, `subheadline_am`, `about_en`, `about_am`, `mission_en`, `mission_am`, `vision_en`, `vision_am`, `phone`, `email`, `booking_email`, `address_en`, `address_am`, `business_hours_en`, `business_hours_am`, `social_*`
3. `performances`: `id`, `slug`, `title_en`, `title_am`, `genre_en`, `genre_am`, `description_en`, `description_am`, `synopsis_en`, `synopsis_am`, `director_en`, `director_am`, `playwright_en`, `playwright_am`, `cast_list_en`, `cast_list_am`, `duration_minutes`, `poster_url`, `trailer_url`, `status`, `featured`, `created_at`
4. `dance_categories`: `id`, `slug`, `name_en`, `name_am`, `region_en`, `region_am`, `description_en`, `description_am`, `costumes_en`, `costumes_am`, `rhythm_en`, `rhythm_am`, `image_url`, `video_url`, `is_available_booking`, `order_index`
5. `events`: `id`, `slug`, `title_en`, `title_am`, `category_en`, `category_am`, `description_en`, `description_am`, `event_date`, `event_time`, `venue_en`, `venue_am`, `city_en`, `city_am`, `ticket_info_en`, `ticket_info_am`, `ticket_url`, `poster_url`, `status`, `created_at`
6. `gallery_items`: `id`, `title_en`, `title_am`, `category`, `media_type`, `media_url`, `thumbnail_url`, `caption_en`, `caption_am`, `featured`, `created_at`
7. `booking_requests`: `id`, `booking_code`, `full_name`, `phone`, `email`, `organization`, `event_type`, `event_date`, `event_location`, `audience_size`, `preferred_performance`, `additional_requirements`, `status`, `admin_notes`, `created_at`, `updated_at`
8. `contact_messages`: `id`, `full_name`, `email`, `phone`, `subject`, `message`, `is_read`, `admin_reply`, `created_at`
9. `testimonials`: `id`, `author_en`, `author_am`, `role_en`, `role_am`, `organization_en`, `organization_am`, `quote_en`, `quote_am`, `rating`, `event_context_en`, `event_context_am`, `created_at`
10. `newsletter_subscribers`: `id`, `email`, `created_at`

---

## 🚀 Running the Project

### 1. Install Dependencies
```bash
npm install
```

### 2. Run in Development Mode
```bash
npm run dev
```
The server will boot on `http://0.0.0.0:3000` with Vite middleware mounted automatically.

### 3. Build for Production
```bash
npm run build
```

### 4. Run in Production Mode
```bash
NODE_ENV=production npm start
```

---

## 🔐 Administrator Access

An initial production administrator account is provisioned automatically upon initial database startup:

- **Admin URL**: Navigate to the **Admin Portal** link in the navigation or footer (`#admin`).
- **Email**: `admin@telos.et`
- **Password**: `TelosEthiopia2026!`

Administrators can review and approve booking requests, add internal notes, manage theatre productions, add cultural events, upload gallery photos, and update organization contact details.

---

## 🌐 API Endpoints Reference

### Public Endpoints
- `GET /api/organization` — Organization profile and settings
- `GET /api/performances` — List productions (`?status=current|upcoming|repertoire&featured=1`)
- `GET /api/performances/:idOrSlug` — Production details
- `GET /api/dance-categories` — Ethiopian dance traditions
- `GET /api/events` — Upcoming and past events
- `GET /api/gallery` — Media gallery items
- `GET /api/testimonials` — Client and critic reviews
- `POST /api/bookings` — Submit event booking inquiry
- `GET /api/bookings/status/:code` — Track booking confirmation status
- `POST /api/contact` — Submit general contact message
- `POST /api/newsletter` — Subscribe to cultural dispatch

### Admin Endpoints (Require Bearer Token)
- `POST /api/auth/login` — Sign in and receive session token
- `GET /api/auth/me` — Verify current user session
- `GET /api/admin/stats` — Metrics overview
- `GET /api/admin/bookings` — List all bookings
- `PUT /api/admin/bookings/:id/status` — Update booking status & admin notes
- `POST /api/admin/performances` — Create production
- `PUT /api/admin/performances/:id` — Update production
- `DELETE /api/admin/performances/:id` — Delete production
- `POST /api/admin/events` — Create event
- `PUT /api/admin/events/:id` — Update event
- `DELETE /api/admin/events/:id` — Delete event
- `POST /api/admin/gallery` — Add media item
- `DELETE /api/admin/gallery/:id` — Delete media item
- `GET /api/admin/contact-messages` — Review received inquiries
- `PUT /api/admin/contact-messages/:id` — Mark message read / reply
- `PUT /api/admin/organization` — Update bilingual settings and contacts
