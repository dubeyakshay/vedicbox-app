import { supabase, isSupabaseConfigured } from './supabase';

// ==========================================
// PRODUCTS API
// ==========================================

export async function fetchProducts(filters?: {
  category?: string;
  search?: string;
  forType?: string;
  festivalSpecial?: boolean;
  bestseller?: boolean;
  isNew?: boolean;
  sort?: string;
}) {
  if (!isSupabaseConfigured()) return null;

  let query = supabase.from('products').select('*');

  if (filters?.category && filters.category !== 'all') {
    query = query.eq('category', filters.category);
  }
  if (filters?.search) {
    query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%,name_hindi.ilike.%${filters.search}%`);
  }
  if (filters?.forType && filters.forType !== 'all') {
    query = query.contains('for_type', [filters.forType]);
  }
  if (filters?.festivalSpecial) {
    query = query.eq('is_festival_special', true);
  }
  if (filters?.bestseller) {
    query = query.eq('is_bestseller', true);
  }
  if (filters?.isNew) {
    query = query.eq('is_new', true);
  }

  switch (filters?.sort) {
    case 'price-low': query = query.order('price', { ascending: true }); break;
    case 'price-high': query = query.order('price', { ascending: false }); break;
    case 'rating': query = query.order('rating', { ascending: false }); break;
    case 'discount': query = query.order('discount', { ascending: false }); break;
    default: query = query.order('review_count', { ascending: false });
  }

  const { data, error } = await query;
  if (error) { console.error('Fetch products error:', error); return null; }
  return data;
}

export async function fetchProductById(id: string) {
  if (!isSupabaseConfigured()) return null;
  const { data, error } = await supabase.from('products').select('*').eq('id', id).single();
  if (error) { console.error('Fetch product error:', error); return null; }
  return data;
}

// ==========================================
// REVIEWS API
// ==========================================

export async function fetchReviews(productId: string) {
  if (!isSupabaseConfigured()) return null;
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('product_id', productId)
    .order('created_at', { ascending: false });
  if (error) { console.error('Fetch reviews error:', error); return null; }
  return data;
}

export async function submitReview(productId: string, rating: number, comment: string, userName: string) {
  if (!isSupabaseConfigured()) return null;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase.from('reviews').insert({
    product_id: productId,
    user_id: user.id,
    user_name: userName,
    rating,
    comment,
    is_verified: true,
  }).select().single();

  if (error) { console.error('Submit review error:', error); return null; }
  return data;
}

// ==========================================
// ORDERS API
// ==========================================

export async function createOrder(orderData: {
  items: Array<{ productId: string; productName: string; quantity: number; price: number; image: string }>;
  subtotal: number;
  couponCode?: string;
  couponDiscount?: number;
  shippingCharge: number;
  totalAmount: number;
  paymentMethod: string;
  shippingAddress: Record<string, string>;
}) {
  if (!isSupabaseConfigured()) return null;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const orderId = 'VB' + Date.now().toString().slice(-8);
  const { data, error } = await supabase.from('orders').insert({
    id: orderId,
    user_id: user.id,
    items: orderData.items,
    subtotal: orderData.subtotal,
    coupon_code: orderData.couponCode || null,
    coupon_discount: orderData.couponDiscount || 0,
    shipping_charge: orderData.shippingCharge,
    total_amount: orderData.totalAmount,
    payment_method: orderData.paymentMethod,
    payment_status: orderData.paymentMethod === 'cod' ? 'pending' : 'paid',
    shipping_address: orderData.shippingAddress,
    status: 'placed',
    status_history: [{ status: 'placed', timestamp: new Date().toISOString(), note: 'Order placed successfully' }],
  }).select().single();

  if (error) { console.error('Create order error:', error); return null; }
  return data;
}

export async function fetchOrders() {
  if (!isSupabaseConfigured()) return null;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) { console.error('Fetch orders error:', error); return null; }
  return data;
}

// ==========================================
// COUPONS API
// ==========================================

export async function validateCoupon(code: string) {
  if (!isSupabaseConfigured()) return null;
  const { data, error } = await supabase
    .from('coupons')
    .select('*')
    .eq('code', code.toUpperCase())
    .eq('is_active', true)
    .single();

  if (error || !data) return null;

  const now = new Date();
  if (data.valid_until && new Date(data.valid_until) < now) return null;
  if (data.usage_limit && data.used_count >= data.usage_limit) return null;

  return { code: data.code, discountPercent: data.discount_percent, maxDiscount: data.max_discount, minOrderAmount: data.min_order_amount };
}

// ==========================================
// CONSULTATION API
// ==========================================

export async function bookConsultation(consultationData: {
  consultantName: string;
  type: string;
  mode: string;
  date: string;
  time: string;
  price: number;
}) {
  if (!isSupabaseConfigured()) return null;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase.from('consultations').insert({
    user_id: user.id,
    consultant_name: consultationData.consultantName,
    type: consultationData.type,
    mode: consultationData.mode,
    consultation_date: consultationData.date,
    consultation_time: consultationData.time,
    price: consultationData.price,
    payment_status: 'paid',
    status: 'booked',
  }).select().single();

  if (error) { console.error('Book consultation error:', error); return null; }
  return data;
}

// ==========================================
// SUBSCRIPTIONS API
// ==========================================

export async function createSubscription(planId: string, planName: string, price: number, frequency: string) {
  if (!isSupabaseConfigured()) return null;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const nextDate = new Date();
  nextDate.setMonth(nextDate.getMonth() + (frequency === 'quarterly' ? 3 : 1));

  const { data, error } = await supabase.from('subscriptions').insert({
    user_id: user.id,
    plan_id: planId,
    plan_name: planName,
    price,
    frequency,
    status: 'active',
    next_delivery_date: nextDate.toISOString().split('T')[0],
  }).select().single();

  if (error) { console.error('Create subscription error:', error); return null; }
  return data;
}

export async function updateSubscription(id: string, status: 'active' | 'paused' | 'cancelled') {
  if (!isSupabaseConfigured()) return null;
  const updates: Record<string, unknown> = { status };
  if (status === 'paused') updates.paused_at = new Date().toISOString();
  if (status === 'cancelled') updates.cancelled_at = new Date().toISOString();

  const { data, error } = await supabase.from('subscriptions').update(updates).eq('id', id).select().single();
  if (error) { console.error('Update subscription error:', error); return null; }
  return data;
}

// ==========================================
// PROFILE API
// ==========================================

export async function fetchProfile() {
  if (!isSupabaseConfigured()) return null;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single();
  if (error) { console.error('Fetch profile error:', error); return null; }
  return data;
}

export async function updateProfile(updates: { name?: string; phone?: string; addresses?: unknown[] }) {
  if (!isSupabaseConfigured()) return null;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase.from('profiles').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', user.id).select().single();
  if (error) { console.error('Update profile error:', error); return null; }
  return data;
}

export async function updateWishlist(wishlist: string[]) {
  if (!isSupabaseConfigured()) return null;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { error } = await supabase.from('profiles').update({ wishlist }).eq('id', user.id);
  if (error) console.error('Update wishlist error:', error);
}

// ==========================================
// AUTH API
// ==========================================

export async function signInWithOtp(phone: string) {
  if (!isSupabaseConfigured()) return null;
  const { data, error } = await supabase.auth.signInWithOtp({ phone: `+91${phone}` });
  if (error) { console.error('OTP error:', error); return null; }
  return data;
}

export async function verifyOtp(phone: string, token: string) {
  if (!isSupabaseConfigured()) return null;
  const { data, error } = await supabase.auth.verifyOtp({ phone: `+91${phone}`, token, type: 'sms' });
  if (error) { console.error('Verify OTP error:', error); return null; }
  return data;
}

export async function signInWithGoogle() {
  if (!isSupabaseConfigured()) return null;
  const { data, error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
  if (error) { console.error('Google auth error:', error); return null; }
  return data;
}

export async function signOut() {
  if (!isSupabaseConfigured()) return;
  await supabase.auth.signOut();
}

export async function getSession() {
  if (!isSupabaseConfigured()) return null;
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

// ==========================================
// DAILY TIPS API
// ==========================================

export async function fetchDailyTips() {
  if (!isSupabaseConfigured()) return null;
  const { data, error } = await supabase.from('daily_tips').select('*').eq('is_active', true);
  if (error) { console.error('Fetch tips error:', error); return null; }
  return data;
}

// ==========================================
// NOTIFICATIONS API
// ==========================================

export async function fetchNotifications() {
  if (!isSupabaseConfigured()) return null;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('sent_at', { ascending: false })
    .limit(20);

  if (error) { console.error('Fetch notifications error:', error); return null; }
  return data;
}
