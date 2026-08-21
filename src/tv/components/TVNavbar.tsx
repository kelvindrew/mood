import React, { useState, useEffect } from 'react';
import { useGame, TVView } from '../../context/GameContext';
import { Sparkles, Layers, User, Settings, Smartphone, Wifi, Menu, Home, Bot } from 'lucide-react';
import { audio } from '../../services/audio';

interface NavItem {
  id: TVView;
  label: string;
  icon: React.ElementType;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'categories', label: 'Design & Jeux', icon: Layers },
  { id: 'profiles', label: 'Profils', icon: User },
  { id: 'settings', label: 'Paramètres TV', icon: Settings },
];

export const TVNavbar: React.FC = () => {
  const { tvView, setTvView, isSimulatorOpen, setIsSimulatorOpen, room } = useGame();
  const [time, setTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleNavClick = (view: TVView) => {
    audio.playSelect();
    setTvView(view);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 px-[5vw] py-4 flex items-center justify-between pointer-events-auto select-none">
      {/* Frosted Glass Floating Navbar (Inspired by Forest Sunlight UI) */}
      <div className="w-full mx-auto px-6 py-3.5 rounded-full bg-[#0A1612]/75 backdrop-blur-xl border border-white/15 shadow-[0_15px_35px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.2)] flex items-center justify-between">
        {/* Left: Brand Logo & Hamburger */}
        <div className="flex items-center space-x-6">
          <div
            data-tv-focus
            tabIndex={0}
            onClick={() => handleNavClick('home')}
            className="flex items-center space-x-3 cursor-pointer group outline-none focus:scale-105 transition-transform"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#10B981] via-[#059669] to-[#F59E0B] flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.5)] group-focus:ring-2 group-focus:ring-white border border-white/30">
              <Menu className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-display font-black text-xl tracking-widest text-white drop-shadow-md flex items-center space-x-1.5">
                <span>PLAYFLIX</span>
                <span className="text-[#FBBF24] font-mono text-xs">AI</span>
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex items-center space-x-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = tvView === item.id;
              return (
                <button
                  key={item.id}
                  data-tv-focus
                  tabIndex={0}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center space-x-2 px-5 py-2 rounded-full font-bold text-sm transition-all duration-200 outline-none ${
                    isActive
                      ? 'bg-white text-[#0A1612] font-black shadow-[0_0_25px_rgba(255,255,255,0.6)] scale-105'
                      : 'text-[#D1D5DB] hover:text-white hover:bg-white/10 focus:bg-white focus:text-[#0A1612] focus:font-black focus:scale-110 focus:shadow-[0_0_30px_rgba(251,191,36,0.6)]'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#059669]' : ''}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right Status & Meta Info */}
        <div className="flex items-center space-x-4">
          <div className="hidden lg:flex items-center space-x-2 text-xs font-semibold text-[#9CA3AF]">
            <span>Designed for Smart TV & Mobile</span>
          </div>

          {/* Connected Room indicator if in party */}
          {room && (
            <div className="flex items-center space-x-2 px-4 py-1.5 rounded-full bg-[#10B981]/20 border border-[#10B981]/40 text-[#34D399] text-xs font-mono font-bold">
              <Wifi className="w-3.5 h-3.5 text-[#34D399] animate-pulse" />
              <span>SALON #{room.code}</span>
            </div>
          )}

          {/* Simulator Toggle */}
          <button
            data-tv-focus
            tabIndex={0}
            onClick={() => {
              audio.playSelect();
              setIsSimulatorOpen(!isSimulatorOpen);
            }}
            className={`flex items-center space-x-2 px-4 py-1.5 rounded-full text-xs font-bold transition-all outline-none ${
              isSimulatorOpen
                ? 'bg-[#F59E0B] text-black font-black shadow-[0_0_20px_rgba(245,158,11,0.6)]'
                : 'bg-white/10 text-white hover:bg-white/20 focus:bg-white focus:text-black focus:scale-105'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>{isSimulatorOpen ? 'Fermer Manette' : 'Manette Test'}</span>
          </button>

          {/* Digital Clock */}
          <div className="px-3.5 py-1 rounded-xl bg-black/40 border border-white/10 text-white font-mono font-bold text-xs tracking-wider">
            {time || '20:00'}
          </div>
        </div>
      </div>
    </header>
  );
};
