import React, { useState, useEffect, useRef } from 'react';
import { useGame } from '../../context/GameContext';
import { ARENA_GAMES_CATALOG, ARENA_CATEGORIES } from '../../data/arenaCatalog';
import { ArenaGameItem, ArenaCategory, ArenaPlayMode } from '../../types/arena';
import { arenaLeagueService, MOCK_LEADERBOARD } from '../../services/arenaLeagueService';
import { tvNav } from '../../services/tvNavigation';
import { audio } from '../../services/audio';
import {
  Brain,
  Trophy,
  Users,
  Clock,
  Sparkles,
  ArrowLeft,
  Play,
  BookOpen,
  Shield,
  Layers,
  Award,
  Swords,
  ChevronRight,
  Flame,
  CheckCircle2,
  Lock,
} from 'lucide-react';

export const TVArenaView: React.FC = () => {
  const { setTvView, createRoom, selectGame, room, startGame, sendGameAction } = useGame();
  const [activeTab, setActiveTab] = useState<'games' | 'league' | 'tournament' | 'profile'>('games');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedGame, setSelectedGame] = useState<ArenaGameItem>(ARENA_GAMES_CATALOG[0]);
  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false);
  const [bracket] = useState(() => arenaLeagueService.generateTournamentBracket());
  const [profile, setProfile] = useState(() => arenaLeagueService.getProfile());
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    tvNav.setInitialFocus('button', containerRef.current);
  }, [activeTab, selectedCategory]);

  const handleFocus = (game: ArenaGameItem, e?: React.FocusEvent<HTMLElement>) => {
    audio.playFocus();
    setSelectedGame(game);
    e?.currentTarget?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  };

  const handleLaunchGame = async (game: ArenaGameItem, mode: ArenaPlayMode = 'party') => {
    audio.playSelect();
    if (room?.code) {
      selectGame('arena');
      sendGameAction('switch_arena_game', { arenaGameId: game.id });
      startGame();
      setTvView('gameplay');
    } else {
      const res = await createRoom('arena', {
        arenaGameId: game.id,
        gameMode: mode,
        maxPlayers: game.maxPlayers,
      });
      if (res.success) {
        startGame();
        setTvView('gameplay');
      }
    }
  };

  const filteredGames = selectedCategory === 'all'
    ? ARENA_GAMES_CATALOG
    : ARENA_GAMES_CATALOG.filter(g => g.category === selectedCategory);

  const playableGames = ARENA_GAMES_CATALOG.filter(g => g.isPlayable);

  return (
    <div ref={containerRef} className="relative min-h-screen bg-[#07090E] text-white selection:bg-[#D4AF37]/30 pb-20 select-none overflow-x-hidden font-sans">
      {/* Halo d'ambiance The Devil's Plan */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-15%] left-[20%] w-[800px] h-[500px] rounded-full bg-gradient-to-b from-[#D4AF37]/10 via-[#DC2626]/5 to-transparent blur-[140px]" />
        <div className="absolute bottom-[-10%] right-[10%] w-[600px] h-[600px] rounded-full bg-blue-900/10 blur-[150px]" />
      </div>

      {/* Barre de navigation supérieure MOOD ARENA */}
      <header className="sticky top-0 z-40 flex items-center justify-between px-8 py-5 bg-[#07090E]/90 backdrop-blur-xl border-b border-white/10">
        <div className="flex items-center gap-6">
          <button
            data-tv-focus
            tabIndex={0}
            onClick={() => {
              audio.playSelect();
              setTvView('home');
            }}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white transition-all outline-none focus:ring-2 focus:ring-[#D4AF37]"
            title="Retour au salon principal MOOD"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Retour Salon</span>
          </button>

          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#B38728] shadow-[0_0_20px_rgba(212,175,55,0.35)]">
              <Shield className="w-5 h-5 text-black" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-black text-2xl tracking-tight text-white">MOOD ARENA</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#D4AF37]">
                  THE DEVIL'S ARENA
                </span>
              </div>
              <p className="text-[11px] font-semibold text-white/40 tracking-wider">
                STRATÉGIE • MÉMOIRE • INTELLIGENCE PURE
              </p>
            </div>
          </div>
        </div>

        {/* Onglets de navigation */}
        <nav className="flex items-center gap-2 bg-white/5 p-1 rounded-2xl border border-white/10">
          <button
            data-tv-focus
            tabIndex={0}
            onClick={() => {
              audio.playSelect();
              setActiveTab('games');
            }}
            className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all outline-none ${
              activeTab === 'games'
                ? 'bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-black shadow-lg shadow-[#D4AF37]/20'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            Épreuves (33)
          </button>
          <button
            data-tv-focus
            tabIndex={0}
            onClick={() => {
              audio.playSelect();
              setActiveTab('league');
            }}
            className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all outline-none ${
              activeTab === 'league'
                ? 'bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-black shadow-lg shadow-[#D4AF37]/20'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            MOOD League
          </button>
          <button
            data-tv-focus
            tabIndex={0}
            onClick={() => {
              audio.playSelect();
              setActiveTab('tournament');
            }}
            className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all outline-none ${
              activeTab === 'tournament'
                ? 'bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-black shadow-lg shadow-[#D4AF37]/20'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            Tournois
          </button>
          <button
            data-tv-focus
            tabIndex={0}
            onClick={() => {
              audio.playSelect();
              setActiveTab('profile');
            }}
            className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all outline-none ${
              activeTab === 'profile'
                ? 'bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-black shadow-lg shadow-[#D4AF37]/20'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            Mon Profil
          </button>
        </nav>

        {/* Indicateur de Pièces du Démon du joueur */}
        <div className="flex items-center gap-3 bg-[#131722] border border-[#D4AF37]/30 px-4 py-2 rounded-2xl shadow-[0_0_15px_rgba(212,175,55,0.15)]">
          <div className="w-6 h-6 rounded-full bg-[#D4AF37] flex items-center justify-center font-black text-black text-xs shadow-inner">
            D
          </div>
          <div>
            <span className="block text-[10px] font-bold uppercase tracking-widest text-[#D4AF37]">
              Pièces du Démon
            </span>
            <span className="font-mono text-sm font-black text-white">
              {profile.devilsPieces} 🪙
            </span>
          </div>
        </div>
      </header>

      {/* CONTENU SELON L'ONGLET ACTIF */}
      <main className="px-8 mt-6 max-w-[1800px] mx-auto">
        {activeTab === 'games' && (
          <div>
            {/* HERO BANNER DE L'ARÈNE (Style Apple TV / Netflix) */}
            <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-r from-[#0C1017] via-[#131924] to-[#0A0D14] p-8 md:p-12 mb-10 shadow-2xl">
              <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-radial from-[#D4AF37]/15 to-transparent pointer-events-none" />

              <div className="relative z-10 max-w-3xl">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/30 text-[#D4AF37] text-xs font-black uppercase tracking-widest mb-4">
                  <Flame className="w-3.5 h-3.5 fill-current" />
                  Épreuve Phare en Vedette
                </div>

                <h1 className="text-4xl md:text-6xl font-black font-display tracking-tight text-white mb-4 leading-none">
                  {selectedGame.title}
                </h1>

                <p className="text-lg md:text-xl font-medium text-white/70 mb-3 leading-snug">
                  {selectedGame.tagline}
                </p>

                <p className="text-sm text-white/50 mb-6 max-w-2xl line-clamp-2">
                  {selectedGame.description}
                </p>

                {/* Métadonnées du jeu */}
                <div className="flex flex-wrap items-center gap-6 mb-8 text-xs font-semibold text-white/60">
                  <span className="inline-flex items-center gap-2">
                    <Users className="w-4 h-4 text-[#D4AF37]" />
                    {selectedGame.minPlayers === selectedGame.maxPlayers
                      ? `${selectedGame.minPlayers} Joueurs`
                      : `${selectedGame.minPlayers} à ${selectedGame.maxPlayers} Joueurs`}
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#D4AF37]" />
                    {selectedGame.durationMinutes}
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <Award className="w-4 h-4 text-[#D4AF37]" />
                    Difficulté : <strong className="text-white">{selectedGame.difficulty}</strong>
                  </span>
                  {selectedGame.isPlayable && (
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold uppercase text-[10px] tracking-wider">
                      ✓ Prêt à Jouer
                    </span>
                  )}
                </div>

                {/* Boutons d'action */}
                <div className="flex items-center gap-4">
                  <button
                    data-tv-focus
                    tabIndex={0}
                    onClick={() => {
                      if (selectedGame.isPlayable) {
                        handleLaunchGame(selectedGame, 'party');
                      } else {
                        setIsDetailOpen(true);
                      }
                    }}
                    className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-[#D4AF37] to-[#B38728] text-black font-black uppercase text-sm tracking-wider shadow-lg shadow-[#D4AF37]/25 hover:brightness-110 active:scale-95 transition-all outline-none focus:ring-4 focus:ring-[#D4AF37]/50"
                  >
                    <Play className="w-5 h-5 fill-current" />
                    {selectedGame.isPlayable ? 'Lancer l’Épreuve' : 'Consulter les Règles'}
                  </button>

                  <button
                    data-tv-focus
                    tabIndex={0}
                    onClick={() => {
                      audio.playSelect();
                      setIsDetailOpen(true);
                    }}
                    className="inline-flex items-center gap-2.5 px-6 py-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/15 text-white font-bold text-sm tracking-wider transition-all outline-none focus:ring-2 focus:ring-white"
                  >
                    <BookOpen className="w-4 h-4 text-white/70" />
                    Règles & Stratégie
                  </button>
                </div>
              </div>
            </section>

            {/* BARRE DES CATÉGORIES ARENA */}
            <div className="flex items-center gap-2.5 overflow-x-auto pb-4 mb-8 scrollbar-none">
              {ARENA_CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  data-tv-focus
                  tabIndex={0}
                  onClick={() => {
                    audio.playFocus();
                    setSelectedCategory(cat.id);
                  }}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all outline-none ${
                    selectedCategory === cat.id
                      ? 'bg-white text-black font-black shadow-md'
                      : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10 border border-white/5'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  {cat.label}
                </button>
              ))}
            </div>

            {/* ÉTAGÈRE 1 : LES 8 JEUX JOUABLES (PHASE 2) */}
            <section className="mb-12">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-6 rounded-full bg-[#D4AF37]" />
                  <h2 className="text-xl font-black font-display uppercase tracking-wide text-white">
                    Épreuves Jouables Immédiatement (Phase 2)
                  </h2>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-wider">
                    8 Jeux Prêts
                  </span>
                </div>
                <span className="text-xs text-white/40 font-semibold">
                  Solo IA • Multijoueur TV & Téléphones
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {playableGames.map(game => (
                  <div
                    key={game.id}
                    data-tv-focus
                    tabIndex={0}
                    onFocus={(e) => handleFocus(game, e)}
                    onClick={() => {
                      audio.playSelect();
                      setSelectedGame(game);
                      handleLaunchGame(game, 'party');
                    }}
                    className={`group relative rounded-2xl p-5 border transition-all duration-300 cursor-pointer outline-none flex flex-col justify-between h-[230px] ${
                      selectedGame.id === game.id
                        ? 'bg-[#151B27] border-[#D4AF37] shadow-[0_0_25px_rgba(212,175,55,0.3)] scale-[1.02]'
                        : 'bg-[#0E131C] border-white/10 hover:border-white/30 hover:bg-[#131924]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30">
                          {game.badge || 'PHASE 2'}
                        </span>
                        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="Serveur Prêt" />
                      </div>

                      <h3 className="font-display font-black text-lg text-white group-hover:text-[#D4AF37] transition-colors leading-tight mb-1">
                        {game.title}
                      </h3>
                      <p className="text-xs text-white/60 line-clamp-2 leading-relaxed">
                        {game.tagline}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px] font-semibold text-white/50">
                      <span className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-[#D4AF37]" />
                        {game.minPlayers}-{game.maxPlayers}j
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-[#D4AF37]" />
                        {game.durationMinutes}
                      </span>
                      <span className="flex items-center gap-1 font-bold text-white group-hover:text-[#D4AF37] transition-colors">
                        Jouer <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* ÉTAGÈRE 2 : CATALOGUE COMPLET DES 33 ÉPREUVES */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-2.5 h-6 rounded-full bg-white/40" />
                <h2 className="text-xl font-black font-display uppercase tracking-wide text-white">
                  Catalogue Complet des 33 Épreuves de l'Arène
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {filteredGames.map(game => (
                  <div
                    key={game.id}
                    data-tv-focus
                    tabIndex={0}
                    onFocus={(e) => handleFocus(game, e)}
                    onClick={() => {
                      audio.playSelect();
                      setSelectedGame(game);
                      if (game.isPlayable) {
                        handleLaunchGame(game, 'party');
                      } else {
                        setIsDetailOpen(true);
                      }
                    }}
                    className={`relative rounded-xl p-4 border transition-all duration-200 cursor-pointer outline-none flex flex-col justify-between h-[180px] ${
                      selectedGame.id === game.id
                        ? 'bg-[#151B27] border-[#D4AF37] shadow-[0_0_20px_rgba(212,175,55,0.25)]'
                        : 'bg-[#0B0F17] border-white/5 hover:border-white/20 hover:bg-[#101520]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[9px] font-black uppercase tracking-wider text-white/40">
                          {game.category}
                        </span>
                        {game.isPlayable ? (
                          <span className="text-[9px] font-bold text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded">
                            JOUABLE
                          </span>
                        ) : (
                          <Lock className="w-3 h-3 text-white/30" />
                        )}
                      </div>
                      <h4 className="font-display font-black text-sm text-white leading-snug line-clamp-2">
                        {game.title}
                      </h4>
                    </div>

                    <div className="text-[10px] text-white/40 flex items-center justify-between pt-2 border-t border-white/5">
                      <span>{game.difficulty}</span>
                      <span>{game.durationMinutes}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* ONGLET : CLASSEMENT MOOD LEAGUE */}
        {activeTab === 'league' && (
          <section className="max-w-4xl mx-auto bg-[#0E131C] border border-white/10 rounded-3xl p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
              <div>
                <h2 className="text-2xl font-black font-display uppercase tracking-wide text-white">
                  Classement Officiel • MOOD LEAGUE
                </h2>
                <p className="text-xs text-white/50">
                  Saison 1 : Épreuves du Démon • Réinitialisation chaque semaine
                </p>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/30 text-[#D4AF37] text-xs font-bold">
                <Trophy className="w-4 h-4" />
                Tableau des Maîtres
              </div>
            </div>

            <div className="space-y-3">
              {MOCK_LEADERBOARD.map(entry => (
                <div
                  key={entry.rank}
                  className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                    entry.rank === 1
                      ? 'bg-gradient-to-r from-[#D4AF37]/20 to-transparent border-[#D4AF37]/50 shadow-lg'
                      : 'bg-white/5 border-white/5'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm ${
                      entry.rank === 1 ? 'bg-[#D4AF37] text-black' : 'bg-white/10 text-white'
                    }`}>
                      #{entry.rank}
                    </span>
                    <span className="text-2xl">{entry.avatar}</span>
                    <div>
                      <h4 className="font-bold text-white text-sm">{entry.name}</h4>
                      <span className="text-[11px] text-[#D4AF37] font-semibold">{entry.title}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-8 text-right">
                    <div>
                      <span className="block text-[10px] text-white/40 uppercase font-bold">Victoires</span>
                      <span className="font-mono text-sm font-bold text-white">{entry.winRate}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-white/40 uppercase font-bold">Pièces</span>
                      <span className="font-mono text-base font-black text-[#D4AF37]">{entry.pieces} 🪙</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ONGLET : ARBRE DE TOURNOI */}
        {activeTab === 'tournament' && (
          <section className="max-w-5xl mx-auto bg-[#0E131C] border border-white/10 rounded-3xl p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
              <div>
                <h2 className="text-2xl font-black font-display uppercase tracking-wide text-white">
                  Tournoi à Élimination Directe • Demi-Finales & Finale
                </h2>
                <p className="text-xs text-white/50">
                  Épreuve active : Memory Poker & Jeu du Moulin
                </p>
              </div>
              <button
                data-tv-focus
                tabIndex={0}
                onClick={() => handleLaunchGame(ARENA_GAMES_CATALOG[0], 'tournament')}
                className="px-6 py-3 rounded-xl bg-[#D4AF37] text-black font-black uppercase text-xs tracking-wider shadow-lg shadow-[#D4AF37]/20 hover:brightness-110 transition-all outline-none"
              >
                Lancer le Tournoi
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
              {bracket.map((match, idx) => (
                <div key={match.id} className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4">
                  <div className="flex items-center justify-between text-xs font-black uppercase tracking-widest text-[#D4AF37]">
                    <span>{match.round === 'semi' ? `Demi-Finale #${idx + 1}` : '🏆 GRANDE FINALE'}</span>
                    <span className="px-2 py-0.5 rounded bg-white/10 text-white/70">{match.status}</span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-[#131722] border border-white/10">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{match.player1?.avatar || '👤'}</span>
                        <span className="font-bold text-sm text-white">{match.player1?.name || 'En attente...'}</span>
                      </div>
                      <span className="font-mono font-bold text-xs text-[#D4AF37]">Score : 0</span>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl bg-[#131722] border border-white/10">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{match.player2?.avatar || '👤'}</span>
                        <span className="font-bold text-sm text-white">{match.player2?.name || 'En attente...'}</span>
                      </div>
                      <span className="font-mono font-bold text-xs text-[#D4AF37]">Score : 0</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ONGLET : MON PROFIL D'ARÈNE */}
        {activeTab === 'profile' && (
          <section className="max-w-3xl mx-auto bg-[#0E131C] border border-white/10 rounded-3xl p-8 shadow-2xl">
            <div className="flex items-center gap-6 mb-8 pb-6 border-b border-white/10">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#D4AF37] to-[#8C6D23] flex items-center justify-center text-4xl shadow-xl">
                👑
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="text-2xl font-black font-display text-white">Joueur Hôte</h2>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#D4AF37] text-xs font-black">
                    Niveau {profile.level}
                  </span>
                </div>
                <p className="text-sm font-semibold text-[#D4AF37] mb-2">{profile.title}</p>
                <div className="w-64 h-2 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#D4AF37] to-amber-300"
                    style={{ width: `${Math.min(100, (profile.xp % 200) / 2)}%` }}
                  />
                </div>
                <span className="text-[10px] text-white/40 mt-1 block">
                  XP : {profile.xp} / {profile.level * 200}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="p-4 rounded-xl bg-white/5 border border-white/5 text-center">
                <span className="block text-2xl font-black text-white">{profile.totalMatches}</span>
                <span className="text-[11px] text-white/50 uppercase font-bold">Parties</span>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/5 text-center">
                <span className="block text-2xl font-black text-emerald-400">{profile.victories}</span>
                <span className="text-[11px] text-white/50 uppercase font-bold">Victoires</span>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/5 text-center">
                <span className="block text-2xl font-black text-[#D4AF37]">{profile.devilsPieces} 🪙</span>
                <span className="text-[11px] text-white/50 uppercase font-bold">Pièces Démon</span>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-black uppercase tracking-wider text-white mb-3">
                Badges & Succès Débloqués
              </h3>
              <div className="flex flex-wrap gap-2">
                {profile.badges.map(b => (
                  <span key={b} className="px-3 py-1.5 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] text-xs font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {b}
                  </span>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      {/* MODAL DES RÈGLES & DÉTAILS D'UN JEU */}
      {isDetailOpen && selectedGame && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-3xl rounded-3xl bg-[#0D121B] border border-white/20 p-8 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-[#D4AF37]">
                  {selectedGame.category.toUpperCase()} • {selectedGame.difficulty}
                </span>
                <h2 className="text-3xl font-black font-display text-white mt-1">
                  {selectedGame.title}
                </h2>
              </div>
              <button
                data-tv-focus
                tabIndex={0}
                onClick={() => setIsDetailOpen(false)}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase transition-all outline-none"
              >
                Fermer
              </button>
            </div>

            <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2 scrollbar-none">
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-[#D4AF37] mb-2 flex items-center gap-2">
                  <BookOpen className="w-4 h-4" /> Règles Officielles de l'Arène
                </h4>
                <ol className="space-y-2 text-sm text-white/80 list-decimal list-inside leading-relaxed bg-white/5 p-4 rounded-2xl border border-white/5">
                  {selectedGame.rules.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ol>
              </div>

              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-[#D4AF37] mb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" /> Mécaniques Clés
                </h4>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-white/70">
                  {selectedGame.features.map((f, i) => (
                    <li key={i} className="flex items-center gap-2 p-2.5 rounded-xl bg-white/5 border border-white/5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#D4AF37] flex-shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-white/10 flex items-center justify-between">
              <span className="text-xs text-white/50 font-semibold">
                Modes : {selectedGame.supportedModes.join(' • ')}
              </span>
              <button
                data-tv-focus
                tabIndex={0}
                onClick={() => {
                  setIsDetailOpen(false);
                  if (selectedGame.isPlayable) {
                    handleLaunchGame(selectedGame, 'party');
                  }
                }}
                className={`px-8 py-3.5 rounded-xl font-black uppercase text-xs tracking-wider transition-all outline-none ${
                  selectedGame.isPlayable
                    ? 'bg-[#D4AF37] text-black hover:brightness-110 shadow-lg shadow-[#D4AF37]/20'
                    : 'bg-white/10 text-white/40 cursor-not-allowed'
                }`}
              >
                {selectedGame.isPlayable ? 'Lancer cette Épreuve' : 'Bientôt Disponible'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
