import React, { useState, useRef, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Mock data
  const unreadCount = 3;
  const notifications = [
    { id: 1, title: 'Budget exceeded for Food', time: '2m ago', color: 'bg-red-500', unread: true },
    { id: 2, title: 'Credit Score increased +5 pts', time: '1h ago', color: 'bg-emerald-500', unread: true },
    { id: 3, title: 'You have ₹5000 idle. Invest?', time: '3h ago', color: 'bg-sky-500', unread: true },
    { id: 4, title: 'Suspicious transaction flagged', time: '1d ago', color: 'bg-red-500', unread: false },
    { id: 5, title: 'Weekly spend summary ready', time: '2d ago', color: 'bg-indigo-500', unread: false },
  ];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-gray-300 hover:text-white hover:bg-white/5 rounded-full transition-colors relative"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 min-w-[16px] h-[16px] flex items-center justify-center rounded-full bg-red-500 text-white text-[9px] font-bold px-1 border-2 border-[#111827]">
            {unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-80 bg-[#111827] border border-white/10 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] z-50 overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
              <h3 className="font-semibold text-white">Notifications</h3>
              <button className="text-xs text-sky-400 hover:text-sky-300">Mark all read</button>
            </div>
            
            <div className="max-h-[300px] overflow-y-auto">
              {notifications.map((notif) => (
                <div key={notif.id} className={`flex gap-3 p-4 hover:bg-white/5 border-b border-white/5 transition-colors cursor-pointer ${notif.unread ? 'bg-white/[0.02]' : ''}`}>
                  <div className={`w-2 h-2 mt-1.5 rounded-full flex-shrink-0 ${notif.color}`} />
                  <div className="flex-1">
                    <p className={`text-sm ${notif.unread ? 'text-white font-medium' : 'text-gray-300'}`}>{notif.title}</p>
                    <p className="text-xs text-gray-500 mt-1">{notif.time}</p>
                  </div>
                  {notif.unread && <div className="w-1.5 h-1.5 bg-sky-500 rounded-full mt-1.5 self-start" />}
                </div>
              ))}
            </div>
            
            <div className="p-2 border-t border-white/5">
              <button className="w-full py-2 text-center text-xs text-gray-400 hover:text-white transition-colors">
                View all notifications
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
