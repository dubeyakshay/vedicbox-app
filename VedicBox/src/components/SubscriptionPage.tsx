import { useState } from 'react';
import { subscriptions } from '../data';
import { Check, Crown, ArrowRight, Pause, X as XIcon } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SubscriptionPage() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [activeSubs, setActiveSubs] = useState<string[]>([]);

  const handleSubscribe = (planId: string) => {
    setActiveSubs(prev => [...prev, planId]);
    setSelectedPlan(planId);
  };

  const handlePause = (planId: string) => {
    setActiveSubs(prev => prev.filter(id => id !== planId));
  };

  return (
    <div className="pb-20">
      <div className="px-4 py-4">
        <h2 className="font-display font-bold text-lg text-gray-800">Subscriptions</h2>
        <p className="text-xs text-gray-400">Never miss your daily puja essentials</p>
      </div>

      {/* Hero */}
      <div className="px-4 mb-5">
        <div className="bg-gradient-to-r from-saffron-500 via-gold-500 to-saffron-500 rounded-2xl p-5 text-center relative overflow-hidden">
          <div className="absolute -top-4 -right-4 text-8xl opacity-10">🔄</div>
          <Crown size={32} className="text-white mx-auto mb-2" />
          <h3 className="text-white font-display text-xl font-bold">Subscribe & Save</h3>
          <p className="text-white/80 text-xs mt-1">Get fresh puja items delivered monthly</p>
          <p className="text-white/60 text-[10px] mt-2">Cancel or pause anytime • Free delivery</p>
        </div>
      </div>

      {/* Plans */}
      <div className="px-4 space-y-4">
        {subscriptions.map((sub, i) => {
          const isActive = activeSubs.includes(sub.id);
          return (
            <motion.div
              key={sub.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`rounded-2xl p-4 border-2 transition-all ${
                isActive
                  ? 'border-green-400 bg-green-50'
                  : selectedPlan === sub.id
                  ? 'border-saffron-500 bg-saffron-50'
                  : 'border-gray-100 bg-white'
              }`}
            >
              {i === 2 && (
                <span className="inline-block bg-gradient-to-r from-saffron-500 to-gold-500 text-white text-[10px] font-bold px-3 py-0.5 rounded-full mb-2">
                  ⭐ MOST POPULAR
                </span>
              )}
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-display font-bold text-gray-800">{sub.name}</h3>
                  <p className="text-xs text-gray-400 mt-0.5">{sub.frequency}</p>
                </div>
                <div className="text-right">
                  <span className="font-bold text-xl text-gray-800">₹{sub.price}</span>
                  <span className="text-xs text-gray-400">/{sub.frequency === 'Monthly' ? 'mo' : 'qtr'}</span>
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-2">{sub.description}</p>
              <ul className="mt-3 space-y-1.5">
                {sub.features.map((f, fi) => (
                  <li key={fi} className="flex items-center gap-2 text-xs text-gray-600">
                    <Check size={12} className="text-green-500" />
                    {f}
                  </li>
                ))}
              </ul>
              <div className="mt-4">
                {isActive ? (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handlePause(sub.id)}
                      className="flex-1 flex items-center justify-center gap-1 py-2.5 rounded-xl border border-yellow-400 text-yellow-600 text-xs font-semibold"
                    >
                      <Pause size={12} /> Pause
                    </button>
                    <button
                      onClick={() => handlePause(sub.id)}
                      className="flex-1 flex items-center justify-center gap-1 py-2.5 rounded-xl border border-red-300 text-red-500 text-xs font-semibold"
                    >
                      <XIcon size={12} /> Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleSubscribe(sub.id)}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-saffron-500 to-gold-500 text-white font-semibold text-sm flex items-center justify-center gap-2"
                  >
                    Subscribe Now <ArrowRight size={14} />
                  </button>
                )}
              </div>
              {isActive && (
                <p className="text-center text-green-600 text-xs font-semibold mt-2">✅ Active Subscription</p>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* FAQ */}
      <div className="px-4 mt-8 mb-4">
        <h3 className="font-display font-bold text-gray-800 mb-3">FAQs</h3>
        <div className="space-y-3">
          {[
            { q: 'Can I cancel anytime?', a: 'Yes, you can cancel or pause your subscription anytime from your profile.' },
            { q: 'When will I receive my kit?', a: 'Monthly kits are delivered on the 1st of each month. Quarterly kits are delivered at the start of each quarter.' },
            { q: 'Can I customize my kit?', a: 'Premium subscribers can customize their kit contents. Contact support for basic plans.' },
          ].map((faq, i) => (
            <div key={i} className="bg-white rounded-xl p-4 border border-gray-100">
              <p className="text-sm font-semibold text-gray-700">{faq.q}</p>
              <p className="text-xs text-gray-500 mt-1">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
