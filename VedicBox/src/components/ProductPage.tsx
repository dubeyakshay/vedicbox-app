import { useState } from 'react';
import { useApp } from '../store';
import { reviews } from '../data';
import { Star, ShoppingCart, Heart, Share2, Check, ChevronDown, ChevronUp, Truck, Shield, RotateCcw, Package } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ProductPage() {
  const { state, dispatch } = useApp();
  const product = state.selectedProduct;
  const [currentImage, setCurrentImage] = useState(0);
  const [showIncludes, setShowIncludes] = useState(true);
  const [showBenefits, setShowBenefits] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [showReviews, setShowReviews] = useState(false);
  const [quantity, setQuantity] = useState(1);

  if (!product) return null;

  const isWishlisted = state.wishlist.includes(product.id);
  const inCart = state.cart.some(item => item.product.id === product.id);

  return (
    <div className="pb-32">
      {/* Image Gallery */}
      <div className="relative">
        <div className="h-72 sm:h-80 overflow-hidden">
          <motion.img
            key={currentImage}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            src={product.images[currentImage]}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
          {product.images.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentImage(i)}
              className={`w-2.5 h-2.5 rounded-full transition-all ${currentImage === i ? 'bg-white w-8' : 'bg-white/50'}`}
            />
          ))}
        </div>
        {product.discount > 0 && (
          <span className="absolute top-4 left-4 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
            {product.discount}% OFF
          </span>
        )}
        <div className="absolute top-4 right-4 flex gap-2">
          <button
            onClick={() => dispatch({ type: 'TOGGLE_WISHLIST', productId: product.id })}
            className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg ${
              isWishlisted ? 'bg-red-50 text-red-500' : 'bg-white text-gray-400'
            }`}
          >
            <Heart size={20} fill={isWishlisted ? 'currentColor' : 'none'} />
          </button>
          <button className="w-10 h-10 rounded-full bg-white text-gray-400 flex items-center justify-center shadow-lg">
            <Share2 size={20} />
          </button>
        </div>
      </div>

      {/* Product Info */}
      <div className="px-4 py-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-saffron-50 text-saffron-700 text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase">
                {product.category === 'vastu' ? '🕉️ Vastu' : '🪔 Puja'}
              </span>
              {product.isBestseller && (
                <span className="bg-gold-50 text-gold-700 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                  ⭐ Bestseller
                </span>
              )}
            </div>
            <h1 className="font-display font-bold text-xl text-gray-800 leading-tight">{product.name}</h1>
            {product.nameHindi && (
              <p className="text-saffron-600 text-sm font-devanagari mt-0.5">{product.nameHindi}</p>
            )}
          </div>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-3 mt-3">
          <div className="flex items-center gap-1 bg-green-50 px-2.5 py-1 rounded-lg">
            <Star size={14} className="text-green-600 fill-green-600" />
            <span className="text-sm font-bold text-green-700">{product.rating}</span>
          </div>
          <span className="text-sm text-gray-500">{product.reviews} ratings & reviews</span>
        </div>

        {/* Price */}
        <div className="mt-4 flex items-baseline gap-3">
          <span className="text-3xl font-bold text-gray-800">₹{product.price.toLocaleString()}</span>
          <span className="text-lg text-gray-400 line-through">₹{product.originalPrice.toLocaleString()}</span>
          <span className="text-sm font-semibold text-green-600">Save ₹{(product.originalPrice - product.price).toLocaleString()}</span>
        </div>
        <p className="text-xs text-gray-400 mt-1">Inclusive of all taxes. Free shipping on orders above ₹999</p>

        {/* Quantity */}
        <div className="flex items-center gap-4 mt-4">
          <span className="text-sm font-medium text-gray-600">Quantity:</span>
          <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-10 h-10 flex items-center justify-center text-gray-500 hover:bg-gray-50 text-lg"
            >
              −
            </button>
            <span className="w-10 h-10 flex items-center justify-center font-semibold text-gray-800 border-x border-gray-200">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="w-10 h-10 flex items-center justify-center text-gray-500 hover:bg-gray-50 text-lg"
            >
              +
            </button>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="grid grid-cols-4 gap-2 mt-5">
          {[
            { icon: <Truck size={16} />, label: 'Free\nDelivery' },
            { icon: <Shield size={16} />, label: 'Authentic\nProducts' },
            { icon: <RotateCcw size={16} />, label: '7 Day\nReturn' },
            { icon: <Package size={16} />, label: 'Secure\nPacking' },
          ].map((badge, i) => (
            <div key={i} className="text-center p-2 bg-saffron-50/50 rounded-xl">
              <div className="text-saffron-500 flex justify-center">{badge.icon}</div>
              <p className="text-[9px] text-gray-500 mt-1 leading-tight whitespace-pre-line">{badge.label}</p>
            </div>
          ))}
        </div>

        {/* Description */}
        <div className="mt-6">
          <h3 className="font-display font-bold text-gray-800">Description</h3>
          <p className="text-sm text-gray-600 mt-2 leading-relaxed">{product.description}</p>
        </div>

        {/* Accordion Sections */}
        <div className="mt-6 space-y-3">
          <AccordionSection
            title="📦 What's Included"
            count={product.includes.length}
            open={showIncludes}
            toggle={() => setShowIncludes(!showIncludes)}
          >
            <ul className="space-y-2">
              {product.includes.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                  <Check size={14} className="text-green-500 mt-0.5 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </AccordionSection>

          <AccordionSection
            title="✨ Benefits"
            count={product.benefits.length}
            open={showBenefits}
            toggle={() => setShowBenefits(!showBenefits)}
          >
            <ul className="space-y-2">
              {product.benefits.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                  <span className="text-saffron-500">•</span>
                  {item}
                </li>
              ))}
            </ul>
          </AccordionSection>

          <AccordionSection
            title="📋 How to Use"
            count={product.instructions.length}
            open={showInstructions}
            toggle={() => setShowInstructions(!showInstructions)}
          >
            <ol className="space-y-3">
              {product.instructions.map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-gray-600">
                  <span className="w-6 h-6 rounded-full bg-saffron-100 text-saffron-700 text-xs font-bold flex items-center justify-center flex-shrink-0">
                    {i + 1}
                  </span>
                  {item}
                </li>
              ))}
            </ol>
          </AccordionSection>

          <AccordionSection
            title="⭐ Reviews"
            count={reviews.length}
            open={showReviews}
            toggle={() => setShowReviews(!showReviews)}
          >
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="border-b border-gray-100 pb-3 last:border-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-saffron-100 flex items-center justify-center text-xs font-bold text-saffron-700">
                        {review.userName.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-700">{review.userName}</p>
                        {review.verified && (
                          <span className="text-[10px] text-green-600 flex items-center gap-0.5">
                            <Check size={10} /> Verified Purchase
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-0.5 bg-green-50 px-2 py-0.5 rounded">
                      <Star size={10} className="text-green-600 fill-green-600" />
                      <span className="text-xs font-bold text-green-700">{review.rating}</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">{review.comment}</p>
                  <p className="text-[10px] text-gray-400 mt-1">{review.date}</p>
                </div>
              ))}
            </div>
          </AccordionSection>
        </div>
      </div>

      {/* Fixed Bottom Bar */}
      <div className="fixed bottom-16 left-0 right-0 bg-white border-t border-gray-100 p-3 flex gap-3 z-30 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
        <button
          onClick={() => {
            for (let i = 0; i < quantity; i++) dispatch({ type: 'ADD_TO_CART', product });
          }}
          className={`flex-1 py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 ${
            inCart
              ? 'bg-green-50 text-green-600 border border-green-200'
              : 'border-2 border-saffron-500 text-saffron-600'
          }`}
        >
          <ShoppingCart size={16} />
          {inCart ? 'Added to Cart' : 'Add to Cart'}
        </button>
        <button
          onClick={() => {
            for (let i = 0; i < quantity; i++) dispatch({ type: 'ADD_TO_CART', product });
            dispatch({ type: 'SET_PAGE', page: 'checkout' });
          }}
          className="flex-1 py-3 rounded-xl bg-gradient-to-r from-saffron-500 to-gold-500 text-white font-semibold text-sm"
        >
          Buy Now — ₹{(product.price * quantity).toLocaleString()}
        </button>
      </div>
    </div>
  );
}

function AccordionSection({ title, count, open, toggle, children }: {
  title: string; count: number; open: boolean; toggle: () => void; children: React.ReactNode;
}) {
  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden">
      <button
        onClick={toggle}
        className="w-full flex items-center justify-between p-4 bg-white"
      >
        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-800 text-sm">{title}</span>
          <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{count} items</span>
        </div>
        {open ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 pt-0">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
