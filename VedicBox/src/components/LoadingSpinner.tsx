import { motion } from 'framer-motion';

export function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeMap = { sm: 24, md: 40, lg: 56 };

  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
      className="inline-block"
    >
      <div
        className="border-4 border-amber-200 border-t-amber-600 rounded-full"
        style={{ width: sizeMap[size], height: sizeMap[size] }}
      />
    </motion.div>
  );
}

export function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <p className="text-gray-600 mt-4">Loading...</p>
      </div>
    </div>
  );
}
