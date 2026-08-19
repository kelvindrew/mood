import React, { useState, useRef, useEffect } from 'react';
import { useGame } from '../../../context/GameContext';
import { DrawGameState, DrawStroke } from '../../../types/game';
import { MobileHeader } from '../../components/MobileHeader';
import { ReactionFlinger } from '../../components/ReactionFlinger';
import { triggerHaptic, hapticPatterns } from '../../components/HapticFeedback';
import { audio } from '../../../services/audio';
import { Palette, Trash2, Send, Eraser, Sparkles } from 'lucide-react';

const COLORS = ['#000000', '#E50914', '#3B82F6', '#10B981', '#F59E0B', '#8A2BE2', '#EC4899', '#FFFFFF'];
const SIZES = [3, 6, 12];

export const DrawController: React.FC = () => {
  const { room, localPlayer, sendGameAction } = useGame();
  const gameState = room?.gameState as DrawGameState | undefined;

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedColor, setSelectedColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(6);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentStroke, setCurrentStroke] = useState<{ x: number; y: number }[]>([]);
  const [guessInput, setGuessInput] = useState('');

  if (!gameState || !localPlayer) return null;

  const isDrawer = gameState.currentDrawerId === localPlayer.id;

  // Drawing event handlers
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawer) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const x = (touch.clientX - rect.left) / rect.width;
    const y = (touch.clientY - rect.top) / rect.height;

    setIsDrawing(true);
    setCurrentStroke([{ x, y }]);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawer || !isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const x = Math.max(0, Math.min(1, (touch.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (touch.clientY - rect.top) / rect.height));

    const updatedPoints = [...currentStroke, { x, y }];
    setCurrentStroke(updatedPoints);

    // Draw locally on canvas
    const ctx = canvas.getContext('2d');
    if (ctx && updatedPoints.length >= 2) {
      const prev = updatedPoints[updatedPoints.length - 2];
      ctx.beginPath();
      ctx.strokeStyle = selectedColor;
      ctx.lineWidth = brushSize;
      ctx.lineCap = 'round';
      ctx.moveTo(prev.x * canvas.width, prev.y * canvas.height);
      ctx.lineTo(x * canvas.width, y * canvas.height);
      ctx.stroke();
    }
  };

  const handleTouchEnd = () => {
    if (!isDrawer || !isDrawing) return;
    setIsDrawing(false);

    if (currentStroke.length > 0) {
      const stroke: DrawStroke = {
        id: Math.random().toString(36).substring(2, 9),
        color: selectedColor,
        size: brushSize,
        points: currentStroke,
      };
      sendGameAction('draw_stroke', { stroke });
      setCurrentStroke([]);
    }
  };

  const handleClear = () => {
    if (!isDrawer) return;
    triggerHaptic(hapticPatterns.tap);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
    }
    sendGameAction('draw_clear');
  };

  const handleGuessSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isDrawer || !guessInput.trim()) return;

    triggerHaptic(hapticPatterns.tap);
    sendGameAction('guess_word', { guessText: guessInput.trim() });
    setGuessInput('');
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-background text-white select-none">
      <MobileHeader />

      <main className="p-4 flex-1 flex flex-col justify-between space-y-4">
        {/* Top Status Header */}
        <div
          className={`p-3 rounded-2xl text-center border transition-all ${
            isDrawer
              ? 'bg-brand-red/20 border-brand-red shadow-glow-red'
              : 'bg-surface-card border-white/10 text-gray-400'
          }`}
        >
          <span className="text-[10px] font-black uppercase tracking-wider block">
            {isDrawer ? '🎨 C’EST VOTRE TOUR DE DESSINER !' : `DESSINATEUR : ${gameState.drawerName}`}
          </span>
          <span className="text-base font-black font-display text-white">
            {isDrawer ? `MOT SECRET : ${gameState.secretWord}` : 'Devinez le mot secret !'}
          </span>
        </div>

        {/* If Drawer: Interactive Touch Canvas & Tools */}
        {isDrawer ? (
          <div className="space-y-3 my-auto">
            {/* Drawing Canvas Frame */}
            <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-white border-2 border-white/20 shadow-xl touch-none">
              <canvas
                ref={canvasRef}
                width={360}
                height={270}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                className="w-full h-full object-contain cursor-crosshair"
              />
            </div>

            {/* Colors Palette & Sizes */}
            <div className="flex items-center justify-between p-2.5 bg-surface-card rounded-2xl border border-white/10">
              <div className="flex items-center space-x-1.5 overflow-x-auto pr-2">
                {COLORS.map((col) => (
                  <button
                    key={col}
                    onClick={() => {
                      triggerHaptic(hapticPatterns.tap);
                      setSelectedColor(col);
                    }}
                    className={`w-7 h-7 rounded-full border border-white/40 transition-transform ${
                      selectedColor === col ? 'scale-125 ring-2 ring-white' : ''
                    }`}
                    style={{ backgroundColor: col }}
                  />
                ))}
              </div>

              <div className="flex items-center space-x-2 border-l border-white/10 pl-2">
                {SIZES.map((sz) => (
                  <button
                    key={sz}
                    onClick={() => setBrushSize(sz)}
                    className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs ${
                      brushSize === sz ? 'bg-brand-red text-white' : 'bg-surface-light text-gray-400'
                    }`}
                  >
                    {sz === 3 ? 'S' : sz === 6 ? 'M' : 'L'}
                  </button>
                ))}

                <button
                  onClick={handleClear}
                  className="p-1.5 rounded-xl bg-surface-light text-rose-400 hover:text-white"
                  title="Effacer tout"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* If Guesser: Fast Guess Input Form */
          <div className="space-y-4 my-auto">
            <div className="p-6 rounded-3xl bg-surface-card/80 border border-white/10 text-center space-y-3">
              <Sparkles className="w-8 h-8 text-brand-gold mx-auto animate-pulse" />
              <h3 className="text-base font-bold text-white">Regardez le dessin sur la TV</h3>
              <p className="text-xs text-gray-400">
                Catégorie : <strong className="text-white">{gameState.category}</strong>
              </p>
            </div>

            <form onSubmit={handleGuessSubmit} className="space-y-3">
              <div className="relative">
                <input
                  type="text"
                  value={guessInput}
                  onChange={(e) => setGuessInput(e.target.value)}
                  placeholder="Tapez votre réponse ici..."
                  className="w-full py-4 pl-4 pr-12 rounded-2xl bg-surface-card border-2 border-brand-red/40 text-base font-bold text-white placeholder-gray-500 focus:outline-none focus:border-brand-red"
                  autoFocus
                />
                <button
                  type="submit"
                  className="absolute right-2 top-2 bottom-2 px-3 rounded-xl bg-brand-red text-white font-bold flex items-center justify-center"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        )}

        <ReactionFlinger />
      </main>
    </div>
  );
};
