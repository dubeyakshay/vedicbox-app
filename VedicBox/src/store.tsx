import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { CartItem, Product, Page } from './types';
import { updateWishlist } from './lib/api';

interface AppState {
  cart: CartItem[];
  currentPage: Page;
  pageHistory: Page[];
  selectedProduct: Product | null;
  selectedCategory: 'all' | 'vastu' | 'puja';
  isLoggedIn: boolean;
  userName: string;
  searchQuery: string;
  showMobileMenu: boolean;
  filters: {
    priceRange: [number, number];
    category: string;
    forType: string;
    festivalSpecial: boolean;
  };
  orders: Array<{
    id: string;
    items: CartItem[];
    total: number;
    status: string;
    date: string;
  }>;
  wishlist: string[];
  couponCode: string;
  couponApplied: boolean;
  couponDiscount: number;
}

type Action =
  | { type: 'ADD_TO_CART'; product: Product }
  | { type: 'REMOVE_FROM_CART'; productId: string }
  | { type: 'UPDATE_QUANTITY'; productId: string; quantity: number }
  | { type: 'CLEAR_CART' }
  | { type: 'SET_PAGE'; page: Page }
  | { type: 'GO_BACK' }
  | { type: 'SET_PRODUCT'; product: Product | null }
  | { type: 'SET_CATEGORY'; category: 'all' | 'vastu' | 'puja' }
  | { type: 'SET_LOGGED_IN'; loggedIn: boolean; userName?: string }
  | { type: 'SET_SEARCH'; query: string }
  | { type: 'TOGGLE_MENU' }
  | { type: 'SET_FILTERS'; filters: Partial<AppState['filters']> }
  | { type: 'ADD_ORDER'; order: AppState['orders'][0] }
  | { type: 'TOGGLE_WISHLIST'; productId: string }
  | { type: 'APPLY_COUPON'; code: string }
  | { type: 'REMOVE_COUPON' };

const initialState: AppState = {
  cart: [],
  currentPage: 'home',
  pageHistory: [],
  selectedProduct: null,
  selectedCategory: 'all',
  isLoggedIn: false,
  userName: '',
  searchQuery: '',
  showMobileMenu: false,
  filters: {
    priceRange: [0, 10000],
    category: 'all',
    forType: 'all',
    festivalSpecial: false,
  },
  orders: [],
  wishlist: [],
  couponCode: '',
  couponApplied: false,
  couponDiscount: 0,
};

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'ADD_TO_CART': {
      const existing = state.cart.find(item => item.product.id === action.product.id);
      if (existing) {
        return {
          ...state,
          cart: state.cart.map(item =>
            item.product.id === action.product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
        };
      }
      return { ...state, cart: [...state.cart, { product: action.product, quantity: 1 }] };
    }
    case 'REMOVE_FROM_CART':
      return { ...state, cart: state.cart.filter(item => item.product.id !== action.productId) };
    case 'UPDATE_QUANTITY':
      if (action.quantity <= 0) {
        return { ...state, cart: state.cart.filter(item => item.product.id !== action.productId) };
      }
      return {
        ...state,
        cart: state.cart.map(item =>
          item.product.id === action.productId ? { ...item, quantity: action.quantity } : item
        ),
      };
    case 'CLEAR_CART':
      return { ...state, cart: [], couponApplied: false, couponCode: '', couponDiscount: 0 };
    case 'SET_PAGE': {
      const newHistory = action.page === state.currentPage
        ? state.pageHistory
        : [...state.pageHistory, state.currentPage].slice(-10);
      return {
        ...state,
        currentPage: action.page,
        pageHistory: newHistory,
        showMobileMenu: false,
      };
    }
    case 'GO_BACK': {
      if (state.pageHistory.length === 0) {
        return { ...state, currentPage: 'home', showMobileMenu: false };
      }
      const history = [...state.pageHistory];
      const previousPage = history.pop()!;
      return {
        ...state,
        currentPage: previousPage,
        pageHistory: history,
        showMobileMenu: false,
      };
    }
    case 'SET_PRODUCT':
      return { ...state, selectedProduct: action.product };
    case 'SET_CATEGORY':
      return { ...state, selectedCategory: action.category };
    case 'SET_LOGGED_IN':
      return { ...state, isLoggedIn: action.loggedIn, userName: action.userName || '' };
    case 'SET_SEARCH':
      return { ...state, searchQuery: action.query };
    case 'TOGGLE_MENU':
      return { ...state, showMobileMenu: !state.showMobileMenu };
    case 'SET_FILTERS':
      return { ...state, filters: { ...state.filters, ...action.filters } };
    case 'ADD_ORDER':
      return { ...state, orders: [action.order, ...state.orders] };
    case 'TOGGLE_WISHLIST': {
      const exists = state.wishlist.includes(action.productId);
      const newWishlist = exists
        ? state.wishlist.filter(id => id !== action.productId)
        : [...state.wishlist, action.productId];
      updateWishlist(newWishlist).catch(() => {});
      return { ...state, wishlist: newWishlist };
    }
    case 'APPLY_COUPON': {
      const validCoupons: Record<string, number> = {
        'VASTU10': 10, 'PUJA20': 20, 'WELCOME15': 15, 'FIRST25': 25, 'DIWALI30': 30,
      };
      const discount = validCoupons[action.code.toUpperCase()];
      if (discount) {
        return { ...state, couponCode: action.code.toUpperCase(), couponApplied: true, couponDiscount: discount };
      }
      return state;
    }
    case 'REMOVE_COUPON':
      return { ...state, couponCode: '', couponApplied: false, couponDiscount: 0 };
    default:
      return state;
  }
}

const AppContext = createContext<{ state: AppState; dispatch: React.Dispatch<Action> } | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
