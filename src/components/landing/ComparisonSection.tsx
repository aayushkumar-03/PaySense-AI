import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { XCircle } from 'lucide-react';
import { Badge } from '../ui/Badge';

export const ComparisonSection = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  const rows = [
    { feature: "Vernacular AI (Hindi/English)", paytm: <XCircle size={18} className="text-red-500 mx-auto" />, bank: <Badge variant="warning">Basic</Badge>, paysense: <Badge variant="success" className="bg-emerald-500/20 text-emerald-400">✓ Full</Badge> },
    { feature: "Proactive Alerts", paytm: <XCircle size={18} className="text-red-500 mx-auto" />, bank: <XCircle size={18} className="text-red-500 mx-auto" />, paysense: <Badge variant="success" className="bg-emerald-500/20 text-emerald-400">✓ Smart</Badge> },
    { feature: "Unified Financial View", paytm: <Badge variant="warning">Partial</Badge>, bank: <XCircle size={18} className="text-red-500 mx-auto" />, paysense: <Badge variant="success" className="bg-emerald-500/20 text-emerald-400">✓ Complete</Badge> },
    { feature: "Credit Score Coaching", paytm: <XCircle size={18} className="text-red-500 mx-auto" />, bank: <Badge variant="warning">Basic</Badge>, paysense: <Badge variant="success" className="bg-emerald-500/20 text-emerald-400">✓ AI-Powered</Badge> },
    { feature: "Fraud Explanation AI", paytm: <XCircle size={18} className="text-red-500 mx-auto" />, bank: <XCircle size={18} className="text-red-500 mx-auto" />, paysense: <Badge variant="success" className="bg-emerald-500/20 text-emerald-400">✓ Real-time</Badge> },
    { feature: "Savings Suggestions", paytm: <XCircle size={18} className="text-red-500 mx-auto" />, bank: <Badge variant="warning">Generic</Badge>, paysense: <Badge variant="success" className="bg-emerald-500/20 text-emerald-400">✓ Personalized</Badge> },
  ];

  return (
    <section id="comparison" className="py-24 bg-[#0A0F1E] relative border-t border-white/5" ref={sectionRef}>
      <div className="max-w-4xl mx-auto px-6 overflow-x-auto pb-4">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold font-heading text-white">
            Why PaySense AI Wins Where Others Failed
          </h2>
        </motion.div>

        <motion.div 
          className="min-w-[700px] w-full bg-[#111827] rounded-2xl overflow-hidden border border-white/10"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ delay: 0.2 }}
        >
          <table className="w-full text-center border-collapse">
            <thead className="bg-[#1F2937] border-b border-white/10">
              <tr>
                <th className="py-5 px-4 text-left font-semibold text-gray-300 w-[35%]">Feature</th>
                <th className="py-5 px-4 font-semibold text-gray-300 w-[20%]">Paytm Today</th>
                <th className="py-5 px-4 font-semibold text-gray-300 w-[20%]">Banks/Others</th>
                <th className="py-5 px-4 font-bold bg-indigo-950/50 border-x border-indigo-500/30 w-[25%] relative">
                  <span className="gradient-text text-lg tracking-tight">PaySense AI</span>
                  <div className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2">
                    <Badge variant="pro" className="text-[10px] [background:none]">⭐ Best</Badge>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => (
                <tr key={idx} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
                  <td className="py-4 px-4 text-left text-sm text-gray-400 font-medium">{row.feature}</td>
                  <td className="py-4 px-4">{row.paytm}</td>
                  <td className="py-4 px-4">{row.bank}</td>
                  <td className="py-4 px-4 bg-indigo-950/20 border-x border-indigo-500/20">{row.paysense}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      </div>
    </section>
  );
};
