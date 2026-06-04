import { useApp } from '../store';
// icons available for future use
import { motion } from 'framer-motion';

const stages = ['Order Placed', 'Packed', 'Shipped', 'Delivered'];

export default function OrdersPage() {
  const { state, dispatch } = useApp();

  if (state.orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 pb-20">
        <span className="text-7xl mb-4">📦</span>
        <h2 className="font-display font-bold text-xl text-gray-800">No Orders Yet</h2>
        <p className="text-gray-400 text-sm mt-2 text-center">Start your spiritual journey by ordering your first kit</p>
        <button
          onClick={() => dispatch({ type: 'SET_PAGE', page: 'category' })}
          className="mt-6 bg-gradient-to-r from-saffron-500 to-gold-500 text-white px-8 py-3 rounded-full text-sm font-semibold"
        >
          Browse Products
        </button>
      </div>
    );
  }

  return (
    <div className="pb-20">
      <div className="px-4 py-4">
        <h2 className="font-display font-bold text-lg text-gray-800">My Orders</h2>
        <p className="text-xs text-gray-400">{state.orders.length} orders</p>
      </div>

      <div className="px-4 space-y-4">
        {state.orders.map((order, idx) => {
          const currentStage = Math.min(idx + 1, stages.length - 1);
          return (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white rounded-2xl p-4 border border-saffron-100/50 shadow-sm"
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-xs text-gray-400">Order #{order.id}</p>
                  <p className="text-[10px] text-gray-400">{order.date}</p>
                </div>
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                  stages[currentStage] === 'Delivered'
                    ? 'bg-green-50 text-green-600'
                    : 'bg-saffron-50 text-saffron-600'
                }`}>
                  {stages[currentStage]}
                </span>
              </div>

              {/* Items */}
              <div className="flex gap-2 mb-4">
                {order.items.slice(0, 3).map((item) => (
                  <img
                    key={item.product.id}
                    src={item.product.image}
                    alt=""
                    className="w-14 h-14 rounded-lg object-cover"
                  />
                ))}
                {order.items.length > 3 && (
                  <div className="w-14 h-14 rounded-lg bg-gray-100 flex items-center justify-center text-xs text-gray-500 font-semibold">
                    +{order.items.length - 3}
                  </div>
                )}
              </div>

              {/* Progress */}
              <div className="flex items-center gap-1 mb-2">
                {stages.map((stage, i) => (
                  <div key={stage} className="flex items-center flex-1">
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                      i <= currentStage
                        ? 'bg-saffron-500'
                        : 'bg-gray-200'
                    }`}>
                      {i <= currentStage && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                    {i < stages.length - 1 && (
                      <div className={`flex-1 h-0.5 ${i < currentStage ? 'bg-saffron-500' : 'bg-gray-200'}`} />
                    )}
                  </div>
                ))}
              </div>
              <div className="flex justify-between">
                {stages.map((stage, i) => (
                  <span key={stage} className={`text-[8px] ${i <= currentStage ? 'text-saffron-600 font-semibold' : 'text-gray-400'}`}>
                    {stage}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                <span className="font-bold text-gray-800">₹{order.total.toLocaleString()}</span>
                <span className="text-xs text-gray-400">
                  {order.items.reduce((s, i) => s + i.quantity, 0)} items
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
