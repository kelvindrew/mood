import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { X, Smartphone, Plus, RefreshCw, Radio } from 'lucide-react';
import { MobileApp } from '../../mobile/MobileApp';
import { audio } from '../../services/audio';

export const SimulatorDrawer: React.FC = () => {
  const { isSimulatorOpen, setIsSimulatorOpen, room } = useGame();
  const [activeSlot, setActiveSlot] = useState<number>(1);

  if (!isSimulatorOpen) return null;

  return (
    <aside className="fixed top-0 right-0 bottom-0 w-[420px] z-50 bg-[#0E111C]/95 backdrop-blur-2xl border-l border-brand-purple/40 shadow-2xl flex flex-col transition-all duration-300">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-surface-dark">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-brand-purple/20 border border-brand-purple/50 flex items-center justify-center">
            <Smartphone className="w-4 h-4 text-brand-purple" />
          </div>
          <div>
            <h2 className="text-sm font-black font-display text-white tracking-wide">
              MANETTE VIRTUELLE PC
            </h2>
            <p className="text-[11px] text-gray-400">
              Simulateur smartphone joueur
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            audio.playBack();
            setIsSimulatorOpen(false);
          }}
          className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Room code info & slot switcher */}
      <div className="px-5 py-2.5 bg-surface-light/50 border-b border-white/5 flex items-center justify-between text-xs">
        <div className="flex items-center space-x-2">
          <span className="text-gray-400">Salon actif :</span>
          <span className="font-mono font-black text-brand-gold">{room ? room.code : 'Aucun (Créez un salon)'}</span>
        </div>

        <div className="flex items-center space-x-1">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-emerald-400 font-bold text-[10px]">LAN CONNECTÉ</span>
        </div>
      </div>

      {/* Simulated Smartphone Frame */}
      <div className="flex-1 overflow-hidden p-4 flex flex-col items-center justify-center bg-[#07080D]">
        <div className="relative w-full max-w-[340px] h-[640px] rounded-[40px] border-[6px] border-[#2A2E3D] shadow-2xl overflow-hidden bg-background flex flex-col">
          {/* Simulated Mobile Notch / Dynamic Island */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-4 bg-black rounded-full z-40 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-[#1A1D27] mr-2" />
            <div className="w-2.5 h-2.5 rounded-full bg-blue-950/80" />
          </div>

          {/* Embedded Mobile Application Controller */}
          <div className="w-full h-full pt-6 overflow-y-auto">
            <MobileApp isSimulatorMode={true} defaultRoomCode={room?.code || ''} />
          </div>
        </div>
      </div>

      {/* Bottom info */}
      <div className="p-3 text-center text-[11px] text-gray-400 bg-surface-dark border-t border-white/10">
        💡 Astuce : Scannez le QR Code de la TV avec votre vrai smartphone pour jouer à plusieurs !
      </div>
    </aside>
  );
};
