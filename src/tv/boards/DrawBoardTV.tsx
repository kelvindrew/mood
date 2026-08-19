import React, { useRef, useEffect } from 'react';
import { useGame } from '../../context/GameContext';
import { DrawGameState } from '../../types/game';
import { Clock, Trophy, Palette, CheckCircle2, Sparkles } from 'lucide-react';

export const DrawBoardTV: React.FC = () => {
  const { room } = useGame();
  const gameState = room?.gameState as DrawGameState | undefined;
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !gameState) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw all strokes
    gameState.strokes.forEach((stroke) => {
      if (stroke.points.length < 2) return;
      ctx.beginPath();
      ctx.strokeStyle = stroke.color || '#000000';
      ctx.lineWidth = stroke.size || 4;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      stroke.points.forEach((p, i) => {
        const x = p.x * canvas.width;
        const y = p.y * canvas.height;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
    });
  }, [gameState?.strokes]);

  if (!gameState) {
    return <div className="p-10 text-white">Chargement de la toile de dessin...</div>;
  }

  const isWordRevealed = gameState.state === 'word_revealed';

  return (
    <div className="w-full h-full flex items-center justify-between px-10 py-6 select-none">
      {/* Left Column: Drawer info & Scores */}
      <div className="w-80 flex flex-col space-y-5">
        <div className="p-6 rounded-3xl bg-surface-card border-2 border-brand-red/50 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-widest text-brand-red">DESSINATEUR ACTIF</span>
            <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-surface-light border border-white/10">
              <Clock className="w-3.5 h-3.5 text-brand-gold" />
              <span className="font-mono font-bold text-sm text-brand-gold">{gameState.timeRemaining}s</span>
            </div>
          </div>

          <div className="flex items-center space-x-4 my-4">
            <div className="text-5xl filter drop-shadow">🎨</div>
            <div>
              <h2 className="text-2xl font-black font-display text-white">{gameState.drawerName}</h2>
              <span className="text-xs text-gray-400 font-semibold">Dessine sur smartphone</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-surface-dark border border-white/10 text-xs text-gray-300">
            Catégorie : <strong className="text-brand-gold">{gameState.category}</strong>
          </div>
        </div>

        {/* Scores */}
        <div className="p-5 rounded-3xl bg-surface-card/85 border border-white/10 backdrop-blur-md space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-gray-300">CLASSEMENT SCORES</span>
            <Trophy className="w-4 h-4 text-brand-gold" />
          </div>

          <div className="space-y-2">
            {room?.players.map((p) => {
              const score = (gameState.scores && gameState.scores[p.id]) || 0;
              const isDrawer = p.id === gameState.currentDrawerId;
              return (
                <div
                  key={p.id}
                  className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                    isDrawer
                      ? 'bg-brand-red/20 border-brand-red text-white'
                      : 'bg-surface-light/50 border-white/5 text-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <span className="text-xl">{p.avatar}</span>
                    <span className="text-sm font-bold text-white truncate max-w-[120px]">{p.name}</span>
                  </div>
                  <span className="font-mono font-black text-brand-gold">{score} pts</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Center: The Shared Canvas */}
      <div className="flex flex-col items-center space-y-4 my-auto">
        {/* Secret Word Mask Banner */}
        <div className="px-8 py-3 rounded-2xl bg-surface-card border border-white/20 backdrop-blur-md shadow-2xl flex items-center space-x-4">
          <span className="text-xs font-black uppercase tracking-widest text-brand-gold">MOT MYSTÈRE :</span>
          <span className={`font-mono font-black text-3xl tracking-widest ${isWordRevealed ? 'text-emerald-400 animate-bounce' : 'text-white'}`}>
            {gameState.maskedWord}
          </span>
        </div>

        {/* White Canvas Frame */}
        <div className="relative w-[580px] h-[480px] rounded-3xl overflow-hidden bg-white border-4 border-[#252C42] shadow-2xl">
          <canvas
            ref={canvasRef}
            width={580}
            height={480}
            className="w-full h-full object-contain bg-white"
          />
        </div>
      </div>

      {/* Right Column: Live Guesses Feed */}
      <div className="w-80 flex flex-col space-y-4">
        <div className="p-5 rounded-3xl bg-surface-card/90 border border-white/10 backdrop-blur-xl shadow-2xl h-[480px] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
              <span className="text-xs font-black uppercase tracking-widest text-brand-cyan">PROPOSITIONS EN DIRECT</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            </div>

            <div className="space-y-2 overflow-y-auto max-h-[380px] pr-1">
              {gameState.guesses.length === 0 ? (
                <div className="text-center text-xs text-gray-500 py-12">
                  Tapez votre réponse sur votre smartphone !
                </div>
              ) : (
                gameState.guesses.map((g) => (
                  <div
                    key={g.id}
                    className={`p-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between animate-scale-in ${
                      g.isCorrect
                        ? 'bg-emerald-600 text-white shadow-glow-emerald'
                        : 'bg-surface-light text-gray-300 border border-white/5'
                    }`}
                  >
                    <div className="flex items-center space-x-1.5 truncate">
                      <span className="text-gray-400">{g.playerName} :</span>
                      <span className={g.isCorrect ? 'text-white font-black' : 'text-gray-200'}>{g.guess}</span>
                    </div>
                    {g.isCorrect && <CheckCircle2 className="w-4 h-4 text-white flex-shrink-0" />}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="text-center text-[10px] text-gray-400 border-t border-white/10 pt-2">
            Seuls les autres joueurs peuvent deviner.
          </div>
        </div>
      </div>
    </div>
  );
};
