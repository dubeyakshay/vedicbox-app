import { useState } from 'react';
import { useApp } from '../store';
import { quizQuestions, products } from '../data';
import { ArrowRight, ArrowLeft, Sparkles, ShoppingCart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function QuizPage() {
  const { dispatch } = useApp();
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [showResult, setShowResult] = useState(false);

  const handleAnswer = (answer: string) => {
    const newAnswers = [...answers];
    newAnswers[currentQ] = answer;
    setAnswers(newAnswers);
  };

  const nextQuestion = () => {
    if (currentQ < quizQuestions.length - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      setShowResult(true);
    }
  };

  const getRecommendations = () => {
    const propertyType = answers[0] || '';
    const problem = answers[2] || '';

    let recommended = products.slice();

    if (propertyType.includes('Office')) {
      recommended = recommended.filter(p => p.forType.includes('office') || p.forType.includes('business'));
    } else if (propertyType.includes('Shop')) {
      recommended = recommended.filter(p => p.forType.includes('shop') || p.forType.includes('business'));
    }

    if (problem.includes('Financial')) {
      recommended = recommended.filter(p => p.tags.includes('wealth') || p.tags.includes('business') || p.name.includes('Wealth') || p.name.includes('Lakshmi'));
    } else if (problem.includes('Health')) {
      recommended = recommended.filter(p => p.tags.includes('vastu') || p.name.includes('Dosh'));
    } else if (problem.includes('Negative')) {
      recommended = recommended.filter(p => p.tags.includes('protection') || p.name.includes('Nazar') || p.name.includes('Protection'));
    }

    if (recommended.length === 0) recommended = products.slice(0, 3);
    return recommended.slice(0, 3);
  };

  if (showResult) {
    const recommendations = getRecommendations();
    return (
      <div className="pb-20">
        <div className="px-4 py-6 text-center">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>
            <span className="text-6xl block mb-4">🧭</span>
            <h2 className="font-display font-bold text-2xl text-gray-800">Your Remedy Results</h2>
            <p className="text-gray-500 text-sm mt-2">Based on your answers, we recommend:</p>
          </motion.div>
        </div>

        <div className="px-4 space-y-4">
          {recommendations.map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.2 }}
              className="bg-white rounded-2xl p-4 border border-saffron-100 shadow-sm"
            >
              <div className="flex gap-3">
                <img src={product.image} alt={product.name} className="w-20 h-20 rounded-xl object-cover" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="bg-saffron-100 text-saffron-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      #{i + 1} Recommended
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-800 text-sm">{product.name}</h3>
                  {product.nameHindi && (
                    <p className="text-[10px] text-saffron-600 font-devanagari">{product.nameHindi}</p>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    <span className="font-bold text-gray-800">₹{product.price.toLocaleString()}</span>
                    <span className="text-xs text-gray-400 line-through">₹{product.originalPrice.toLocaleString()}</span>
                  </div>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-3 line-clamp-2">{product.description}</p>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => {
                    dispatch({ type: 'SET_PRODUCT', product });
                    dispatch({ type: 'SET_PAGE', page: 'product' });
                  }}
                  className="flex-1 py-2.5 rounded-xl border border-saffron-300 text-saffron-600 text-xs font-semibold"
                >
                  View Details
                </button>
                <button
                  onClick={() => dispatch({ type: 'ADD_TO_CART', product })}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-saffron-500 to-gold-500 text-white text-xs font-semibold flex items-center justify-center gap-1"
                >
                  <ShoppingCart size={12} /> Add to Cart
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="px-4 mt-6">
          <button
            onClick={() => { setCurrentQ(0); setAnswers([]); setShowResult(false); }}
            className="w-full py-3 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm"
          >
            Retake Quiz
          </button>
        </div>
      </div>
    );
  }

  const question = quizQuestions[currentQ];
  const progress = ((currentQ + 1) / quizQuestions.length) * 100;

  return (
    <div className="pb-20 min-h-[80vh] flex flex-col">
      <div className="px-4 py-4">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles size={16} className="text-saffron-500" />
          <h2 className="font-display font-bold text-lg text-gray-800">Find Your Vastu Remedy</h2>
        </div>
        <p className="text-xs text-gray-400">Answer a few questions to get personalized recommendations</p>
      </div>

      {/* Progress */}
      <div className="px-4 mb-6">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-gray-400">Question {currentQ + 1} of {quizQuestions.length}</span>
          <span className="text-xs text-saffron-600 font-semibold">{Math.round(progress)}%</span>
        </div>
        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className="h-full bg-gradient-to-r from-saffron-500 to-gold-500 rounded-full"
          />
        </div>
      </div>

      {/* Question */}
      <div className="flex-1 px-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQ}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
          >
            <h3 className="font-display font-bold text-xl text-gray-800 mb-6">{question.question}</h3>
            <div className="space-y-3">
              {question.options.map((option) => (
                <button
                  key={option}
                  onClick={() => handleAnswer(option)}
                  className={`w-full p-4 rounded-xl border-2 text-left text-sm font-medium transition-all ${
                    answers[currentQ] === option
                      ? 'border-saffron-500 bg-saffron-50 text-saffron-700'
                      : 'border-gray-100 bg-white text-gray-600 hover:border-gray-200'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="px-4 py-4 flex gap-3">
        {currentQ > 0 && (
          <button
            onClick={() => setCurrentQ(currentQ - 1)}
            className="flex-1 py-3.5 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm flex items-center justify-center gap-2"
          >
            <ArrowLeft size={16} /> Previous
          </button>
        )}
        <button
          onClick={nextQuestion}
          disabled={!answers[currentQ]}
          className={`flex-1 py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 ${
            answers[currentQ]
              ? 'bg-gradient-to-r from-saffron-500 to-gold-500 text-white'
              : 'bg-gray-200 text-gray-400'
          }`}
        >
          {currentQ < quizQuestions.length - 1 ? (
            <>Next <ArrowRight size={16} /></>
          ) : (
            <>Get Results <Sparkles size={16} /></>
          )}
        </button>
      </div>
    </div>
  );
}
