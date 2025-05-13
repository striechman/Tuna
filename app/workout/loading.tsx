'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const loadingMessages = [
  'מאתחל את המצלמה...',
  'מכין את מערכת זיהוי התנועות...',
  'מאתחל את מודל זיהוי התרגילים...',
  'מכין את מערכת זיהוי מצבי חירום...',
  'כמעט מוכן...'
];

export default function Loading() {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
      <div className="text-center">
        <motion.div
          className="w-24 h-24 mx-auto mb-8"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 360],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <svg
            className="w-full h-full text-blue-500"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
          </svg>
        </motion.div>

        <motion.div
          key={currentMessageIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          className="text-2xl font-bold text-white mb-4"
        >
          {loadingMessages[currentMessageIndex]}
        </motion.div>

        <div className="flex justify-center gap-2">
          {loadingMessages.map((_, index) => (
            <motion.div
              key={index}
              className={`w-2 h-2 rounded-full ${
                index === currentMessageIndex ? 'bg-blue-500' : 'bg-gray-600'
              }`}
              animate={{
                scale: index === currentMessageIndex ? [1, 1.5, 1] : 1,
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
} 