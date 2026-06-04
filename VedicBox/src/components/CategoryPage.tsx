import { useState } from 'react';
import { useApp } from '../store';
import { products } from '../data';
import { SlidersHorizontal, Grid3X3, List, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ProductCard from './ProductCard';

export default function CategoryPage() {
  const { state, dispatch } = useApp();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('popular');
  const [localFilters, setLocalFilters] = useState({
    priceRange: [0, 10000] as [number, number],
    forType: 'all',
    festivalSpecial: false,
  });

  let filtered = products.filter(p => {
    if (state.selectedCategory !== 'all' && p.category !== state.selectedCategory) return false;
    if (state.searchQuery) {
      const q = state.searchQuery.toLowerCase();
      if (!p.name.toLowerCase().includes(q) && !p.description.toLowerCase().includes(q) &&
          !p.tags.some(t => t.includes(q)) && !(p.nameHindi || '').includes(q)) return false;
    }
    if (localFilters.forType !== 'all' && !p.forType.includes(localFilters.forType as any)) return false;
    if (localFilters.festivalSpecial && !p.isFestivalSpecial) return false;
    if (p.price < localFilters.priceRange[0] || p.price > localFilters.priceRange[1]) return false;
    return true;
  });

  if (sortBy === 'price-low') filtered.sort((a, b) => a.price - b.price);
  else if (sortBy === 'price-high') filtered.sort((a, b) => b.price - a.price);
  else if (sortBy === 'rating') filtered.sort((a, b) => b.rating - a.rating);
  else if (sortBy === 'discount') filtered.sort((a, b) => b.discount - a.discount);
  else filtered.sort((a, b) => b.reviews - a.reviews);

  return (
    <div className="pb-20">
      {/* Category Tabs */}
      <div className="sticky top-[52px] z-30 bg-white border-b border-saffron-100">
        <div className="flex items-center px-4 py-2.5 gap-2 overflow-x-auto hide-scrollbar">
          {[
            { label: 'All', value: 'all' as const },
            { label: '🕉️ Vastu', value: 'vastu' as const },
            { label: '🪔 Puja', value: 'puja' as const },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => dispatch({ type: 'SET_CATEGORY', category: tab.value })}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                state.selectedCategory === tab.value
                  ? 'bg-gradient-to-r from-saffron-500 to-gold-500 text-white'
                  : 'bg-saffron-50 text-gray-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
          <div className="w-px h-6 bg-gray-200 mx-1" />
          <button
            onClick={() => setShowFilters(true)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-saffron-50 text-gray-600 text-xs font-semibold whitespace-nowrap"
          >
            <SlidersHorizontal size={12} /> Filters
          </button>
        </div>
      </div>

      {/* Sort & View Controls */}
      <div className="flex items-center justify-between px-4 py-3">
        <p className="text-xs text-gray-500">{filtered.length} products found</p>
        <div className="flex items-center gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="text-xs bg-white border border-gray-200 rounded-lg px-2 py-1.5 text-gray-600 focus:outline-none focus:border-saffron-300"
          >
            <option value="popular">Most Popular</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
            <option value="discount">Biggest Discount</option>
          </select>
          <div className="flex bg-gray-100 rounded-lg p-0.5">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md ${viewMode === 'grid' ? 'bg-white shadow-sm' : ''}`}
            >
              <Grid3X3 size={14} className={viewMode === 'grid' ? 'text-saffron-500' : 'text-gray-400'} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md ${viewMode === 'list' ? 'bg-white shadow-sm' : ''}`}
            >
              <List size={14} className={viewMode === 'list' ? 'text-saffron-500' : 'text-gray-400'} />
            </button>
          </div>
        </div>
      </div>

      {/* Products */}
      <div className={`px-4 ${viewMode === 'grid' ? 'grid grid-cols-2 gap-3' : 'space-y-3'}`}>
        {filtered.map((product, i) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <ProductCard product={product} compact={viewMode === 'grid'} />
          </motion.div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 px-4">
          <span className="text-5xl mb-4">🔍</span>
          <h3 className="font-display font-bold text-gray-700 text-lg">No products found</h3>
          <p className="text-gray-400 text-sm text-center mt-2">Try adjusting your filters or search query</p>
          <button
            onClick={() => {
              dispatch({ type: 'SET_CATEGORY', category: 'all' });
              dispatch({ type: 'SET_SEARCH', query: '' });
              setLocalFilters({ priceRange: [0, 10000], forType: 'all', festivalSpecial: false });
            }}
            className="mt-4 bg-saffron-500 text-white px-6 py-2 rounded-full text-sm font-semibold"
          >
            Clear All Filters
          </button>
        </div>
      )}

      {/* Filter Bottom Sheet */}
      <AnimatePresence>
        {showFilters && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black z-50"
              onClick={() => setShowFilters(false)}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="fixed bottom-0 left-0 right-0 bg-white z-50 rounded-t-3xl max-h-[80vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-white p-4 border-b border-gray-100 flex items-center justify-between rounded-t-3xl">
                <h3 className="font-display font-bold text-lg">Filters</h3>
                <button onClick={() => setShowFilters(false)}>
                  <X size={24} className="text-gray-400" />
                </button>
              </div>
              <div className="p-4 space-y-6">
                {/* Price Range */}
                <div>
                  <h4 className="font-semibold text-sm text-gray-700 mb-3">Price Range</h4>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-gray-500">₹{localFilters.priceRange[0]}</span>
                    <input
                      type="range"
                      min={0}
                      max={10000}
                      step={500}
                      value={localFilters.priceRange[1]}
                      onChange={(e) => setLocalFilters(f => ({ ...f, priceRange: [f.priceRange[0], parseInt(e.target.value)] }))}
                      className="flex-1"
                    />
                    <span className="text-xs text-gray-500">₹{localFilters.priceRange[1]}</span>
                  </div>
                </div>

                {/* For Type */}
                <div>
                  <h4 className="font-semibold text-sm text-gray-700 mb-3">Space Type</h4>
                  <div className="flex flex-wrap gap-2">
                    {['all', 'home', 'office', 'business', 'shop'].map((type) => (
                      <button
                        key={type}
                        onClick={() => setLocalFilters(f => ({ ...f, forType: type }))}
                        className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                          localFilters.forType === type
                            ? 'bg-saffron-500 text-white'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {type === 'all' ? 'All' : type.charAt(0).toUpperCase() + type.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Festival Special */}
                <div>
                  <label className="flex items-center gap-3">
                    <div
                      className={`w-11 h-6 rounded-full relative transition-colors cursor-pointer ${
                        localFilters.festivalSpecial ? 'bg-saffron-500' : 'bg-gray-200'
                      }`}
                      onClick={() => setLocalFilters(f => ({ ...f, festivalSpecial: !f.festivalSpecial }))}
                    >
                      <div
                        className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform shadow ${
                          localFilters.festivalSpecial ? 'translate-x-5' : 'translate-x-0.5'
                        }`}
                      />
                    </div>
                    <span className="text-sm text-gray-700 font-medium">Festival Special Only</span>
                  </label>
                </div>
              </div>
              <div className="sticky bottom-0 bg-white p-4 border-t border-gray-100 flex gap-3">
                <button
                  onClick={() => {
                    setLocalFilters({ priceRange: [0, 10000], forType: 'all', festivalSpecial: false });
                  }}
                  className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold"
                >
                  Reset
                </button>
                <button
                  onClick={() => setShowFilters(false)}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-saffron-500 to-gold-500 text-white text-sm font-semibold"
                >
                  Apply Filters
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
