export interface OrganizationSettings {
  id: string;
  org_name_en: string;
  org_name_am: string;
  headline_en: string;
  headline_am: string;
  subheadline_en: string;
  subheadline_am: string;
  about_en: string;
  about_am: string;
  mission_en: string;
  mission_am: string;
  vision_en: string;
  vision_am: string;
  phone: string;
  email: string;
  booking_email: string;
  address_en: string;
  address_am: string;
  business_hours_en: string;
  business_hours_am: string;
  social_facebook?: string;
  social_instagram?: string;
  social_youtube?: string;
  social_tiktok?: string;
}

export interface Performance {
  id: string;
  slug: string;
  title_en: string;
  title_am: string;
  genre_en: string;
  genre_am: string;
  description_en: string;
  description_am: string;
  synopsis_en: string;
  synopsis_am: string;
  director_en: string;
  director_am: string;
  playwright_en?: string;
  playwright_am?: string;
  cast_list_en?: string;
  cast_list_am?: string;
  duration_minutes: number;
  poster_url: string;
  trailer_url?: string;
  status: 'upcoming' | 'current' | 'repertoire';
  featured: number;
  created_at?: string;
}

export interface DanceCategory {
  id: string;
  slug: string;
  name_en: string;
  name_am: string;
  region_en: string;
  region_am: string;
  description_en: string;
  description_am: string;
  costumes_en: string;
  costumes_am: string;
  rhythm_en: string;
  rhythm_am: string;
  image_url: string;
  video_url?: string;
  is_available_booking: number;
  order_index: number;
}

export interface EventItem {
  id: string;
  slug: string;
  title_en: string;
  title_am: string;
  category_en: string;
  category_am: string;
  description_en: string;
  description_am: string;
  event_date: string;
  event_time: string;
  venue_en: string;
  venue_am: string;
  city_en: string;
  city_am: string;
  ticket_info_en?: string;
  ticket_info_am?: string;
  ticket_url?: string;
  poster_url: string;
  status: 'upcoming' | 'completed' | 'sold_out';
  created_at?: string;
}

export interface GalleryItem {
  id: string;
  title_en: string;
  title_am: string;
  category: 'theatre' | 'dance' | 'rehearsal' | 'events';
  media_type: 'image' | 'video';
  media_url: string;
  thumbnail_url?: string;
  caption_en?: string;
  caption_am?: string;
  featured: number;
  created_at?: string;
}

export interface BookingRequest {
  id: string;
  booking_code: string;
  full_name: string;
  phone: string;
  email: string;
  organization?: string;
  event_type: string;
  event_date: string;
  event_location: string;
  audience_size: string;
  preferred_performance: string;
  additional_requirements?: string;
  status: 'new' | 'under_review' | 'approved' | 'rejected' | 'completed';
  admin_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ContactMessage {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  is_read: number;
  admin_reply?: string;
  created_at: string;
}

export interface Testimonial {
  id: string;
  author_en: string;
  author_am: string;
  role_en: string;
  role_am: string;
  organization_en: string;
  organization_am: string;
  quote_en: string;
  quote_am: string;
  rating: number;
  event_context_en?: string;
  event_context_am?: string;
  created_at?: string;
}

export interface AdminStats {
  totalBookings: number;
  newBookings: number;
  totalPerformances: number;
  totalDances: number;
  totalEvents: number;
  unreadMessages: number;
  totalSubscribers: number;
  totalMembers?: number;
}

export interface UserMember {
  id: string;
  membership_code: string;
  full_name: string;
  phone: string;
  fayda_id: string;
  email: string;
  city?: string;
  preferred_interest: 'theatre' | 'dance' | 'both';
  role?: string;
  created_at?: string;
}
