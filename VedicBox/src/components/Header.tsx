import { useState } from 'react';
import { useApp } from '../store';
import { Search, ShoppingCart, User, Menu, X, Heart, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Header() {
  const { state, dispatch } = useApp();
  const [showSearch, setShowSearch] = useState(false);
  const cartCount = state.cart.reduce((sum, item) => sum + item.quantity, 0);

  const isSubPage = state.currentPage !== 'home';

  return (
    <>
      <header className="sticky top-0 z-50 bg-gradient-to-r from-saffron-600 via-saffron-500 to-gold-500 shadow-lg">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            {isSubPage ? (
              <button onClick={() => dispatch({ type: 'GO_BACK' })} className="text-white">
                <ArrowLeft size={24} />
              </button>
            ) : (
              <button onClick={() => dispatch({ type: 'TOGGLE_MENU' })} className="text-white">
                <Menu size={24} />
              </button>
            )}
            <div className="flex items-center gap-2" onClick={() => dispatch({ type: 'SET_PAGE', page: 'home' })}>
              <span className="text-2xl">🌼</span>
              <div>
                <h1 className="text-white font-display text-lg font-bold leading-tight tracking-wide">VedicBox</h1>
                <p className="text-white/80 text-[10px] font-light -mt-0.5">Vastu & Puja Remedy Store</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setShowSearch(!showSearch)} className="text-white p-1">
              <Search size={22} />
            </button>
            <button onClick={() => dispatch({ type: 'SET_PAGE', page: 'profile' })} className="text-white p-1 relative">
              <Heart size={22} />
              {state.wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {state.wishlist.length}
                </span>
              )}
            </button>
            <button onClick={() => dispatch({ type: 'SET_PAGE', page: 'cart' })} className="text-white p-1 relative">
              <ShoppingCart size={22} />
              {cartCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold"
                >
                  {cartCount}
                </motion.span>
              )}
            </button>
            <button onClick={() => dispatch({ type: 'SET_PAGE', page: 'profile' })} className="text-white p-1">
              <User size={22} />
            </button>
          </div>
        </div>
        <AnimatePresence>
          {showSearch && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-3">
                <div className="relative">
                  <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-saffron-400" />
                  <input
                    type="text"
                    placeholder="Search kits, remedies, puja items..."
                    value={state.searchQuery}
                    onChange={(e) => dispatch({ type: 'SET_SEARCH', query: e.target.value })}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && state.searchQuery.trim()) {
                        dispatch({ type: 'SET_PAGE', page: 'category' });
                        setShowSearch(false);
                      }
                    }}
                    className="w-full pl-10 pr-10 py-2.5 rounded-full bg-white/95 text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-gold-300 placeholder-gray-400"
                    autoFocus
                  />
                  {state.searchQuery && (
                    <button onClick={() => dispatch({ type: 'SET_SEARCH', query: '' })} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <X size={16} />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Side Menu */}
      <AnimatePresence>
        {state.showMobileMenu && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black z-50"
              onClick={() => dispatch({ type: 'TOGGLE_MENU' })}
            />
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'spring', damping: 25 }}
              className="fixed left-0 top-0 bottom-0 w-72 bg-white z-50 shadow-2xl"
            >
              <div className="bg-gradient-to-br from-saffron-500 to-gold-500 p-6 pb-8">
                <button onClick={() => dispatch({ type: 'TOGGLE_MENU' })} className="absolute top-4 right-4 text-white">
                  <X size={24} />
                </button>
                <div className="flex items-center gap-3 mt-2">
                  <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-3xl">
                    {state.isLoggedIn ? '👤' : '🌼'}
                  </div>
                  <div>
                    <p className="text-white font-display font-bold text-lg">
                      {state.isLoggedIn ? state.userName : 'Welcome!'}
                    </p>
                    <button
                      onClick={() => {
                        dispatch({ type: 'SET_PAGE', page: state.isLoggedIn ? 'profile' : 'auth' });
                      }}
                      className="text-white/80 text-xs underline"
                    >
                      {state.isLoggedIn ? 'View Profile' : 'Login / Sign Up'}
                    </button>
                  </div>
                </div>
              </div>
              <nav className="p-4 space-y-1">
                {[
                  { icon: '🏠', label: 'Home', page: 'home' as const },
                  { icon: '🕉️', label: 'Vastu Remedy Kits', page: 'category' as const, cat: 'vastu' as const },
                  { icon: '🪔', label: 'Puja Kits', page: 'category' as const, cat: 'puja' as const },
                  { icon: '📦', label: 'My Orders', page: 'orders' as const },
                  { icon: '📅', label: 'Book Consultation', page: 'consultation' as const },
                  { icon: '🔄', label: 'Subscriptions', page: 'subscription' as const },
                  { icon: '🧭', label: 'Find Your Remedy', page: 'quiz' as const },
                  { icon: '📿', label: 'Daily Tips & Mantras', page: 'tips' as const },
                  { icon: '🧭', label: 'Vastu Compass', page: 'compass' as const },
                  { icon: '🛒', label: 'Cart', page: 'cart' as const },
                ].map((item) => (
                  <button
                    key={item.label}
                    onClick={() => {
                      if (item.cat) dispatch({ type: 'SET_CATEGORY', category: item.cat });
                      dispatch({ type: 'SET_PAGE', page: item.page });
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-saffron-50 transition-colors text-left"
                  >
                    <span className="text-xl">{item.icon}</span>
                    <span className="text-sm font-medium">{item.label}</span>
                  </button>
                ))}
              </nav>
              <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-saffron-100">
                <p className="text-center text-xs text-gray-400">🙏 VedicBox v1.0</p>
                <p className="text-center text-[10px] text-gray-300 mt-1">Bringing Harmony to Your Home</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
