import React, { useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

export const PricingSection = () => {
  const [isAnnual, setIsAnnual] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  const itemVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    show: { opacity: 1, scale: 1, y: 0 }
  };

  return (
    <section id="pricing" className="py-24 bg-[#0A0F1E] relative border-t border-white/5" ref={sectionRef}>
      <div className="max-w-5xl mx-auto px-6">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold font-heading text-white mb-6">
            Start Free. Upgrade When Ready.
          </h2>
          
          <div className="flex items-center justify-center gap-3">
            <span className={`text-sm ${!isAnnual ? 'text-white' : 'text-gray-400'}`}>Monthly</span>
            <button 
              onClick={() => setIsAnnual(!isAnnual)}
              className="relative w-12 h-6 bg-[#1F2937] border border-white/10 rounded-full flex items-center px-1 cursor-pointer"
            >
              <div className={`w-4 h-4 bg-sky-500 rounded-full transition-transform duration-300 ${isAnnual ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
            <span className={`text-sm ${isAnnual ? 'text-white' : 'text-gray-400'} flex items-center gap-2`}>
              Annual 
              <Badge variant="success" className="bg-emerald-500/20 text-emerald-400">Save 20%</Badge>
            </span>
          </div>
        </motion.div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "show" : "hidden"}
        >
          {/* Free Card */}
          <motion.div variants={itemVariants}>
            <Card variant="default" className="h-full flex flex-col pt-8">
              <div className="mb-8">
                <h3 className="text-xl font-bold text-white mb-2">Free</h3>
                <div className="flex items-end gap-1 text-white">
                  <span className="text-4xl font-bold">₹0</span>
                  <span className="text-gray-400 mb-1">/forever</span>
                </div>
              </div>
              
              <ul className="flex flex-col gap-4 text-sm text-gray-300 mb-8 flex-1">
                <li className="flex gap-3 items-center"><Check size={18} className="text-sky-500" /> 5 AI queries/day</li>
                <li className="flex gap-3 items-center"><Check size={18} className="text-sky-500" /> Basic spend view</li>
                <li className="flex gap-3 items-center"><Check size={18} className="text-sky-500" /> Last 30 days data</li>
                <li className="flex gap-3 items-center"><Check size={18} className="text-sky-500" /> Hindi + English</li>
                <li className="flex gap-3 items-center text-gray-600"><X size={18} /> Proactive Fraud Shield</li>
                <li className="flex gap-3 items-center text-gray-600"><X size={18} /> Credit Coaching</li>
              </ul>
              
              <Button variant="secondary" fullWidth className="py-6 mt-auto">
                Get Started Free
              </Button>
            </Card>
          </motion.div>

          {/* Pro Card */}
          <motion.div variants={itemVariants}>
            <Card variant="glow" className="h-full flex flex-col pt-8 relative ring-2 ring-indigo-500/50">
              <div className="absolute top-0 right-0 transform translate-x-2 -translate-y-2">
                <Badge variant="pro">Most Popular</Badge>
              </div>
              <div className="mb-8">
                <h3 className="text-xl font-bold text-indigo-400 mb-2">Pro</h3>
                <div className="flex items-end gap-1 text-white">
                  {isAnnual ? (
                    <>
                      <span className="text-4xl font-bold">₹79</span>
                      <span className="text-sm text-gray-500 line-through mb-1 ml-1">₹99</span>
                      <span className="text-gray-400 mb-1">/month</span>
                    </>
                  ) : (
                    <>
                      <span className="text-4xl font-bold">₹99</span>
                      <span className="text-gray-400 mb-1">/month</span>
                    </>
                  )}
                </div>
                {isAnnual && <p className="text-xs text-emerald-400 mt-2">Billed ₹948 annually</p>}
              </div>
              
              <ul className="flex flex-col gap-4 text-sm text-gray-300 mb-8 flex-1">
                <li className="flex gap-3 items-start"><span className="p-0.5 bg-indigo-500/20 rounded-full mt-0.5"><Check size={14} className="text-indigo-400" /></span> Unlimited AI queries</li>
                <li className="flex gap-3 items-start"><span className="p-0.5 bg-indigo-500/20 rounded-full mt-0.5"><Check size={14} className="text-indigo-400" /></span> Deep spend analysis</li>
                <li className="flex gap-3 items-start"><span className="p-0.5 bg-indigo-500/20 rounded-full mt-0.5"><Check size={14} className="text-indigo-400" /></span> 12 months history</li>
                <li className="flex gap-3 items-start"><span className="p-0.5 bg-indigo-500/20 rounded-full mt-0.5"><Check size={14} className="text-indigo-400" /></span> Credit coaching</li>
                <li className="flex gap-3 items-start"><span className="p-0.5 bg-indigo-500/20 rounded-full mt-0.5"><Check size={14} className="text-indigo-400" /></span> Proactive fraud shield</li>
                <li className="flex gap-3 items-start"><span className="p-0.5 bg-indigo-500/20 rounded-full mt-0.5"><Check size={14} className="text-indigo-400" /></span> Priority support</li>
              </ul>
              
              <Button variant="primary" fullWidth className="py-6 mt-auto">
                Upgrade to Pro
              </Button>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};
