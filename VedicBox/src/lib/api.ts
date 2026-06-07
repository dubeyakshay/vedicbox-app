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
