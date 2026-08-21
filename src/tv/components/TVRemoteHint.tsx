import React from 'react';

export const TVRemoteHint: React.FC = () => {
  return (
    <footer className="fixed bottom-3 left-[5vw] right-[5vw] z-30 py-2.5 px-6 rounded-full bg-[#0A1612]/80 backdrop-blur-xl border border-white/15 shadow-[0_10px_30px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.2)] flex items-center justify-between text-xs text-[#9CA3AF] font-bold select-none pointer-events-none">
      {/* Left side: Navigation legend */}
      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-white/10 border border-white/20 text-white font-mono font-black text-xs shadow-sm">
            <span>▲</span><span>▼</span><span>◄</span><span>►</span>
          </div>
          <span className="text-white">Naviguer</span>
        </div>

        <div className="flex items-center space-x-2">
          <span className="px-3 py-1 rounded-lg bg-gradient-to-r from-[#10B981] to-[#059669] text-white font-mono font-black text-xs shadow-[0_0_15px_rgba(16,185,129,0.5)]">
            OK
          </span>
          <span className="text-white">Choisir</span>
        </div>

        <div className="flex items-center space-x-2">
          <span className="px-3 py-1 rounded-lg bg-white/10 border border-white/20 text-white font-mono font-black text-xs shadow-sm">
            RETOUR
          </span>
          <span className="text-white">Précédent</span>
        </div>
      </div>

      {/* Right side: TV OS Compatibility & status badge */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-[#10B981] animate-ping" />
          <span className="text-[#34D399] font-black text-xs">TÉLÉCOMMANDE D-PAD ACTIVE</span>
        </div>
        <span className="text-xs text-[#6B7280] font-mono font-black">HISENSE VIDAA • GOOGLE TV • TIZEN</span>
      </div>
    </footer>
  );
};
