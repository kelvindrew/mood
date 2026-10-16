import React, { useState, useEffect } from 'react';
import { useGame } from '../../context/GameContext';
import { GAMES_CATALOG } from '../../data/gamesCatalog';
import { GameCatalogItem } from '../../types/game';
import { Play, Heart, BookOpen, ArrowLeft, Users, Clock, Flame, CheckCircle, Sliders, Shield, Loader2, AlertCircle } from 'lucide-react';
import { audio } from '../../services/audio';
import { tvNav } from '../../services/tvNavigation';
import { useTvBack, useTvModalScope } from '../hooks/useTvNav';

// M6 — Modale « Règles du jeu » : focus trap + Back/Échap = fermer
const RulesModal: React.FC<{ game: GameCatalogItem; onClose: () => void }> = ({ game, onClose }) => {
  const scopeRef = useTvModalScope(onClose);

  return (
    <div ref={scopeRef} className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-[#0A0F1D]/90">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-3xl p-7 shadow-2xl flex flex-col space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-3">
            <BookOpen className="w-6 h-6 text-amber-400" />
            <h2 className="text-xl sm:text-2xl font-black font-display text-white">Règles du Jeu : {game.title}</h2>
          </div>
        </div>

        <div className="space-y-2.5 max-h-[50vh] overflow-y-auto pr-2">
          {game.rules.map((rule, idx) => (
            <div key={idx} className="flex items-start space-x-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="w-6 h-6 rounded-full bg-cyan-950 border border-cyan-400/40 text-cyan-300 flex items-center justify-center font-bold text-xs flex-shrink-0">
                {idx + 1}
              </span>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">{rule}</p>
            </div>
          ))}
        </div>

        <div className="flex justify-end pt-2">
          <button
            data-tv-focus
            tabIndex={0}
            onClick={onClose}
            className="px-7 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider focus:bg-white focus:text-slate-950 focus:ring-4 focus:ring-white transition-all outline-none"
          >
            COMPRIS !
          </button>
        </div>
      </div>
    </div>
  );
};

// M6 — Modale « Créer un salon » : focus trap + Back/Échap = fermer
interface CreateModalProps {
  game: GameCatalogItem;
  isCreating: boolean;
  createError: string;
  maxPlayers: number;
  turnDuration: number;
  gameMode: string;
  onClose: () => void;
  onMaxPlayers: (n: number) => void;
  onTurnDuration: (s: number) => void;
  onGameMode: (m: string) => void;
  onCreate: () => void;
}

const CreateRoomModal: React.FC<CreateModalProps> = ({
  game, isCreating, createError,
  maxPlayers, turnDuration, gameMode,
  onClose, onMaxPlayers, onTurnDuration, onGameMode, onCreate,
}) => {
  const scopeRef = useTvModalScope(onClose);

  return (
    <div ref={scopeRef} className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-[#0A0F1D]/90">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-3xl p-7 shadow-2xl flex flex-col space-y-5">
        <div className="flex items-center space-x-3 border-b border-slate-800 pb-3">
          <Sliders className="w-6 h-6 text-cyan-400" />
          <div>
            <h2 className="text-xl sm:text-2xl font-black font-display text-white">CRÉER UN SALON</h2>
            <p className="text-xs text-slate-400">Paramétrez votre partie de {game.title}</p>
          </div>
        </div>

        {/* Options */}
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">Nombre Maximum de Joueurs</label>
            {(() => {
              const validCounts = (() => {
                if (game.minPlayers === game.maxPlayers) return [game.maxPlayers];
                const list: number[] = [];
                for (let n = Math.max(1, game.minPlayers); n <= game.maxPlayers; n++) {
                  list.push(n);
                }
                if (list.length > 4) {
                  return Array.from(new Set([
                    game.minPlayers,
                    Math.round(game.minPlayers + (game.maxPlayers - game.minPlayers) * 0.33),
                    Math.round(game.minPlayers + (game.maxPlayers - game.minPlayers) * 0.66),
                    game.maxPlayers
                  ])).sort((a, b) => a - b);
                }
                return list;
              })();

              const gridClass = validCounts.length === 1 ? 'grid-cols-1' : validCounts.length === 2 ? 'grid-cols-2' : validCounts.length === 3 ? 'grid-cols-3' : 'grid-cols-4';

              return (
                <div className={`grid ${gridClass} gap-2`}>
                  {validCounts.map((num) => (
                    <button
                      key={num}
                      data-tv-focus
                      tabIndex={0}
                      onClick={() => onMaxPlayers(num)}
                      className={`py-2 rounded-xl font-bold text-xs sm:text-sm border transition-all outline-none ${
                        maxPlayers === num
                          ? 'bg-cyan-400 text-slate-950 border-cyan-400 font-black shadow-md'
                          : 'bg-slate-950/60 border-slate-700/80 text-slate-300 hover:border-slate-500 focus:ring-2 focus:ring-cyan-400'
                      }`}
                    >
                      {num} {num > 1 ? 'Joueurs' : 'Joueur'}
                      {game.minPlayers === game.maxPlayers && ' (Règle)'}
                    </button>
                  ))}
                </div>
              );
            })()}
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">Chronomètre par Tour</label>
            <div className="grid grid-cols-3 gap-2">
              {[15, 30, 45].map((sec) => (
                <button
                  key={sec}
                  data-tv-focus
                  tabIndex={0}
                  onClick={() => onTurnDuration(sec)}
                  className={`py-2 rounded-xl font-bold text-xs border transition-all outline-none ${
                    turnDuration === sec
                      ? 'bg-amber-400 text-slate-950 border-amber-400 font-black'
                      : 'bg-slate-950/60 border-slate-700/80 text-slate-300 hover:border-slate-500 focus:ring-2 focus:ring-amber-400'
                  }`}
                >
                  {sec} secondes
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">Mode de Partie</label>
            <div className="grid grid-cols-2 gap-2">
              {['standard', 'rapide'].map((mode) => (
                <button
                  key={mode}
                  data-tv-focus
                  tabIndex={0}
                  onClick={() => onGameMode(mode)}
                  className={`py-2 rounded-xl font-bold text-xs capitalize border transition-all outline-none ${
                    gameMode === mode
                      ? 'bg-indigo-600 text-white border-indigo-500 shadow-md'
                      : 'bg-slate-950/60 border-slate-700/80 text-slate-300 hover:border-slate-500 focus:ring-2 focus:ring-indigo-400'
                  }`}
                >
                  Mode {mode}
                </button>
              ))}
            </div>
          </div>
        </div>

        {createError && (
          <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500/50 text-rose-300 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{createError}</span>
          </div>
        )}

        {/* Modal Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <button
            data-tv-focus
            tabIndex={0}
            disabled={isCreating}
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white border border-slate-700 font-bold text-xs sm:text-sm outline-none focus:ring-2 focus:ring-white disabled:opacity-50"
          >
            Annuler
          </button>

          <button
            data-tv-focus
            tabIndex={0}
            disabled={isCreating}
            onClick={onCreate}
            className="flex items-center space-x-2 px-7 py-3 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider shadow-[0_4px_25px_rgba(6,182,212,0.35)] hover:scale-105 focus:scale-105 focus:bg-white focus:text-slate-950 focus:ring-4 focus:ring-white transition-all outline-none disabled:opacity-75"
          >
            {isCreating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>CRÉATION DU SALON...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>GÉNÉRER LE SALON</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export const TVGameDetailView: React.FC = () => {
  const { selectedGame: contextGame, setSelectedGame, setTvView, createRoom, games } = useGame();
  const selectedGame = games.find((g) => g.id === contextGame.id) || contextGame;
  const [isFavorite, setIsFavorite] = useState(false);
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  // Room custom settings
  const [maxPlayers, setMaxPlayers] = useState(selectedGame.maxPlayers);
  const [turnDuration, setTurnDuration] = useState(30);
  const [gameMode, setGameMode] = useState('standard');

  // M5 — Back télécommande = retour au catalogue (comme le bouton haut-gauche)
  useTvBack(() => {
    if (showRulesModal) { setShowRulesModal(false); return; }
    if (showCreateModal) { setShowCreateModal(false); return; }
    audio.playBack();
    setTvView('home');
  });

  useEffect(() => {
    tvNav.setInitialFocus('button');
  }, []);

  const handleCreateRoom = async () => {
    if (isCreating) return;
    setIsCreating(true);
    setCreateError('');
    audio.playSelect();

    try {
      const res = await createRoom(selectedGame.id, {
        maxPlayers,
        turnDuration,
        gameMode,
      });
      if (!res.success) {
        setCreateError(res.error || 'Erreur lors de la création du salon');
      }
    } catch (err: any) {
      setCreateError(err?.message || 'Connexion au serveur impossible');
    } finally {
      setIsCreating(false);
    }
  };

  const similarGames = games.filter((g) => g.id !== selectedGame.id);

  return (
    <div className="relative min-h-screen pt-20 px-[5vw] pb-24 select-none bg-[#0A0F1D] text-white">
      {/* Background with Ambient Glow */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <img
          src={selectedGame.heroImage}
          alt={selectedGame.title}
          className="w-full h-full object-cover object-center opacity-20 filter blur-xl scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#07090E]/85 via-[#07090E]/95 to-[#07090E]" />
      </div>

      {/* Top Back Button */}
      <div className="relative z-10 mb-6">
        <button
          data-tv-focus
          tabIndex={0}
          onClick={() => {
            audio.playBack();
            setTvView('home');
          }}
          className="flex items-center space-x-2 px-5 py-2.5 rounded-xl liquid-glass hover:bg-white/10 text-slate-200 hover:text-white transition-all outline-none focus:scale-105 focus:ring-4 focus:ring-white cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="font-display font-bold text-xs sm:text-sm uppercase tracking-wider">Retour au catalogue</span>
        </button>
      </div>

      {/* Main Game Showcase */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Big Visual & Quick Actions */}
        <div className="lg:col-span-5 flex flex-col space-y-4">
          <div className="relative w-full aspect-video lg:aspect-[4/3] rounded-3xl overflow-hidden border border-white/10 shadow-2xl group bg-neutral-900">
            <img
              src={selectedGame.coverImage}
              alt={selectedGame.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#07090E] via-transparent to-transparent opacity-80" />

            {selectedGame.badge && (
              <div className="absolute top-4 left-4 px-3 py-1 rounded-md bg-amber-400 text-neutral-950 text-xs font-black uppercase tracking-wider shadow-md">
                {selectedGame.badge}
              </div>
            )}

            {/* Favorite toggle as discreet overlay icon on the artwork */}
            <button
              data-tv-focus
              tabIndex={0}
              onClick={() => {
                audio.playSelect();
                setIsFavorite(!isFavorite);
              }}
              className="absolute top-4 right-4 w-10 h-10 rounded-full liquid-glass-pill hover:bg-white/20 flex items-center justify-center transition-all outline-none focus:scale-110 focus:ring-2 focus:ring-white cursor-pointer"
              title={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
            >
              <Heart className={`w-5 h-5 ${isFavorite ? 'fill-rose-500 text-rose-500' : 'text-white'}`} />
            </button>
          </div>

          {/* RÈGLE STRICTE DES DEUX BOUTONS D'ACTION VISIBLES : CRÉER UN SALON & RÈGLES DU JEU */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <button
              data-tv-focus
              tabIndex={0}
              onClick={() => setShowCreateModal(true)}
              className="flex items-center justify-center space-x-2 py-3.5 px-6 rounded-xl bg-white hover:bg-neutral-200 text-neutral-950 font-display font-black text-xs sm:text-sm uppercase tracking-wider shadow-[0_4px_25px_rgba(255,255,255,0.25)] hover:scale-105 focus:scale-105 focus:ring-4 focus:ring-white transition-all outline-none cursor-pointer"
            >
              <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-neutral-950 translate-x-0.5" />
              <span>CRÉER UN SALON</span>
            </button>

            <button
              data-tv-focus
              tabIndex={0}
              onClick={() => {
                audio.playSelect();
                setShowRulesModal(true);
              }}
              className="flex items-center justify-center space-x-2 py-3.5 px-6 rounded-xl liquid-glass hover:bg-white/10 text-white font-display font-bold text-xs sm:text-sm uppercase tracking-wider hover:scale-105 focus:scale-105 focus:ring-4 focus:ring-white transition-all outline-none cursor-pointer"
            >
              <BookOpen className="w-4 h-4 text-amber-400" />
              <span>RÈGLES DU JEU</span>
            </button>
          </div>
        </div>

        {/* Right Column: Title, Metadata, Features, Rules */}
        <div className="lg:col-span-7 flex flex-col space-y-6">
          <div>
            <span className="text-cyan-400 text-xs font-bold tracking-widest uppercase">
              EXPÉRIENCE SMART TV PREMIUM
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black font-display text-white tracking-tight mt-1">
              {selectedGame.title}
            </h1>
            <p className="text-base text-amber-300/90 mt-1.5 font-medium">
              {selectedGame.tagline}
            </p>
          </div>

          {/* Quick Specs */}
          <div className="flex flex-wrap gap-2.5">
            <div className="flex items-center space-x-2 px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700/60">
              <Users className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold text-slate-200">{selectedGame.minPlayers} à {selectedGame.maxPlayers} Joueurs</span>
            </div>
            <div className="flex items-center space-x-2 px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700/60">
              <Clock className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold text-slate-200">{selectedGame.durationMinutes}</span>
            </div>
            <div className="flex items-center space-x-2 px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700/60">
              <Flame className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold text-amber-300">{selectedGame.difficulty}</span>
            </div>
          </div>

          {/* Description */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-700/60 shadow-md">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">Description</h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {selectedGame.description}
            </p>
          </div>

          {/* Key Features */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Fonctionnalités Smart TV & Mobile</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {selectedGame.features.map((feat, i) => (
                <div key={i} className="flex items-center space-x-2.5 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                  <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span className="text-xs font-medium text-slate-200">{feat}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Similar Games Row */}
          <div className="pt-2">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2.5">Autres Jeux Recommandés</h3>
            <div className="flex items-center space-x-3.5 overflow-x-auto pb-2">
              {similarGames.map((simGame) => (
                <div
                  key={simGame.id}
                  data-tv-focus
                  tabIndex={0}
                  onClick={() => {
                    audio.playSelect();
                    setSelectedGame(simGame);
                  }}
                  className="flex-shrink-0 w-44 p-2 rounded-xl bg-slate-900 border border-slate-700/60 cursor-pointer hover:border-cyan-400 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/40 focus:scale-102 transition-all outline-none"
                >
                  <img src={simGame.coverImage} alt={simGame.title} className="w-full h-24 object-cover rounded-lg mb-2" />
                  <div className="text-xs font-bold text-white truncate">{simGame.title}</div>
                  <div className="text-[10px] text-slate-400">{simGame.minPlayers}-{simGame.maxPlayers} Joueurs</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* MODAL: Game Rules */}
      {showRulesModal && (
        <RulesModal game={selectedGame} onClose={() => setShowRulesModal(false)} />
      )}

      {/* MODAL: Create Room Customization */}
      {showCreateModal && (
        <CreateRoomModal
          game={selectedGame}
          isCreating={isCreating}
          createError={createError}
          maxPlayers={maxPlayers}
          turnDuration={turnDuration}
          gameMode={gameMode}
          onClose={() => setShowCreateModal(false)}
          onMaxPlayers={setMaxPlayers}
          onTurnDuration={setTurnDuration}
          onGameMode={setGameMode}
          onCreate={handleCreateRoom}
        />
      )}
    </div>
  );
};
