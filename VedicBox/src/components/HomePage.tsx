import { useState, useEffect } from 'react';
import { useApp } from '../store';
import { products, dailyTips } from '../data';
import { ChevronRight, ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import ProductCard from './ProductCard';

const banners = [
  { image: './images/hero-banner-1.jpg', title: 'Sacred Puja Kits', subtitle: 'Authentic & Energized', tag: 'Festival Special — Up to 40% Off' },
  { image: './images/hero-banner-2.jpg', title: 'Vastu Remedy Kits', subtitle: 'Transform Your Space', tag: 'Expert Curated — Free Shipping' },
  { image: './images/consultation-banner.jpg', title: 'Book Consultation', subtitle: 'Expert Vastu Guidance', tag: 'Starting at ₹499 — Online & Offline' },
];

export default function HomePage() {
  const { dispatch } = useApp();
  const [currentBanner, setCurrentBanner] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setCurrentBanner(p => (p + 1) % banners.length), 4000);
    return () => clearInterval(timer);
  }, []);

  const bestsellers = products.filter(p => p.isBestseller);
  const newArrivals = products.filter(p => p.isNew);
  const festivalSpecials = products.filter(p => p.isFestivalSpecial);

  const fadeUp = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.5 },
  };

  return (
    <div className="pb-20">
      {/* Hero Banner Slider */}
      <div className="relative h-52 sm:h-64 overflow-hidden">
        {banners.map((banner, i) => (
          <motion.div
            key={i}
            initial={false}
            animate={{ opacity: currentBanner === i ? 1 : 0, scale: currentBanner === i ? 1 : 1.05 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0"
          >
            <img src={banner.image} alt={banner.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-5">
              <span className="inline-block bg-saffron-500 text-white text-[10px] font-semibold px-3 py-1 rounded-full mb-2">
                {banner.tag}
              </span>
              <h2 className="text-white font-display text-2xl font-bold">{banner.title}</h2>
              <p className="text-white/80 text-sm">{banner.subtitle}</p>
            </div>
          </motion.div>
        ))}
        <div className="absolute bottom-3 right-4 flex gap-1.5">
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentBanner(i)}
              className={`w-2 h-2 rounded-full transition-all ${currentBanner === i ? 'bg-white w-6' : 'bg-white/50'}`}
            />
          ))}
        </div>
      </div>

      {/* Quick Categories */}
      <motion.div {...fadeUp} className="px-4 py-5">
        <div className="grid grid-cols-5 gap-2">
          {[
            { emoji: '🕉️', label: 'Vastu Kits', cat: 'vastu' as const },
            { emoji: '🪔', label: 'Puja Kits', cat: 'puja' as const },
            { emoji: '📅', label: 'Consult', page: 'consultation' as const },
            { emoji: '🧭', label: 'Compass', page: 'compass' as const },
            { emoji: '❓', label: 'Quiz', page: 'quiz' as const },
          ].map((item) => (
            <button
              key={item.label}
              onClick={() => {
                if ('cat' in item && item.cat) {
                  dispatch({ type: 'SET_CATEGORY', category: item.cat });
                  dispatch({ type: 'SET_PAGE', page: 'category' });
                } else if ('page' in item && item.page) {
                  dispatch({ type: 'SET_PAGE', page: item.page });
                }
              }}
              className="flex flex-col items-center gap-2 p-3 bg-white rounded-2xl shadow-sm border border-saffron-100 hover:shadow-md transition-shadow"
            >
              <span className="text-2xl">{item.emoji}</span>
              <span className="text-xs font-medium text-gray-700">{item.label}</span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Daily Vastu Tip */}
      <motion.div {...fadeUp} className="px-4 pb-5">
        <div className="bg-gradient-to-r from-saffron-50 to-gold-50 rounded-2xl p-4 border border-saffron-200/50">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={16} className="text-saffron-500" />
            <span className="text-xs font-semibold text-saffron-700 uppercase tracking-wider">Daily Vastu Tip</span>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-3xl">{dailyTips[0].icon}</span>
            <div>
              <h3 className="font-display font-bold text-gray-800 text-sm">{dailyTips[0].title}</h3>
              <p className="text-gray-600 text-xs mt-1 leading-relaxed">{dailyTips[0].content}</p>
              <button
                onClick={() => dispatch({ type: 'SET_PAGE', page: 'tips' })}
                className="text-saffron-600 text-xs font-semibold mt-2 flex items-center gap-1"
              >
                Read More Tips <ArrowRight size={12} />
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Bestsellers */}
      <motion.div {...fadeUp}>
        <SectionHeader
          title="🏆 Bestsellers"
          subtitle="Most loved by our customers"
          onSeeAll={() => dispatch({ type: 'SET_PAGE', page: 'category' })}
        />
        <div className="flex gap-3 overflow-x-auto px-4 pb-4 hide-scrollbar">
          {bestsellers.map(product => (
            <div key={product.id} className="min-w-[170px] max-w-[170px]">
              <ProductCard product={product} compact />
            </div>
          ))}
        </div>
      </motion.div>

      {/* Festival Special Banner */}
      <motion.div {...fadeUp} className="px-4 py-4">
        <button
          onClick={() => {
            dispatch({ type: 'SET_FILTERS', filters: { festivalSpecial: true } });
            dispatch({ type: 'SET_PAGE', page: 'category' });
          }}
          className="w-full bg-gradient-to-r from-sacred to-sacred-light rounded-2xl p-5 text-left relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 text-6xl opacity-20">🪔</div>
          <span className="text-gold-300 text-[10px] font-semibold uppercase tracking-widest">Limited Time</span>
          <h3 className="text-white font-display text-xl font-bold mt-1">Festival Special Kits</h3>
          <p className="text-white/70 text-xs mt-1">Complete puja kits for all festivals</p>
          <div className="flex items-center gap-1 mt-3 text-gold-300 text-sm font-semibold">
            Shop Now <ArrowRight size={14} />
          </div>
        </button>
      </motion.div>

      {/* New Arrivals */}
      {newArrivals.length > 0 && (
        <motion.div {...fadeUp}>
          <SectionHeader
            title="✨ New Arrivals"
            subtitle="Just added to our collection"
            onSeeAll={() => dispatch({ type: 'SET_PAGE', page: 'category' })}
          />
          <div className="flex gap-3 overflow-x-auto px-4 pb-4 hide-scrollbar">
            {newArrivals.map(product => (
              <div key={product.id} className="min-w-[170px] max-w-[170px]">
                <ProductCard product={product} compact />
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Categories Banner */}
      <motion.div {...fadeUp} className="px-4 py-4 grid grid-cols-2 gap-3">
        <button
          onClick={() => {
            dispatch({ type: 'SET_CATEGORY', category: 'vastu' });
            dispatch({ type: 'SET_PAGE', page: 'category' });
          }}
          className="relative h-36 rounded-2xl overflow-hidden"
        >
          <img src="./images/vastu-kit.jpg" alt="Vastu" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          <div className="absolute bottom-3 left-3 right-3">
            <span className="text-white font-display font-bold text-base">Vastu Kits</span>
            <p className="text-white/70 text-[10px]">8 Products</p>
          </div>
        </button>
        <button
          onClick={() => {
            dispatch({ type: 'SET_CATEGORY', category: 'puja' });
            dispatch({ type: 'SET_PAGE', page: 'category' });
          }}
          className="relative h-36 rounded-2xl overflow-hidden"
        >
          <img src="./images/puja-kit.jpg" alt="Puja" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          <div className="absolute bottom-3 left-3 right-3">
            <span className="text-white font-display font-bold text-base">Puja Kits</span>
            <p className="text-white/70 text-[10px]">8 Products</p>
          </div>
        </button>
      </motion.div>

      {/* Festival Specials */}
      {festivalSpecials.length > 0 && (
        <motion.div {...fadeUp}>
          <SectionHeader
            title="🎆 Festival Specials"
            subtitle="Celebrate with divine blessings"
            onSeeAll={() => dispatch({ type: 'SET_PAGE', page: 'category' })}
          />
          <div className="flex gap-3 overflow-x-auto px-4 pb-4 hide-scrollbar">
            {festivalSpecials.map(product => (
              <div key={product.id} className="min-w-[170px] max-w-[170px]">
                <ProductCard product={product} compact />
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Consultation Banner */}
      <motion.div {...fadeUp} className="px-4 py-4">
        <button
          onClick={() => dispatch({ type: 'SET_PAGE', page: 'consultation' })}
          className="w-full rounded-2xl overflow-hidden relative h-40"
        >
          <img src="./images/consultation-banner.jpg" alt="Consultation" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent" />
          <div className="absolute inset-0 flex flex-col justify-center px-5">
            <span className="text-saffron-300 text-[10px] font-semibold uppercase tracking-widest">Expert Guidance</span>
            <h3 className="text-white font-display text-xl font-bold mt-1">Book Vastu<br />Consultation</h3>
            <p className="text-white/70 text-xs mt-1">Get personalized remedies</p>
            <span className="mt-3 bg-saffron-500 text-white text-xs font-semibold px-4 py-1.5 rounded-full inline-flex items-center gap-1 w-fit">
              Book Now <ArrowRight size={12} />
            </span>
          </div>
        </button>
      </motion.div>

      {/* Subscription Banner */}
      <motion.div {...fadeUp} className="px-4 pb-4">
        <button
          onClick={() => dispatch({ type: 'SET_PAGE', page: 'subscription' })}
          className="w-full bg-gradient-to-r from-gold-500 to-saffron-500 rounded-2xl p-5 text-left relative overflow-hidden"
        >
          <div className="absolute top-2 right-4 text-5xl opacity-30">🔄</div>
          <span className="text-white/70 text-[10px] font-semibold uppercase tracking-widest">Monthly Plans</span>
          <h3 className="text-white font-display text-lg font-bold mt-1">Subscribe & Save</h3>
          <p className="text-white/80 text-xs mt-1">Get monthly puja essentials delivered to your door</p>
          <div className="flex items-center gap-1 mt-3 text-white text-sm font-semibold">
            Starting at ₹699/month <ArrowRight size={14} />
          </div>
        </button>
      </motion.div>

      {/* Find Your Remedy Quiz */}
      <motion.div {...fadeUp} className="px-4 pb-4">
        <button
          onClick={() => dispatch({ type: 'SET_PAGE', page: 'quiz' })}
          className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-5 text-left relative overflow-hidden"
        >
          <div className="absolute top-2 right-4 text-5xl opacity-20">🧭</div>
          <span className="text-purple-200 text-[10px] font-semibold uppercase tracking-widest">Personalized</span>
          <h3 className="text-white font-display text-lg font-bold mt-1">Find Your Vastu Remedy</h3>
          <p className="text-white/80 text-xs mt-1">Take a quick quiz and get the perfect kit recommendation</p>
          <div className="flex items-center gap-1 mt-3 text-white text-sm font-semibold">
            Start Quiz <ArrowRight size={14} />
          </div>
        </button>
      </motion.div>

      {/* Trust Badges */}
      <motion.div {...fadeUp} className="px-4 pb-6">
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: '✅', label: 'Authentic', sub: '100% Genuine' },
            { icon: '🚚', label: 'Free Delivery', sub: 'Above ₹999' },
            { icon: '🔒', label: 'Secure Pay', sub: 'Encrypted' },
          ].map((badge) => (
            <div key={badge.label} className="text-center p-3 bg-white rounded-xl border border-saffron-100">
              <span className="text-2xl">{badge.icon}</span>
              <p className="text-xs font-semibold text-gray-700 mt-1">{badge.label}</p>
              <p className="text-[10px] text-gray-400">{badge.sub}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

function SectionHeader({ title, subtitle, onSeeAll }: { title: string; subtitle: string; onSeeAll: () => void }) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <div>
        <h2 className="font-display font-bold text-gray-800 text-lg">{title}</h2>
        <p className="text-gray-400 text-xs">{subtitle}</p>
      </div>
      <button onClick={onSeeAll} className="flex items-center gap-1 text-saffron-600 text-xs font-semibold">
        See All <ChevronRight size={14} />
      </button>
    </div>
  );
}
