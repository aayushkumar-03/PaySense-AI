import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Card } from '../ui/Card';
import { useCountUp } from '../../hooks/useCountUp';

const StatItem = ({ end, suffix, label }: { end: number, suffix: string, label: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  const count = useCountUp(end, 2, ref);

  return (
    <Card variant="glass" className="text-center" ref={ref}>
      <h3 className="text-4xl md:text-5xl font-bold font-display gradient-text mb-2">
        {count}{suffix}
      </h3>
      <p className="text-sm text-gray-400 font-medium">
        {label}
      </p>
    </Card>
  );
};

export const ProblemSection = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <section id="problem" className="py-24 relative" ref={sectionRef}>
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            className="text-3xl md:text-4xl font-bold font-heading text-white"
          >
            India's <span className="text-sky-400">500M+ Paytm Users</span> Are Flying Blind
          </motion.h2>
        </div>

        <motion.div 
          variants={containerVariants} 
          initial="hidden" 
          animate={isInView ? "show" : "hidden"} 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
        >
          <motion.div variants={itemVariants}><StatItem end={500} suffix="M+" label="Users with zero AI financial guidance" /></motion.div>
          <motion.div variants={itemVariants}><StatItem end={90} suffix="%" label="Make avoidable money mistakes monthly" /></motion.div>
          <motion.div variants={itemVariants}><StatItem end={8} suffix="+" label="Needed for a complete financial picture" /></motion.div>
          <motion.div variants={itemVariants}><StatItem end={0} suffix="" label="Spent on personalized financial AI" /></motion.div>
        </motion.div>

        <motion.div 
          variants={containerVariants} 
          initial="hidden" 
          animate={isInView ? "show" : "hidden"} 
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <motion.div variants={itemVariants} className="bg-[#111827] border border-white/5 rounded-2xl p-6 flex flex-col items-center text-center">
            <span className="text-4xl mb-4">🪤</span>
            <h4 className="text-lg font-bold text-white mb-2">WhatsApp Tip Trap</h4>
            <p className="text-gray-400 text-sm">Lakhs lost to unverified forwarded 'tips' and scams masquerading as advice.</p>
          </motion.div>
          <motion.div variants={itemVariants} className="bg-[#111827] border border-white/5 rounded-2xl p-6 flex flex-col items-center text-center">
            <span className="text-4xl mb-4">🧩</span>
            <h4 className="text-lg font-bold text-white mb-2">Fragmented Experience</h4>
            <p className="text-gray-400 text-sm">Salary, UPI, wallet, credit cards, EMI — all scattered across completely different apps.</p>
          </motion.div>
          <motion.div variants={itemVariants} className="bg-[#111827] border border-white/5 rounded-2xl p-6 flex flex-col items-center text-center">
            <span className="text-4xl mb-4">🔕</span>
            <h4 className="text-lg font-bold text-white mb-2">Zero Proactive Guidance</h4>
            <p className="text-gray-400 text-sm">No one tells you before you overspend. By the time you notice, the money is gone.</p>
          </motion.div>
          <motion.div variants={itemVariants} className="bg-[#111827] border border-white/5 rounded-2xl p-6 flex flex-col items-center text-center">
            <span className="text-4xl mb-4">🗣️</span>
            <h4 className="text-lg font-bold text-white mb-2">Vernacular Exclusion</h4>
            <p className="text-gray-400 text-sm">Advanced financial AI currently exists almost exclusively for fluent English speakers.</p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};
