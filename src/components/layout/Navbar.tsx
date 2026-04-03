import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { useScrollY } from '../../hooks/useScrollY';
import { Button } from '../ui/Button';
import { LanguageToggle } from '../ui/LanguageToggle';
import { useAuthModal } from '../../hooks/useAuth';

export const Navbar = () => {
  const scrollY = useScrollY();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { openModal } = useAuthModal();

  const isScrolled = scrollY > 20;

  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const navLinks = [
    { label: 'Features', href: 'features' },
    { label: 'How It Works', href: 'how-it-works' },
    { label: 'Pricing', href: 'pricing' },
    { label: 'About', href: 'about' },
  ];

  return (
    <>
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        className={`fixed top-0 w-full z-40 transition-all duration-300 ${
          isScrolled ? 'bg-[#0A0F1E]/90 backdrop-blur-xl border-b border-white/8 py-3' : 'bg-transparent py-5'
        }`}
      >
        <div className="max-w-5xl mx-auto flex items-center justify-between px-6">
          
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-500 to-indigo-500 flex items-center justify-center shadow-lg">
              <span className="text-white font-bold font-logo text-sm leading-none">P</span>
            </div>
            <span className="font-heading font-bold text-lg tracking-tight gradient-text">
              PaySense AI
            </span>
          </div>

          {/* Desktop Links */}
          <div className="hidden md:flex flex-1 justify-center items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={`#${link.href}`}
                onClick={(e) => handleSmoothScroll(e, link.href)}
                className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Desktop Right Actions */}
          <div className="hidden md:flex items-center gap-4">
            <LanguageToggle />
            <Button variant="ghost" size="sm" onClick={() => openModal()}>
              Login
            </Button>
            <Button variant="primary" size="sm" onClick={() => openModal()}>
              Get Started Free
            </Button>
          </div>

          {/* Mobile Hamburger toggle */}
          <div className="md:hidden flex items-center gap-4">
            <LanguageToggle />
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-400 hover:text-white p-1 focus:outline-none"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile slide-down drawer */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden overflow-hidden bg-[#0A0F1E] border-b border-white/10"
            >
              <div className="flex flex-col px-6 py-6 gap-6">
                <div className="flex flex-col gap-4">
                  {navLinks.map((link) => (
                    <a
                      key={link.label}
                      href={`#${link.href}`}
                      onClick={(e) => handleSmoothScroll(e, link.href)}
                      className="text-lg font-medium text-gray-300 hover:text-white transition-colors border-b border-white/5 pb-2"
                    >
                      {link.label}
                    </a>
                  ))}
                </div>
                
                <div className="flex flex-col gap-3 mt-4">
                  <Button variant="secondary" fullWidth onClick={() => { setIsMobileMenuOpen(false); openModal(); }}>
                    Login
                  </Button>
                  <Button variant="primary" fullWidth onClick={() => { setIsMobileMenuOpen(false); openModal(); }}>
                    Get Started Free
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </>
  );
};
