import { useApp } from '../store';
import { Home, Grid3X3, ShoppingCart, Calendar, User } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Page } from '../types';

export default function BottomNav() {
  const { state, dispatch } = useApp();

  const tabs: { icon: typeof Home; label: string; page: Page; cat?: 'all' | 'vastu' | 'puja' }[] = [
    { icon: Home, label: 'Home', page: 'home' },
    { icon: Grid3X3, label: 'Shop', page: 'category', cat: 'all' },
    { icon: ShoppingCart, label: 'Cart', page: 'cart' },
    { icon: Calendar, label: 'Consult', page: 'consultation' },
    { icon: User, label: 'Profile', page: 'profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-saffron-100 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
      <div className="flex items-center justify-around px-2 py-1 max-w-lg mx-auto">
        {tabs.map((tab) => {
          const isActive = state.currentPage === tab.page;
          const Icon = tab.icon;
          return (
            <button
              key={tab.label}
              onClick={() => {
                if (tab.cat) dispatch({ type: 'SET_CATEGORY', category: tab.cat });
                dispatch({ type: 'SET_PAGE', page: tab.page });
              }}
              className="relative flex flex-col items-center py-2 px-3 min-w-[60px]"
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute -top-1 w-12 h-1 bg-gradient-to-r from-saffron-500 to-gold-500 rounded-full"
                />
              )}
              <Icon
                size={22}
                className={isActive ? 'text-saffron-500' : 'text-gray-400'}
                strokeWidth={isActive ? 2.5 : 1.5}
              />
              <span className={`text-[10px] mt-1 ${isActive ? 'text-saffron-600 font-semibold' : 'text-gray-400'}`}>
                {tab.label}
              </span>
              {tab.page === 'cart' && state.cart.length > 0 && (
                <span className="absolute top-1 right-2 bg-red-500 text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {state.cart.reduce((s, i) => s + i.quantity, 0)}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
