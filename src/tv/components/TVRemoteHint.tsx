import React from 'react';

export const TVRemoteHint: React.FC = () => {
  return (
    <footer className="fixed bottom-0 left-0 right-0 z-30 px-[5vw] py-3.5 bg-gradient-to-t from-[#07090E] via-[#07090E]/95 to-transparent flex items-center justify-between text-xs text-[#B8C2D8] font-bold select-none pointer-events-none">
      {/* Left side: Navigation legend */}
      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-[#181F33] border border-white/20 text-white font-mono font-black text-xs shadow-sm">
            <span>▲</span><span>▼</span><span>◄</span><span>►</span>
          </div>
          <span className="text-white">Naviguer</span>
        </div>

        <div className="flex items-center space-x-2">
          <span className="px-3 py-1 rounded-lg bg-[#E50914] text-white font-mono font-black text-xs shadow-[0_0_15px_rgba(229,9,20,0.5)]">
            OK
          </span>
          <span className="text-white">Choisir</span>
        </div>

        <div className="flex items-center space-x-2">
          <span className="px-3 py-1 rounded-lg bg-[#181F33] border border-white/20 text-white font-mono font-black text-xs shadow-sm">
            RETOUR
          </span>
          <span className="text-white">Précédent</span>
        </div>
      </div>

      {/* Right side: TV OS Compatibility & status badge */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] animate-ping" />
          <span className="text-[#10B981] font-black text-xs">TÉLÉCOMMANDE D-PAD ACTIVE</span>
        </div>
        <span className="text-xs text-[#B8C2D8] font-mono font-black">VIDAA • GOOGLE TV • TIZEN • WEBOS</span>
      </div>
    </footer>
  );
};
