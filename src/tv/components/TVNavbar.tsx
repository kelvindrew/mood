import React, { useState, useEffect } from 'react';
import { useGame, TVView } from '../../context/GameContext';
import { Gamepad2, Layers, User, Settings, Sparkles, Smartphone, Wifi, Shield } from 'lucide-react';
import { audio } from '../../services/audio';

interface NavItem {
  id: TVView;
  label: string;
  icon: React.ElementType;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'home', label: 'Accueil Launcher', icon: Sparkles },
  { id: 'categories', label: 'Jeux & Catégories', icon: Layers },
  { id: 'profiles', label: 'Profils & Trophées', icon: User },
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
    <header className="fixed top-0 left-0 right-0 z-40 px-[5vw] py-5 flex items-center justify-between bg-gradient-to-b from-[#07090E] via-[#07090E]/90 to-transparent">
      {/* Brand Logo */}
      <div className="flex items-center space-x-8">
        <div 
          data-tv-focus
          tabIndex={0}
          onClick={() => handleNavClick('home')}
          className="flex items-center space-x-3.5 cursor-pointer group outline-none focus:scale-105 transition-transform"
        >
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#E50914] to-[#FF2E63] flex items-center justify-center shadow-[0_0_25px_rgba(229,9,20,0.6)] group-focus:ring-4 group-focus:ring-white border border-white/20">
            <Gamepad2 className="w-7 h-7 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-display font-black text-2xl tracking-widest text-white drop-shadow-md">
              PLAYFLIX
            </span>
            <span className="text-[10px] font-black tracking-widest text-[#FFB800] -mt-1 uppercase flex items-center space-x-1">
              <span>SMART TV CONSOLE</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF2E63]" />
              <span>AAA</span>
            </span>
          </div>
        </div>

        {/* Navigation Tabs (10-Foot UI) */}
        <nav className="flex items-center space-x-2">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = tvView === item.id;
            return (
              <button
                key={item.id}
                data-tv-focus
                tabIndex={0}
                onClick={() => handleNavClick(item.id)}
                className={`flex items-center space-x-2.5 px-6 py-2.5 rounded-full font-bold text-base transition-all duration-200 outline-none ${
                  isActive
                    ? 'bg-white text-[#07090E] font-black shadow-[0_0_30px_rgba(255,255,255,0.7)] scale-105 ring-2 ring-white'
                    : 'text-[#B8C2D8] hover:text-white hover:bg-white/10 focus:bg-white focus:text-[#07090E] focus:font-black focus:ring-4 focus:ring-white focus:scale-110 focus:shadow-[0_0_35px_rgba(229,9,20,0.7)]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#E50914]' : ''}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Right controls: Active Room, Admin, Simulator PC Toggle, TV Clock */}
      <div className="flex items-center space-x-5">
        {room && (
          <div className="flex items-center space-x-2.5 px-4 py-1.5 rounded-full bg-[#101420] border-2 border-[#E50914]/50 shadow-[0_0_20px_rgba(229,9,20,0.4)]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] animate-ping" />
            <span className="text-xs font-black text-gray-300 uppercase">SALON ACTIF :</span>
            <span className="text-sm font-black font-mono text-[#FFB800] tracking-widest">{room.code}</span>
          </div>
        )}

        {/* Admin CMS Button */}
        <button
          data-tv-focus
          tabIndex={0}
          onClick={() => {
            audio.playSelect();
            setTvView('admin');
          }}
          className={`flex items-center space-x-1.5 px-4 py-2 rounded-2xl text-xs font-black transition-all outline-none border ${
            tvView === 'admin'
              ? 'bg-[#FFB800] text-gray-950 font-black shadow-[0_0_25px_rgba(255,184,0,0.6)] scale-105 border-white'
              : 'bg-[#101420] text-gray-300 border-white/10 hover:border-amber-400 hover:text-white focus:bg-white focus:text-black focus:scale-105'
          }`}
          title="Panneau d'administration"
        >
          <Shield className="w-3.5 h-3.5 text-amber-400" />
          <span>ADMIN</span>
        </button>

        {/* Simulator Toggle Button (For PC Dual-Screen) */}
        <button
          data-tv-focus
          tabIndex={0}
          onClick={() => {
            audio.playSelect();
            setIsSimulatorOpen(!isSimulatorOpen);
          }}
          className={`flex items-center space-x-2 px-4 py-2 rounded-2xl text-xs font-black transition-all outline-none ${
            isSimulatorOpen
              ? 'bg-[#8A2BE2] text-white shadow-[0_0_25px_rgba(138,43,226,0.6)] ring-2 ring-white scale-105'
              : 'bg-[#101420] text-gray-300 border border-white/10 hover:border-[#8A2BE2] hover:text-white focus:bg-[#8A2BE2] focus:text-white focus:ring-4 focus:ring-white focus:scale-105'
          }`}
          title="Simulateur manette smartphone"
        >
          <Smartphone className="w-4 h-4 text-purple-400" />
          <span>{isSimulatorOpen ? 'Fermer Manette' : 'Manette PC'}</span>
        </button>

        {/* TV Clock & Connection Indicator */}
        <div className="text-right">
          <div className="text-base font-black text-white tracking-wider font-display">{time}</div>
          <div className="text-[11px] text-[#10B981] flex items-center justify-end space-x-1.5 font-black">
            <Wifi className="w-3.5 h-3.5 text-[#10B981]" />
            <span>TV EN LIGNE</span>
          </div>
        </div>
      </div>
    </header>
  );
};
