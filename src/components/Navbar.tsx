import React from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import {
  Sparkles,
  BookOpen,
  PlayCircle,
  BarChart3,
  History,
  FileText,
  MessageSquare,
  LogOut,
  User as UserIcon,
  Briefcase,
} from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onOpenAuth: () => void;
  onOpenFeedback: () => void;
  hasResume: boolean;
  activeSessionId?: string | null;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  onOpenAuth,
  onOpenFeedback,
  hasResume,
  activeSessionId,
}) => {
  const { user, logout } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Sparkles },
    { id: 'topics', label: 'Resume Topics', icon: BookOpen, disabled: !hasResume },
    { id: 'jd', label: 'Target Job (JD)', icon: Briefcase, disabled: !hasResume },
    { id: 'practice', label: 'Mock Interview', icon: PlayCircle, highlight: Boolean(activeSessionId) },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'history', label: 'History', icon: History },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#303030] bg-[#0B0B0B]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <div
          onClick={() => setCurrentTab('dashboard')}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#FF7900] to-[#FF9F43] flex items-center justify-center shadow-lg shadow-[#FF7900]/20 group-hover:scale-105 transition-transform">
            <span className="font-mono font-bold text-black text-lg">IV</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-lg tracking-tight text-white group-hover:text-[#FF7900] transition-colors">
                Inter<span className="text-[#FF7900]">Vue</span>
              </span>
              <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-[#FF7900]/15 text-[#FF7900] border border-[#FF7900]/30">
                PRO
              </span>
            </div>
            <p className="text-[10px] text-[#B3B3B3] hidden sm:block">AI Interview Intelligence</p>
          </div>
        </div>

        {/* Center Navigation */}
        {user && (
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  disabled={item.disabled}
                  onClick={() => setCurrentTab(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-[#181818] text-[#FF7900] border border-[#FF7900]/40 shadow-sm'
                      : item.disabled
                      ? 'text-[#666666] cursor-not-allowed'
                      : 'text-[#B3B3B3] hover:text-white hover:bg-[#181818]/60'
                  } ${item.highlight && !isActive ? 'border border-[#FF7900]/30 text-white animate-pulse' : ''}`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#FF7900]' : ''}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        )}

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-2.5">
              <button
                onClick={onOpenFeedback}
                title="Send Feedback"
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#181818] hover:bg-[#202020] text-[#B3B3B3] hover:text-white border border-[#303030] transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5 text-[#FF7900]" />
                <span>Feedback</span>
              </button>

              <div className="flex items-center gap-2 pl-2 border-l border-[#303030]">
                <div className="w-8 h-8 rounded-full bg-[#181818] border border-[#303030] flex items-center justify-center text-[#FF7900] text-xs font-semibold">
                  {user.name ? user.name[0].toUpperCase() : 'U'}
                </div>
                <div className="hidden lg:block text-left">
                  <div className="text-xs font-medium text-white truncate max-w-[120px]">
                    {user.name || user.email.split('@')[0]}
                  </div>
                  <div className="text-[10px] text-[#B3B3B3] truncate max-w-[120px]">
                    {user.email}
                  </div>
                </div>

                <button
                  onClick={logout}
                  title="Logout"
                  className="p-2 rounded-lg text-[#B3B3B3] hover:text-[#EF4444] hover:bg-[#181818] transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenAuth}
                className="px-4 py-2 rounded-lg text-sm font-medium text-white hover:bg-[#181818] border border-[#303030] transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={onOpenAuth}
                className="px-4 py-2 rounded-lg text-sm font-semibold text-black bg-[#FF7900] hover:bg-[#FF9F43] transition-colors shadow-lg shadow-[#FF7900]/25"
              >
                Get Started
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile nav row */}
      {user && (
        <div className="md:hidden flex overflow-x-auto border-t border-[#202020] px-2 py-1.5 gap-1 bg-[#111111]">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                disabled={item.disabled}
                onClick={() => setCurrentTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 whitespace-nowrap rounded-md text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-[#181818] text-[#FF7900] border border-[#FF7900]/40'
                    : item.disabled
                    ? 'text-[#555555]'
                    : 'text-[#B3B3B3]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
