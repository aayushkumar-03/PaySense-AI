import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, MessageCircle, BarChart2, TrendingUp,
  Bell, Settings, LogOut, ChevronLeft, ChevronRight
} from 'lucide-react';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
import { LanguageToggle } from '../ui/LanguageToggle';
import { useAuthStore } from '../../store/authStore';
import { useState } from 'react';

const navItems = [
  { to: '/dashboard',    icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/chat',         icon: MessageCircle,   label: 'AI Chat' },
  { to: '/analysis',     icon: BarChart2,        label: 'Spend Analysis' },
  { to: '/credit-coach', icon: TrendingUp,       label: 'Credit Coach' },
  { to: '/alerts',       icon: Bell,             label: 'Alerts' },
  { to: '/settings',     icon: Settings,         label: 'Settings' },
];

interface SidebarProps {
  alertCount?: number;
}

export const Sidebar = ({ alertCount = 0 }: SidebarProps) => {
  const { user, signOut } = useAuthStore();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const firstName = user?.displayName?.split(' ')[0] || 'User';
  const plan: string = 'free'; // Can be derived from DB profile once synced

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 64 : 240 }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
        className="hidden md:flex fixed left-0 top-0 h-screen bg-[#111827] border-r border-white/5 flex-col z-40 overflow-hidden"
      >
        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute top-4 -right-3 w-6 h-6 bg-[#1F2937] border border-white/10 rounded-full flex items-center justify-center text-gray-400 hover:text-white z-50"
        >
          {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>

        {/* User profile top */}
        <div className="p-4 border-b border-white/5 flex items-center gap-3 min-h-[72px]">
          <Avatar name={user?.displayName || 'U'} />
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.15 }}
                className="overflow-hidden"
              >
                <p className="text-sm font-medium text-white truncate max-w-[148px]">{user?.displayName || firstName}</p>
                <Badge variant={plan === 'pro' ? 'success' : 'info'}>
                  {plan === 'pro' ? '⭐ Pro' : 'Free'}
                </Badge>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Nav links */}
        <nav className="flex-1 py-4 space-y-1 overflow-y-auto scrollbar-none">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 mx-2 px-3 py-2.5 rounded-xl text-sm transition-all duration-150 group relative
                ${isActive
                  ? 'bg-sky-500/10 text-sky-400 font-medium'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'}`
              }
              title={collapsed ? label : undefined}
            >
              {({ isActive }) => (
                <>
                  <Icon size={18} className={isActive ? 'text-sky-400' : 'text-gray-400 group-hover:text-white'} />
                  <AnimatePresence>
                    {!collapsed && (
                      <motion.span
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        transition={{ duration: 0.12 }}
                        className="whitespace-nowrap"
                      >
                        {label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                  {label === 'Alerts' && alertCount > 0 && (
                    <span className="ml-auto bg-amber-500 text-black text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                      {alertCount > 9 ? '9+' : alertCount}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Bottom controls */}
        <div className="p-3 border-t border-white/5 space-y-2">
          {!collapsed && <LanguageToggle />}
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut size={18} />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </motion.aside>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#111827]/95 backdrop-blur-xl border-t border-white/5">
        <div className="flex items-center justify-around py-2 px-2">
          {navItems.slice(0, 5).map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl text-xs transition-colors
                ${isActive ? 'text-sky-400' : 'text-gray-500'}`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={20} className={isActive ? 'text-sky-400' : 'text-gray-500'} />
                  <span>{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </>
  );
};
