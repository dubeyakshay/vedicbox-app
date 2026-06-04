import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Send, Sparkles, X, ArrowRight, GripVertical } from 'lucide-react';
import { useApp } from '../store';
import { products } from '../data';
import type { Product, Page } from '../types';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Suggestion {
  label: string;
  action: () => void;
}

interface ChatMessage {
  id: number;
  role: 'assistant' | 'user';
  text: string;
  suggestions?: Suggestion[];
  productCard?: Product;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function fmt(n: number) {
  return `₹${n.toLocaleString('en-IN')}`;
}

function productSummary(p: Product) {
  return `${p.name} (${p.nameHindi || ''}) — ${fmt(p.price)} (${p.discount}% off). Includes ${p.includes.length} items. ${p.benefits[0]}.`;
}

/* ------------------------------------------------------------------ */
/*  Response builder — returns text + actionable suggestions           */
/* ------------------------------------------------------------------ */

function buildResponse(
  query: string,
  state: ReturnType<typeof useApp>['state'],
  nav: (page: Page) => void,
  viewProduct: (p: Product) => void,
  addToCart: (p: Product) => void,
) {
  const q = query.toLowerCase().trim();

  // ---- Greetings ----
  if (/^(hi|hello|hey|namaste|namaskar|hola|howdy)/.test(q)) {
    return {
      text: '🙏 Namaste! Welcome to VedicBox. I can help you find the perfect Vastu remedy or Puja kit. What are you looking for today?',
      suggestions: [
        { label: '🕉️ Browse Vastu Kits', action: () => nav('category') },
        { label: '🪔 Browse Puja Kits', action: () => nav('category') },
        { label: '🧭 Take Remedy Quiz', action: () => nav('quiz') },
        { label: '📅 Book Consultation', action: () => nav('consultation') },
      ],
    };
  }

  // ---- Order Tracking ----
  if (/order|track|shipment|shipping|delivery|where.*(order|package)/.test(q)) {
    if (state.orders.length > 0) {
      const latest = state.orders[0];
      return {
        text: `📦 Your latest order #${latest.id} is currently "${latest.status}". It was placed on ${latest.date} with ${latest.items.length} item(s) totalling ${fmt(latest.total)}.`,
        suggestions: [
          { label: '📦 Open My Orders', action: () => nav('orders') },
          { label: '🛒 Continue Shopping', action: () => nav('category') },
          { label: '💬 Need Help?', action: () => nav('consultation') },
        ],
      };
    }
    return {
      text: "You don't have any orders yet. Browse our collection and place your first order! We offer free delivery on orders above ₹999.",
      suggestions: [
        { label: '🛍️ Browse All Products', action: () => nav('category') },
        { label: '🏆 See Bestsellers', action: () => nav('home') },
        { label: '🛒 Open Cart', action: () => nav('cart') },
      ],
    };
  }

  // ---- Cart ----
  if (/cart|basket|bag|checkout|buy/.test(q)) {
    const cartCount = state.cart.reduce((s, i) => s + i.quantity, 0);
    if (cartCount > 0) {
      const total = state.cart.reduce((s, i) => s + i.product.price * i.quantity, 0);
      return {
        text: `🛒 You have ${cartCount} item(s) in your cart totalling ${fmt(total)}. Ready to checkout?`,
        suggestions: [
          { label: '🛒 Open Cart', action: () => nav('cart') },
          { label: '💳 Proceed to Checkout', action: () => nav('checkout') },
          { label: '🛍️ Add More Items', action: () => nav('category') },
        ],
      };
    }
    return {
      text: "Your cart is empty right now. Let me help you find something perfect!",
      suggestions: [
        { label: '🏆 Bestsellers', action: () => nav('home') },
        { label: '🕉️ Vastu Kits', action: () => nav('category') },
        { label: '🪔 Puja Kits', action: () => nav('category') },
      ],
    };
  }

  // ---- Consultation / Booking ----
  if (/consult|book|call|expert|guidance|pandit|astro/.test(q)) {
    return {
      text: '📅 You can book a Vastu consultation or Puja guidance call with our experts. Choose between video call (₹999) or phone call (₹499). Select your preferred date, time, and expert.',
      suggestions: [
        { label: '📅 Book Now', action: () => nav('consultation') },
        { label: '🕉️ Vastu Consultation', action: () => nav('consultation') },
        { label: '🪔 Puja Guidance', action: () => nav('consultation') },
      ],
    };
  }

  // ---- Subscription ----
  if (/subscri|monthly|recurring|plan|pause|cancel.*sub/.test(q)) {
    return {
      text: '🔄 We offer 3 subscription plans:\n• Monthly Puja Essentials — ₹699/month\n• Festival Special Box — ₹1,299/quarter\n• Premium Spiritual Box — ₹2,499/month\nYou can pause or cancel anytime.',
      suggestions: [
        { label: '📦 View All Plans', action: () => nav('subscription') },
        { label: '⭐ Premium Plan', action: () => nav('subscription') },
        { label: '🏠 Back to Home', action: () => nav('home') },
      ],
    };
  }

  // ---- Payment ----
  if (/payment|pay|upi|card|cod|cash|razorpay|stripe|secure|money/.test(q)) {
    return {
      text: '💳 We support multiple payment methods:\n• 📱 UPI (GPay, PhonePe, Paytm)\n• 💳 Credit/Debit Card (Visa, Mastercard)\n• 💵 Cash on Delivery (+₹49)\nAll payments are secure and encrypted.',
      suggestions: [
        { label: '🛒 Go to Cart', action: () => nav('cart') },
        { label: '💳 Checkout Now', action: () => nav('checkout') },
        { label: '🛍️ Shop More', action: () => nav('category') },
      ],
    };
  }

  // ---- Login / Profile ----
  if (/login|sign.?up|otp|profile|account|address|wishlist/.test(q)) {
    return {
      text: '👤 You can login using Phone OTP or Google account. Once logged in, you can manage your profile, saved addresses, wishlist, and order history.',
      suggestions: [
        { label: '👤 Open Profile', action: () => nav('profile') },
        { label: '🔐 Login / Sign Up', action: () => nav('auth') },
        { label: '🏠 Back to Home', action: () => nav('home') },
      ],
    };
  }

  // ---- Quiz / Remedy Finder ----
  if (/quiz|find.*remedy|which.*kit|suggest|recommend.*me|help.*choose|not.*sure/.test(q)) {
    return {
      text: '🧭 Not sure which kit is right for you? Take our quick 6-question quiz! Based on your property type, direction, and problems faced, we\'ll recommend the perfect Vastu remedy.',
      suggestions: [
        { label: '🧭 Start Quiz Now', action: () => nav('quiz') },
        { label: '📅 Ask an Expert', action: () => nav('consultation') },
        { label: '🛍️ Browse All Kits', action: () => nav('category') },
      ],
    };
  }

  // ---- Tips / Mantras / Spiritual ----
  if (/tip|mantra|spiritual|daily|blog|article|festival.*calendar/.test(q)) {
    return {
      text: '📿 Check out our Daily Vastu Tips & Mantras section! We have:\n• Daily Vastu tips for home & office\n• Sacred mantras with audio\n• Spiritual blog articles\n• Upcoming festival calendar',
      suggestions: [
        { label: '📿 Open Tips & Mantras', action: () => nav('tips') },
        { label: '🎆 Festival Calendar', action: () => nav('tips') },
        { label: '🏠 Back to Home', action: () => nav('home') },
      ],
    };
  }

  // ---- Coupon / Discount ----
  if (/coupon|discount|offer|promo|code|save/.test(q)) {
    return {
      text: '🏷️ Here are some active coupon codes:\n• WELCOME15 — 15% off\n• PUJA20 — 20% off\n• DIWALI30 — 30% off\n• FIRST25 — 25% off for first order\nApply them at checkout!',
      suggestions: [
        { label: '🛒 Apply in Cart', action: () => nav('cart') },
        { label: '🛍️ Shop Now', action: () => nav('category') },
        { label: '🏠 Back to Home', action: () => nav('home') },
      ],
    };
  }

  // ---- Specific festival kits ----
  if (/diwali/.test(q)) {
    const kit = products.find(p => p.id === 'p7')!;
    return {
      text: `🪔 ${productSummary(kit)}\nThe Diwali Puja Kit includes Lakshmi-Ganesh idols, premium diyas, rangoli stencils, and complete puja samagri. Perfect for a blessed Diwali!`,
      suggestions: [
        { label: '👁️ View Diwali Kit', action: () => viewProduct(kit) },
        { label: '🛒 Add to Cart', action: () => addToCart(kit) },
        { label: '🎆 More Festival Kits', action: () => nav('category') },
      ],
      productCard: kit,
    };
  }

  if (/navratri/.test(q)) {
    const kit = products.find(p => p.id === 'p4')!;
    return {
      text: `🙏 ${productSummary(kit)}\nComplete 9-day kit with color chunaris for each day, Durga idol, and havan samagri.`,
      suggestions: [
        { label: '👁️ View Navratri Kit', action: () => viewProduct(kit) },
        { label: '🛒 Add to Cart', action: () => addToCart(kit) },
        { label: '🎆 More Festival Kits', action: () => nav('category') },
      ],
      productCard: kit,
    };
  }

  if (/ganesh/.test(q)) {
    const kit = products.find(p => p.id === 'p2')!;
    return {
      text: `🕉️ ${productSummary(kit)}\nIncludes eco-friendly Ganesh idol, modak mould, durva grass, and complete aarti book.`,
      suggestions: [
        { label: '👁️ View Ganesh Kit', action: () => viewProduct(kit) },
        { label: '🛒 Add to Cart', action: () => addToCart(kit) },
        { label: '🪔 More Puja Kits', action: () => nav('category') },
      ],
      productCard: kit,
    };
  }

  if (/lakshmi/.test(q)) {
    const kit = products.find(p => p.id === 'p3')!;
    return {
      text: `✨ ${productSummary(kit)}\nInvoke Goddess Lakshmi's blessings with brass idol, lotus flowers, and gold coins set.`,
      suggestions: [
        { label: '👁️ View Lakshmi Kit', action: () => viewProduct(kit) },
        { label: '🛒 Add to Cart', action: () => addToCart(kit) },
        { label: '🪔 More Puja Kits', action: () => nav('category') },
      ],
      productCard: kit,
    };
  }

  if (/satyanarayan/.test(q)) {
    const kit = products.find(p => p.id === 'p1')!;
    return {
      text: `🙏 ${productSummary(kit)}\nComplete kit with puja thali, panchamrit ingredients, and instruction manual with Katha.`,
      suggestions: [
        { label: '👁️ View Kit', action: () => viewProduct(kit) },
        { label: '🛒 Add to Cart', action: () => addToCart(kit) },
        { label: '🪔 More Puja Kits', action: () => nav('category') },
      ],
      productCard: kit,
    };
  }

  // ---- Vastu for specific places ----
  if (/office/.test(q)) {
    const kit = products.find(p => p.id === 'v3')!;
    return {
      text: `🏢 ${productSummary(kit)}\nDesigned for professional spaces — includes office yantra, crystal globe, and positive energy spray.`,
      suggestions: [
        { label: '👁️ View Office Kit', action: () => viewProduct(kit) },
        { label: '🛒 Add to Cart', action: () => addToCart(kit) },
        { label: '🧭 Take Remedy Quiz', action: () => nav('quiz') },
      ],
      productCard: kit,
    };
  }

  if (/shop|dukan/.test(q)) {
    const kit = products.find(p => p.id === 'v8')!;
    return {
      text: `🏪 ${productSummary(kit)}\nSpecially designed for retail shops — attract customers, increase sales, and create positive energy.`,
      suggestions: [
        { label: '👁️ View Shop Kit', action: () => viewProduct(kit) },
        { label: '🛒 Add to Cart', action: () => addToCart(kit) },
        { label: '📈 Business Growth Kit', action: () => viewProduct(products.find(p => p.id === 'v6')!) },
      ],
      productCard: kit,
    };
  }

  if (/business|growth|revenue/.test(q)) {
    const kit = products.find(p => p.id === 'v6')!;
    return {
      text: `📈 ${productSummary(kit)}\nSupercharge your business with vyapar vridhi yantra, prosperity crystal grid, and success mantras.`,
      suggestions: [
        { label: '👁️ View Business Kit', action: () => viewProduct(kit) },
        { label: '🛒 Add to Cart', action: () => addToCart(kit) },
        { label: '🏪 Shop Vastu Kit', action: () => viewProduct(products.find(p => p.id === 'v8')!) },
      ],
      productCard: kit,
    };
  }

  if (/wealth|prosperity|money|financial|rich/.test(q)) {
    const kit = products.find(p => p.id === 'v4')!;
    return {
      text: `💰 ${productSummary(kit)}\nAttracts wealth and abundance — includes gold-plated Kuber Yantra, Lakshmi idol, and citrine crystal.`,
      suggestions: [
        { label: '👁️ View Wealth Kit', action: () => viewProduct(kit) },
        { label: '🛒 Add to Cart', action: () => addToCart(kit) },
        { label: '🪔 Lakshmi Puja Kit', action: () => viewProduct(products.find(p => p.id === 'p3')!) },
      ],
      productCard: kit,
    };
  }

  if (/nazar|evil.?eye|protection|negative/.test(q)) {
    const kit = products.find(p => p.id === 'v5')!;
    return {
      text: `🛡️ ${productSummary(kit)}\nShield from evil eye with black tourmaline, protection yantra, and loban dhoop.`,
      suggestions: [
        { label: '👁️ View Protection Kit', action: () => viewProduct(kit) },
        { label: '🛒 Add to Cart', action: () => addToCart(kit) },
        { label: '🕉️ Vastu Dosh Kit', action: () => viewProduct(products.find(p => p.id === 'v1')!) },
      ],
      productCard: kit,
    };
  }

  if (/griha.?pravesh|new.?home|house.?warming|new.?house/.test(q)) {
    const kit = products.find(p => p.id === 'v2')!;
    return {
      text: `🏠 ${productSummary(kit)}\nEverything for an auspicious new home entry — kalash set, gangajal, swastik stickers, and more.`,
      suggestions: [
        { label: '👁️ View Griha Pravesh Kit', action: () => viewProduct(kit) },
        { label: '🛒 Add to Cart', action: () => addToCart(kit) },
        { label: '🕉️ Vastu Dosh Kit', action: () => viewProduct(products.find(p => p.id === 'v1')!) },
      ],
      productCard: kit,
    };
  }

  if (/pyramid|energy|meditation|sleep/.test(q)) {
    const kit = products.find(p => p.id === 'v7')!;
    return {
      text: `🔺 ${productSummary(kit)}\nHarness pyramid energy — 9-piece set with placement guide and compass for correct alignment.`,
      suggestions: [
        { label: '👁️ View Pyramid Kit', action: () => viewProduct(kit) },
        { label: '🛒 Add to Cart', action: () => addToCart(kit) },
        { label: '🧭 Take Remedy Quiz', action: () => nav('quiz') },
      ],
      productCard: kit,
    };
  }

  // ---- General Vastu / Puja ----
  if (/vastu|dosh|remedy/.test(q)) {
    const kit = products.find(p => p.id === 'v1')!;
    return {
      text: `🕉️ Our most popular Vastu kit: ${productSummary(kit)}\nNeutralizes negative energies and restores harmony. Energized by Vedic pandits.`,
      suggestions: [
        { label: '👁️ View Vastu Kit', action: () => viewProduct(kit) },
        { label: '🛒 Add to Cart', action: () => addToCart(kit) },
        { label: '🕉️ All Vastu Kits', action: () => nav('category') },
        { label: '🧭 Take Remedy Quiz', action: () => nav('quiz') },
      ],
      productCard: kit,
    };
  }

  if (/puja|pooja|worship|prayer|aarti/.test(q)) {
    const kit = products.find(p => p.id === 'p1')!;
    return {
      text: `🪔 Our bestselling puja kit: ${productSummary(kit)}\nComplete with puja thali, prasad mix, and step-by-step katha booklet.`,
      suggestions: [
        { label: '👁️ View Puja Kit', action: () => viewProduct(kit) },
        { label: '🛒 Add to Cart', action: () => addToCart(kit) },
        { label: '🪔 All Puja Kits', action: () => nav('category') },
        { label: '🎆 Festival Specials', action: () => nav('category') },
      ],
      productCard: kit,
    };
  }

  if (/best.?seller|popular|top|best|trending/.test(q)) {
    const bestsellers = products.filter(p => p.isBestseller);
    const names = bestsellers.map(p => `• ${p.name} — ${fmt(p.price)}`).join('\n');
    return {
      text: `🏆 Our Bestsellers:\n${names}\n\nThese are our most loved products with highest ratings!`,
      suggestions: [
        { label: '🏆 View All Bestsellers', action: () => nav('home') },
        ...bestsellers.slice(0, 2).map(p => ({
          label: `👁️ ${p.name.split(' ').slice(0, 3).join(' ')}`,
          action: () => viewProduct(p),
        })),
      ],
    };
  }

  if (/festival|special|celebration/.test(q)) {
    const festKits = products.filter(p => p.isFestivalSpecial);
    const names = festKits.map(p => `• ${p.name} — ${fmt(p.price)}`).join('\n');
    return {
      text: `🎆 Festival Special Kits:\n${names}\n\nComplete kits with everything you need for the perfect celebration!`,
      suggestions: [
        { label: '🎆 View Festival Kits', action: () => nav('category') },
        ...festKits.slice(0, 2).map(p => ({
          label: `👁️ ${p.name.split(' ').slice(0, 3).join(' ')}`,
          action: () => viewProduct(p),
        })),
      ],
    };
  }

  // ---- Price related ----
  if (/price|cost|cheap|afford|budget|under|below/.test(q)) {
    const sorted = [...products].sort((a, b) => a.price - b.price);
    const top3 = sorted.slice(0, 3);
    const list = top3.map(p => `• ${p.name} — ${fmt(p.price)}`).join('\n');
    return {
      text: `💰 Our most affordable kits:\n${list}\n\nAll kits include complete items and step-by-step guides!`,
      suggestions: top3.map(p => ({
        label: `👁️ ${p.name.split(' ').slice(0, 3).join(' ')}`,
        action: () => viewProduct(p),
      })),
    };
  }

  // ---- Return / Refund ----
  if (/return|refund|exchange|damage|broken|wrong/.test(q)) {
    return {
      text: '↩️ We offer a 7-day return policy for all products. If you received a damaged or wrong item, please contact our support team. Refunds are processed within 5-7 business days.',
      suggestions: [
        { label: '📦 My Orders', action: () => nav('orders') },
        { label: '📅 Contact Expert', action: () => nav('consultation') },
        { label: '🏠 Back to Home', action: () => nav('home') },
      ],
    };
  }

  // ---- Thank you / Bye ----
  if (/thank|thanks|bye|ok|okay|got.it/.test(q)) {
    return {
      text: '🙏 You\'re welcome! May your home be filled with positivity and prosperity. Feel free to ask anytime!',
      suggestions: [
        { label: '🏠 Back to Home', action: () => nav('home') },
        { label: '🛍️ Shop Now', action: () => nav('category') },
        { label: '📿 Daily Tips', action: () => nav('tips') },
      ],
    };
  }

  // ---- Default Fallback ----
  return {
    text: "🙏 I can help you with:\n• Finding the right Vastu or Puja kit\n• Booking expert consultations\n• Tracking orders\n• Subscriptions & plans\n• Payment methods\n• Coupons & discounts\n\nTry asking something specific or use the buttons below!",
    suggestions: [
      { label: '🕉️ Vastu Kits', action: () => nav('category') },
      { label: '🪔 Puja Kits', action: () => nav('category') },
      { label: '🧭 Remedy Quiz', action: () => nav('quiz') },
      { label: '📅 Book Consultation', action: () => nav('consultation') },
      { label: '📦 My Orders', action: () => nav('orders') },
      { label: '📿 Tips & Mantras', action: () => nav('tips') },
    ],
  };
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function AssistantBot() {
  const { state, dispatch } = useApp();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const endRef = useRef<HTMLDivElement | null>(null);

  const navigate = (page: Page) => {
    dispatch({ type: 'SET_PAGE', page });
    setOpen(false);
  };

  const viewProduct = (p: Product) => {
    dispatch({ type: 'SET_PRODUCT', product: p });
    dispatch({ type: 'SET_PAGE', page: 'product' });
    setOpen(false);
  };

  const addToCart = (p: Product) => {
    dispatch({ type: 'ADD_TO_CART', product: p });
  };

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      role: 'assistant',
      text: '🙏 Namaste! I am your VedicBox Assistant. Ask me about products, remedies, consultations, subscriptions, orders, or payments.',
      suggestions: [
        { label: '🕉️ Browse Vastu Kits', action: () => navigate('category') },
        { label: '🪔 Browse Puja Kits', action: () => navigate('category') },
        { label: '🧭 Take Remedy Quiz', action: () => navigate('quiz') },
        { label: '📅 Book Consultation', action: () => navigate('consultation') },
      ],
    },
  ]);

  useEffect(() => {
    if (open) endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  const cartCount = useMemo(
    () => state.cart.reduce((s, i) => s + i.quantity, 0),
    [state.cart],
  );

  const sendMessage = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const userMsg: ChatMessage = { id: Date.now(), role: 'user', text: trimmed };
    const reply = buildResponse(trimmed, state, navigate, viewProduct, addToCart);
    const botMsg: ChatMessage = {
      id: Date.now() + 1,
      role: 'assistant',
      text: reply.text,
      suggestions: reply.suggestions,
      productCard: (reply as any).productCard,
    };

    setMessages(prev => [...prev, userMsg, botMsg]);
    setInput('');
  };

  const quickPrompts = [
    { label: '🕉️ Vastu kits', q: 'Show me Vastu kits' },
    { label: '🪔 Puja kits', q: 'Show me Puja kits' },
    { label: '🏆 Bestsellers', q: 'What are your bestsellers' },
    { label: '📅 Consultation', q: 'How to book consultation' },
    { label: '📦 Track order', q: 'Track my order' },
    { label: '🏷️ Coupons', q: 'Any discount coupons' },
    { label: '🔄 Subscriptions', q: 'Tell me about subscriptions' },
    { label: '💳 Payment', q: 'What payment methods' },
  ];

  const [isDragging, setIsDragging] = useState(false);
  const dragTimeout = useRef<number | null>(null);

  const handleBotClick = () => {
    // Only open if not dragging
    if (!isDragging) {
      setOpen(true);
    }
  };

  return (
    <>
      {/* Draggable Floating Button */}
      <motion.div
        drag
        dragMomentum={false}
        dragElastic={0.1}
        dragConstraints={{ top: -400, bottom: 0, left: -300, right: 0 }}
        onDragStart={() => {
          setIsDragging(true);
          if (dragTimeout.current) clearTimeout(dragTimeout.current);
        }}
        onDragEnd={() => {
          dragTimeout.current = window.setTimeout(() => setIsDragging(false), 200);
        }}
        whileDrag={{ scale: 1.1 }}
        className="fixed bottom-28 right-3 z-40 cursor-grab active:cursor-grabbing touch-none"
        style={{ touchAction: 'none' }}
      >
        <button
          onClick={handleBotClick}
          className="flex items-center gap-2 rounded-full bg-gradient-to-r from-saffron-600 to-gold-500 pl-2 pr-4 py-2.5 text-white shadow-xl shadow-saffron-500/30"
        >
          <div className="flex items-center gap-1">
            <GripVertical size={14} className="text-white/50" />
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
              <Bot size={16} />
            </div>
          </div>
          <span className="text-xs font-semibold">Ask VedicBox</span>
        </button>
      </motion.div>

      {/* Chat Drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black"
              onClick={() => setOpen(false)}
            />
            <motion.section
              initial={{ y: 40, opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 40, opacity: 0, scale: 0.98 }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className="fixed bottom-20 left-3 right-3 z-50 mx-auto max-w-lg overflow-hidden rounded-[28px] border border-saffron-100 bg-white shadow-2xl"
            >
              {/* Header */}
              <div className="flex items-center justify-between bg-gradient-to-r from-saffron-600 via-saffron-500 to-gold-500 px-4 py-3 text-white">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15">
                    <Sparkles size={18} />
                  </div>
                  <div>
                    <p className="font-display text-sm font-bold leading-tight">VedicBox Assistant</p>
                    <p className="text-[10px] text-white/75">Ask anything • Get instant help</p>
                  </div>
                </div>
                <button onClick={() => setOpen(false)} className="rounded-full bg-white/10 p-2 text-white">
                  <X size={18} />
                </button>
              </div>

              {/* Context Bar */}
              <div className="border-b border-saffron-50 bg-saffron-50/60 px-4 py-2 text-[10px] text-saffron-700 flex items-center justify-between">
                <span>{cartCount > 0 ? `🛒 ${cartCount} item(s) in cart` : '🛒 Cart empty'}</span>
                <span>{state.orders.length > 0 ? `📦 ${state.orders.length} order(s)` : ''}</span>
              </div>

              {/* Messages */}
              <div className="max-h-[48vh] overflow-y-auto px-3 py-3">
                <div className="space-y-3">
                  {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-gradient-to-r from-saffron-500 to-gold-500 text-white rounded-br-md'
                          : 'bg-saffron-50 text-gray-700 rounded-bl-md'
                      }`}>
                        <span className="whitespace-pre-line">{msg.text}</span>

                        {/* Product Card */}
                        {msg.productCard && (
                          <div className="mt-2.5 flex items-center gap-2.5 rounded-xl bg-white p-2 border border-saffron-100">
                            <img src={msg.productCard.image} alt="" className="w-14 h-14 rounded-lg object-cover" />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-gray-800 truncate">{msg.productCard.name}</p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-xs font-bold text-saffron-600">{fmt(msg.productCard.price)}</span>
                                <span className="text-[10px] text-gray-400 line-through">{fmt(msg.productCard.originalPrice)}</span>
                                <span className="text-[9px] text-red-500 font-bold">{msg.productCard.discount}% OFF</span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Action Suggestions */}
                        {msg.suggestions && msg.suggestions.length > 0 && (
                          <div className="mt-2.5 flex flex-wrap gap-1.5">
                            {msg.suggestions.map((s, i) => (
                              <button
                                key={i}
                                onClick={s.action}
                                className="flex items-center gap-1 rounded-full border border-saffron-200 bg-white px-2.5 py-1 text-[10px] font-semibold text-saffron-700 hover:bg-saffron-50 transition-colors"
                              >
                                {s.label} <ArrowRight size={8} />
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  <div ref={endRef} />
                </div>
              </div>

              {/* Quick Prompts */}
              <div className="border-t border-saffron-100 bg-saffron-50/30 px-3 pt-2 pb-1">
                <div className="flex gap-1.5 overflow-x-auto pb-1.5 hide-scrollbar">
                  {quickPrompts.map((p) => (
                    <button
                      key={p.q}
                      onClick={() => sendMessage(p.q)}
                      className="whitespace-nowrap rounded-full bg-white border border-saffron-100 px-2.5 py-1.5 text-[10px] font-semibold text-saffron-700 hover:bg-saffron-50 transition-colors"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Input */}
              <div className="border-t border-saffron-100 bg-white px-3 py-2.5">
                <form
                  onSubmit={(e) => { e.preventDefault(); sendMessage(input); }}
                  className="flex items-center gap-2"
                >
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type your question..."
                    className="flex-1 rounded-2xl border border-gray-200 px-3.5 py-2.5 text-sm text-gray-700 outline-none focus:border-saffron-300"
                  />
                  <button
                    type="submit"
                    className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-r from-saffron-500 to-gold-500 text-white flex-shrink-0"
                  >
                    <Send size={16} />
                  </button>
                </form>
              </div>
            </motion.section>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
