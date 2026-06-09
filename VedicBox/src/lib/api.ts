import { supabase, isSupabaseConfigured } from './supabase';
import { validateEmail, validatePhone, validateZipCode, sanitizeInput, validateAmount, validateCouponCode } from '../utils/validation';
import { logError } from '../utils/errorHandler';

// Helper: get current user ID reliably
async function getCurrentUserId(): Promise<string | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.id) return user.id;

    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user?.id) return session.user.id;

    return null;
  } catch (error) {
    logError(error, 'getCurrentUserId');
    return null;
  }
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
}): Promise<{ success: boolean; orderId?: string; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: 'Supabase not configured' };
  }

  // Validate inputs
  if (!orderData.items || orderData.items.length === 0) {
    return { success: false, error: 'Cart is empty' };
  }

  if (!validateAmount(orderData.totalAmount)) {
    return { success: false, error: 'Invalid order amount' };
  }

  const userId = await getCurrentUserId();
  if (!userId) {
    return { success: false, error: 'Not logged in with Supabase. Use Email login (not demo OTP).' };
  }

  try {
    const orderId = 'VB' + Date.now().toString().slice(-8);

    const { data, error } = await supabase.from('orders').insert({
      id: orderId,
      user_id: userId,
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

    if (error) {
      logError(error, 'Create order');
      return { success: false, error: 'Failed to create order' };
    }

    return { success: true, orderId: data?.id || orderId };
  } catch (error) {
    logError(error, 'createOrder');
    return { success: false, error: 'An unexpected error occurred' };
  }
}

export async function fetchOrders() {
  try {
    if (!isSupabaseConfigured()) return null;
    const userId = await getCurrentUserId();
    if (!userId) return null;

    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      logError(error, 'Fetch orders');
      return null;
    }
    return data;
  } catch (error) {
    logError(error, 'fetchOrders');
    return null;
  }
}

// ==========================================
// WISHLIST API
// ==========================================

export async function updateWishlist(wishlist: string[]) {
  try {
    if (!isSupabaseConfigured()) return null;
    const userId = await getCurrentUserId();
    if (!userId) return null;

    const { error } = await supabase.from('profiles').update({ wishlist }).eq('id', userId);
    if (error) {
      logError(error, 'Update wishlist');
      return null;
    }
    return true;
  } catch (error) {
    logError(error, 'updateWishlist');
    return null;
  }
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
  try {
    if (!isSupabaseConfigured()) return null;

    if (!validateAmount(consultationData.price)) {
      return null;
    }

    const userId = await getCurrentUserId();
    if (!userId) return null;

    const { data, error } = await supabase.from('consultations').insert({
      user_id: userId,
      consultant_name: sanitizeInput(consultationData.consultantName),
      type: consultationData.type,
      mode: consultationData.mode,
      consultation_date: consultationData.date,
      consultation_time: consultationData.time,
      price: consultationData.price,
      payment_status: 'paid',
      status: 'booked',
    }).select().single();

    if (error) {
      logError(error, 'Book consultation');
      return null;
    }
    return data;
  } catch (error) {
    logError(error, 'bookConsultation');
    return null;
  }
}

// ==========================================
// PRODUCTS API
// ==========================================

export async function fetchProducts() {
  try {
    if (!isSupabaseConfigured()) return null;
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('review_count', { ascending: false });

    if (error) {
      logError(error, 'Fetch products');
      return null;
    }
    return data;
  } catch (error) {
    logError(error, 'fetchProducts');
    return null;
  }
}

// ==========================================
// COUPONS API
// ==========================================

export async function validateCoupon(code: string) {
  try {
    if (!isSupabaseConfigured()) return null;

    if (!validateCouponCode(code)) {
      return null;
    }

    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', code.toUpperCase())
      .eq('is_active', true)
      .single();

    if (error || !data) return null;
    return { code: data.code, discountPercent: data.discount_percent, maxDiscount: data.max_discount };
  } catch (error) {
    logError(error, 'validateCoupon');
    return null;
  }
}

// ==========================================
// PROFILE API
// ==========================================

export async function fetchProfile() {
  try {
    if (!isSupabaseConfigured()) return null;
    const userId = await getCurrentUserId();
    if (!userId) return null;

    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (error) {
      logError(error, 'Fetch profile');
      return null;
    }
    return data;
  } catch (error) {
    logError(error, 'fetchProfile');
    return null;
  }
}

export async function signOut() {
  try {
    if (!isSupabaseConfigured()) return;
    await supabase.auth.signOut();
  } catch (error) {
    logError(error, 'signOut');
  }
}
