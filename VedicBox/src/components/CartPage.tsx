import { useState } from 'react';
import { useApp } from '../store';
import { Minus, Plus, Trash2, Tag, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CartPage() {
  const { state, dispatch } = useApp();
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');

  const subtotal = state.cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const savings = state.cart.reduce((sum, item) => sum + (item.product.originalPrice - item.product.price) * item.quantity, 0);
  const couponSavings = state.couponApplied ? Math.round(subtotal * state.couponDiscount / 100) : 0;
  const shipping = subtotal >= 999 ? 0 : 99;
  const total = subtotal - couponSavings + shipping;

  const applyCoupon = () => {
    dispatch({ type: 'APPLY_COUPON', code: couponInput });
    if (!['VASTU10', 'PUJA20', 'WELCOME15', 'FIRST25', 'DIWALI30'].includes(couponInput.toUpperCase())) {
      setCouponError('Invalid coupon code');
      setTimeout(() => setCouponError(''), 3000);
    } else {
      setCouponError('');
    }
  };

  if (state.cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 pb-20">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <span className="text-7xl block mb-4">🛒</span>
          <h2 className="font-display font-bold text-xl text-gray-800">Your Cart is Empty</h2>
          <p className="text-gray-400 text-sm mt-2">Add some sacred items to begin your spiritual journey</p>
          <button
            onClick={() => dispatch({ type: 'SET_PAGE', page: 'category' })}
            className="mt-6 bg-gradient-to-r from-saffron-500 to-gold-500 text-white px-8 py-3 rounded-full text-sm font-semibold"
          >
            Browse Products
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="pb-48">
      <div className="px-4 py-4">
        <h2 className="font-display font-bold text-lg text-gray-800">
          Shopping Cart ({state.cart.reduce((s, i) => s + i.quantity, 0)} items)
        </h2>
      </div>

      {/* Cart Items */}
      <div className="px-4 space-y-3">
        <AnimatePresence>
          {state.cart.map((item) => (
            <motion.div
              key={item.product.id}
              layout
              exit={{ opacity: 0, x: -100 }}
              className="bg-white rounded-2xl p-3 flex gap-3 border border-saffron-100/50 shadow-sm"
            >
              <img
                src={item.product.image}
                alt={item.product.name}
                className="w-20 h-20 rounded-xl object-cover"
                onClick={() => {
                  dispatch({ type: 'SET_PRODUCT', product: item.product });
                  dispatch({ type: 'SET_PAGE', page: 'product' });
                }}
              />
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <h3 className="font-semibold text-sm text-gray-800 line-clamp-2 flex-1 pr-2">{item.product.name}</h3>
                  <button
                    onClick={() => dispatch({ type: 'REMOVE_FROM_CART', productId: item.product.id })}
                    className="text-gray-300 hover:text-red-400 p-1"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <p className="text-xs text-gray-400 mt-0.5">{item.product.category === 'vastu' ? 'Vastu Kit' : 'Puja Kit'}</p>
                <div className="flex items-center justify-between mt-2">
                  <div>
                    <span className="font-bold text-gray-800">₹{(item.product.price * item.quantity).toLocaleString()}</span>
                    {item.quantity > 1 && (
                      <span className="text-[10px] text-gray-400 ml-1">({item.quantity} × ₹{item.product.price})</span>
                    )}
                  </div>
                  <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                    <button
                      onClick={() => dispatch({ type: 'UPDATE_QUANTITY', productId: item.product.id, quantity: item.quantity - 1 })}
                      className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-50"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-8 h-8 flex items-center justify-center font-semibold text-sm border-x border-gray-200">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => dispatch({ type: 'UPDATE_QUANTITY', productId: item.product.id, quantity: item.quantity + 1 })}
                      className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-50"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Coupon Section */}
      <div className="px-4 mt-5">
        <div className="bg-white rounded-2xl p-4 border border-saffron-100/50">
          <div className="flex items-center gap-2 mb-3">
            <Tag size={16} className="text-saffron-500" />
            <span className="font-semibold text-sm text-gray-700">Apply Coupon</span>
          </div>
          {state.couponApplied ? (
            <div className="flex items-center justify-between bg-green-50 p-3 rounded-xl">
              <div>
                <span className="text-green-700 font-semibold text-sm">{state.couponCode}</span>
                <span className="text-green-600 text-xs ml-2">{state.couponDiscount}% off applied!</span>
              </div>
              <button onClick={() => dispatch({ type: 'REMOVE_COUPON' })} className="text-red-400 text-xs font-semibold">
                Remove
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                type="text"
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value)}
                placeholder="Enter coupon code"
                className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-saffron-300"
              />
              <button
                onClick={applyCoupon}
                className="px-5 py-2.5 bg-saffron-500 text-white rounded-xl text-sm font-semibold"
              >
                Apply
              </button>
            </div>
          )}
          {couponError && <p className="text-red-500 text-xs mt-2">{couponError}</p>}
          <div className="mt-3 flex flex-wrap gap-2">
            {['WELCOME15', 'PUJA20', 'DIWALI30'].map(code => (
              <button
                key={code}
                onClick={() => {
                  setCouponInput(code);
                  dispatch({ type: 'APPLY_COUPON', code });
                }}
                className="text-[10px] border border-dashed border-saffron-300 text-saffron-600 px-2 py-1 rounded-md font-semibold"
              >
                {code}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Order Summary */}
      <div className="px-4 mt-5">
        <div className="bg-white rounded-2xl p-4 border border-saffron-100/50">
          <h3 className="font-semibold text-sm text-gray-700 mb-3">Order Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Subtotal</span>
              <span className="text-gray-700">₹{subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-green-600">
              <span>Product Savings</span>
              <span>-₹{savings.toLocaleString()}</span>
            </div>
            {state.couponApplied && (
              <div className="flex justify-between text-green-600">
                <span>Coupon ({state.couponCode})</span>
                <span>-₹{couponSavings.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-500">Shipping</span>
              <span className={shipping === 0 ? 'text-green-600 font-semibold' : 'text-gray-700'}>
                {shipping === 0 ? 'FREE' : `₹${shipping}`}
              </span>
            </div>
            <div className="border-t border-gray-100 pt-2 flex justify-between font-bold text-base">
              <span>Total</span>
              <span className="text-gray-800">₹{total.toLocaleString()}</span>
            </div>
          </div>
          {savings > 0 && (
            <div className="mt-3 bg-green-50 rounded-lg p-2 text-center">
              <span className="text-green-600 text-xs font-semibold">
                🎉 You save ₹{(savings + couponSavings).toLocaleString()} on this order!
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Fixed Bottom */}
      <div className="fixed bottom-16 left-0 right-0 bg-white border-t border-gray-100 p-4 z-30 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="text-xs text-gray-500">Total Amount</span>
            <p className="font-bold text-xl text-gray-800">₹{total.toLocaleString()}</p>
          </div>
          <button
            onClick={() => dispatch({ type: 'SET_PAGE', page: 'checkout' })}
            className="bg-gradient-to-r from-saffron-500 to-gold-500 text-white px-8 py-3.5 rounded-xl font-semibold text-sm flex items-center gap-2"
          >
            Checkout <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
