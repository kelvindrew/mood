import React, { useState, useEffect } from 'react';
import { useGame } from '../../context/GameContext';
import { GAMES_CATALOG } from '../../data/gamesCatalog';
import { Play, Heart, BookOpen, ArrowLeft, Users, Clock, Flame, CheckCircle, Sliders, Shield } from 'lucide-react';
import { audio } from '../../services/audio';
import { tvNav } from '../../services/tvNavigation';

export const TVGameDetailView: React.FC = () => {
  const { selectedGame, setSelectedGame, setTvView, createRoom } = useGame();
  const [isFavorite, setIsFavorite] = useState(false);
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Room custom settings
  const [maxPlayers, setMaxPlayers] = useState(selectedGame.maxPlayers);
  const [turnDuration, setTurnDuration] = useState(30);
  const [gameMode, setGameMode] = useState('standard');

  useEffect(() => {
    tvNav.setInitialFocus('button');
  }, [showRulesModal, showCreateModal]);

  const handleCreateRoom = async () => {
    audio.playSelect();
    await createRoom(selectedGame.id, {
      maxPlayers,
      turnDuration,
      gameMode,
    });
  };

  const similarGames = GAMES_CATALOG.filter((g) => g.id !== selectedGame.id);

  return (
    <div className="relative min-h-screen pt-20 px-12 pb-24 select-none">
      {/* Background with Ambient Glow */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <img
          src={selectedGame.heroImage}
          alt={selectedGame.title}
          className="w-full h-full object-cover object-center opacity-30 filter blur-xl scale-110"
        />
        <div className="absolute inset-0 bg-[#0B0D14]/90 backdrop-blur-md" />
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
          className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-surface-card border border-white/10 text-gray-300 hover:text-white hover:border-white/30 focus:bg-white focus:text-background focus:ring-4 focus:ring-brand-accent transition-all outline-none"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="font-bold text-xs">Retour au catalogue</span>
        </button>
      </div>

      {/* Main Game Showcase */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column: Big Visual & Quick Actions */}
        <div className="lg:col-span-5 flex flex-col space-y-6">
          <div className="relative w-full aspect-video lg:aspect-[4/3] rounded-3xl overflow-hidden border-2 border-white/15 shadow-2xl shadow-brand-red/20 group">
            <img
              src={selectedGame.coverImage}
              alt={selectedGame.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B0D14] via-transparent to-transparent opacity-80" />

            {selectedGame.badge && (
              <div className="absolute top-4 left-4 px-3.5 py-1 rounded-full bg-brand-red text-white text-xs font-black uppercase tracking-wider shadow-glow-red">
                {selectedGame.badge}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-3 gap-3">
            <button
              data-tv-focus
              tabIndex={0}
              onClick={() => setShowCreateModal(true)}
              className="col-span-3 flex items-center justify-center space-x-3 py-4 px-6 rounded-2xl bg-brand-red hover:bg-red-600 text-white font-black text-lg shadow-glow-red hover:scale-105 focus:scale-105 focus:bg-white focus:text-brand-red focus:ring-4 focus:ring-brand-red transition-all outline-none"
            >
              <Play className="w-6 h-6 fill-current" />
              <span>▶ CRÉER UN SALON</span>
            </button>

            <button
              data-tv-focus
              tabIndex={0}
              onClick={() => {
                audio.playSelect();
                setIsFavorite(!isFavorite);
              }}
              className={`flex items-center justify-center space-x-2 py-3 rounded-xl border text-sm font-bold transition-all outline-none ${
                isFavorite
                  ? 'bg-rose-950/80 border-rose-500 text-rose-400'
                  : 'bg-surface-card border-white/10 text-gray-300 hover:text-white focus:bg-white focus:text-background focus:ring-4 focus:ring-brand-accent'
              }`}
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current text-rose-500' : ''}`} />
              <span>{isFavorite ? 'FAVORI ♡' : 'FAVORIS'}</span>
            </button>

            <button
              data-tv-focus
              tabIndex={0}
              onClick={() => {
                audio.playSelect();
                setShowRulesModal(true);
              }}
              className="col-span-2 flex items-center justify-center space-x-2 py-3 rounded-xl bg-surface-card border border-white/10 hover:border-white/30 text-gray-200 text-sm font-bold focus:bg-white focus:text-background focus:ring-4 focus:ring-brand-accent transition-all outline-none"
            >
              <BookOpen className="w-4 h-4 text-brand-gold" />
              <span>ⓘ RÈGLES DU JEU</span>
            </button>
          </div>
        </div>

        {/* Right Column: Title, Metadata, Features, Rules */}
        <div className="lg:col-span-7 flex flex-col space-y-6">
          <div>
            <span className="text-brand-accent text-xs font-black tracking-widest uppercase">
              EXPÉRIENCE SMART TV PREMIUM
            </span>
            <h1 className="text-4xl lg:text-5xl font-black font-display text-white tracking-tight mt-1">
              {selectedGame.title}
            </h1>
            <p className="text-lg text-gray-300 mt-2 font-medium">
              {selectedGame.tagline}
            </p>
          </div>

          {/* Quick Specs */}
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-surface-card border border-white/10">
              <Users className="w-4 h-4 text-brand-cyan" />
              <span className="text-xs font-bold text-gray-200">{selectedGame.minPlayers} à {selectedGame.maxPlayers} Joueurs</span>
            </div>
            <div className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-surface-card border border-white/10">
              <Clock className="w-4 h-4 text-brand-gold" />
              <span className="text-xs font-bold text-gray-200">{selectedGame.durationMinutes}</span>
            </div>
            <div className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-surface-card border border-white/10">
              <Flame className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold text-emerald-400">{selectedGame.difficulty}</span>
            </div>
          </div>

          {/* Description */}
          <div className="p-5 rounded-2xl bg-surface-card/70 border border-white/10 backdrop-blur-sm">
            <h3 className="text-sm font-black text-gray-300 uppercase tracking-wider mb-2">Description</h3>
            <p className="text-sm text-gray-300 leading-relaxed">
              {selectedGame.description}
            </p>
          </div>

          {/* Key Features */}
          <div className="space-y-2">
            <h3 className="text-sm font-black text-gray-300 uppercase tracking-wider">Fonctionnalités Smart TV & Mobile</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {selectedGame.features.map((feat, i) => (
                <div key={i} className="flex items-center space-x-2.5 p-3 rounded-xl bg-surface-light/50 border border-white/5">
                  <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span className="text-xs font-semibold text-gray-200">{feat}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Similar Games Row */}
          <div className="pt-4">
            <h3 className="text-sm font-black text-gray-300 uppercase tracking-wider mb-3">Autres Jeux Recommandés</h3>
            <div className="flex items-center space-x-4 overflow-x-auto pb-2">
              {similarGames.map((simGame) => (
                <div
                  key={simGame.id}
                  data-tv-focus
                  tabIndex={0}
                  onClick={() => {
                    audio.playSelect();
                    setSelectedGame(simGame);
                  }}
                  className="flex-shrink-0 w-44 p-2 rounded-xl bg-surface-card border border-white/10 cursor-pointer hover:border-brand-red focus:ring-4 focus:ring-brand-red focus:scale-105 transition-all outline-none"
                >
                  <img src={simGame.coverImage} alt={simGame.title} className="w-full h-24 object-cover rounded-lg mb-2" />
                  <div className="text-xs font-bold text-white truncate">{simGame.title}</div>
                  <div className="text-[10px] text-gray-400">{simGame.minPlayers}-{simGame.maxPlayers} Joueurs</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* MODAL: Game Rules */}
      {showRulesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-2xl bg-surface-card border border-white/20 rounded-3xl p-8 shadow-2xl flex flex-col space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center space-x-3">
                <BookOpen className="w-6 h-6 text-brand-gold" />
                <h2 className="text-2xl font-black font-display text-white">Règles du Jeu : {selectedGame.title}</h2>
              </div>
            </div>

            <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-2">
              {selectedGame.rules.map((rule, idx) => (
                <div key={idx} className="flex items-start space-x-3 p-3.5 rounded-xl bg-surface-light border border-white/5">
                  <span className="w-6 h-6 rounded-full bg-brand-red text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                    {idx + 1}
                  </span>
                  <p className="text-sm text-gray-200 leading-relaxed font-medium">{rule}</p>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <button
                data-tv-focus
                tabIndex={0}
                onClick={() => {
                  audio.playBack();
                  setShowRulesModal(false);
                }}
                className="px-8 py-3 rounded-xl bg-white text-background font-black text-sm hover:bg-gray-200 focus:bg-brand-red focus:text-white focus:ring-4 focus:ring-white transition-all outline-none"
              >
                COMPRIS !
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Create Room Customization */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/85 backdrop-blur-lg">
          <div className="w-full max-w-lg bg-surface-card border border-brand-red/40 rounded-3xl p-8 shadow-glow-red flex flex-col space-y-6">
            <div className="flex items-center space-x-3 border-b border-white/10 pb-4">
              <Sliders className="w-6 h-6 text-brand-red" />
              <div>
                <h2 className="text-2xl font-black font-display text-white">CRÉER UN SALON</h2>
                <p className="text-xs text-gray-400">Paramétrez votre partie de {selectedGame.title}</p>
              </div>
            </div>

            {/* Options */}
            <div className="space-y-4">
              <div>
                <label className="text-xs font-black text-gray-300 uppercase tracking-wider block mb-2">Nombre Maximum de Joueurs</label>
                <div className="grid grid-cols-4 gap-2">
                  {[2, 3, 4, selectedGame.maxPlayers > 4 ? selectedGame.maxPlayers : 4].map((num, i) => (
                    <button
                      key={i}
                      data-tv-focus
                      tabIndex={0}
                      onClick={() => setMaxPlayers(num)}
                      className={`py-2.5 rounded-xl font-black text-sm border transition-all outline-none ${
                        maxPlayers === num
                          ? 'bg-brand-red border-brand-red text-white shadow-glow-red'
                          : 'bg-surface-light border-white/10 text-gray-300 hover:border-white/30 focus:ring-2 focus:ring-brand-red'
                      }`}
                    >
                      {num} Joueurs
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-black text-gray-300 uppercase tracking-wider block mb-2">Chronomètre par Tour</label>
                <div className="grid grid-cols-3 gap-2">
                  {[15, 30, 45].map((sec) => (
                    <button
                      key={sec}
                      data-tv-focus
                      tabIndex={0}
                      onClick={() => setTurnDuration(sec)}
                      className={`py-2.5 rounded-xl font-bold text-xs border transition-all outline-none ${
                        turnDuration === sec
                          ? 'bg-brand-gold text-background border-brand-gold font-black'
                          : 'bg-surface-light border-white/10 text-gray-300 hover:border-white/30 focus:ring-2 focus:ring-brand-gold'
                      }`}
                    >
                      {sec} secondes
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-black text-gray-300 uppercase tracking-wider block mb-2">Mode de Partie</label>
                <div className="grid grid-cols-2 gap-2">
                  {['standard', 'rapide'].map((mode) => (
                    <button
                      key={mode}
                      data-tv-focus
                      tabIndex={0}
                      onClick={() => setGameMode(mode)}
                      className={`py-2.5 rounded-xl font-bold text-xs capitalize border transition-all outline-none ${
                        gameMode === mode
                          ? 'bg-brand-purple text-white border-brand-purple shadow-glow-purple'
                          : 'bg-surface-light border-white/10 text-gray-300 hover:border-white/30 focus:ring-2 focus:ring-brand-purple'
                      }`}
                    >
                      Mode {mode}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              <button
                data-tv-focus
                tabIndex={0}
                onClick={() => {
                  audio.playBack();
                  setShowCreateModal(false);
                }}
                className="px-5 py-3 rounded-xl bg-surface-light text-gray-300 hover:text-white font-bold text-sm outline-none focus:ring-2 focus:ring-white"
              >
                Annuler
              </button>

              <button
                data-tv-focus
                tabIndex={0}
                onClick={handleCreateRoom}
                className="flex items-center space-x-2 px-8 py-3.5 rounded-2xl bg-brand-red hover:bg-red-600 text-white font-black text-base shadow-glow-red hover:scale-105 focus:scale-105 focus:bg-white focus:text-brand-red focus:ring-4 focus:ring-brand-red transition-all outline-none"
              >
                <Play className="w-5 h-5 fill-current" />
                <span>GÉNÉRER LE SALON</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
