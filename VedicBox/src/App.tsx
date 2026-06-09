import { AppProvider, useApp } from './store';
import { ToastProvider } from './components/Toast';
import { ErrorBoundary } from './components/ErrorBoundary';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import HomePage from './components/HomePage';
import CategoryPage from './components/CategoryPage';
import ProductPage from './components/ProductPage';
import CartPage from './components/CartPage';
import CheckoutPage from './components/CheckoutPage';
import OrdersPage from './components/OrdersPage';
import ConsultationPage from './components/ConsultationPage';
import SubscriptionPage from './components/SubscriptionPage';
import QuizPage from './components/QuizPage';
import TipsPage from './components/TipsPage';
import AuthPage from './components/AuthPage';
import ProfilePage from './components/ProfilePage';
import CompassPage from './components/CompassPage';
import AssistantBot from './components/AssistantBot';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';
import { supabase, isSupabaseConfigured } from './lib/supabase';
import { logError } from './utils/errorHandler';

function AppContent() {
  const { state, dispatch } = useApp();

  // Auto-detect auth state from Supabase
  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    const initAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;

        if (session?.user) {
          try {
            const { data } = await supabase.from('profiles').select('name').eq('id', session.user.id).single();
            dispatch({
              type: 'SET_LOGGED_IN',
              loggedIn: true,
              userName: data?.name || session.user.email?.split('@')[0] || 'User',
            });
          } catch (e) {
            logError(e, 'Profile fetch');
          }
        }
      } catch (error) {
        logError(error, 'Session check');
      }
    };

    initAuth();

    // Listen for auth changes (login/logout/Google redirect)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        try {
          const { data } = await supabase.from('profiles').select('name').eq('id', session.user.id).single();
          dispatch({
            type: 'SET_LOGGED_IN',
            loggedIn: true,
            userName: data?.name || session.user?.email?.split('@')[0] || 'User',
          });
          if (state.currentPage === 'auth') {
            dispatch({ type: 'SET_PAGE', page: 'home' });
          }
        } catch (error) {
          logError(error, 'Auth state change');
        }
      } else {
        dispatch({ type: 'SET_LOGGED_IN', loggedIn: false });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [state.currentPage]);

  const renderPage = () => {
    switch (state.currentPage) {
      case 'home': return <HomePage />;
      case 'category': case 'search': return <CategoryPage />;
      case 'product': return <ProductPage />;
      case 'cart': return <CartPage />;
      case 'checkout': return <CheckoutPage />;
      case 'orders': return <OrdersPage />;
      case 'consultation': return <ConsultationPage />;
      case 'subscription': return <SubscriptionPage />;
      case 'quiz': return <QuizPage />;
      case 'tips': return <TipsPage />;
      case 'auth': return <AuthPage />;
      case 'profile': return <ProfilePage />;
      case 'compass': return <CompassPage />;
      default: return <HomePage />;
    }
  };

  const hideHeaderOnAuth = state.currentPage === 'auth';

  return (
    <div className="max-w-lg mx-auto bg-cream min-h-screen relative shadow-2xl">
      {!hideHeaderOnAuth && <Header />}
      <AnimatePresence mode="wait">
        <motion.main
          key={state.currentPage}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {renderPage()}
        </motion.main>
      </AnimatePresence>
      {!hideHeaderOnAuth && <BottomNav />}
      <AssistantBot />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <ToastProvider>
          <AppContent />
        </ToastProvider>
      </AppProvider>
    </ErrorBoundary>
  );
}
