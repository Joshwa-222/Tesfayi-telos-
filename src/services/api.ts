import {
  OrganizationSettings,
  Performance,
  DanceCategory,
  EventItem,
  GalleryItem,
  BookingRequest,
  ContactMessage,
  Testimonial,
  AdminStats
} from '../types/index.ts';

const TOKEN_KEY = 'telos_admin_token';
const USER_TOKEN_KEY = 'telos_user_token';

export const authStorage = {
  getToken: () => localStorage.getItem(TOKEN_KEY),
  setToken: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clearToken: () => localStorage.removeItem(TOKEN_KEY),
};

export const userAuthStorage = {
  getToken: () => localStorage.getItem(USER_TOKEN_KEY),
  setToken: (token: string) => localStorage.setItem(USER_TOKEN_KEY, token),
  clearToken: () => localStorage.removeItem(USER_TOKEN_KEY),
};

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const adminToken = authStorage.getToken();
  const userToken = userAuthStorage.getToken();
  const token = adminToken || userToken;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || `HTTP error ${response.status}`);
  }

  return data as T;
}

export const api = {
  // Public
  getOrganization: () => request<OrganizationSettings>('/api/organization'),
  getPerformances: (params?: { status?: string; featured?: boolean; search?: string }) => {
    const q = new URLSearchParams();
    if (params?.status) q.append('status', params.status);
    if (params?.featured) q.append('featured', '1');
    if (params?.search) q.append('search', params.search);
    return request<Performance[]>(`/api/performances?${q.toString()}`);
  },
  getPerformanceBySlug: (slug: string) => request<Performance>(`/api/performances/${slug}`),
  getDanceCategories: () => request<DanceCategory[]>('/api/dance-categories'),
  getEvents: (status?: string) => {
    const q = status ? `?status=${status}` : '';
    return request<EventItem[]>(`/api/events${q}`);
  },
  getGallery: (category?: string, mediaType?: string) => {
    const q = new URLSearchParams();
    if (category) q.append('category', category);
    if (mediaType) q.append('mediaType', mediaType);
    return request<GalleryItem[]>(`/api/gallery?${q.toString()}`);
  },
  getTestimonials: () => request<Testimonial[]>('/api/testimonials'),
  submitBooking: (bookingData: any) =>
    request<{ success: boolean; bookingCode: string; messageEn: string; messageAm: string }>('/api/bookings', {
      method: 'POST',
      body: JSON.stringify(bookingData),
    }),
  checkBookingStatus: (code: string) =>
    request<{
      booking_code: string;
      full_name: string;
      event_type: string;
      event_date: string;
      event_location: string;
      status: string;
      created_at: string;
    }>(`/api/bookings/status/${code}`),
  submitContact: (contactData: any) =>
    request<{ success: boolean; messageEn: string; messageAm: string }>('/api/contact', {
      method: 'POST',
      body: JSON.stringify(contactData),
    }),
  subscribeNewsletter: (email: string) =>
    request<{ success: boolean; messageEn: string; messageAm: string }>('/api/newsletter', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  // Auth
  login: (credentials: { email: string; password: string }) =>
    request<{ success: boolean; token: string; user: any }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),
  getMe: () => request<{ user: any }>('/api/auth/me'),

  // Admin
  getAdminStats: () => request<AdminStats>('/api/admin/stats'),
  updateOrganization: (settings: any) =>
    request<{ success: boolean }>('/api/admin/organization', {
      method: 'PUT',
      body: JSON.stringify(settings),
    }),
  getAdminBookings: (status?: string) => {
    const q = status ? `?status=${status}` : '';
    return request<BookingRequest[]>(`/api/admin/bookings${q}`);
  },
  updateBookingStatus: (id: string, payload: { status: string; adminNotes?: string }) =>
    request<{ success: boolean }>(`/api/admin/bookings/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
  savePerformance: (data: any, id?: string) =>
    request<{ success: boolean; id: string }>(id ? `/api/admin/performances/${id}` : '/api/admin/performances', {
      method: id ? 'PUT' : 'POST',
      body: JSON.stringify(data),
    }),
  deletePerformance: (id: string) =>
    request<{ success: boolean }>(`/api/admin/performances/${id}`, { method: 'DELETE' }),
  saveEvent: (data: any, id?: string) =>
    request<{ success: boolean; id: string }>(id ? `/api/admin/events/${id}` : '/api/admin/events', {
      method: id ? 'PUT' : 'POST',
      body: JSON.stringify(data),
    }),
  deleteEvent: (id: string) =>
    request<{ success: boolean }>(`/api/admin/events/${id}`, { method: 'DELETE' }),
  saveGalleryItem: (data: any) =>
    request<{ success: boolean; id: string }>('/api/admin/gallery', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  deleteGalleryItem: (id: string) =>
    request<{ success: boolean }>(`/api/admin/gallery/${id}`, { method: 'DELETE' }),
  getContactMessages: () => request<ContactMessage[]>('/api/admin/contact-messages'),
  updateContactMessage: (id: string, payload: { is_read: boolean; admin_reply?: string }) =>
    request<{ success: boolean }>(`/api/admin/contact-messages/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
  deleteContactMessage: (id: string) =>
    request<{ success: boolean }>(`/api/admin/contact-messages/${id}`, { method: 'DELETE' }),
  saveTestimonial: (data: any) =>
    request<{ success: boolean; id: string }>('/api/admin/testimonials', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  deleteTestimonial: (id: string) =>
    request<{ success: boolean }>(`/api/admin/testimonials/${id}`, { method: 'DELETE' }),

  // User / Member Registration & Auth
  registerMember: (data: {
    fullName: string;
    phone: string;
    faydaId: string;
    email: string;
    password: string;
    city?: string;
    preferredInterest?: string;
  }) =>
    request<{
      success: boolean;
      token: string;
      user: any;
      messageEn: string;
      messageAm: string;
    }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  loginMember: (credentials: { identifier: string; password: string }) =>
    request<{ success: boolean; token: string; user: any }>('/api/auth/user-login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),

  getUserProfile: () =>
    request<{ user: any; bookings: BookingRequest[] }>('/api/user/profile'),

  updateUserProfile: (data: { fullName: string; phone: string; city?: string; preferredInterest?: string }) =>
    request<{ success: boolean; user: any }>('/api/user/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  getAdminMembers: () =>
    request<any[]>('/api/admin/members'),
};
