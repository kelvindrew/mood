import React, { useState, useEffect } from 'react';
import { useGame, TVView } from '../../context/GameContext';
import { Gamepad2, Layers, User, Settings, Sparkles, Smartphone, Wifi } from 'lucide-react';
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
    <header className="fixed top-0 left-0 right-0 z-40 px-12 py-5 flex items-center justify-between bg-gradient-to-b from-[#07090E]/95 via-[#07090E]/70 to-transparent backdrop-blur-md">
      {/* Brand Logo */}
      <div className="flex items-center space-x-10">
        <div 
          data-tv-focus
          tabIndex={0}
          onClick={() => handleNavClick('home')}
          className="flex items-center space-x-3.5 cursor-pointer group outline-none focus:scale-105 transition-transform"
        >
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-red via-brand-accent to-red-500 flex items-center justify-center shadow-glow-red group-focus:ring-4 group-focus:ring-white border border-white/20">
            <Gamepad2 className="w-7 h-7 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-display font-black text-2xl tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-white via-red-100 to-brand-accent drop-shadow-md">
              PLAYFLIX
            </span>
            <span className="text-[10px] font-black tracking-widest text-gray-400 -mt-1 uppercase flex items-center space-x-1">
              <span>SMART TV CONSOLE</span>
              <span className="w-1.5 h-1.5 rounded-full bg-brand-accent" />
              <span className="text-brand-gold">AAA</span>
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
                className={`flex items-center space-x-2.5 px-6 py-2.5 rounded-full font-bold text-sm transition-all duration-200 outline-none ${
                  isActive
                    ? 'bg-white text-background font-black shadow-lg shadow-white/20 scale-105 ring-2 ring-white'
                    : 'text-gray-300 hover:text-white hover:bg-white/10 focus:bg-white focus:text-background focus:font-black focus:ring-4 focus:ring-brand-accent focus:scale-105'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-brand-red' : ''}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Right controls: Active Room, Simulator PC Toggle, TV Clock */}
      <div className="flex items-center space-x-6">
        {room && (
          <div className="flex items-center space-x-2.5 px-4 py-1.5 rounded-full bg-surface-card border border-brand-red/40 shadow-glow-red">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-[11px] font-bold text-gray-300 uppercase">SALON ACTIF :</span>
            <span className="text-sm font-black font-mono text-brand-gold tracking-widest">{room.code}</span>
          </div>
        )}

        {/* Admin Back-Office CMS Button */}
        <button
          data-tv-focus
          tabIndex={0}
          onClick={() => {
            audio.playSelect();
            setTvView('admin');
          }}
          className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-2xl text-xs font-black transition-all outline-none border ${
            tvView === 'admin'
              ? 'bg-brand-gold text-gray-950 font-black shadow-glow-gold scale-105 border-white'
              : 'bg-surface-card text-gray-300 border-white/10 hover:border-amber-400 hover:text-white'
          }`}
          title="Accéder au panneau d'administration"
        >
          <span className="text-amber-400">⚙️</span>
          <span>ADMIN</span>
        </button>

        {/* Simulator Toggle Button (For PC Testing) */}
        <button
          data-tv-focus
          tabIndex={0}
          onClick={() => {
            audio.playSelect();
            setIsSimulatorOpen(!isSimulatorOpen);
          }}
          className={`flex items-center space-x-2 px-4 py-2 rounded-2xl text-xs font-black transition-all outline-none ${
            isSimulatorOpen
              ? 'bg-brand-purple text-white shadow-glow-purple ring-2 ring-white scale-105'
              : 'bg-surface-card text-gray-300 border border-white/10 hover:border-brand-purple hover:text-white focus:bg-brand-purple focus:text-white focus:ring-4 focus:ring-brand-purple focus:scale-105'
          }`}
          title="Ouvrir le simulateur de manette smartphone"
        >
          <Smartphone className="w-4 h-4 text-brand-purple" />
          <span>{isSimulatorOpen ? 'Fermer Manette' : 'Manette PC'}</span>
        </button>

        {/* TV Clock & Connection Indicator */}
        <div className="text-right">
          <div className="text-sm font-black text-gray-200 tracking-wider font-display">{time}</div>
          <div className="text-[10px] text-emerald-400 flex items-center justify-end space-x-1 font-bold">
            <Wifi className="w-3 h-3 text-emerald-400" />
            <span>TV CONNECTÉE</span>
          </div>
        </div>
      </div>
    </header>
  );
};
