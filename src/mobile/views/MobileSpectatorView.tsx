import React from 'react';
import { useGame } from '../../context/GameContext';
import { MobileHeader } from '../components/MobileHeader';
import { ReactionFlinger } from '../components/ReactionFlinger';
import { Eye, Trophy, Sparkles, Tv } from 'lucide-react';

export const MobileSpectatorView: React.FC = () => {
  const { room, selectedGame } = useGame();

  if (!room) return null;

  return (
    <div className="min-h-screen flex flex-col justify-between bg-background text-white select-none">
      <MobileHeader />

      <main className="p-5 flex-1 flex flex-col justify-between space-y-6">
        <div className="text-center space-y-2 pt-2">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-brand-purple/20 text-brand-purple border border-brand-purple/40 text-[10px] font-black uppercase">
            <Eye className="w-3.5 h-3.5" />
            <span>MODE SPECTATEUR ACTIF</span>
          </div>
          <h1 className="text-2xl font-black font-display text-white">{selectedGame.title}</h1>
          <p className="text-xs text-gray-400">Suivez l'action en direct sur l'écran Smart TV</p>
        </div>

        {/* Big TV Screen Prompt */}
        <div className="p-6 rounded-3xl bg-surface-card border border-white/10 text-center space-y-3">
          <Tv className="w-10 h-10 text-brand-cyan mx-auto animate-pulse" />
          <h3 className="text-base font-bold text-white">Regardez la Smart TV</h3>
          <p className="text-xs text-gray-300">
            Encouragez ou taquinez les joueurs en envoyant des réactions et des emojis en direct !
          </p>
        </div>

        {/* Players in Room */}
        <div className="p-4 rounded-2xl bg-surface-card/80 border border-white/10 space-y-2">
          <span className="text-[10px] font-black uppercase text-gray-400">JOUEURS EN PARTIE</span>
          <div className="grid grid-cols-2 gap-2">
            {room.players.map((p) => (
              <div key={p.id} className="flex items-center space-x-2 p-2 rounded-xl bg-surface-light border border-white/5">
                <span className="text-xl">{p.avatar}</span>
                <span className="text-xs font-bold text-white truncate">{p.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Reaction Flinger */}
        <div className="space-y-2">
          <span className="text-xs font-black uppercase text-brand-gold">Envoyer des Réactions TV</span>
          <ReactionFlinger />
        </div>
      </main>
    </div>
  );
};
