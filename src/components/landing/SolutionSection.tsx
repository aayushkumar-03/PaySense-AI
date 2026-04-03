import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Card } from '../ui/Card';
import { PieChart, BellRing, Target, PiggyBank, Languages, ShieldAlert } from 'lucide-react';

export const SolutionSection = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  const features = [
    {
      icon: <PieChart size={24} className="text-blue-500" />,
      bg: "bg-blue-500/10",
      title: "Unified Money View",
      desc: "See all Paytm transactions, wallet, bills in one comprehensive place."
    },
    {
      icon: <BellRing size={24} className="text-amber-500" />,
      bg: "bg-amber-500/10",
      title: "Proactive AI Alerts",
      desc: "Get warned before you hit your category budget limits automatically."
    },
    {
      icon: <Target size={24} className="text-purple-500" />,
      bg: "bg-purple-500/10",
      title: "Credit Score Coach",
      desc: "Understand and improve your CIBIL factors in plain language."
    },
    {
      icon: <PiggyBank size={24} className="text-emerald-500" />,
      bg: "bg-emerald-500/10",
      title: "Smart Savings Engine",
      desc: "Idle ₹5000? Get exactly which SIP/FD options suit you right now."
    },
    {
      icon: <Languages size={24} className="text-orange-500" />,
      bg: "bg-orange-500/10",
      title: "Vernacular AI",
      desc: "Ask in Hindi, Hinglish, or English — The AI naturally understands all."
    },
    {
      icon: <ShieldAlert size={24} className="text-red-500" />,
      bg: "bg-red-500/10",
      title: "Fraud Shield",
      desc: "Suspicious transaction? AI flags and explains it before you lose money."
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <section id="features" className="py-24 bg-[#0A0F1E] relative border-t border-white/5" ref={sectionRef}>
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/10 via-transparent to-transparent pointer-events-none" />
      
      <div className="max-w-6xl mx-auto px-6 relative z-10 text-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        >
          <span className="inline-block px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-400 text-xs font-semibold mb-4 tracking-wider">
            THE SOLUTION
          </span>
          <h2 className="text-3xl md:text-4xl font-bold font-heading text-white mb-16">
            Six AI Powers. One Chat.
          </h2>
        </motion.div>

        <motion.div 
          variants={containerVariants} 
          initial="hidden" 
          animate={isInView ? "show" : "hidden"} 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature, i) => (
            <motion.div key={i} variants={itemVariants}>
              <Card variant="glow" className="h-full text-left">
                <div className={`w-12 h-12 rounded-full ${feature.bg} flex items-center justify-center mb-4 ring-1 ring-white/10`}>
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed min-h-[40px]">
                  {feature.desc}
                </p>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
