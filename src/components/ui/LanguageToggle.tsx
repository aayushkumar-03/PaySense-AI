import React from 'react';
import { motion } from 'framer-motion';
import { useUiStore } from '../../store/uiStore';

export const LanguageToggle = () => {
  const { language, setLanguage } = useUiStore();

  const handleToggle = (lang: 'en' | 'hi' | 'mix') => {
    setLanguage(lang);
    // In a real app we'd also trigger API call here to persist.
  };

  const options: Array<{ id: 'en' | 'hi' | 'mix', label: string }> = [
    { id: 'en', label: 'EN' },
    { id: 'hi', label: 'HI' },
    { id: 'mix', label: 'Mix' },
  ];

  return (
    <div className="flex items-center p-1 bg-[#1F2937] border border-white/10 rounded-full relative">
      {options.map((opt) => {
        const isActive = language === opt.id;
        return (
          <button
            key={opt.id}
            onClick={() => handleToggle(opt.id)}
            className={`relative px-3 py-1 text-xs z-10 transition-colors ${isActive ? 'text-white font-semibold' : 'text-gray-400 hover:text-gray-300'}`}
          >
            {isActive && (
              <motion.div
                layoutId="language-toggle-bubble"
                className="absolute inset-0 bg-sky-600 rounded-full -z-10"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
};
