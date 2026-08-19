import React, { useState } from 'react';
import { useGame } from '../../../context/GameContext';
import { WerewolfGameState, WerewolfRole } from '../../../types/game';
import { MobileHeader } from '../../components/MobileHeader';
import { ReactionFlinger } from '../../components/ReactionFlinger';
import { triggerHaptic, hapticPatterns } from '../../components/HapticFeedback';
import { audio } from '../../../services/audio';
import { Eye, Shield, Skull, Moon, Sun, Lock, Check } from 'lucide-react';

const ROLE_DETAILS: Record<WerewolfRole, { name: string; icon: string; desc: string; color: string }> = {
  werewolf: { name: 'Loup-Garou', icon: '🐺', desc: 'Dévorez un villageois chaque nuit avec votre meute.', color: 'text-red-400 border-red-500' },
  seer: { name: 'Voyante', icon: '🔮', desc: 'Sondez l’identité secrète d’un joueur chaque nuit.', color: 'text-indigo-400 border-indigo-500' },
  witch: { name: 'Sorcière', icon: '🧪', desc: 'Vous possédez une potion de vie et une potion de mort.', color: 'text-purple-400 border-purple-500' },
  hunter: { name: 'Chasseur', icon: '🏹', desc: 'Si vous êtes éliminé, tirez immédiatement sur un joueur.', color: 'text-amber-400 border-amber-500' },
  villager: { name: 'Simple Villageois', icon: '👨‍🌾', desc: 'Démasquez les loups lors des débats et votes du village.', color: 'text-emerald-400 border-emerald-500' },
};

export const WerewolfController: React.FC = () => {
  const { room, localPlayer, sendGameAction } = useGame();
  const gameState = room?.gameState as WerewolfGameState | undefined;

  const [revealRole, setRevealRole] = useState(false);
  const [selectedTarget, setSelectedTarget] = useState<string | null>(null);

  if (!gameState || !localPlayer) return null;

  const myState = gameState.players && gameState.players[localPlayer.id];
  if (!myState) return null;

  const roleInfo = ROLE_DETAILS[myState.role] || ROLE_DETAILS.villager;
  const isNight = gameState.phase.startsWith('night');
  const isVoting = gameState.phase === 'day_voting';
  const alivePlayers = Object.values(gameState.players).filter((p) => p.isAlive && p.id !== localPlayer.id);

  const handleSelectTarget = (targetId: string) => {
    if (!myState.isAlive) return;
    setSelectedTarget(targetId);
    triggerHaptic(hapticPatterns.tap);
    audio.playSelect();
    sendGameAction('werewolf_action', { targetId });
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-background text-white select-none">
      <MobileHeader />

      <main className="p-4 flex-1 flex flex-col justify-between space-y-4">
        {/* Secret Role Card (Hold / Tap to reveal) */}
        <div className="p-4 rounded-3xl bg-surface-card border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">VOTRE CARTE DE RÔLE SECRÈTE</span>
            <button
              onClick={() => {
                triggerHaptic(hapticPatterns.tap);
                setRevealRole(!revealRole);
              }}
              className="px-3 py-1 rounded-full bg-surface-light text-xs font-bold text-brand-gold flex items-center space-x-1"
            >
              {revealRole ? <Lock className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
              <span>{revealRole ? 'Masquer' : 'Voir mon rôle'}</span>
            </button>
          </div>

          {revealRole ? (
            <div className={`p-4 rounded-2xl border-2 ${roleInfo.color} bg-black/40 flex items-center space-x-4 animate-scale-in`}>
              <div className="text-5xl">{roleInfo.icon}</div>
              <div>
                <h3 className="text-lg font-black font-display text-white">{roleInfo.name}</h3>
                <p className="text-xs text-gray-300 leading-snug mt-0.5">{roleInfo.desc}</p>
              </div>
            </div>
          ) : (
            <div className="p-6 rounded-2xl bg-surface-dark border border-dashed border-gray-700 text-center text-gray-500 text-xs font-bold">
              🔒 Carte masquée pour préserver le secret dans la pièce
            </div>
          )}
        </div>

        {/* Phase Action Box */}
        <div className="my-auto space-y-3">
          <div className="text-center space-y-1">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-surface-card border border-white/10 text-xs font-bold">
              {isNight ? <Moon className="w-3.5 h-3.5 text-indigo-400" /> : <Sun className="w-3.5 h-3.5 text-amber-400" />}
              <span>{isNight ? 'Phase Nocturne' : isVoting ? 'Tribunal & Vote du Village' : 'Débat en cours'}</span>
            </div>
            <p className="text-xs text-gray-400">
              {isNight && myState.role === 'werewolf'
                ? '🐺 Choisissez votre victime cette nuit :'
                : isVoting
                ? '⚖️ Votez contre le joueur suspect :'
                : 'Regardez la TV et préparez vos arguments !'}
            </p>
          </div>

          {/* Target Selection Grid */}
          {(isNight && myState.role === 'werewolf' || isVoting) && myState.isAlive && (
            <div className="grid grid-cols-2 gap-2.5 max-h-[220px] overflow-y-auto pr-1">
              {alivePlayers.map((p) => {
                const isSelected = selectedTarget === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => handleSelectTarget(p.id)}
                    className={`p-3 rounded-2xl border-2 flex items-center justify-between transition-all ${
                      isSelected
                        ? 'bg-rose-950/80 border-rose-500 text-white shadow-glow-red scale-105'
                        : 'bg-surface-card border-white/10 text-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-2 truncate">
                      <span className="text-xl">{p.avatar}</span>
                      <span className="text-xs font-bold truncate">{p.name}</span>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-rose-400 flex-shrink-0" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <ReactionFlinger />
      </main>
    </div>
  );
};
