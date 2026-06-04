import { useApp } from '../store';
import { Star, ShoppingCart, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { Product } from '../types';

interface Props {
  product: Product;
  compact?: boolean;
}

export default function ProductCard({ product, compact }: Props) {
  const { state, dispatch } = useApp();
  const isWishlisted = state.wishlist.includes(product.id);
  const inCart = state.cart.some(item => item.product.id === product.id);

  const handleView = () => {
    dispatch({ type: 'SET_PRODUCT', product });
    dispatch({ type: 'SET_PAGE', page: 'product' });
  };

  if (compact) {
    return (
      <motion.div
        whileTap={{ scale: 0.97 }}
        className="bg-white rounded-2xl shadow-sm border border-saffron-100/50 overflow-hidden"
      >
        <div className="relative" onClick={handleView}>
          <img src={product.image} alt={product.name} className="w-full h-32 object-cover" />
          {product.discount > 0 && (
            <span className="absolute top-2 left-2 bg-red-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
              {product.discount}% OFF
            </span>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              dispatch({ type: 'TOGGLE_WISHLIST', productId: product.id });
            }}
            className={`absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center ${
              isWishlisted ? 'bg-red-50 text-red-500' : 'bg-white/80 text-gray-400'
            }`}
          >
            <Heart size={14} fill={isWishlisted ? 'currentColor' : 'none'} />
          </button>
          {product.isBestseller && (
            <span className="absolute bottom-2 left-2 bg-gold-500 text-white text-[8px] font-bold px-2 py-0.5 rounded-full">
              BESTSELLER
            </span>
          )}
        </div>
        <div className="p-3" onClick={handleView}>
          <h3 className="font-semibold text-gray-800 text-xs leading-tight line-clamp-2">{product.name}</h3>
          <div className="flex items-center gap-1 mt-1">
            <Star size={10} className="text-gold-500 fill-gold-500" />
            <span className="text-[10px] text-gray-600">{product.rating}</span>
            <span className="text-[10px] text-gray-400">({product.reviews})</span>
          </div>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="font-bold text-gray-800 text-sm">₹{product.price.toLocaleString()}</span>
            <span className="text-[10px] text-gray-400 line-through">₹{product.originalPrice.toLocaleString()}</span>
          </div>
        </div>
        <div className="px-3 pb-3">
          <button
            onClick={() => dispatch({ type: 'ADD_TO_CART', product })}
            className={`w-full py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              inCart
                ? 'bg-green-50 text-green-600 border border-green-200'
                : 'bg-gradient-to-r from-saffron-500 to-gold-500 text-white'
            }`}
          >
            <ShoppingCart size={12} />
            {inCart ? 'Added ✓' : 'Add to Cart'}
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      className="bg-white rounded-2xl shadow-sm border border-saffron-100/50 overflow-hidden flex"
    >
      <div className="relative w-32 flex-shrink-0" onClick={handleView}>
        <img src={product.image} alt={product.name} className="w-full h-full object-cover min-h-[130px]" />
        {product.discount > 0 && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
            {product.discount}% OFF
          </span>
        )}
      </div>
      <div className="flex-1 p-3 flex flex-col justify-between" onClick={handleView}>
        <div>
          <div className="flex items-start justify-between">
            <h3 className="font-semibold text-gray-800 text-sm leading-tight flex-1">{product.name}</h3>
            <button
              onClick={(e) => {
                e.stopPropagation();
                dispatch({ type: 'TOGGLE_WISHLIST', productId: product.id });
              }}
              className="ml-2"
            >
              <Heart size={16} className={isWishlisted ? 'text-red-500 fill-red-500' : 'text-gray-300'} />
            </button>
          </div>
          {product.nameHindi && (
            <p className="text-[10px] text-saffron-600 font-devanagari mt-0.5">{product.nameHindi}</p>
          )}
          <div className="flex items-center gap-1 mt-1">
            <Star size={11} className="text-gold-500 fill-gold-500" />
            <span className="text-xs text-gray-600">{product.rating}</span>
            <span className="text-xs text-gray-400">({product.reviews} reviews)</span>
          </div>
          <p className="text-xs text-gray-500 mt-1 line-clamp-2">{product.description}</p>
        </div>
        <div className="flex items-center justify-between mt-2">
          <div>
            <span className="font-bold text-gray-800">₹{product.price.toLocaleString()}</span>
            <span className="text-xs text-gray-400 line-through ml-2">₹{product.originalPrice.toLocaleString()}</span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              dispatch({ type: 'ADD_TO_CART', product });
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              inCart
                ? 'bg-green-50 text-green-600 border border-green-200'
                : 'bg-gradient-to-r from-saffron-500 to-gold-500 text-white'
            }`}
          >
            {inCart ? '✓ Added' : 'Add'}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
