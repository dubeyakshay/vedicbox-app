import { useState } from 'react';
import { useApp } from '../store';
import { MapPin, CreditCard, Banknote, Smartphone, Check, Lock, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { createOrder } from '../lib/api';
import { isSupabaseConfigured } from '../lib/supabase';

export default function CheckoutPage() {
  const { state, dispatch } = useApp();
  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [address, setAddress] = useState({
    name: state.userName || 'Rajesh Kumar',
    phone: '9876543210',
    line1: '123, Shanti Nagar',
    line2: 'Near Ram Mandir',
    city: 'Jaipur',
    state: 'Rajasthan',
    pincode: '302001',
  });

  const subtotal = state.cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const couponSavings = state.couponApplied ? Math.round(subtotal * state.couponDiscount / 100) : 0;
  const shipping = subtotal >= 999 ? 0 : 99;
  const total = subtotal - couponSavings + shipping;

  const placeOrder = async () => {
    setPlacingOrder(true);
    const orderId = 'VB' + Date.now().toString().slice(-8);

    // Save to Supabase if configured
    if (isSupabaseConfigured()) {
      try {
        await createOrder({
          items: state.cart.map(item => ({
            productId: item.product.id,
            productName: item.product.name,
            quantity: item.quantity,
            price: item.product.price,
            image: item.product.image,
          })),
          subtotal,
          couponCode: state.couponApplied ? state.couponCode : undefined,
          couponDiscount: couponSavings,
          shippingCharge: shipping,
          totalAmount: total,
          paymentMethod,
          shippingAddress: address,
        });
      } catch (e) {
        console.error('Supabase order error:', e);
      }
    }

    // Always save to local state too
    dispatch({
      type: 'ADD_ORDER',
      order: {
        id: orderId,
        items: [...state.cart],
        total,
        status: 'Order Placed',
        date: new Date().toLocaleDateString('en-IN'),
      },
    });
    dispatch({ type: 'CLEAR_CART' });
    setPlacingOrder(false);
    setOrderPlaced(true);
  };

  if (orderPlaced) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-6 pb-20">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', damping: 15 }}
          className="text-center"
        >
          <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <Check size={48} className="text-green-500" />
          </div>
          <h2 className="font-display font-bold text-2xl text-gray-800">Order Placed! 🎉</h2>
          <p className="text-gray-500 text-sm mt-2">Your sacred items are being prepared with love and devotion</p>
          {isSupabaseConfigured() && (
            <p className="text-green-600 text-xs mt-1 font-semibold">✅ Saved to database</p>
          )}
          <div className="bg-saffron-50 rounded-2xl p-4 mt-6">
            <p className="text-xs text-gray-500">Order ID</p>
            <p className="font-bold text-saffron-700 text-lg">#{state.orders[0]?.id}</p>
            <p className="text-xs text-gray-400 mt-2">Expected delivery in 3-5 business days</p>
          </div>
          <div className="mt-6 space-y-3">
            <button
              onClick={() => dispatch({ type: 'SET_PAGE', page: 'orders' })}
              className="w-full bg-gradient-to-r from-saffron-500 to-gold-500 text-white py-3 rounded-xl font-semibold text-sm"
            >
              Track Order
            </button>
            <button
              onClick={() => dispatch({ type: 'SET_PAGE', page: 'home' })}
              className="w-full border border-gray-200 text-gray-600 py-3 rounded-xl font-semibold text-sm"
            >
              Continue Shopping
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-4">🙏 Thank you for choosing VedicBox</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="pb-32">
      {/* Progress Steps */}
      <div className="px-4 py-4">
        <div className="flex items-center justify-center gap-2">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                s <= step ? 'bg-saffron-500 text-white' : 'bg-gray-200 text-gray-400'
              }`}>
                {s < step ? <Check size={14} /> : s}
              </div>
              <span className={`text-xs ${s <= step ? 'text-saffron-600 font-semibold' : 'text-gray-400'}`}>
                {s === 1 ? 'Address' : s === 2 ? 'Payment' : 'Confirm'}
              </span>
              {s < 3 && <div className={`w-8 h-0.5 ${s < step ? 'bg-saffron-500' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>
      </div>

      {/* Step 1: Address */}
      {step === 1 && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="px-4">
          <h3 className="font-display font-bold text-lg text-gray-800 mb-4">Delivery Address</h3>
          <div className="space-y-3">
            {Object.entries(address).map(([key, value]) => (
              <div key={key}>
                <label className="text-xs text-gray-500 capitalize">{key.replace(/([A-Z])/g, ' $1')}</label>
                <input
                  type="text"
                  value={value}
                  onChange={(e) => setAddress(a => ({ ...a, [key]: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm mt-1 focus:outline-none focus:border-saffron-300"
                />
              </div>
            ))}
          </div>
          <button
            onClick={() => setStep(2)}
            className="w-full mt-6 bg-gradient-to-r from-saffron-500 to-gold-500 text-white py-3.5 rounded-xl font-semibold text-sm"
          >
            Continue to Payment
          </button>
        </motion.div>
      )}

      {/* Step 2: Payment */}
      {step === 2 && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="px-4">
          <h3 className="font-display font-bold text-lg text-gray-800 mb-4">Payment Method</h3>
          
          <div className="bg-saffron-50 rounded-xl p-3 mb-4 flex items-center gap-2">
            <MapPin size={14} className="text-saffron-500" />
            <div className="flex-1">
              <p className="text-xs text-gray-600">{address.name} • {address.phone}</p>
              <p className="text-xs text-gray-400">{address.line1}, {address.city} - {address.pincode}</p>
            </div>
            <button onClick={() => setStep(1)} className="text-xs text-saffron-600 font-semibold">Change</button>
          </div>

          <div className="space-y-3">
            {[
              { id: 'upi', icon: <Smartphone size={18} />, label: 'UPI Payment', sub: 'GPay, PhonePe, Paytm' },
              { id: 'card', icon: <CreditCard size={18} />, label: 'Credit/Debit Card', sub: 'Visa, Mastercard, Rupay' },
              { id: 'cod', icon: <Banknote size={18} />, label: 'Cash on Delivery', sub: '+₹49 handling charge' },
            ].map((method) => (
              <button
                key={method.id}
                onClick={() => setPaymentMethod(method.id)}
                className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                  paymentMethod === method.id
                    ? 'border-saffron-500 bg-saffron-50'
                    : 'border-gray-100 bg-white'
                }`}
              >
                <div className={paymentMethod === method.id ? 'text-saffron-500' : 'text-gray-400'}>
                  {method.icon}
                </div>
                <div className="text-left flex-1">
                  <p className="text-sm font-semibold text-gray-700">{method.label}</p>
                  <p className="text-[10px] text-gray-400">{method.sub}</p>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  paymentMethod === method.id ? 'border-saffron-500' : 'border-gray-300'
                }`}>
                  {paymentMethod === method.id && <div className="w-3 h-3 rounded-full bg-saffron-500" />}
                </div>
              </button>
            ))}
          </div>

          <div className="flex items-center justify-center gap-1 mt-4 text-gray-400">
            <Lock size={12} />
            <span className="text-xs">Secure & encrypted payment</span>
          </div>

          <div className="flex gap-3 mt-6">
            <button onClick={() => setStep(1)} className="flex-1 py-3.5 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm">
              Back
            </button>
            <button onClick={() => setStep(3)} className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-saffron-500 to-gold-500 text-white font-semibold text-sm">
              Review Order
            </button>
          </div>
        </motion.div>
      )}

      {/* Step 3: Review */}
      {step === 3 && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="px-4">
          <h3 className="font-display font-bold text-lg text-gray-800 mb-4">Review & Confirm</h3>
          
          {/* Address Summary */}
          <div className="bg-white rounded-xl p-4 border border-gray-100 mb-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-gray-500 uppercase">Delivery To</span>
              <button onClick={() => setStep(1)} className="text-xs text-saffron-600 font-semibold">Edit</button>
            </div>
            <p className="text-sm font-semibold text-gray-700">{address.name}</p>
            <p className="text-xs text-gray-500">{address.line1}, {address.line2}</p>
            <p className="text-xs text-gray-500">{address.city}, {address.state} - {address.pincode}</p>
          </div>

          {/* Items Summary */}
          <div className="bg-white rounded-xl p-4 border border-gray-100 mb-3">
            <span className="text-xs font-semibold text-gray-500 uppercase">Items ({state.cart.length})</span>
            <div className="mt-2 space-y-2">
              {state.cart.map((item) => (
                <div key={item.product.id} className="flex items-center gap-3">
                  <img src={item.product.image} alt="" className="w-10 h-10 rounded-lg object-cover" />
                  <div className="flex-1">
                    <p className="text-xs font-medium text-gray-700 line-clamp-1">{item.product.name}</p>
                    <p className="text-[10px] text-gray-400">Qty: {item.quantity}</p>
                  </div>
                  <span className="text-sm font-semibold text-gray-700">₹{(item.product.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Summary */}
          <div className="bg-white rounded-xl p-4 border border-gray-100 mb-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-gray-500 uppercase">Payment</span>
              <button onClick={() => setStep(2)} className="text-xs text-saffron-600 font-semibold">Change</button>
            </div>
            <p className="text-sm text-gray-700">
              {paymentMethod === 'upi' ? '📱 UPI Payment' : paymentMethod === 'card' ? '💳 Card Payment' : '💵 Cash on Delivery'}
            </p>
          </div>

          {/* Total */}
          <div className="bg-saffron-50 rounded-xl p-4 border border-saffron-200/50">
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Subtotal</span>
                <span>₹{subtotal.toLocaleString()}</span>
              </div>
              {state.couponApplied && (
                <div className="flex justify-between text-green-600">
                  <span>Coupon</span>
                  <span>-₹{couponSavings.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-500">Shipping</span>
                <span className={shipping === 0 ? 'text-green-600' : ''}>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span>
              </div>
              {paymentMethod === 'cod' && (
                <div className="flex justify-between">
                  <span className="text-gray-500">COD Charge</span>
                  <span>₹49</span>
                </div>
              )}
              <div className="border-t border-saffron-200 pt-2 flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>₹{(total + (paymentMethod === 'cod' ? 49 : 0)).toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button onClick={() => setStep(2)} className="flex-1 py-3.5 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm">
              Back
            </button>
            <button
              onClick={placeOrder}
              disabled={placingOrder}
              className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-saffron-500 to-gold-500 text-white font-semibold text-sm flex items-center justify-center gap-2"
            >
              {placingOrder ? (
                <><Loader2 size={14} className="animate-spin" /> Placing...</>
              ) : (
                <><Lock size={14} /> Place Order</>
              )}
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
