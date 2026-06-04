import { useState } from 'react';
import { useApp } from '../store';
import { products } from '../data';
import { MapPin, Package, Heart, Settings, LogOut, ChevronRight, Bell, HelpCircle, Star, Wifi, WifiOff, Database, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface ConnectionStatus {
  configured: boolean;
  connected: boolean;
  productCount: number | null;
  couponCount: number | null;
  tipCount: number | null;
  reviewCount: number | null;
  authReady: boolean;
  error: string | null;
}

export default function ProfilePage() {
  const { state, dispatch } = useApp();
  const [showDebug, setShowDebug] = useState(false);
  const [testing, setTesting] = useState(false);
  const [status, setStatus] = useState<ConnectionStatus>({
    configured: false,
    connected: false,
    productCount: null,
    couponCount: null,
    tipCount: null,
    reviewCount: null,
    authReady: false,
    error: null,
  });

  const runTest = async () => {
    setTesting(true);
    const result: ConnectionStatus = {
      configured: isSupabaseConfigured(),
      connected: false,
      productCount: null,
      couponCount: null,
      tipCount: null,
      reviewCount: null,
      authReady: false,
      error: null,
    };

    if (!result.configured) {
      result.error = 'Supabase not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your environment variables.';
      setStatus(result);
      setTesting(false);
      return;
    }

    try {
      // Test 1: Products
      const { data: prods, error: prodErr } = await supabase.from('products').select('id', { count: 'exact' });
      if (prodErr) throw new Error(`Products: ${prodErr.message}`);
      result.productCount = prods?.length ?? 0;

      // Test 2: Coupons
      const { data: coups, error: coupErr } = await supabase.from('coupons').select('id', { count: 'exact' });
      if (coupErr) throw new Error(`Coupons: ${coupErr.message}`);
      result.couponCount = coups?.length ?? 0;

      // Test 3: Tips
      const { data: tips, error: tipErr } = await supabase.from('daily_tips').select('id', { count: 'exact' });
      if (tipErr) throw new Error(`Tips: ${tipErr.message}`);
      result.tipCount = tips?.length ?? 0;

      // Test 4: Reviews
      const { data: revs, error: revErr } = await supabase.from('reviews').select('id', { count: 'exact' });
      if (revErr) throw new Error(`Reviews: ${revErr.message}`);
      result.reviewCount = revs?.length ?? 0;

      // Test 5: Auth
      const { error: authErr } = await supabase.auth.getSession();
      result.authReady = !authErr;

      result.connected = true;
    } catch (e: any) {
      result.error = e.message || 'Connection failed';
      result.connected = false;
    }

    setStatus(result);
    setTesting(false);
  };

  if (!state.isLoggedIn) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 pb-20">
        <span className="text-7xl mb-4">🔒</span>
        <h2 className="font-display font-bold text-xl text-gray-800">Login Required</h2>
        <p className="text-gray-400 text-sm mt-2 text-center">Please login to view your profile</p>
        <button
          onClick={() => dispatch({ type: 'SET_PAGE', page: 'auth' })}
          className="mt-6 bg-gradient-to-r from-saffron-500 to-gold-500 text-white px-8 py-3 rounded-full text-sm font-semibold"
        >
          Login / Sign Up
        </button>
        <button
          onClick={() => dispatch({ type: 'GO_BACK' })}
          className="mt-3 text-saffron-600 text-sm font-semibold underline"
        >
          ← Go Back
        </button>
      </div>
    );
  }

  const wishlistProducts = products.filter(p => state.wishlist.includes(p.id));

  return (
    <div className="pb-20">
      {/* Profile Header */}
      <div className="bg-gradient-to-br from-saffron-500 to-gold-500 px-6 pt-6 pb-10 relative">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-3xl border-2 border-white/30">
            👤
          </div>
          <div>
            <h2 className="text-white font-display text-xl font-bold">{state.userName}</h2>
            <p className="text-white/70 text-xs">Member since 2024</p>
          </div>
        </div>
      </div>

      <div className="-mt-5 px-4">
        {/* Stats */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-saffron-100/50 grid grid-cols-3 gap-3">
          <div className="text-center">
            <p className="font-bold text-lg text-gray-800">{state.orders.length}</p>
            <p className="text-[10px] text-gray-400">Orders</p>
          </div>
          <div className="text-center border-x border-gray-100">
            <p className="font-bold text-lg text-gray-800">{state.wishlist.length}</p>
            <p className="text-[10px] text-gray-400">Wishlist</p>
          </div>
          <div className="text-center">
            <p className="font-bold text-lg text-gray-800">0</p>
            <p className="text-[10px] text-gray-400">Reviews</p>
          </div>
        </div>

        {/* Menu Items */}
        <div className="mt-5 bg-white rounded-2xl border border-saffron-100/50 overflow-hidden">
          {[
            { icon: <Package size={18} />, label: 'My Orders', sub: `${state.orders.length} orders`, page: 'orders' as const, color: 'text-blue-500' },
            { icon: <Heart size={18} />, label: 'Wishlist', sub: `${state.wishlist.length} items`, page: 'category' as const, color: 'text-red-500' },
            { icon: <MapPin size={18} />, label: 'Saved Addresses', sub: '1 address', page: 'profile' as const, color: 'text-green-500' },
            { icon: <Bell size={18} />, label: 'Notifications', sub: 'Manage alerts', page: 'profile' as const, color: 'text-yellow-500' },
            { icon: <Star size={18} />, label: 'Subscriptions', sub: 'Active plans', page: 'subscription' as const, color: 'text-purple-500' },
            { icon: <Settings size={18} />, label: 'Settings', sub: 'App preferences', page: 'profile' as const, color: 'text-gray-500' },
            { icon: <HelpCircle size={18} />, label: 'Help & Support', sub: 'FAQ & Contact', page: 'profile' as const, color: 'text-teal-500' },
          ].map((item, i) => (
            <button
              key={i}
              onClick={() => dispatch({ type: 'SET_PAGE', page: item.page })}
              className="w-full flex items-center gap-3 px-4 py-3.5 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors"
            >
              <div className={item.color}>{item.icon}</div>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-gray-700">{item.label}</p>
                <p className="text-[10px] text-gray-400">{item.sub}</p>
              </div>
              <ChevronRight size={16} className="text-gray-300" />
            </button>
          ))}
        </div>

        {/* Wishlist Preview */}
        {wishlistProducts.length > 0 && (
          <div className="mt-5">
            <h3 className="font-display font-bold text-gray-800 mb-3">❤️ Your Wishlist</h3>
            <div className="space-y-2">
              {wishlistProducts.slice(0, 3).map((product) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-white rounded-xl p-3 flex items-center gap-3 border border-gray-100"
                >
                  <img src={product.image} alt="" className="w-12 h-12 rounded-lg object-cover" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-700 line-clamp-1">{product.name}</p>
                    <p className="text-xs font-bold text-saffron-600">₹{product.price.toLocaleString()}</p>
                  </div>
                  <button
                    onClick={() => dispatch({ type: 'ADD_TO_CART', product })}
                    className="text-xs bg-saffron-50 text-saffron-600 px-3 py-1.5 rounded-lg font-semibold"
                  >
                    Add
                  </button>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* ================================================ */}
        {/* SUPABASE CONNECTION TEST SECTION                  */}
        {/* ================================================ */}
        <div className="mt-5">
          <button
            onClick={() => { setShowDebug(!showDebug); if (!showDebug && !status.configured) runTest(); }}
            className="w-full flex items-center justify-between bg-white rounded-2xl p-4 border border-gray-100"
          >
            <div className="flex items-center gap-3">
              <Database size={18} className="text-indigo-500" />
              <div className="text-left">
                <p className="text-sm font-medium text-gray-700">Backend Status</p>
                <p className="text-[10px] text-gray-400">Supabase connection test</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isSupabaseConfigured() ? (
                <span className="flex items-center gap-1 text-[10px] text-green-600 font-semibold bg-green-50 px-2 py-1 rounded-full">
                  <Wifi size={10} /> Configured
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[10px] text-gray-400 font-semibold bg-gray-50 px-2 py-1 rounded-full">
                  <WifiOff size={10} /> Not Set
                </span>
              )}
              <ChevronRight size={16} className={`text-gray-300 transition-transform ${showDebug ? 'rotate-90' : ''}`} />
            </div>
          </button>

          {showDebug && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-2 bg-white rounded-2xl border border-gray-100 overflow-hidden"
            >
              {/* Test Button */}
              <div className="p-4 border-b border-gray-50">
                <button
                  onClick={runTest}
                  disabled={testing}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold text-sm flex items-center justify-center gap-2"
                >
                  {testing ? (
                    <><Loader2 size={16} className="animate-spin" /> Testing Connection...</>
                  ) : (
                    <><Database size={16} /> Run Connection Test</>
                  )}
                </button>
              </div>

              {/* Results */}
              <div className="p-4 space-y-3">
                {/* Config Check */}
                <TestRow
                  label="Supabase Configured"
                  detail={isSupabaseConfigured() ? 'URL & Key detected' : 'Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY'}
                  pass={status.configured}
                  tested={status.configured || !!status.error}
                />

                {/* Products */}
                <TestRow
                  label="Products Table"
                  detail={status.productCount !== null ? `${status.productCount} products found` : 'Not tested yet'}
                  pass={status.productCount !== null && status.productCount > 0}
                  tested={status.productCount !== null}
                />

                {/* Coupons */}
                <TestRow
                  label="Coupons Table"
                  detail={status.couponCount !== null ? `${status.couponCount} coupons found` : 'Not tested yet'}
                  pass={status.couponCount !== null && status.couponCount > 0}
                  tested={status.couponCount !== null}
                />

                {/* Tips */}
                <TestRow
                  label="Daily Tips Table"
                  detail={status.tipCount !== null ? `${status.tipCount} tips found` : 'Not tested yet'}
                  pass={status.tipCount !== null && status.tipCount > 0}
                  tested={status.tipCount !== null}
                />

                {/* Reviews */}
                <TestRow
                  label="Reviews Table"
                  detail={status.reviewCount !== null ? `${status.reviewCount} reviews found` : 'Not tested yet'}
                  pass={status.reviewCount !== null && status.reviewCount > 0}
                  tested={status.reviewCount !== null}
                />

                {/* Auth */}
                <TestRow
                  label="Auth Service"
                  detail={status.authReady ? 'Auth is ready' : 'Not tested yet'}
                  pass={status.authReady}
                  tested={status.connected}
                />

                {/* Overall */}
                {status.connected && (
                  <div className="bg-green-50 rounded-xl p-3 flex items-center gap-3 mt-2">
                    <CheckCircle size={20} className="text-green-500" />
                    <div>
                      <p className="text-sm font-semibold text-green-700">All Connected! 🎉</p>
                      <p className="text-[10px] text-green-600">Supabase backend is fully working</p>
                    </div>
                  </div>
                )}

                {status.error && (
                  <div className="bg-red-50 rounded-xl p-3 mt-2">
                    <div className="flex items-start gap-2">
                      <XCircle size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-red-700">Connection Error</p>
                        <p className="text-[10px] text-red-600 mt-1 break-all">{status.error}</p>
                      </div>
                    </div>
                  </div>
                )}

                {!status.configured && !testing && (
                  <div className="bg-amber-50 rounded-xl p-3 mt-2">
                    <p className="text-xs text-amber-700 font-semibold mb-1">⚠️ Setup Required</p>
                    <p className="text-[10px] text-amber-600 leading-relaxed">
                      Add these to your Vercel Environment Variables:
                    </p>
                    <div className="mt-2 bg-amber-100/50 rounded-lg p-2 space-y-1">
                      <p className="text-[10px] font-mono text-amber-800">VITE_SUPABASE_URL=https://xxx.supabase.co</p>
                      <p className="text-[10px] font-mono text-amber-800">VITE_SUPABASE_ANON_KEY=eyJhbG...</p>
                    </div>
                    <p className="text-[10px] text-amber-600 mt-2">Then redeploy on Vercel.</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </div>

        {/* Logout */}
        <button
          onClick={async () => {
            if (isSupabaseConfigured()) {
              await supabase.auth.signOut();
            }
            dispatch({ type: 'SET_LOGGED_IN', loggedIn: false });
            dispatch({ type: 'SET_PAGE', page: 'home' });
          }}
          className="w-full mt-5 py-3.5 rounded-xl border-2 border-red-200 text-red-500 font-semibold text-sm flex items-center justify-center gap-2"
        >
          <LogOut size={16} /> Logout
        </button>

        <p className="text-center text-xs text-gray-300 mt-6 mb-4">VedicBox v1.0 • Made with 🙏 in India</p>
      </div>
    </div>
  );
}

/* ---- Test Result Row Component ---- */
function TestRow({ label, detail, pass, tested }: { label: string; detail: string; pass: boolean; tested: boolean }) {
  return (
    <div className="flex items-center gap-3 py-2">
      <div className="flex-shrink-0">
        {!tested ? (
          <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-gray-300" />
          </div>
        ) : pass ? (
          <CheckCircle size={20} className="text-green-500" />
        ) : (
          <XCircle size={20} className="text-red-400" />
        )}
      </div>
      <div className="flex-1">
        <p className="text-xs font-semibold text-gray-700">{label}</p>
        <p className={`text-[10px] ${pass ? 'text-green-600' : tested ? 'text-red-500' : 'text-gray-400'}`}>{detail}</p>
      </div>
    </div>
  );
}
