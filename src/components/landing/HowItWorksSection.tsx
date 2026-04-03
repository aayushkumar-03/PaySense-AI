import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { ChatBubble } from '../ui/ChatBubble';

const conversations = [
  {
    id: 1,
    userMsg: "Mera food budget kya hai?",
    aiMsg: "Aapka food budget ₹5,000/month hai. Ab tak ₹4,350 kharch kar chuke ho — sirf ₹650 bacha hai! 🚨"
  },
  {
    id: 2,
    userMsg: "Why did my credit score drop?",
    aiMsg: "Your CIBIL dropped 22 points because your credit utilization crossed 35%. Pay ₹8,000 off your card this week to recover it. 📉"
  },
  {
    id: 3,
    userMsg: "I have ₹5000 idle in wallet",
    aiMsg: "Great! For ₹5,000 idle funds: \n1. SIP in Nifty 50 index fund for long-term\n2. 3-month FD for 7.1% guaranteed return \nWhich fits your goal? 💰"
  }
];

export const HowItWorksSection = () => {
  const [activeIdx, setActiveIdx] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % conversations.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  return (
    <section id="how-it-works" className="py-24 bg-[#0A0F1E] relative border-t border-white/5" ref={sectionRef}>
      <div className="max-w-4xl mx-auto px-6">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold font-heading text-white">
            One Chat. Total Control.
          </h2>
        </motion.div>

        {/* Steps */}
        <motion.div 
          className="hidden md:flex justify-between items-start mb-16 relative"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
          transition={{ delay: 0.2 }}
        >
          <div className="absolute top-6 left-0 right-0 h-[2px] bg-white/10 border border-dashed border-white/20 -z-10" />
          
          <div className="flex flex-col items-center flex-1 max-w-[250px] text-center">
            <div className="w-12 h-12 bg-[#111827] rounded-full border border-sky-500 text-sky-400 font-bold flex items-center justify-center mb-4 text-xl">01</div>
            <h3 className="text-white font-semibold mb-2">Ask in Hindi or English</h3>
            <p className="text-sm text-gray-400">Speak naturally regarding your finances without any banking jargon.</p>
          </div>
          <div className="flex flex-col items-center flex-1 max-w-[250px] text-center">
            <div className="w-12 h-12 bg-[#111827] rounded-full border border-indigo-500 text-indigo-400 font-bold flex items-center justify-center mb-4 text-xl">02</div>
            <h3 className="text-white font-semibold mb-2">AI reads your data</h3>
            <p className="text-sm text-gray-400">It securely maps against your own synced Paytm transactions and limits.</p>
          </div>
          <div className="flex flex-col items-center flex-1 max-w-[250px] text-center">
            <div className="w-12 h-12 bg-[#111827] rounded-full border border-emerald-500 text-emerald-400 font-bold flex items-center justify-center mb-4 text-xl">03</div>
            <h3 className="text-white font-semibold mb-2">Get smart answers</h3>
            <p className="text-sm text-gray-400">Receive accurate context-aware responses with actionable advice.</p>
          </div>
        </motion.div>

        {/* Demo Cell Phone */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ delay: 0.4 }}
          className="mx-auto w-full max-w-[340px] h-[500px] bg-[#111827] rounded-[40px] border-4 border-[#2a3045] shadow-2xl overflow-hidden relative ring-1 ring-white/10 flex flex-col"
        >
          {/* Header */}
          <div className="px-5 py-4 border-b border-white/5 bg-[#1F2937] text-center shrink-0">
            <span className="font-semibold text-sm text-white">PaySense Demo</span>
          </div>

          {/* Chat Container */}
          <div className="flex-1 p-4 bg-[#0A0F1E] relative overflow-hidden flex flex-col justify-end pb-12">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeIdx}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.5 }}
                className="w-full flex flex-col gap-4"
              >
                <ChatBubble role="user" content={conversations[activeIdx].userMsg} />
                <ChatBubble role="assistant" content={conversations[activeIdx].aiMsg} />
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
