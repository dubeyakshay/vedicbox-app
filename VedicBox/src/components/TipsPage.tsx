import { useState } from 'react';
import { dailyTips } from '../data';
import { BookOpen, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const blogArticles = [
  { title: '10 Vastu Tips for a Prosperous Home', category: 'Vastu', readTime: '5 min', image: '🏠' },
  { title: 'How to Perform Satyanarayan Puja at Home', category: 'Puja Guide', readTime: '8 min', image: '🪔' },
  { title: 'Understanding Vastu Directions & Their Effects', category: 'Education', readTime: '6 min', image: '🧭' },
  { title: 'Best Plants for Positive Energy According to Vastu', category: 'Tips', readTime: '4 min', image: '🌿' },
  { title: 'Navratri 2024: Complete Puja Guide', category: 'Festival', readTime: '10 min', image: '🎆' },
];

const mantras = [
  {
    name: 'Om Namah Shivaya',
    subtitle: 'Powerful Shiva Mantra Chanting',
    benefit: 'Peace & Strength',
    duration: '33 min',
    icon: '🕉️',
    color: 'from-blue-500 to-indigo-600',
    youtubeId: '0kNfvEukjh0',
  },
  {
    name: 'Gayatri Mantra',
    subtitle: '108 Times Peaceful Chanting',
    benefit: 'Wisdom & Knowledge',
    duration: '28 min',
    icon: '☀️',
    color: 'from-amber-500 to-orange-600',
    youtubeId: 'DWbb9SoCeGA',
  },
  {
    name: 'Ganesh Mantra',
    subtitle: 'Om Gan Ganpataye Namo Namah',
    benefit: 'Remove Obstacles',
    duration: '25 min',
    icon: '🙏',
    color: 'from-red-500 to-rose-600',
    youtubeId: 'jMqa6OLBM0s',
  },
  {
    name: 'Lakshmi Mantra',
    subtitle: 'Om Shreem Mahalakshmiyei Swaha',
    benefit: 'Wealth & Prosperity',
    duration: '18 min',
    icon: '💰',
    color: 'from-yellow-500 to-amber-600',
    youtubeId: '1ak9O1Kw3BY',
  },
  {
    name: 'Mahamrityunjaya Mantra',
    subtitle: '108 Times by Anuradha Paudwal',
    benefit: 'Healing & Protection',
    duration: '50 min',
    icon: '🙏',
    color: 'from-emerald-500 to-teal-600',
    youtubeId: 'L-y1sr1qUlE',
  },
  {
    name: 'Hanuman Chalisa',
    subtitle: 'Full HD with Lyrics',
    benefit: 'Courage & Protection',
    duration: '10 min',
    icon: '🐒',
    color: 'from-orange-500 to-red-600',
    youtubeId: '0WCN0YotNng',
  },
];

const festivals = [
  { name: 'Navratri', date: 'Oct 3 - Oct 12', daysAway: 45 },
  { name: 'Dussehra', date: 'Oct 12', daysAway: 54 },
  { name: 'Diwali', date: 'Nov 1', daysAway: 74 },
  { name: 'Dev Diwali', date: 'Nov 15', daysAway: 88 },
];

export default function TipsPage() {
  const [activeTab, setActiveTab] = useState<'tips' | 'mantras' | 'blog' | 'festivals'>('tips');
  const [playingMantra, setPlayingMantra] = useState<number | null>(null);

  return (
    <div className="pb-20">
      <div className="px-4 py-4">
        <h2 className="font-display font-bold text-lg text-gray-800">Daily Vastu Tips & Mantras</h2>
        <p className="text-xs text-gray-400">Your daily dose of spiritual guidance</p>
      </div>

      {/* Tabs */}
      <div className="px-4 mb-4">
        <div className="flex gap-2 overflow-x-auto hide-scrollbar">
          {[
            { id: 'tips' as const, label: '✨ Tips' },
            { id: 'mantras' as const, label: '🕉️ Mantras' },
            { id: 'blog' as const, label: '📖 Articles' },
            { id: 'festivals' as const, label: '🎆 Festivals' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-saffron-500 to-gold-500 text-white'
                  : 'bg-white border border-gray-100 text-gray-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tips */}
      {activeTab === 'tips' && (
        <div className="px-4 space-y-3">
          {dailyTips.map((tip, i) => (
            <motion.div
              key={tip.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-2xl p-4 border border-saffron-100/50 shadow-sm"
            >
              <div className="flex items-start gap-3">
                <span className="text-3xl">{tip.icon}</span>
                <div className="flex-1">
                  <span className="bg-saffron-50 text-saffron-700 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                    {tip.category}
                  </span>
                  <h3 className="font-display font-bold text-gray-800 text-sm mt-1">{tip.title}</h3>
                  <p className="text-xs text-gray-600 mt-1 leading-relaxed">{tip.content}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Mantras */}
      {activeTab === 'mantras' && (
        <div className="px-4 space-y-3">
          {/* Header */}
          <div className="bg-gradient-to-br from-purple-600 via-indigo-600 to-violet-700 rounded-2xl p-5 text-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'radial-gradient(circle at 30% 50%, white 1px, transparent 1px)', backgroundSize: '20px 20px'}} />
            <span className="text-5xl block mb-2">🕉️</span>
            <h3 className="text-white font-display text-xl font-bold">Sacred Mantras</h3>
            <p className="text-white/70 text-xs mt-1">Tap any mantra to play real chanting audio</p>
            <p className="text-white/50 text-[10px] mt-1">🔊 Powered by YouTube • Turn volume up</p>
          </div>

          {/* Mantra Cards */}
          {mantras.map((mantra, i) => {
            const isPlaying = playingMantra === i;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm"
              >
                {/* Color bar */}
                <div className={`h-1.5 bg-gradient-to-r ${mantra.color}`} />

                {/* Card Content */}
                <button
                  onClick={() => setPlayingMantra(isPlaying ? null : i)}
                  className="w-full p-4 flex items-center gap-3 text-left"
                >
                  {/* Play Icon */}
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all ${
                    isPlaying
                      ? `bg-gradient-to-br ${mantra.color} text-white shadow-lg`
                      : 'bg-gray-50 text-gray-500'
                  }`}>
                    {isPlaying ? (
                      <div className="flex items-end gap-[3px] h-5">
                        {[1,2,3,4].map(b => (
                          <motion.div
                            key={b}
                            animate={{ height: ['30%', '100%', '30%'] }}
                            transition={{ repeat: Infinity, duration: 0.5 + b * 0.1, delay: b * 0.08 }}
                            className="w-[3px] bg-white rounded-full"
                          />
                        ))}
                      </div>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{mantra.icon}</span>
                      <h4 className="font-semibold text-sm text-gray-800 truncate">{mantra.name}</h4>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-0.5 truncate">{mantra.subtitle}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-full text-white bg-gradient-to-r ${mantra.color}`}>
                        {mantra.benefit}
                      </span>
                      <span className="text-[10px] text-gray-400">⏱ {mantra.duration}</span>
                    </div>
                  </div>

                  {/* Arrow / Close */}
                  <div className="flex-shrink-0">
                    {isPlaying ? (
                      <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center text-red-400">
                        <X size={14} />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M6 9l6 6 6-6"/>
                        </svg>
                      </div>
                    )}
                  </div>
                </button>

                {/* YouTube Embed */}
                <AnimatePresence>
                  {isPlaying && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4">
                        <div className="rounded-xl overflow-hidden bg-black shadow-inner relative" style={{ paddingBottom: '56.25%' }}>
                          <iframe
                            className="absolute inset-0 w-full h-full"
                            src={`https://www.youtube.com/embed/${mantra.youtubeId}?autoplay=1&rel=0&modestbranding=1`}
                            title={mantra.name}
                            allow="autoplay; encrypted-media"
                            allowFullScreen
                          />
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <p className="text-[10px] text-gray-400">
                            🎵 {mantra.name} — {mantra.subtitle}
                          </p>
                          <button
                            onClick={(e) => { e.stopPropagation(); setPlayingMantra(null); }}
                            className="text-[10px] text-red-400 font-semibold"
                          >
                            Close
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}

          {/* Footer */}
          <div className="bg-indigo-50 rounded-xl p-3 mt-2">
            <p className="text-[10px] text-indigo-600 text-center leading-relaxed">
              🎵 Mantras stream from YouTube. Requires internet connection.
              <br />Use headphones for the best meditation experience. 🙏
            </p>
          </div>
        </div>
      )}

      {/* Blog */}
      {activeTab === 'blog' && (
        <div className="px-4 space-y-3">
          {blogArticles.map((article, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-2xl p-4 border border-gray-100 flex items-start gap-3"
            >
              <span className="text-3xl">{article.image}</span>
              <div className="flex-1">
                <span className="text-[10px] text-saffron-600 font-semibold">{article.category}</span>
                <h4 className="font-semibold text-sm text-gray-800 mt-0.5">{article.title}</h4>
                <div className="flex items-center gap-2 mt-2">
                  <BookOpen size={10} className="text-gray-400" />
                  <span className="text-[10px] text-gray-400">{article.readTime} read</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Festivals */}
      {activeTab === 'festivals' && (
        <div className="px-4 space-y-3">
          <div className="bg-gradient-to-r from-sacred to-sacred-light rounded-2xl p-5 text-center mb-4">
            <span className="text-4xl block mb-2">🎆</span>
            <h3 className="text-white font-display text-lg font-bold">Upcoming Festivals</h3>
            <p className="text-white/70 text-xs mt-1">Plan your celebrations in advance</p>
          </div>
          {festivals.map((festival, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-xl p-4 border border-gray-100 flex items-center justify-between"
            >
              <div>
                <h4 className="font-display font-bold text-gray-800">{festival.name}</h4>
                <p className="text-xs text-gray-400">{festival.date}</p>
              </div>
              <span className="bg-saffron-50 text-saffron-700 text-xs font-semibold px-3 py-1.5 rounded-full">
                {festival.daysAway} days
              </span>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
