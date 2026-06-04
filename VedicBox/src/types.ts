export interface Product {
  id: string;
  name: string;
  nameHindi?: string;
  category: 'vastu' | 'puja';
  subCategory: string;
  price: number;
  originalPrice: number;
  discount: number;
  rating: number;
  reviews: number;
  image: string;
  images: string[];
  description: string;
  includes: string[];
  benefits: string[];
  instructions: string[];
  tags: string[];
  isBestseller?: boolean;
  isNew?: boolean;
  isFestivalSpecial?: boolean;
  forType: ('home' | 'office' | 'business' | 'shop')[];
  inStock: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface ConsultationSlot {
  id: string;
  date: string;
  time: string;
  type: 'vastu' | 'puja';
  price: number;
  available: boolean;
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
}

export interface Review {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
  verified: boolean;
}

export interface DailyTip {
  id: string;
  title: string;
  content: string;
  category: string;
  icon: string;
}

export interface Subscription {
  id: string;
  name: string;
  price: number;
  frequency: string;
  description: string;
  features: string[];
}

export type Page = 'home' | 'category' | 'product' | 'cart' | 'checkout' | 'orders' | 'consultation' | 'subscription' | 'quiz' | 'tips' | 'profile' | 'search' | 'auth' | 'compass';
