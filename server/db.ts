import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const DATA_DIR = path.resolve(process.cwd(), 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const dbPath = path.join(DATA_DIR, 'telos.db');
export const db = new Database(dbPath);

// Enable foreign keys and WAL mode for high performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, combinedHash: string): boolean {
  try {
    const [salt, key] = combinedHash.split(':');
    if (!salt || !key) return false;
    const keyBuffer = Buffer.from(key, 'hex');
    const derivedKey = crypto.scryptSync(password, salt, 64);
    return crypto.timingSafeEqual(keyBuffer, derivedKey);
  } catch {
    return false;
  }
}

export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS admin_users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT DEFAULT 'admin',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS organization_settings (
      id TEXT PRIMARY KEY,
      org_name_en TEXT NOT NULL,
      org_name_am TEXT NOT NULL,
      headline_en TEXT NOT NULL,
      headline_am TEXT NOT NULL,
      subheadline_en TEXT NOT NULL,
      subheadline_am TEXT NOT NULL,
      about_en TEXT NOT NULL,
      about_am TEXT NOT NULL,
      mission_en TEXT NOT NULL,
      mission_am TEXT NOT NULL,
      vision_en TEXT NOT NULL,
      vision_am TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT NOT NULL,
      booking_email TEXT NOT NULL,
      address_en TEXT NOT NULL,
      address_am TEXT NOT NULL,
      business_hours_en TEXT NOT NULL,
      business_hours_am TEXT NOT NULL,
      social_facebook TEXT,
      social_instagram TEXT,
      social_youtube TEXT,
      social_tiktok TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS performances (
      id TEXT PRIMARY KEY,
      slug TEXT UNIQUE NOT NULL,
      title_en TEXT NOT NULL,
      title_am TEXT NOT NULL,
      genre_en TEXT NOT NULL,
      genre_am TEXT NOT NULL,
      description_en TEXT NOT NULL,
      description_am TEXT NOT NULL,
      synopsis_en TEXT NOT NULL,
      synopsis_am TEXT NOT NULL,
      director_en TEXT NOT NULL,
      director_am TEXT NOT NULL,
      playwright_en TEXT,
      playwright_am TEXT,
      cast_list_en TEXT,
      cast_list_am TEXT,
      duration_minutes INTEGER DEFAULT 90,
      poster_url TEXT NOT NULL,
      trailer_url TEXT,
      status TEXT DEFAULT 'repertoire', -- 'upcoming', 'current', 'repertoire'
      featured INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS dance_categories (
      id TEXT PRIMARY KEY,
      slug TEXT UNIQUE NOT NULL,
      name_en TEXT NOT NULL,
      name_am TEXT NOT NULL,
      region_en TEXT NOT NULL,
      region_am TEXT NOT NULL,
      description_en TEXT NOT NULL,
      description_am TEXT NOT NULL,
      costumes_en TEXT NOT NULL,
      costumes_am TEXT NOT NULL,
      rhythm_en TEXT NOT NULL,
      rhythm_am TEXT NOT NULL,
      image_url TEXT NOT NULL,
      video_url TEXT,
      is_available_booking INTEGER DEFAULT 1,
      order_index INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS events (
      id TEXT PRIMARY KEY,
      slug TEXT UNIQUE NOT NULL,
      title_en TEXT NOT NULL,
      title_am TEXT NOT NULL,
      category_en TEXT NOT NULL,
      category_am TEXT NOT NULL,
      description_en TEXT NOT NULL,
      description_am TEXT NOT NULL,
      event_date TEXT NOT NULL,
      event_time TEXT NOT NULL,
      venue_en TEXT NOT NULL,
      venue_am TEXT NOT NULL,
      city_en TEXT NOT NULL,
      city_am TEXT NOT NULL,
      ticket_info_en TEXT,
      ticket_info_am TEXT,
      ticket_url TEXT,
      poster_url TEXT NOT NULL,
      status TEXT DEFAULT 'upcoming', -- 'upcoming', 'completed', 'sold_out'
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS gallery_items (
      id TEXT PRIMARY KEY,
      title_en TEXT NOT NULL,
      title_am TEXT NOT NULL,
      category TEXT NOT NULL, -- 'theatre', 'dance', 'rehearsal', 'events'
      media_type TEXT NOT NULL, -- 'image', 'video'
      media_url TEXT NOT NULL,
      thumbnail_url TEXT,
      caption_en TEXT,
      caption_am TEXT,
      featured INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS booking_requests (
      id TEXT PRIMARY KEY,
      booking_code TEXT UNIQUE NOT NULL,
      full_name TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT NOT NULL,
      organization TEXT,
      event_type TEXT NOT NULL,
      event_date TEXT NOT NULL,
      event_location TEXT NOT NULL,
      audience_size TEXT NOT NULL,
      preferred_performance TEXT NOT NULL,
      additional_requirements TEXT,
      status TEXT DEFAULT 'new', -- 'new', 'under_review', 'approved', 'rejected', 'completed'
      admin_notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS contact_messages (
      id TEXT PRIMARY KEY,
      full_name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      subject TEXT NOT NULL,
      message TEXT NOT NULL,
      is_read INTEGER DEFAULT 0,
      admin_reply TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS testimonials (
      id TEXT PRIMARY KEY,
      author_en TEXT NOT NULL,
      author_am TEXT NOT NULL,
      role_en TEXT NOT NULL,
      role_am TEXT NOT NULL,
      organization_en TEXT NOT NULL,
      organization_am TEXT NOT NULL,
      quote_en TEXT NOT NULL,
      quote_am TEXT NOT NULL,
      rating INTEGER DEFAULT 5,
      event_context_en TEXT,
      event_context_am TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS announcements (
      id TEXT PRIMARY KEY,
      title_en TEXT NOT NULL,
      title_am TEXT NOT NULL,
      content_en TEXT NOT NULL,
      content_am TEXT NOT NULL,
      link_url TEXT,
      link_text_en TEXT,
      link_text_am TEXT,
      is_active INTEGER DEFAULT 1,
      priority INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS newsletter_subscribers (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      membership_code TEXT UNIQUE NOT NULL,
      full_name TEXT NOT NULL,
      phone TEXT NOT NULL,
      fayda_id TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      city TEXT,
      preferred_interest TEXT DEFAULT 'both',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Seed default admin if none exists
  const existingAdmin = db.prepare('SELECT id FROM admin_users LIMIT 1').get();
  if (!existingAdmin) {
    const adminId = crypto.randomUUID();
    // Default credentials for production administration: admin@telos.et / TelosEthiopia2026!
    const defaultPasswordHash = hashPassword('TelosEthiopia2026!');
    db.prepare(`
      INSERT INTO admin_users (id, email, password_hash, name, role)
      VALUES (?, ?, ?, ?, ?)
    `).run(adminId, 'admin@telos.et', defaultPasswordHash, 'Telos Artistic Director', 'admin');
  }

  // Seed sample member if none exists
  const existingUser = db.prepare('SELECT id FROM users LIMIT 1').get();
  if (!existingUser) {
    const userId = crypto.randomUUID();
    const userPassHash = hashPassword('MemberPass123!');
    db.prepare(`
      INSERT INTO users (id, membership_code, full_name, phone, fayda_id, email, password_hash, city, preferred_interest)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      userId,
      'TELOS-MEM-1082',
      'Yohannes Bekele',
      '+251 91 234 5678',
      'ET-FAYDA-9821-4402',
      'yohannes.b@gmail.com',
      userPassHash,
      'Addis Ababa',
      'both'
    );
  }

  // Seed default settings if empty
  const existingSettings = db.prepare('SELECT id FROM organization_settings LIMIT 1').get();
  if (!existingSettings) {
    db.prepare(`
      INSERT INTO organization_settings (
        id, org_name_en, org_name_am,
        headline_en, headline_am,
        subheadline_en, subheadline_am,
        about_en, about_am,
        mission_en, mission_am,
        vision_en, vision_am,
        phone, email, booking_email,
        address_en, address_am,
        business_hours_en, business_hours_am,
        social_facebook, social_instagram, social_youtube, social_tiktok
      ) VALUES (
        'default',
        'Telos Kine Tibeb', 'ቴሎስ ኪነ ጥበብ',
        'Celebrating Ethiopian Culture Through Theatre and Dance',
        'የኢትዮጵያን ባህል በቲያትር እና በባህላዊ ውዝዋዜ ማክበር',
        'A premier Ethiopian performing arts ensemble dedicated to authentic historical drama, contemporary stage plays, and exhilarating regional dance heritage.',
        'የኢትዮጵያን ታሪካዊ ድራማዎች፣ ዘመናዊ የቴአትር ስራዎች እና ደማቅ የብሔረሰቦች ባህላዊ ውዝዋዜዎችን በሀገር ውስጥና በአለም አቀፍ ደረጃ በክብር የሚያቀርብ ጥበባዊ ድርጅት።',
        'Telos Kine Tibeb was founded by passionate Ethiopian dramatists, choreographers, and cultural musicians. We preserve and evolve Ethiopia’s centuries-old storytelling tradition and vibrant folk dance rhythms for national and international stages.',
        'ቴሎስ ኪነ ጥበብ በኢትዮጵያ አንጋፋ እና ወጣት የቴአትር ባለሙያዎች፣ ኮሪዮግራፈሮችና የባህል ሙዚቀኞች የተመሰረተ ማህበር ነው። ጥንታዊውንና ደማቁን የኢትዮጵያ የኪነ-ጥበብ ቅርሳችንን ለትውልድ ማስተላለፍና ለአለም ማስተዋወቅ ዋና ተልዕኳችን ነው።',
        'To elevate Ethiopian performing arts through compelling stage productions, rigorous traditional choreography, and accessible cultural education.',
        'ጥራት ባላቸው የቴአትር ስራዎች፣ ትክክለኛ የባህል ውዝዋዜዎች እና በኪነ-ጥበብ ትምህርት የኢትዮጵያን ባህላዊ ቅርስ በከፍተኛ ደረጃ ማስፋፋት።',
        'To be the leading cultural ambassador of Ethiopian theatre and dance globally, fostering cultural unity, artistic innovation, and heritage pride.',
        'በአለም አቀፍ መድረኮች የኢትዮጵያ ቴአትርና ውዝዋዜ ግንባር ቀደም አምባሳደር በመሆን የባህል አንድነትንና የጥበብ ፈጠራን ማሳደግ።',
        '+251 90 716 1650 / +251 99 178 4565',
        'tdiribu2@gmail.com',
        'tesfayediribu8@gmail.com',
        'Kirkos Sub-City, Woreda 02, Youth Recreation & Development Center, Addis Ababa, Ethiopia',
        'አ.አ ቂርቆስ ክፍለ ከተማ ወረዳ 02 ወጣቶች መገንባ ማዕከል',
        'Mon - Sat: 9:00 AM - 6:00 PM',
        'ከሰኞ እስከ ቅዳሜ፡ ከጠዋቱ 3:00 - ከሰዓት 12:00',
        'https://facebook.com/telostiyator',
        'https://instagram.com/telostiyator',
        'https://youtube.com/@telostiyator',
        'https://tiktok.com/@telostiyator'
      )
    `).run();
  }

  // Ensure organization branding and verified contacts are synchronized
  try {
    db.prepare(`
      UPDATE organization_settings
      SET org_name_en = 'Telos Kine Tibeb',
          org_name_am = 'ቴሎስ ኪነ ጥበብ',
          phone = '0907161650 / 0991784565',
          email = 'tdiribu2@gmail.com',
          booking_email = 'tesfayediribu8@gmail.com',
          address_en = 'Kirkos Sub-City, Woreda 02, Youth Recreation & Development Center, Addis Ababa, Ethiopia',
          address_am = 'አ.አ ቂርቆስ ክፍለ ከተማ ወረዳ 02 ወጣቶች መገንባ ማዕከል'
      WHERE id = 'default'
    `).run();
  } catch (e) {
    // ignore
  }

  // Seed performances if empty
  const existingPerformances = db.prepare('SELECT id FROM performances LIMIT 1').get();
  if (!existingPerformances) {
    const seedPerformances = [
      {
        id: crypto.randomUUID(),
        slug: 'tewodros-the-visionary',
        title_en: 'Tewodros: Fire of Unity',
        title_am: 'ቴዎድሮስ፡ የእሳት አንድነት',
        genre_en: 'Historical Drama',
        genre_am: 'ታሪካዊ ድራማ',
        description_en: 'A gripping historical stage production portraying the legendary life, triumphs, and tragic stand of Emperor Tewodros II at Maqdala.',
        description_am: 'የአፄ ቴዎድሮስን የህይወት ጉዞ፣ የሀገር አንድነት ራዕይ እና የመቅደላን ታሪካዊ ገድል የሚያሳይ ልብ አንጠልጣይ ታሪካዊ የመድረክ ቴአትር።',
        synopsis_en: 'Set in 19th-century Abyssinia, this production captures Kassa Hailu’s rise from Quara to the Imperial Throne, his visionary drive to unify a fragmented nation, and the dramatic confrontation on the heights of Maqdala. Features full period costumes, live masenqo and begena music.',
        synopsis_am: 'በ19ኛው ክፍለ ዘመን የተከናወነው ይህ ቴአትር፣ ካሳ ሀይሉ ከቋራ ተነስቶ እስከ ንጉሰ ነገስትነት የደረሰበትን፣ ሀገሩን አንድ ለማድረግ የከፈለውን ዋጋ እና በመቅደላ አምባ የተፈጸመውን ታሪክ በህያው ሙዚቃና አልባሳት ያቀርባል።',
        director_en: 'Mekonnen Tadesse',
        director_am: 'መኮንን ታደሰ',
        playwright_en: 'Tsegaye Gabre-Medhin Adapt.',
        playwright_am: 'ጸጋዬ ገብረመድህን ቅንብር',
        cast_list_en: 'Yonas Berhanu (Tewodros), Selamawit Alemu (Tiruwork), Dawit Fikre (Engida)',
        cast_list_am: 'ዮናስ ብርሃኑ (ቴዎድሮስ)፣ ሰላማዊት አለሙ (ጥሩወርቅ)፣ ዳዊት ፍቅሬ (እንግዳ)',
        duration_minutes: 110,
        poster_url: '/src/assets/images/theatre_stage_play_1793100135088.jpg',
        trailer_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        status: 'current',
        featured: 1
      },
      {
        id: crypto.randomUUID(),
        slug: 'ye-dem-adera-the-blood-oath',
        title_en: 'Ye’Dem Adera (The Sacred Covenant)',
        title_am: 'የደም አደራ',
        genre_en: 'Cultural Drama & Tragedy',
        genre_am: 'ባህላዊ ድራማ እና አሳዛኝ ክስተት',
        description_en: 'A moving theatrical exploration of Ethiopian ancestral covenants, generational reconciliation, and rural community ties.',
        description_am: 'የአባቶችን አደራ፣ የትውልድ እርቅን እና የህብረተሰብ ትስስርን በጥልቀት የሚመረምር ተወዳጅ ባህላዊ ቴአትር።',
        synopsis_en: 'When modern urban life challenges ancestral customs in a highlands village, two families must confront a decades-old reconciliation promise. Rich in poetic Amharic dialogues and traditional proverbs.',
        synopsis_am: 'በገጠሪቱ ኢትዮጵያ የቤተሰብ ክብርና የአባቶች አደራ ከዘመናዊው አለም አስተሳሰብ ጋር የሚያደርገውን ፍትጊያ የሚያሳይ ግሩም ድራማ።',
        director_en: 'Aster Bekele',
        director_am: 'አስቴር በቀለ',
        playwright_en: 'Hailemariam Gessese',
        playwright_am: 'ኃይለማርያም ገሰሰ',
        cast_list_en: 'Kebede Worku, Hiwot Girma, Tesfaye Desta',
        cast_list_am: 'ከበደ ወርቁ፣ ህይወት ግርማ፣ ተስፋዬ ደስታ',
        duration_minutes: 95,
        poster_url: '/src/assets/images/hero_ethiopian_theatre_1793100134111.jpg',
        trailer_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        status: 'upcoming',
        featured: 1
      },
      {
        id: crypto.randomUUID(),
        slug: 'ye-abate-kaba-the-fathers-cloak',
        title_en: 'Ye’Abate Kaba (The Royal Cloak)',
        title_am: 'የአባቴ ካባ',
        genre_en: 'Classic Stage Play',
        genre_am: 'ክላሲክ የመድረክ ቴአትር',
        description_en: 'A beloved family drama about legacy, justice, and filial responsibility set against royal provincial courts.',
        description_am: 'ስለ ቅርስ፣ ፍትህና የቤተሰብ ሀላፊነት የሚያስተምር ተወዳጅ ድራማ።',
        synopsis_en: 'An elder judge bestows his symbolic judicial cloak upon his rebellious youngest son, sparking a family conflict that tests the integrity of their community.',
        synopsis_am: 'አንድ ታዋቂ የባህል ዳኛ የፍትህ ካባቸውን ለትንሹ ልጃቸው ሲያወርሱ በቤተሰቡና በማህበረሰቡ ውስጥ የሚነሳውን ፈተና ይዳስሳል።',
        director_en: 'Mekonnen Tadesse',
        director_am: 'መኮንን ታደሰ',
        playwright_en: 'Solomon Derese',
        playwright_am: 'ሰለሞን ደረሰ',
        cast_list_en: 'Alemayehu Tura, Genet Mamo, Daniel Assefa',
        cast_list_am: 'አለማየሁ ቱራ፣ ገነት ማሞ፣ ዳንኤል አሰፋ',
        duration_minutes: 105,
        poster_url: '/src/assets/images/theatre_stage_play_1793100135088.jpg',
        trailer_url: '',
        status: 'repertoire',
        featured: 0
      }
    ];

    const insertPerf = db.prepare(`
      INSERT INTO performances (
        id, slug, title_en, title_am, genre_en, genre_am,
        description_en, description_am, synopsis_en, synopsis_am,
        director_en, director_am, playwright_en, playwright_am,
        cast_list_en, cast_list_am, duration_minutes, poster_url,
        trailer_url, status, featured
      ) VALUES (
        @id, @slug, @title_en, @title_am, @genre_en, @genre_am,
        @description_en, @description_am, @synopsis_en, @synopsis_am,
        @director_en, @director_am, @playwright_en, @playwright_am,
        @cast_list_en, @cast_list_am, @duration_minutes, @poster_url,
        @trailer_url, @status, @featured
      )
    `);

    for (const p of seedPerformances) {
      insertPerf.run(p);
    }
  }

  // Seed dance categories if empty
  const existingDances = db.prepare('SELECT id FROM dance_categories LIMIT 1').get();
  if (!existingDances) {
    const seedDances = [
      {
        id: crypto.randomUUID(),
        slug: 'eskista-gonder-gojjam',
        name_en: 'Eskista (Gonder & Gojjam)',
        name_am: 'እስክስታ (ጎንደር እና ጎጃም)',
        region_en: 'Amhara Highlands',
        region_am: 'አማራ ክልል',
        description_en: 'The world-renowned Ethiopian shoulder dance characterized by rapid rhythmic shoulder rolls, neck vibrations, and intricate chest isolations.',
        description_am: 'በዓለም ዙሪያ ታዋቂ የሆነውና ልዩ የትከሻ እንቅስቃሴ፣ የአንገት ቅላጼ እና ፈጣን ምት ያለው የአማራ ባህላዊ ውዝዋዜ።',
        costumes_en: 'Pure white hand-loomed Shemma/Kemis with gold embroidered tibeb borders, Gabi wrap, and cowrie-shell ornaments.',
        costumes_am: 'በወርቃማ ጥልፍ የተሸለመ ነጭ የሀበሻ ቀሚስ፣ ጋቢ እና የባህል ጌጣጌጦች።',
        rhythm_en: 'Syncopated 6/8 polyrhythm driven by Kebero drums, Kirar melodies, and Masenqo bow work.',
        rhythm_am: 'በከበሮ፣ በክራርና በመሰንቆ የታጀበ ልዩ የ6/8 ምት።',
        image_url: '/src/assets/images/dance_eskista_performance_1793100134639.jpg',
        video_url: '',
        is_available_booking: 1,
        order_index: 1
      },
      {
        id: crypto.randomUUID(),
        slug: 'guragigna',
        name_en: 'Guragigna (Gurage Rhythms)',
        name_am: 'ጉራጊኛ ውዝዋዜ',
        region_en: 'Gurage Zone / Central Ethiopia',
        region_am: 'ጉራጌ ዞን',
        description_en: 'A high-energy, acrobatic dance featuring rapid footwork, celebratory leaps, and rhythmic clapping honoring community festivals.',
        description_am: 'ፈጣን የእግር እንቅስቃሴ፣ ዝላይና ጭብጨባ የተዋሃደበት ደማቅና ልዩ ጉልበት የሚጠይቅ የጉራጌ ባህላዊ ውዝዋዜ።',
        costumes_en: 'Colorful embroidered vests, woven sash belts, leather anklets with brass bells, and hand-held cowtail whisks.',
        costumes_am: 'በደማቅ ጥልፍ የተሰሩ ልብሶች፣ የቆዳ ጌጦች፣ ቃጭልና ጭራ።',
        rhythm_en: 'Driving quadruple meter accelerating to whirlwind tempos accompanied by flute (Washint) and drums.',
        rhythm_am: 'በዋሽንት፣ ከበሮና ጭብጨባ የሚመራ ፈጣን የውዝዋዜ ምት።',
        image_url: '/src/assets/images/traditional_dance_troupe_1793100135241.jpg',
        video_url: '',
        is_available_booking: 1,
        order_index: 2
      },
      {
        id: crypto.randomUUID(),
        slug: 'oromo-shibo-shewa',
        name_en: 'Oromo (Shibo & Ragada)',
        name_am: 'ኦሮሚኛ (ሺቦ እና ረገዳ)',
        region_en: 'Oromia Region',
        region_am: 'ኦሮሚያ ክልል',
        description_en: 'Graceful yet powerful choreography featuring energetic head tosses, flowing circular formations, and stomping rhythms celebrating harvest and unity.',
        description_am: 'የራስ እንቅስቃሴ፣ የክብ ቅርጽ አሰላለፍና ጥንካሬ የተሞላበት የኦሮሞ ባህላዊ ውዝዋዜ።',
        costumes_en: 'Wandabo and Wayya dresses in bright reds and blacks, beaded necklaces, and ceremonial fly whisks.',
        costumes_am: 'ዋንዳቦ እና ወያ፣ በቀይና ጥቁር ቀለማት ያሸበረቁ አልባሳትና ዶቃዎች።',
        rhythm_en: 'Resonant call-and-response chorals accompanied by hand percussion and Atamo drums.',
        rhythm_am: 'በአታሞ፣ በክራርና በህብረት ዜማ የሚመራ ዜማ።',
        image_url: '/src/assets/images/traditional_dance_troupe_1793100135241.jpg',
        video_url: '',
        is_available_booking: 1,
        order_index: 3
      },
      {
        id: crypto.randomUUID(),
        slug: 'wolaita-southern-rhythms',
        name_en: 'Wolaita & Southern Rhythms',
        name_am: 'ወላይትኛ እና የደቡብ ውዝዋዜዎች',
        region_en: 'Southern Ethiopia (Wolaita / Sidama)',
        region_am: 'ደቡብ ኢትዮጵያ',
        description_en: 'Exuberant hip movements and syncopated bouncy step routines that embody celebratory harvest joy and warmth.',
        description_am: 'የወገብ ቅልጥፍና፣ ደማቅ ሳቅና የደስታ ስሜት የሚንጸባረቅበት ተወዳጅ የደቡብ ውዝዋዜ።',
        costumes_en: 'Multi-tiered brightly patterned cotton skirts, cowrie shells, and yellow-red woven headbands.',
        costumes_am: 'ባለብዙ ቀለም ጥልፍ ቀሚሶች፣ የዛጎል ጌጣጌጦችና ራስ ማሰሪያዎች።',
        rhythm_en: 'Polyrhythmic bamboo trumpets (Dinke) and syncopated clapping patterns.',
        rhythm_am: 'በዲንቄ፣ ከበሮና ፈጣን ምት የታጀበ የሙዚቃ ቅላጼ።',
        image_url: '/src/assets/images/dance_eskista_performance_1793100134639.jpg',
        video_url: '',
        is_available_booking: 1,
        order_index: 4
      },
      {
        id: crypto.randomUUID(),
        slug: 'tigrigna',
        name_en: 'Tigrigna (Ashenda & Guayla)',
        name_am: 'ትግርኛ (አሸንዳ እና ጓይላ)',
        region_en: 'Tigray Region',
        region_am: 'ትግራይ ክልል',
        description_en: 'Circular celebratory dance characterized by rhythmic bounce, synchronized shoulder shifts, and joyful melodic clapping.',
        description_am: 'የክብ አሰላለፍ፣ የተጣጣመ የትከሻ እንቅስቃሴና የደስታ ጭብጨባ የያዘ የትግራይ ባህላዊ ውዝዋዜ።',
        costumes_en: 'Zuria dresses with golden embroidery, braided Albaso hairstyles, and traditional silver earrings.',
        costumes_am: 'ዙሪያ ቀሚስ፣ የአልባሶ የጸጉር አሰራርና የብር ጌጣጌጦች።',
        rhythm_en: 'Smooth 4/4 syncopated bounce driven by Kirar riffs and hand claps.',
        rhythm_am: 'በክራርና በከበሮ ታጅቦ የሚቀርብ የተረጋጋና ማራኪ ምት።',
        image_url: '/src/assets/images/dance_eskista_performance_1793100134639.jpg',
        video_url: '',
        is_available_booking: 1,
        order_index: 5
      },
      {
        id: crypto.randomUUID(),
        slug: 'wollo-ambassel',
        name_en: 'Wollo (Ambassel & Tizita)',
        name_am: 'ወሎ (አምባሰል እና ባቲ)',
        region_en: 'Wollo Province',
        region_am: 'ወሎ ክፍለ ሀገር',
        description_en: 'Lyrical and soulful performance pairing poetic recitations with gentle swaying and sudden explosive shoulder pops.',
        description_am: 'ስሜት ቀስቃሽ ግጥሞችና ዜማዎች ከስስ የትከሻ ንቅናቄ ጋር የተዋሃዱበት የወሎ ውዝዋዜ።',
        costumes_en: 'Wollo silk embroidered vests, soft white turbans, and red-trimmed shawls.',
        costumes_am: 'የወሎ ባህላዊ ካባ፣ ሻሽና በጥልፍ ያሸበረቁ ልብሶች።',
        rhythm_en: 'Haunting Ambassel kiñit (modal tuning) transitioning to lively celebratory beats.',
        rhythm_am: 'በአምባሰል ቅኝት የሚጀምርና ወደ ደማቅ የከበሮ ምት የሚቀየር ዜማ።',
        image_url: '/src/assets/images/hero_ethiopian_theatre_1793100134111.jpg',
        video_url: '',
        is_available_booking: 1,
        order_index: 6
      }
    ];

    const insertDance = db.prepare(`
      INSERT INTO dance_categories (
        id, slug, name_en, name_am, region_en, region_am,
        description_en, description_am, costumes_en, costumes_am,
        rhythm_en, rhythm_am, image_url, video_url, is_available_booking, order_index
      ) VALUES (
        @id, @slug, @name_en, @name_am, @region_en, @region_am,
        @description_en, @description_am, @costumes_en, @costumes_am,
        @rhythm_en, @rhythm_am, @image_url, @video_url, @is_available_booking, @order_index
      )
    `);

    for (const d of seedDances) {
      insertDance.run(d);
    }
  }

  // Seed events if empty
  const existingEvents = db.prepare('SELECT id FROM events LIMIT 1').get();
  if (!existingEvents) {
    const seedEvents = [
      {
        id: crypto.randomUUID(),
        slug: 'grand-cultural-gala-2026',
        title_en: 'Grand Ethiopian Heritage Night',
        title_am: 'ታላቁ የኢትዮጵያ የቅርስ ምሽት',
        category_en: 'Theatre & Dance Showcase',
        category_am: 'የቴአትርና ውዝዋዜ ድግስ',
        description_en: 'A premier cultural evening showcasing 3 theatrical acts, traditional dancers from 8 Ethiopian regions, and live acoustic orchestra.',
        description_am: 'ሶስት የመድረክ ድራማዎች፣ የ8 ክልሎች ባህላዊ ውዝዋዜዎችና የቀጥታ የባህል ኦርኬስትራ የሚቀርብበት ልዩ ምሽት።',
        event_date: '2026-11-20',
        event_time: '6:30 PM - 10:00 PM',
        venue_en: 'Ethiopian National Theatre Main Hall',
        venue_am: 'የኢትዮጵያ ብሔራዊ ቴአትር ዋና አዳራሽ',
        city_en: 'Addis Ababa',
        city_am: 'አዲስ አበባ',
        ticket_info_en: 'VIP: 1,500 ETB / Regular: 600 ETB',
        ticket_info_am: 'ቪ አይ ፒ፡ 1,500 ብር / መደበኛ፡ 600 ብር',
        ticket_url: 'https://telebirr.et',
        poster_url: '/src/assets/images/hero_ethiopian_theatre_1793100134111.jpg',
        status: 'upcoming'
      },
      {
        id: crypto.randomUUID(),
        slug: 'tewodros-theatre-weekend',
        title_en: 'Tewodros: Fire of Unity (Stage Season)',
        title_am: 'ቴዎድሮስ፡ የእሳት አንድነት (የመድረክ ትርኢት)',
        category_en: 'Historical Theatre',
        category_am: 'ታሪካዊ ቴአትር',
        description_en: 'Special weekend matinee and evening performances of the acclaimed historical stage production.',
        description_am: 'የተወዳጁ ታሪካዊ ድራማ ልዩ የሳምንቱ መጨረሻ ትርኢት።',
        event_date: '2026-12-05',
        event_time: '3:00 PM & 6:00 PM',
        venue_en: 'Hager Fikir Theatre',
        venue_am: 'ሀገር ፍቅር ቴአትር',
        city_en: 'Addis Ababa',
        city_am: 'አዲስ አበባ',
        ticket_info_en: 'General Admission: 500 ETB',
        ticket_info_am: 'መደበኛ መግቢያ፡ 500 ብር',
        ticket_url: '',
        poster_url: '/src/assets/images/theatre_stage_play_1793100135088.jpg',
        status: 'upcoming'
      },
      {
        id: crypto.randomUUID(),
        slug: 'african-union-cultural-night',
        title_en: 'Pan-African Cultural Summit Showcase',
        title_am: 'የአፍሪካ አንድነት ባህላዊ ትርኢት',
        category_en: 'Cultural Diplomacy',
        category_am: 'የባህል ዲፕሎማሲ',
        description_en: 'An exclusive cultural gala presented for international delegates, diplomatic missions, and cultural ambassadors.',
        description_am: 'ለአለም አቀፍ እንግዶችና ዲፕሎማቶች የቀረበ ደማቅ የባህል ትርኢት።',
        event_date: '2026-09-15',
        event_time: '7:00 PM',
        venue_en: 'African Union Conference Hall',
        venue_am: 'የአፍሪካ ህብረት የስብሰባ ማዕከል',
        city_en: 'Addis Ababa',
        city_am: 'አዲስ አበባ',
        ticket_info_en: 'By Invitation Only',
        ticket_info_am: 'በግብዣ ብቻ',
        ticket_url: '',
        poster_url: '/src/assets/images/traditional_dance_troupe_1793100135241.jpg',
        status: 'completed'
      }
    ];

    const insertEvent = db.prepare(`
      INSERT INTO events (
        id, slug, title_en, title_am, category_en, category_am,
        description_en, description_am, event_date, event_time,
        venue_en, venue_am, city_en, city_am, ticket_info_en,
        ticket_info_am, ticket_url, poster_url, status
      ) VALUES (
        @id, @slug, @title_en, @title_am, @category_en, @category_am,
        @description_en, @description_am, @event_date, @event_time,
        @venue_en, @venue_am, @city_en, @city_am, @ticket_info_en,
        @ticket_info_am, @ticket_url, @poster_url, @status
      )
    `);

    for (const ev of seedEvents) {
      insertEvent.run(ev);
    }
  }

  // Seed gallery items if empty
  const existingGallery = db.prepare('SELECT id FROM gallery_items LIMIT 1').get();
  if (!existingGallery) {
    const seedGallery = [
      {
        id: crypto.randomUUID(),
        title_en: 'Grand Historical Theatre Ensemble',
        title_am: 'የታሪካዊ ቴአትር ተዋንያን በመድረክ ላይ',
        category: 'theatre',
        media_type: 'image',
        media_url: '/src/assets/images/hero_ethiopian_theatre_1793100134111.jpg',
        thumbnail_url: '/src/assets/images/hero_ethiopian_theatre_1793100134111.jpg',
        caption_en: 'Full cast on the main stage of the National Theatre during the climax of Tewodros: Fire of Unity.',
        caption_am: 'የቴዎድሮስ ቴአትር የመጨረሻ ድራማዊ ክፍል በብሔራዊ ቴአትር መድረክ።',
        featured: 1
      },
      {
        id: crypto.randomUUID(),
        title_en: 'Eskista Traditional Dancers with Live Kebero',
        title_am: 'የእስክስታ ባህላዊ ውዝዋዜ ከነከበሮው',
        category: 'dance',
        media_type: 'image',
        media_url: '/src/assets/images/dance_eskista_performance_1793100134639.jpg',
        thumbnail_url: '/src/assets/images/dance_eskista_performance_1793100134639.jpg',
        caption_en: 'Dancers performing swift shoulder oscillations dressed in hand-woven Habesha Kemis.',
        caption_am: 'በእጅ የተሸመነ የሀበሻ ቀሚስ የለበሱ ወዛዋዦች ፈጣን የትከሻ ውዝዋዜ ሲያቀርቡ።',
        featured: 1
      },
      {
        id: crypto.randomUUID(),
        title_en: 'Cultural Troupe with Traditional Instruments',
        title_am: 'የባህል ሙዚቀኞችና ተዋንያን ከባህላዊ የሙዚቃ መሳሪያዎች ጋር',
        category: 'rehearsal',
        media_type: 'image',
        media_url: '/src/assets/images/traditional_dance_troupe_1793100135241.jpg',
        thumbnail_url: '/src/assets/images/traditional_dance_troupe_1793100135241.jpg',
        caption_en: 'Musicians playing Kirar, Masenqo, and Kebero before an international performance tour.',
        caption_am: 'ክራር፣ መሰንቆና ከበሮ የያዙ የባህል አባላት ከጉዞ በፊት ባደረጉት ዝግጅት።',
        featured: 1
      },
      {
        id: crypto.randomUUID(),
        title_en: 'Climactic Scene of the Imperial Court',
        title_am: 'የንጉሳዊ ፍርድ ቤት የመድረክ ክስተት',
        category: 'theatre',
        media_type: 'image',
        media_url: '/src/assets/images/theatre_stage_play_1793100135088.jpg',
        thumbnail_url: '/src/assets/images/theatre_stage_play_1793100135088.jpg',
        caption_en: 'Actor depicting imperial decree with rich royal velvet cape and golden embroidery.',
        caption_am: 'ንጉሳዊ ካባ የለበሱ ተዋናይ በመድረክ ላይ የፍርድ ንግግር ሲያደርጉ።',
        featured: 1
      }
    ];

    const insertGal = db.prepare(`
      INSERT INTO gallery_items (
        id, title_en, title_am, category, media_type,
        media_url, thumbnail_url, caption_en, caption_am, featured
      ) VALUES (
        @id, @title_en, @title_am, @category, @media_type,
        @media_url, @thumbnail_url, @caption_en, @caption_am, @featured
      )
    `);

    for (const g of seedGallery) {
      insertGal.run(g);
    }
  }

  // Seed testimonials if empty
  const existingTestimonials = db.prepare('SELECT id FROM testimonials LIMIT 1').get();
  if (!existingTestimonials) {
    const seedTestimonials = [
      {
        id: crypto.randomUUID(),
        author_en: 'Dr. Berhanu Gebremariam',
        author_am: 'ዶ/ር ብርሃኑ ገብረማርያም',
        role_en: 'Director of Cultural Exchange',
        role_am: 'የባህል ልውውጥ ዳይሬክተር',
        organization_en: 'Ethiopian Cultural Heritage Trust',
        organization_am: 'የኢትዮጵያ ባህል ቅርስ ትረስት',
        quote_en: 'Telos Tiyator’s staging of historical plays is among the most authentic and emotionally resonant theatre experiences in Addis Ababa. Their dedication to genuine cultural costuming and language is remarkable.',
        quote_am: 'ቴሎስ ቲያትር የሚያቀርባቸው ታሪካዊ ስራዎች በአዲስ አበባ ካየኋቸው እጅግ ልብ የሚነኩና ባህሉን በታማኝነት የጠበቁ ናቸው። ለአልባሳትና ለቋንቋ ያላቸው ክብር እጅግ የሚያስመሰግን ነው።',
        rating: 5,
        event_context_en: 'Annual Cultural Festival',
        event_context_am: 'ዓመታዊ የባህል ፌስቲቫል'
      },
      {
        id: crypto.randomUUID(),
        author_en: 'Rahel Solomon',
        author_am: 'ራሄል ሰለሞን',
        role_en: 'Senior Event Producer',
        role_am: 'ዋና የዝግጅት አዘጋጅ',
        organization_en: 'Habesha Global Weddings & Galas',
        organization_am: 'ሀበሻ ግሎባል ሰርግና ዝግጅቶች',
        quote_en: 'We booked the Telos Traditional Dance Troupe for an international diplomatic reception. Their 6-region medley captivated every guest. Unmatched punctuality, artistry, and crowd energy.',
        quote_am: 'ለአንድ ዲፕሎማሲያዊ ዝግጅት የቴሎስ የባህል ውዝዋዜ ቡድንን አስይዘን ነበር። የ6ቱንም ክልሎች ውዝዋዜ ያቀረቡበት መንገድ እንግዶቻችንን አስደምሟል። ሰዓት አክባሪነታቸውና ጥበባቸው ወደር የለውም።',
        rating: 5,
        event_context_en: 'Diplomatic Gala',
        event_context_am: 'ዲፕሎማሲያዊ ምሽት'
      }
    ];

    const insertTest = db.prepare(`
      INSERT INTO testimonials (
        id, author_en, author_am, role_en, role_am,
        organization_en, organization_am, quote_en, quote_am,
        rating, event_context_en, event_context_am
      ) VALUES (
        @id, @author_en, @author_am, @role_en, @role_am,
        @organization_en, @organization_am, @quote_en, @quote_am,
        @rating, @event_context_en, @event_context_am
      )
    `);

    for (const t of seedTestimonials) {
      insertTest.run(t);
    }
  }

  // Seed sample booking requests if empty
  const existingBookings = db.prepare('SELECT id FROM booking_requests LIMIT 1').get();
  if (!existingBookings) {
    const seedBookings = [
      {
        id: crypto.randomUUID(),
        booking_code: 'TELOS-2026-7841',
        full_name: 'Solomon Tekle',
        phone: '+251 92 345 6789',
        email: 'solomon.tekle@oromoheritage.org',
        organization: 'Oromia Cultural Foundation',
        event_type: 'cultural_celebration',
        event_date: '2026-11-28',
        event_location: 'Skylight Hotel, Addis Ababa',
        audience_size: '300-500 guests',
        preferred_performance: 'Full Regional Traditional Dance Package',
        additional_requirements: 'Needs live Kebero drums, Kirar accompaniment, and wedding entrance choreography.',
        status: 'under_review',
        admin_notes: 'Spoke with client on phone. Quoted preliminary rate, waiting for schedule sign-off.'
      },
      {
        id: crypto.randomUUID(),
        booking_code: 'TELOS-2026-9214',
        full_name: 'Elena Rostova',
        phone: '+251 91 987 6543',
        email: 'events@embassy-cultural.org',
        organization: 'International Diplomatic Mission',
        event_type: 'corporate_diplomatic',
        event_date: '2026-12-14',
        event_location: 'Sheraton Addis Grand Ballroom',
        audience_size: '200-300 delegates',
        preferred_performance: 'Stage Play Excerpt + Eskista & Wolaita Medley',
        additional_requirements: 'English synopsis briefing before performance begins.',
        status: 'new',
        admin_notes: 'New inquiry received via website.'
      }
    ];

    const insertBooking = db.prepare(`
      INSERT INTO booking_requests (
        id, booking_code, full_name, phone, email, organization,
        event_type, event_date, event_location, audience_size,
        preferred_performance, additional_requirements, status, admin_notes
      ) VALUES (
        @id, @booking_code, @full_name, @phone, @email, @organization,
        @event_type, @event_date, @event_location, @audience_size,
        @preferred_performance, @additional_requirements, @status, @admin_notes
      )
    `);

    for (const b of seedBookings) {
      insertBooking.run(b);
    }
  }

  // Seed sample contact messages if empty
  const existingMessages = db.prepare('SELECT id FROM contact_messages LIMIT 1').get();
  if (!existingMessages) {
    const seedMsgs = [
      {
        id: crypto.randomUUID(),
        full_name: 'Kassahun Melaku',
        email: 'kassahun.m@gmail.com',
        phone: '+251 91 144 5566',
        subject: 'Audition inquiry for upcoming historical play',
        message: 'Greetings Telos Theatre directors. I am a theatre graduate from Addis Ababa University with 4 years experience in classical stage drama. How can I submit my portfolio for upcoming auditions?',
        is_read: 0,
        admin_reply: null
      }
    ];

    const insertMsg = db.prepare(`
      INSERT INTO contact_messages (
        id, full_name, email, phone, subject, message, is_read, admin_reply
      ) VALUES (
        @id, @full_name, @email, @phone, @subject, @message, @is_read, @admin_reply
      )
    `);

    for (const m of seedMsgs) {
      insertMsg.run(m);
    }
  }
}
