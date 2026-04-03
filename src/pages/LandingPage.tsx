import React from 'react';
import { motion } from 'framer-motion';
import { Play, ShieldCheck, Globe, Zap, ChevronDown } from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import { Button } from '../components/ui/Button';
import { ProblemSection } from '../components/landing/ProblemSection';
import { SolutionSection } from '../components/landing/SolutionSection';
import { HowItWorksSection } from '../components/landing/HowItWorksSection';
import { ComparisonSection } from '../components/landing/ComparisonSection';
import { PricingSection } from '../components/landing/PricingSection';
import { Footer } from '../components/layout/Footer';

export const LandingPage = () => {
  
  // Staggered animation variants for left content
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const childVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-[#0A0F1E] w-full text-white relative font-body overflow-x-hidden">
      <Navbar />
      
      {/* BACKGROUND LAYERS */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Radial Glow */}
        <div 
          className="absolute inset-0 w-full h-[800px]" 
          style={{ background: 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(99,102,241,0.25), transparent)' }} 
        />
        
        {/* Grid pattern (SVG data URI) */}
        <div 
          className="absolute inset-0 opacity-40 mix-blend-overlay hidden md:block" 
          style={{ 
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h40v40H0V0zm1 1h38v38H1V1z' fill='%23ffffff' fill-opacity='0.04' fill-rule='evenodd'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat' 
          }} 
        />
        
        {/* Floating Orbs */}
        <div className="absolute top-20 left-[10%] w-72 h-72 bg-sky-600/20 rounded-full blur-[120px] animate-[float_15s_ease-in-out_infinite_alternate]" />
        <div className="absolute top-40 right-[5%] w-96 h-96 bg-indigo-600/15 rounded-full blur-[120px] animate-[float_18s_ease-in-out_infinite_alternate]" style={{ animationDelay: '-5s' }} />
        <div className="absolute bottom-20 left-[40%] w-64 h-64 bg-emerald-600/10 rounded-full blur-[120px] animate-[float_20s_ease-in-out_infinite_alternate]" style={{ animationDelay: '-10s' }} />
      </div>

      {/* HERO CONTENT */}
      <main className="relative z-10 w-full min-h-screen flex items-center justify-center pt-24 pb-20">
        <div className="max-w-5xl mx-auto flex flex-col xl:flex-row items-center gap-16 px-6">
          
          {/* Left Side (Text content) */}
          <motion.div 
            className="flex flex-col items-center xl:items-start text-center xl:text-left flex-1"
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            {/* Pill */}
            <motion.div variants={childVariants} className="mb-6">
              <span className="bg-sky-500/10 border border-sky-500/30 text-sky-400 text-xs font-semibold rounded-full px-3 py-1 flex items-center gap-2">
                <span>🏆</span> Fin-O-Hack 2026 · Best AI Project
              </span>
            </motion.div>
            
            {/* H1 */}
            <motion.div variants={childVariants} className="mb-6">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold font-heading leading-[1.1] tracking-tight">
                Stop Guessing.<br/>
                <span className="gradient-text">Start Knowing.</span>
              </h1>
            </motion.div>
            
            {/* Subheading */}
            <motion.div variants={childVariants} className="mb-8 max-w-xl text-lg text-gray-400 leading-relaxed font-body">
              PaySense AI — India's first conversational AI financial copilot. Track spends, coach your credit, detect fraud — all in Hindi & English.
            </motion.div>
            
            {/* Buttons */}
            <motion.div variants={childVariants} className="flex flex-col sm:flex-row gap-4 mb-10 w-full sm:w-auto">
              <Button size="lg" className="px-8 shadow-[0_0_20px_rgba(14,165,233,0.3)]">
                Start Free — 5 queries/day
              </Button>
              <Button variant="secondary" size="lg" className="px-8" leftIcon={<Play size={18} fill="currentColor" />}>
                Watch Demo
              </Button>
            </motion.div>
            
            {/* Trust row */}
            <motion.div variants={childVariants} className="flex flex-wrap justify-center xl:justify-start gap-x-8 gap-y-4 text-sm text-gray-500 font-medium">
              <div className="flex items-center gap-2 tracking-wide">
                <ShieldCheck size={16} className="text-sky-500" />
                50 Cr+ Paytm Users
              </div>
              <div className="flex items-center gap-2 tracking-wide">
                <Globe size={16} className="text-sky-500" />
                Hindi + English
              </div>
              <div className="flex items-center gap-2 tracking-wide">
                <Zap size={16} className="text-sky-500" />
                Real-time AI
              </div>
            </motion.div>
          </motion.div>

          {/* Right Side (Phone Mockup) */}
          <div className="hidden lg:flex w-full max-w-[340px] xl:max-w-none flex-1 justify-center relative">
            <motion.div 
              animate={{ y: [0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="w-[280px] h-[580px] bg-[#1a1f35] rounded-[40px] border-4 border-[#2a3045] shadow-2xl overflow-hidden glow-blue relative ring-1 ring-white/10"
            >
              {/* Phone Notch Mock*/}
              <div className="absolute top-0 inset-x-0 h-6 bg-[#2a3045] rounded-b-2xl w-32 mx-auto z-20" />
              
              {/* Chat UI within Phone */}
              <div className="flex flex-col h-full bg-[#0A0F1E] pt-10">
                {/* Header */}
                <div className="px-5 pb-3 border-b border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="font-semibold text-sm">PaySense AI</span>
                  </div>
                  <span className="text-[10px] text-gray-500">Online</span>
                </div>
                
                {/* Chat Area */}
                <div className="flex-1 p-4 flex flex-col gap-4">
                  {/* User Message */}
                  <div className="self-end max-w-[85%] bg-gradient-to-r from-sky-500 to-indigo-500 rounded-2xl rounded-br-sm px-3 py-2 text-xs text-white shadow-md">
                    Mera is mahine kitna kharch hua? 🤔
                  </div>
                  
                  {/* AI response */}
                  <div className="self-start max-w-[90%] bg-[#1F2937] border border-white/10 rounded-2xl rounded-bl-sm px-3 py-2.5 text-xs text-white shadow-md leading-relaxed">
                    <p className="mb-2 text-sky-400 font-medium">Is mahine aapne ₹14,200 kharch kiye! 📊</p>
                    <div className="flex justify-between border-b border-white/10 pb-1 mb-1">
                      <span>🍔 Food:</span> <span className="font-mono">₹4,800 (34%)</span>
                    </div>
                    <div className="flex justify-between border-b border-white/10 pb-1 mb-1">
                      <span>🚕 Transport:</span> <span className="font-mono">₹2,100 (15%)</span>
                    </div>
                    <div className="flex justify-between pb-1">
                      <span>🛍️ Shopping:</span> <span className="font-mono">₹5,200 (37%)</span>
                    </div>
                  </div>
                  
                  {/* Typing Indicator */}
                  <div className="self-start px-3 py-2 bg-[#1F2937] border border-white/10 rounded-full flex gap-1">
                    <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce [animation-delay:0ms]" />
                    <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]" />
                    <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]" />
                  </div>
                </div>
                
                {/* Fake Input area */}
                <div className="h-16 border-t border-white/5 bg-[#111827] flex items-center px-4 mb-2">
                  <div className="w-full h-8 bg-[#1F2937] rounded-full border border-white/5 flex items-center px-4">
                    <span className="text-[10px] text-gray-500">Ask something...</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <motion.div 
          className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 opacity-70 hover:opacity-100 transition-opacity cursor-pointer text-gray-500"
          animate={{ y: [0, 5, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          onClick={() => {
            document.getElementById('problem')?.scrollIntoView({ behavior: 'smooth' });
          }}
        >
          <span className="text-[10px] font-medium tracking-widest uppercase mb-1">Scroll to explore</span>
          <ChevronDown size={20} />
        </motion.div>
      </main>

      <ProblemSection />
      <SolutionSection />
      <HowItWorksSection />
      <ComparisonSection />
      <PricingSection />
      <Footer />
    </div>
  );
};

export default LandingPage;
