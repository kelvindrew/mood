import React from 'react';

export const TVRemoteHint: React.FC = () => {
  return (
    <footer className="fixed bottom-0 left-0 right-0 z-30 px-12 py-3 bg-gradient-to-t from-[#07090E] via-[#07090E]/90 to-transparent flex items-center justify-between text-xs text-gray-400 font-medium select-none pointer-events-none backdrop-blur-xs">
      {/* Left side: Navigation legend */}
      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1 px-2.5 py-0.5 rounded-lg bg-surface-light border border-white/15 text-white font-mono font-bold text-[10px] shadow-sm">
            <span>▲</span><span>▼</span><span>◄</span><span>►</span>
          </div>
          <span className="font-bold text-gray-300">Naviguer</span>
        </div>

        <div className="flex items-center space-x-2">
          <span className="px-2.5 py-0.5 rounded-lg bg-surface-light border border-white/15 text-white font-mono font-bold text-[10px] shadow-sm">
            OK / ENTRÉE
          </span>
          <span className="font-bold text-gray-300">Choisir</span>
        </div>

        <div className="flex items-center space-x-2">
          <span className="px-2.5 py-0.5 rounded-lg bg-surface-light border border-white/15 text-white font-mono font-bold text-[10px] shadow-sm">
            RETOUR / ÉCHAP
          </span>
          <span className="font-bold text-gray-300">Précédent</span>
        </div>
      </div>

      {/* Right side: TV OS Compatibility & status badge */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-brand-gold animate-ping" />
          <span className="text-gray-200 font-bold text-xs">TÉLÉCOMMANDE D-PAD ACTIVE</span>
        </div>
        <span className="text-[11px] text-gray-500 font-mono font-bold">HISENSE VIDAA • GOOGLE TV • TIZEN • WEBOS</span>
      </div>
    </footer>
  );
};
