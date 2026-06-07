import { supabase, isSupabaseConfigured } from './supabase';

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

export async function updateWishlist(wishlist: string[]) {
  if (!isSupabaseConfigured()) return null;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { error } = await supabase.from('profiles').update({ wishlist }).eq('id', user.id);
  if (error) console.error('Update wishlist error:', error);
}

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

export async function fetchProducts() {
  if (!isSupabaseConfigured()) return null;
  const { data, error } = await supabase.from('products').select('*').order('review_count', { ascending: false });
  if (error) { console.error('Fetch products error:', error); return null; }
  return data;
}

export async function fetchOrders() {
  if (!isSupabaseConfigured()) return null;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data, error } = await supabase.from('orders').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
  if (error) { console.error('Fetch orders error:', error); return null; }
  return data;
}

export async function validateCoupon(code: string) {
  if (!isSupabaseConfigured()) return null;
  const { data, error } = await supabase.from('coupons').select('*').eq('code', code.toUpperCase()).eq('is_active', true).single();
  if (error || !data) return null;
  return { code: data.code, discountPercent: data.discount_percent, maxDiscount: data.max_discount };
}

export async function fetchProfile() {
  if (!isSupabaseConfigured()) return null;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single();
  if (error) return null;
  return data;
}

export async function signOut() {
  if (!isSupabaseConfigured()) return;
  await supabase.auth.signOut();
}
