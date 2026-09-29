import React, { useState, useEffect } from 'react';
import { useGame } from '../../../context/GameContext';
import { WildRushGameState, WildRushPlayerState, WildRushChoice } from '../../../types/game';
import { Zap, Flame, Trophy, CheckCircle2, AlertTriangle, Sparkles, Activity } from 'lucide-react';
import { audio } from '../../../services/audio';

export const WildRushController: React.FC = () => {
  const { room, localPlayer, sendGameAction } = useGame();
  const gameState = room?.gameState as WildRushGameState | undefined;

  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null);

  const me: WildRushPlayerState | undefined = gameState?.players?.find(p => p.id === localPlayer?.id);
  const currentEnv = gameState?.currentEnvironment;
  const phase = gameState?.phase || 'countdown';
  const challengeTimeLeft = gameState?.challengeTimeLeft ?? 8;

  // Reset selected choice when new challenge begins
  useEffect(() => {
    if (phase === 'challenge') {
      setSelectedChoiceId(null);
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([40, 30, 40]);
      }
    }
  }, [phase, currentEnv?.id]);

  const handleSelectChoice = (choice: WildRushChoice) => {
    if (selectedChoiceId || me?.hasChosenCurrent || phase !== 'challenge') return;
    setSelectedChoiceId(choice.id);
    audio.playSelect();
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(60);
    }
    sendGameAction('wild_rush_choice', { choiceId: choice.id });
  };

  const handleCheer = () => {
    audio.playDiceRoll();
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(30);
    }
    sendGameAction('wild_rush_cheer', {});
  };

  const hasConfirmed = Boolean(selectedChoiceId || me?.hasChosenCurrent);

  return (
    <div className="min-h-screen bg-[#07090E] text-white flex flex-col justify-between p-4 select-none pb-8">
      {/* 1. Player Status Header Bar */}
      <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/5 border border-white/10 shadow-lg">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-xl">
            {localPlayer?.avatar || '🏃'}
          </div>
          <div>
            <div className="font-display font-black text-sm text-white truncate max-w-[130px]">
              {localPlayer?.name || 'Coureur'}
            </div>
            <div className="text-[11px] font-bold text-gray-400">
              {me ? `${Math.round(me.distance)}m / 1000m` : 'Course 3D'}
            </div>
          </div>
        </div>

        {/* Live Rank & Combo Counter */}
        <div className="flex items-center space-x-2">
          {me?.comboCount ? (
            <div className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 font-mono font-black text-xs">
              <Flame className="w-3.5 h-3.5 fill-current" />
              <span>x{me.comboCount}</span>
            </div>
          ) : null}

          <div className="px-3 py-1 rounded-xl bg-white/10 border border-white/15 font-mono font-black text-sm text-emerald-400">
            #{me?.rank || 1}
          </div>
        </div>
      </div>

      {/* 2. Main Controller Interface depending on Phase */}
      <div className="flex-1 flex flex-col justify-center my-4">
        {/* PHASE A: Countdown */}
        {phase === 'countdown' && (
          <div className="text-center space-y-4 animate-scale-in py-12">
            <span className="text-xs font-black uppercase tracking-widest text-amber-400">
              PRÉPAREZ-VOUS !
            </span>
            <div className="text-7xl font-display font-black text-white animate-pulse">
              {gameState?.countdown ?? 3}
            </div>
            <p className="text-xs text-gray-400 max-w-xs mx-auto">
              Regardez la Smart TV ! Choisissez l'animal parfait à chaque obstacle pour sprinter en tête.
            </p>
          </div>
        )}

        {/* PHASE B: Racing / In-between Obstacles */}
        {phase === 'racing' && (
          <div className="flex flex-col items-center justify-center space-y-6 text-center animate-fade-in">
            {/* Speedometer & Active Mascot Card */}
            <div className="w-full p-5 rounded-3xl bg-gradient-to-b from-white/10 to-white/5 border border-white/15 shadow-xl space-y-3">
              <div className="flex items-center justify-center space-x-2 text-xs font-black uppercase tracking-wider text-emerald-400">
                <Activity className="w-4 h-4 animate-pulse" />
                <span>EN PLEIN SPRINT</span>
              </div>

              <div className="text-3xl font-display font-black text-white">
                {me?.activeAnimal || 'Humain Sprinter'}
              </div>

              <div className="flex justify-around items-center pt-2 border-t border-white/10 text-xs">
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase">Vitesse</span>
                  <span className="font-mono font-black text-amber-300 text-lg">
                    {Math.round((me?.currentSpeed || 18) * 3.6)} km/h
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase">Environnement</span>
                  <span className="font-bold text-white text-sm">
                    {currentEnv?.name || 'Piste'}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Tap Cheer Button for extra micro-boost */}
            <button
              onClick={handleCheer}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 active:scale-95 text-white font-display font-black text-base uppercase tracking-wider shadow-[0_0_25px_rgba(16,185,129,0.4)] flex items-center justify-center space-x-2 transition-transform"
            >
              <Zap className="w-5 h-5 fill-current" />
              <span>BOOSTER L'ALLURE !</span>
            </button>
          </div>
        )}

        {/* PHASE C: Active Challenge / Animal Selection */}
        {(phase === 'challenge' || phase === 'obstacle_reaction') && currentEnv && (
          <div className="flex flex-col space-y-4 animate-slide-up">
            {/* Challenge Alert Header */}
            <div className="text-center p-3 rounded-2xl bg-amber-500/15 border border-amber-400/40 shadow-md">
              <div className="flex items-center justify-center space-x-1.5 text-amber-300 text-xs font-black uppercase tracking-wider mb-0.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>{currentEnv.name} ({challengeTimeLeft}s)</span>
              </div>
              <h2 className="text-base font-display font-black text-white leading-snug">
                {currentEnv.obstacleTitle}
              </h2>
            </div>

            {/* If choice is already confirmed */}
            {hasConfirmed ? (
              <div className="p-6 rounded-3xl bg-emerald-950/40 border-2 border-emerald-400 flex flex-col items-center justify-center text-center space-y-3 animate-scale-in">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 animate-bounce" />
                <div className="font-display font-black text-xl text-white">CHOIX ENREGISTRÉ !</div>
                <p className="text-xs text-emerald-200">
                  Regardez la Smart TV pour voir votre animal franchir l'obstacle en 3D !
                </p>
              </div>
            ) : (
              /* 4 Tactile Animal Selection Cards */
              <div className="grid grid-cols-2 gap-3">
                {currentEnv.choices.map(choice => (
                  <button
                    key={choice.id}
                    onClick={() => handleSelectChoice(choice)}
                    className="p-3.5 rounded-2xl bg-[#121826] border-2 border-white/15 active:border-emerald-400 active:scale-95 text-left flex flex-col justify-between space-y-2 shadow-lg transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-3xl">{choice.emoji}</span>
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-white/10 text-gray-300">
                        {choice.tagline.split('&')[0]}
                      </span>
                    </div>

                    <div>
                      <div className="font-display font-black text-sm text-white">
                        {choice.name}
                      </div>
                      <div className="text-[10px] text-gray-400 line-clamp-2 leading-tight mt-0.5">
                        {choice.description}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* PHASE D: Finish Line & Podium */}
        {phase === 'finished' && (
          <div className="text-center p-6 rounded-3xl bg-white/5 border border-white/15 space-y-4 animate-scale-in">
            <Trophy className="w-12 h-12 text-amber-400 mx-auto" />
            <div className="font-display font-black text-2xl text-white">COURSE TERMINÉE !</div>
            <div className="text-sm font-bold text-gray-300">
              Classement : <span className="text-amber-400 font-mono font-black text-lg">#{me?.rank || 1}</span>
            </div>
            <div className="text-xs text-emerald-400 font-bold">
              Score total : +{me?.score || 0} points
            </div>
          </div>
        )}
      </div>

      {/* 3. Bottom Mini Guidance */}
      <div className="text-center text-[10px] font-bold text-gray-400">
        WILD RUSH 3D • MOOD SMART TV GAMING
      </div>
    </div>
  );
};
