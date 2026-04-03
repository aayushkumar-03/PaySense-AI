import React from 'react';
import { Globe, Mail, MessageSquare } from 'lucide-react';
import { Badge } from '../ui/Badge';

export const Footer = () => {
  return (
    <footer className="bg-[#090D1A] border-t border-white/5 py-12 relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sky-500/20 to-transparent" />
      <div className="max-w-6xl mx-auto px-6 relative z-10">
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12 border-b border-white/5 pb-10">
          
          {/* Logo & Tagline */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-500 to-indigo-500 flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-sm leading-none">P</span>
              </div>
              <span className="font-heading font-bold text-lg tracking-tight text-white">
                PaySense AI
              </span>
            </div>
            <p className="text-gray-400 text-sm max-w-xs">
              Stop guessing, start knowing. Your intelligent conversational copilot for demystifying personal finance effortlessly.
            </p>
          </div>

          {/* Links */}
          <div className="flex justify-between md:justify-around w-full col-span-1">
            <div className="flex flex-col gap-3">
              <h4 className="text-white font-semibold mb-2">Product</h4>
              <a href="#" className="text-sm text-gray-500 hover:text-white transition-colors">Features</a>
              <a href="#" className="text-sm text-gray-500 hover:text-white transition-colors">Pricing</a>
              <a href="#" className="text-sm text-gray-500 hover:text-white transition-colors">Changelog</a>
            </div>
            <div className="flex flex-col gap-3">
              <h4 className="text-white font-semibold mb-2">Company</h4>
              <a href="#" className="text-sm text-gray-500 hover:text-white transition-colors">About</a>
              <a href="#" className="text-sm text-gray-500 hover:text-white transition-colors">Blog</a>
              <a href="#" className="text-sm text-gray-500 hover:text-white transition-colors">Contact</a>
            </div>
            <div className="flex flex-col gap-3">
              <h4 className="text-white font-semibold mb-2">Legal</h4>
              <a href="#" className="text-sm text-gray-500 hover:text-white transition-colors">Privacy</a>
              <a href="#" className="text-sm text-gray-500 hover:text-white transition-colors">Terms</a>
            </div>
          </div>

          {/* Social */}
          <div className="flex flex-col md:items-end gap-4">
            <h4 className="text-white font-semibold mb-2">Connect</h4>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors">
                <Globe size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#1DA1F2] hover:border-[#1DA1F2] transition-colors">
                <MessageSquare size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#0A66C2] hover:border-[#0A66C2] transition-colors">
                <Mail size={18} />
              </a>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-end">
          <p className="text-xs text-gray-500 leading-tight">
            © 2026 PaySense AI<br/>
            Built with ❤️ by Team FutureX — DTU — Fin-O-Hack 2026
          </p>
          <div className="hidden sm:block">
            <Badge variant="neutral" className="text-[10px] bg-white/5 text-gray-400 border-white/5 cursor-default hover:bg-white/10 transition-colors">
              Built at Fin-O-Hack 2026 🏆
            </Badge>
          </div>
        </div>
      </div>
    </footer>
  );
};
