import { supabase } from './supabase';
import { logError } from '../utils/errorHandler';

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const cache = new Map<string, { data: unknown; timestamp: number }>();

const getCachedData = (key: string) => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  cache.delete(key);
  return null;
};

const setCachedData = (key: string, data: unknown) => {
  cache.set(key, { data, timestamp: Date.now() });
};

export async function fetchProductsOptimized() {
  const cacheKey = 'products';
  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  try {
    const { data, error } = await supabase
      .from('products')
      .select('id,name,price,image,rating,reviews,category')
      .order('review_count', { ascending: false });

    if (error) throw error;
    setCachedData(cacheKey, data);
    return data;
  } catch (error) {
    logError(error, 'Fetch products');
    return null;
  }
}

export async function fetchOrdersOptimized() {
  const cacheKey = `orders-${(await getCurrentUserId()) || 'anon'}`;
  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  try {
    const userId = await getCurrentUserId();
    if (!userId) return null;

    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;
    setCachedData(cacheKey, data);
    return data;
  } catch (error) {
    logError(error, 'Fetch orders');
    return null;
  }
}

async function getCurrentUserId(): Promise<string | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.id) return user.id;

    const { data: { session } } = await supabase.auth.getSession();
    return session?.user?.id || null;
  } catch {
    return null;
  }
}

export const clearCache = () => {
  cache.clear();
};
