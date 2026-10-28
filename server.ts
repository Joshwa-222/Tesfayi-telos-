import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import crypto from 'crypto';
import { db, initDatabase, hashPassword, verifyPassword } from './server/db.ts';

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const SESSION_SECRET = process.env.SESSION_SECRET || 'telos-ethiopia-theatre-secret-key-2026';

// Initialize SQLite database
initDatabase();

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Helper for JWT-like signed tokens without extra dependencies
function signToken(payload: object): string {
  const data = Buffer.from(JSON.stringify({ ...payload, exp: Date.now() + 7 * 24 * 60 * 60 * 1000 })).toString('base64url');
  const signature = crypto.createHmac('sha256', SESSION_SECRET).update(data).digest('base64url');
  return `${data}.${signature}`;
}

function verifyToken(token: string): { userId: string; email: string; role: string } | null {
  try {
    const [data, signature] = token.split('.');
    if (!data || !signature) return null;
    const expectedSig = crypto.createHmac('sha256', SESSION_SECRET).update(data).digest('base64url');
    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig))) {
      return null;
    }
    const payload = JSON.parse(Buffer.from(data, 'base64url').toString('utf8'));
    if (payload.exp && Date.now() > payload.exp) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

// Authentication middleware
interface AuthenticatedRequest extends Request {
  user?: { userId: string; email: string; role: string };
}

function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : (req.headers['x-admin-token'] as string);

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ error: 'Invalid or expired session token' });
  }

  req.user = decoded;
  next();
}

// -----------------------------------------------------------------------------
// PUBLIC & CLIENT API ROUTES
// -----------------------------------------------------------------------------

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Organization settings
app.get('/api/organization', (_req, res) => {
  try {
    const settings = db.prepare('SELECT * FROM organization_settings LIMIT 1').get();
    res.json(settings || {});
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Performances list
app.get('/api/performances', (req, res) => {
  try {
    const { status, featured, search } = req.query;
    let query = 'SELECT * FROM performances WHERE 1=1';
    const params: any[] = [];

    if (status && status !== 'all') {
      query += ' AND status = ?';
      params.push(status);
    }
    if (featured === '1' || featured === 'true') {
      query += ' AND featured = 1';
    }
    if (search && typeof search === 'string') {
      query += ' AND (title_en LIKE ? OR title_am LIKE ? OR description_en LIKE ? OR description_am LIKE ?)';
      const term = `%${search}%`;
      params.push(term, term, term, term);
    }

    query += ' ORDER BY created_at DESC';
    const rows = db.prepare(query).all(...params);
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Single performance detail
app.get('/api/performances/:slugOrId', (req, res) => {
  try {
    const { slugOrId } = req.params;
    const item = db.prepare('SELECT * FROM performances WHERE id = ? OR slug = ?').get(slugOrId, slugOrId);
    if (!item) {
      return res.status(404).json({ error: 'Performance not found' });
    }
    res.json(item);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Dance categories
app.get('/api/dance-categories', (_req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM dance_categories ORDER BY order_index ASC').all();
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Single dance category detail
app.get('/api/dance-categories/:slugOrId', (req, res) => {
  try {
    const { slugOrId } = req.params;
    const item = db.prepare('SELECT * FROM dance_categories WHERE id = ? OR slug = ?').get(slugOrId, slugOrId);
    if (!item) {
      return res.status(404).json({ error: 'Dance category not found' });
    }
    res.json(item);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Events list
app.get('/api/events', (req, res) => {
  try {
    const { status } = req.query;
    let query = 'SELECT * FROM events WHERE 1=1';
    const params: any[] = [];

    if (status && status !== 'all') {
      query += ' AND status = ?';
      params.push(status);
    }

    query += ' ORDER BY event_date ASC';
    const rows = db.prepare(query).all(...params);
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Single event detail
app.get('/api/events/:slugOrId', (req, res) => {
  try {
    const { slugOrId } = req.params;
    const item = db.prepare('SELECT * FROM events WHERE id = ? OR slug = ?').get(slugOrId, slugOrId);
    if (!item) {
      return res.status(404).json({ error: 'Event not found' });
    }
    res.json(item);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Gallery items
app.get('/api/gallery', (req, res) => {
  try {
    const { category, mediaType } = req.query;
    let query = 'SELECT * FROM gallery_items WHERE 1=1';
    const params: any[] = [];

    if (category && category !== 'all') {
      query += ' AND category = ?';
      params.push(category);
    }
    if (mediaType && mediaType !== 'all') {
      query += ' AND media_type = ?';
      params.push(mediaType);
    }

    query += ' ORDER BY featured DESC, created_at DESC';
    const rows = db.prepare(query).all(...params);
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Testimonials
app.get('/api/testimonials', (_req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM testimonials ORDER BY created_at DESC').all();
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Announcements
app.get('/api/announcements', (_req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM announcements WHERE is_active = 1 ORDER BY priority DESC, created_at DESC').all();
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Submit booking request
app.post('/api/bookings', (req, res) => {
  try {
    const {
      fullName,
      phone,
      email,
      organization,
      eventType,
      eventDate,
      eventLocation,
      audienceSize,
      preferredPerformance,
      additionalRequirements
    } = req.body;

    if (!fullName || !phone || !email || !eventType || !eventDate || !eventLocation || !audienceSize) {
      return res.status(400).json({ error: 'Please provide all mandatory booking fields.' });
    }

    // Basic email format check
    if (!email.includes('@') || !email.includes('.')) {
      return res.status(400).json({ error: 'Please provide a valid email address.' });
    }

    const id = crypto.randomUUID();
    const randomCode = Math.floor(1000 + Math.random() * 9000);
    const bookingCode = `TELOS-2026-${randomCode}`;

    db.prepare(`
      INSERT INTO booking_requests (
        id, booking_code, full_name, phone, email, organization,
        event_type, event_date, event_location, audience_size,
        preferred_performance, additional_requirements, status
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'new'
      )
    `).run(
      id,
      bookingCode,
      fullName.trim(),
      phone.trim(),
      email.trim(),
      organization ? organization.trim() : '',
      eventType,
      eventDate,
      eventLocation.trim(),
      audienceSize,
      preferredPerformance || 'General Consultation',
      additionalRequirements ? additionalRequirements.trim() : ''
    );

    res.status(201).json({
      success: true,
      bookingCode,
      messageEn: 'Your booking inquiry has been registered. An artistic coordinator will contact you within 24 hours.',
      messageAm: 'የቦታ ማስያዣ ጥያቄዎ በተሳካ ሁኔታ ተመዝግቧል። የኪነ-ጥበብ አስተባባሪያችን በ24 ሰዓት ውስጥ ያነጋግርዎታል።'
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Check booking status by code
app.get('/api/bookings/status/:code', (req, res) => {
  try {
    const { code } = req.params;
    const booking = db.prepare(`
      SELECT booking_code, full_name, event_type, event_date, event_location, status, created_at
      FROM booking_requests
      WHERE booking_code = ?
    `).get(code.toUpperCase().trim());

    if (!booking) {
      return res.status(404).json({ error: 'Booking code not found. Please verify your reference number.' });
    }

    res.json(booking);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Submit contact message
app.post('/api/contact', (req, res) => {
  try {
    const { fullName, email, phone, subject, message } = req.body;

    if (!fullName || !email || !subject || !message) {
      return res.status(400).json({ error: 'All fields marked with an asterisk are required.' });
    }

    const id = crypto.randomUUID();
    db.prepare(`
      INSERT INTO contact_messages (id, full_name, email, phone, subject, message)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, fullName.trim(), email.trim(), phone?.trim() || '', subject.trim(), message.trim());

    res.status(201).json({
      success: true,
      messageEn: 'Thank you for reaching out to Telos Tiyator. We will respond promptly.',
      messageAm: 'መልዕክትዎ ደርሶናል። ቴሎስ ቲያትርን ስላነጋገሩ እናመሰግናለን፤ በቅርቡ ምላሽ እንሰጣለን።'
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Newsletter subscription
app.post('/api/newsletter', (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Valid email address required' });
    }

    const existing = db.prepare('SELECT id FROM newsletter_subscribers WHERE email = ?').get(email.toLowerCase().trim());
    if (existing) {
      return res.json({ success: true, messageEn: 'Already subscribed!', messageAm: 'ቀደም ሲል ተመዝግበዋል!' });
    }

    const id = crypto.randomUUID();
    db.prepare('INSERT INTO newsletter_subscribers (id, email) VALUES (?, ?)').run(id, email.toLowerCase().trim());

    res.status(201).json({
      success: true,
      messageEn: 'Thank you for subscribing to Telos cultural updates!',
      messageAm: 'ለቴሎስ ባህላዊ ዜናዎችና ዝግጅቶች ስለተመዘገቡ እናመሰግናለን!'
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// -----------------------------------------------------------------------------
// AUTHENTICATION ROUTES
// -----------------------------------------------------------------------------

app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const user: any = db.prepare('SELECT * FROM admin_users WHERE email = ?').get(email.toLowerCase().trim());
    if (!user || !verifyPassword(password, user.password_hash)) {
      return res.status(401).json({ error: 'Invalid administrator email or password.' });
    }

    const token = signToken({ userId: user.id, email: user.email, role: user.role, name: user.name });

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Member Registration
app.post('/api/auth/register', (req, res) => {
  try {
    const { fullName, phone, faydaId, email, password, city, preferredInterest } = req.body;

    if (!fullName || !phone || !faydaId || !email || !password) {
      return res.status(400).json({
        error: 'Please provide all mandatory fields: Full Name, Phone Number, Fayda/National ID, Email, and Password.',
        errorAm: 'እባክዎ ሙሉ ስም፣ ስልክ ቁጥር፣ የፋይዳ/ብሔራዊ መታወቂያ፣ ኢሜይል እና የይለፍ ቃል ያስገቡ።'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: 'Password must be at least 6 characters long.',
        errorAm: 'የይለፍ ቃል ቢያንስ 6 ቁምፊዎች ሊኖሩት ይገባል።'
      });
    }

    if (!email.includes('@') || !email.includes('.')) {
      return res.status(400).json({
        error: 'Please provide a valid email address.',
        errorAm: 'እባክዎ ትክክለኛ የኢሜይል አድራሻ ያስገቡ።'
      });
    }

    const trimmedEmail = email.toLowerCase().trim();
    const trimmedPhone = phone.trim();
    const trimmedFayda = faydaId.trim().toUpperCase();
    const trimmedName = fullName.trim();

    // Check Fayda uniqueness
    const existingFayda = db.prepare('SELECT id FROM users WHERE fayda_id = ?').get(trimmedFayda);
    if (existingFayda) {
      return res.status(400).json({
        error: 'This Fayda / National ID is already registered.',
        errorAm: 'ይህ የፋይዳ ወይም ብሔራዊ መታወቂያ ቀደም ሲል ተመዝግቧል።'
      });
    }

    // Check email uniqueness
    const existingEmail = db.prepare('SELECT id FROM users WHERE email = ?').get(trimmedEmail);
    if (existingEmail) {
      return res.status(400).json({
        error: 'An account with this email address already exists.',
        errorAm: 'በዚህ ኢሜይል አድራሻ የተመዘገበ አካውንት ቀደም ሲል አለ።'
      });
    }

    // Check phone uniqueness
    const existingPhone = db.prepare('SELECT id FROM users WHERE phone = ?').get(trimmedPhone);
    if (existingPhone) {
      return res.status(400).json({
        error: 'An account with this phone number already exists.',
        errorAm: 'በዚህ ስልክ ቁጥር የተመዘገበ አካውንት ቀደም ሲል አለ።'
      });
    }

    const id = crypto.randomUUID();
    const randomCode = Math.floor(1000 + Math.random() * 9000);
    const membershipCode = `TELOS-MEM-${randomCode}`;
    const passwordHash = hashPassword(password);

    db.prepare(`
      INSERT INTO users (
        id, membership_code, full_name, phone, fayda_id, email, password_hash, city, preferred_interest
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      membershipCode,
      trimmedName,
      trimmedPhone,
      trimmedFayda,
      trimmedEmail,
      passwordHash,
      city ? city.trim() : 'Addis Ababa',
      preferredInterest || 'both'
    );

    const token = signToken({
      userId: id,
      email: trimmedEmail,
      role: 'member',
      name: trimmedName,
      membershipCode,
      faydaId: trimmedFayda
    });

    res.status(201).json({
      success: true,
      token,
      user: {
        id,
        membership_code: membershipCode,
        full_name: trimmedName,
        phone: trimmedPhone,
        fayda_id: trimmedFayda,
        email: trimmedEmail,
        city: city ? city.trim() : 'Addis Ababa',
        preferred_interest: preferredInterest || 'both',
        role: 'member'
      },
      messageEn: 'Registration successful! Welcome to the Telos Cultural Membership family.',
      messageAm: 'ምዝገባዎ በተሳካ ሁኔታ ተጠናቋል! ወደ ቴሎስ ባህላዊ ማህበር በደህና መጡ።'
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Member Login (by Email, Phone, or Fayda ID)
app.post('/api/auth/user-login', (req, res) => {
  try {
    const { identifier, password } = req.body;
    if (!identifier || !password) {
      return res.status(400).json({
        error: 'Identifier (Email, Phone, or Fayda ID) and password required.',
        errorAm: 'መለያ (ኢሜይል፣ ስልክ ወይም የፋይዳ መታወቂያ) እና የይለፍ ቃል ያስፈልጋል።'
      });
    }

    const cleanId = identifier.trim();
    const user: any = db.prepare(`
      SELECT * FROM users
      WHERE email = ? OR phone = ? OR fayda_id = ?
    `).get(cleanId.toLowerCase(), cleanId, cleanId.toUpperCase());

    if (!user || !verifyPassword(password, user.password_hash)) {
      return res.status(401).json({
        error: 'Invalid login credentials. Please check your Email, Phone, or Fayda ID and password.',
        errorAm: 'የተሳሳተ የመግቢያ መረጃ። እባክዎ ኢሜይል፣ ስልክ ወይም የፋይዳ መታወቂያዎን እና የይለፍ ቃልዎን ያረጋግጡ።'
      });
    }

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: 'member',
      name: user.full_name,
      membershipCode: user.membership_code,
      faydaId: user.fayda_id
    });

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        membership_code: user.membership_code,
        full_name: user.full_name,
        phone: user.phone,
        fayda_id: user.fayda_id,
        email: user.email,
        city: user.city,
        preferred_interest: user.preferred_interest,
        role: 'member'
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get User Profile & User Bookings
app.get('/api/user/profile', requireAuth, (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user?.userId;
    const user: any = db.prepare('SELECT id, membership_code, full_name, phone, fayda_id, email, city, preferred_interest, created_at FROM users WHERE id = ?').get(userId);

    if (!user) {
      return res.status(404).json({ error: 'User profile not found.' });
    }

    const bookings = db.prepare(`
      SELECT * FROM booking_requests
      WHERE email = ? OR phone = ?
      ORDER BY created_at DESC
    `).all(user.email, user.phone);

    res.json({ user, bookings });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Update User Profile
app.put('/api/user/profile', requireAuth, (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user?.userId;
    const { fullName, phone, city, preferredInterest } = req.body;

    if (!fullName || !phone) {
      return res.status(400).json({ error: 'Full name and phone are required.' });
    }

    db.prepare(`
      UPDATE users SET
        full_name = ?, phone = ?, city = ?, preferred_interest = ?
      WHERE id = ?
    `).run(fullName.trim(), phone.trim(), city ? city.trim() : '', preferredInterest || 'both', userId);

    const updatedUser = db.prepare('SELECT id, membership_code, full_name, phone, fayda_id, email, city, preferred_interest, created_at FROM users WHERE id = ?').get(userId);
    res.json({ success: true, user: updatedUser });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/auth/me', requireAuth, (req: AuthenticatedRequest, res) => {
  res.json({ user: req.user });
});

// -----------------------------------------------------------------------------
// PROTECTED ADMIN MANAGEMENT ROUTES
// -----------------------------------------------------------------------------

// Admin Dashboard stats
app.get('/api/admin/stats', requireAuth, (_req, res) => {
  try {
    const bookingsCount = db.prepare('SELECT COUNT(*) as count FROM booking_requests').get() as { count: number };
    const newBookingsCount = db.prepare("SELECT COUNT(*) as count FROM booking_requests WHERE status = 'new'").get() as { count: number };
    const performancesCount = db.prepare('SELECT COUNT(*) as count FROM performances').get() as { count: number };
    const dancesCount = db.prepare('SELECT COUNT(*) as count FROM dance_categories').get() as { count: number };
    const eventsCount = db.prepare('SELECT COUNT(*) as count FROM events').get() as { count: number };
    const messagesCount = db.prepare('SELECT COUNT(*) as count FROM contact_messages WHERE is_read = 0').get() as { count: number };
    const subscribersCount = db.prepare('SELECT COUNT(*) as count FROM newsletter_subscribers').get() as { count: number };
    const membersCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };

    res.json({
      totalBookings: bookingsCount.count,
      newBookings: newBookingsCount.count,
      totalPerformances: performancesCount.count,
      totalDances: dancesCount.count,
      totalEvents: eventsCount.count,
      unreadMessages: messagesCount.count,
      totalSubscribers: subscribersCount.count,
      totalMembers: membersCount.count
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Admin list registered members
app.get('/api/admin/members', requireAuth, (_req, res) => {
  try {
    const members = db.prepare(`
      SELECT id, membership_code, full_name, phone, fayda_id, email, city, preferred_interest, created_at
      FROM users
      ORDER BY created_at DESC
    `).all();
    res.json(members);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Admin update organization settings
app.put('/api/admin/organization', requireAuth, (req, res) => {
  try {
    const {
      org_name_en, org_name_am,
      headline_en, headline_am,
      subheadline_en, subheadline_am,
      about_en, about_am,
      mission_en, mission_am,
      vision_en, vision_am,
      phone, email, booking_email,
      address_en, address_am,
      business_hours_en, business_hours_am,
      social_facebook, social_instagram, social_youtube, social_tiktok
    } = req.body;

    db.prepare(`
      UPDATE organization_settings SET
        org_name_en = ?, org_name_am = ?,
        headline_en = ?, headline_am = ?,
        subheadline_en = ?, subheadline_am = ?,
        about_en = ?, about_am = ?,
        mission_en = ?, mission_am = ?,
        vision_en = ?, vision_am = ?,
        phone = ?, email = ?, booking_email = ?,
        address_en = ?, address_am = ?,
        business_hours_en = ?, business_hours_am = ?,
        social_facebook = ?, social_instagram = ?,
        social_youtube = ?, social_tiktok = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = 'default'
    `).run(
      org_name_en, org_name_am,
      headline_en, headline_am,
      subheadline_en, subheadline_am,
      about_en, about_am,
      mission_en, mission_am,
      vision_en, vision_am,
      phone, email, booking_email,
      address_en, address_am,
      business_hours_en, business_hours_am,
      social_facebook, social_instagram,
      social_youtube, social_tiktok
    );

    res.json({ success: true, message: 'Settings updated successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Admin Booking Requests
app.get('/api/admin/bookings', requireAuth, (req, res) => {
  try {
    const { status } = req.query;
    let query = 'SELECT * FROM booking_requests WHERE 1=1';
    const params: any[] = [];
    if (status && status !== 'all') {
      query += ' AND status = ?';
      params.push(status);
    }
    query += ' ORDER BY created_at DESC';
    const rows = db.prepare(query).all(...params);
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/admin/bookings/:id/status', requireAuth, (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;
    db.prepare(`
      UPDATE booking_requests
      SET status = ?, admin_notes = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(status, adminNotes || '', id);

    res.json({ success: true, message: 'Booking status updated' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Admin Performances CRUD
app.post('/api/admin/performances', requireAuth, (req, res) => {
  try {
    const {
      title_en, title_am, genre_en, genre_am,
      description_en, description_am, synopsis_en, synopsis_am,
      director_en, director_am, playwright_en, playwright_am,
      cast_list_en, cast_list_am, duration_minutes,
      poster_url, trailer_url, status, featured
    } = req.body;

    const id = crypto.randomUUID();
    const slug = title_en.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') || `perf-${Date.now()}`;

    db.prepare(`
      INSERT INTO performances (
        id, slug, title_en, title_am, genre_en, genre_am,
        description_en, description_am, synopsis_en, synopsis_am,
        director_en, director_am, playwright_en, playwright_am,
        cast_list_en, cast_list_am, duration_minutes,
        poster_url, trailer_url, status, featured
      ) VALUES (
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?,
        ?, ?, ?, ?
      )
    `).run(
      id, slug, title_en, title_am, genre_en, genre_am,
      description_en, description_am, synopsis_en, synopsis_am,
      director_en, director_am, playwright_en || '', playwright_am || '',
      cast_list_en || '', cast_list_am || '', duration_minutes || 90,
      poster_url, trailer_url || '', status || 'repertoire', featured ? 1 : 0
    );

    res.status(201).json({ success: true, id, slug });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/admin/performances/:id', requireAuth, (req, res) => {
  try {
    const { id } = req.params;
    const {
      title_en, title_am, genre_en, genre_am,
      description_en, description_am, synopsis_en, synopsis_am,
      director_en, director_am, playwright_en, playwright_am,
      cast_list_en, cast_list_am, duration_minutes,
      poster_url, trailer_url, status, featured
    } = req.body;

    db.prepare(`
      UPDATE performances SET
        title_en = ?, title_am = ?, genre_en = ?, genre_am = ?,
        description_en = ?, description_am = ?, synopsis_en = ?, synopsis_am = ?,
        director_en = ?, director_am = ?, playwright_en = ?, playwright_am = ?,
        cast_list_en = ?, cast_list_am = ?, duration_minutes = ?,
        poster_url = ?, trailer_url = ?, status = ?, featured = ?
      WHERE id = ?
    `).run(
      title_en, title_am, genre_en, genre_am,
      description_en, description_am, synopsis_en, synopsis_am,
      director_en, director_am, playwright_en || '', playwright_am || '',
      cast_list_en || '', cast_list_am || '', duration_minutes || 90,
      poster_url, trailer_url || '', status, featured ? 1 : 0, id
    );

    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/admin/performances/:id', requireAuth, (req, res) => {
  try {
    db.prepare('DELETE FROM performances WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Admin Events CRUD
app.post('/api/admin/events', requireAuth, (req, res) => {
  try {
    const {
      title_en, title_am, category_en, category_am,
      description_en, description_am, event_date, event_time,
      venue_en, venue_am, city_en, city_am, ticket_info_en,
      ticket_info_am, ticket_url, poster_url, status
    } = req.body;

    const id = crypto.randomUUID();
    const slug = title_en.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') || `event-${Date.now()}`;

    db.prepare(`
      INSERT INTO events (
        id, slug, title_en, title_am, category_en, category_am,
        description_en, description_am, event_date, event_time,
        venue_en, venue_am, city_en, city_am, ticket_info_en,
        ticket_info_am, ticket_url, poster_url, status
      ) VALUES (
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?
      )
    `).run(
      id, slug, title_en, title_am, category_en, category_am,
      description_en, description_am, event_date, event_time,
      venue_en, venue_am, city_en || 'Addis Ababa', city_am || 'አዲስ አበባ',
      ticket_info_en || '', ticket_info_am || '', ticket_url || '',
      poster_url, status || 'upcoming'
    );

    res.status(201).json({ success: true, id, slug });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/admin/events/:id', requireAuth, (req, res) => {
  try {
    const { id } = req.params;
    const {
      title_en, title_am, category_en, category_am,
      description_en, description_am, event_date, event_time,
      venue_en, venue_am, city_en, city_am, ticket_info_en,
      ticket_info_am, ticket_url, poster_url, status
    } = req.body;

    db.prepare(`
      UPDATE events SET
        title_en = ?, title_am = ?, category_en = ?, category_am = ?,
        description_en = ?, description_am = ?, event_date = ?, event_time = ?,
        venue_en = ?, venue_am = ?, city_en = ?, city_am = ?, ticket_info_en = ?,
        ticket_info_am = ?, ticket_url = ?, poster_url = ?, status = ?
      WHERE id = ?
    `).run(
      title_en, title_am, category_en, category_am,
      description_en, description_am, event_date, event_time,
      venue_en, venue_am, city_en, city_am, ticket_info_en || '',
      ticket_info_am || '', ticket_url || '', poster_url, status, id
    );

    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/admin/events/:id', requireAuth, (req, res) => {
  try {
    db.prepare('DELETE FROM events WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Admin Gallery CRUD
app.post('/api/admin/gallery', requireAuth, (req, res) => {
  try {
    const { title_en, title_am, category, media_type, media_url, thumbnail_url, caption_en, caption_am, featured } = req.body;
    const id = crypto.randomUUID();

    db.prepare(`
      INSERT INTO gallery_items (
        id, title_en, title_am, category, media_type,
        media_url, thumbnail_url, caption_en, caption_am, featured
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id, title_en, title_am, category || 'theatre', media_type || 'image',
      media_url, thumbnail_url || media_url, caption_en || '', caption_am || '', featured ? 1 : 0
    );

    res.status(201).json({ success: true, id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/admin/gallery/:id', requireAuth, (req, res) => {
  try {
    db.prepare('DELETE FROM gallery_items WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Admin Contact Messages
app.get('/api/admin/contact-messages', requireAuth, (_req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM contact_messages ORDER BY created_at DESC').all();
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/admin/contact-messages/:id', requireAuth, (req, res) => {
  try {
    const { is_read, admin_reply } = req.body;
    db.prepare('UPDATE contact_messages SET is_read = ?, admin_reply = ? WHERE id = ?').run(is_read ? 1 : 0, admin_reply || null, req.params.id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/admin/contact-messages/:id', requireAuth, (req, res) => {
  try {
    db.prepare('DELETE FROM contact_messages WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Admin Testimonials
app.post('/api/admin/testimonials', requireAuth, (req, res) => {
  try {
    const { author_en, author_am, role_en, role_am, organization_en, organization_am, quote_en, quote_am, rating, event_context_en, event_context_am } = req.body;
    const id = crypto.randomUUID();
    db.prepare(`
      INSERT INTO testimonials (
        id, author_en, author_am, role_en, role_am,
        organization_en, organization_am, quote_en, quote_am,
        rating, event_context_en, event_context_am
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, author_en, author_am, role_en, role_am, organization_en || '', organization_am || '', quote_en, quote_am, rating || 5, event_context_en || '', event_context_am || '');
    res.status(201).json({ success: true, id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/admin/testimonials/:id', requireAuth, (req, res) => {
  try {
    db.prepare('DELETE FROM testimonials WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// -----------------------------------------------------------------------------
// VITE DEV SERVER / STATIC ASSETS
// -----------------------------------------------------------------------------

async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(process.cwd(), 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(process.cwd(), 'dist', 'index.html'));
    });
  } else {
    // Mount Vite dev server middleware
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Telos Tiyator Full-Stack Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
