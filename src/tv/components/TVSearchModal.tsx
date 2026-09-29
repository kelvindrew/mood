import React, { useState, useEffect, useRef } from 'react';
import { GameCatalogItem } from '../../types/game';
import {
  Search,
  X,
  Play,
  Users,
  Clock,
  Sparkles,
  Shield,
  Lock,
  Eye,
  EyeOff,
  AlertTriangle,
  ArrowLeft,
  KeyRound,
  Check,
} from 'lucide-react';
import { audio } from '../../services/audio';
import { useGame } from '../../context/GameContext';
import { adminCms } from '../../services/adminCmsService';

interface TVSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  games: GameCatalogItem[];
  onSelectGame: (game: GameCatalogItem) => void;
  onPlayGame: (game: GameCatalogItem) => void;
}

export const TVSearchModal: React.FC<TVSearchModalProps> = ({
  isOpen,
  onClose,
  games,
  onSelectGame,
  onPlayGame,
}) => {
  const { setTvView } = useGame();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);

  // Admin secret password state
  const [isPasswordMode, setIsPasswordMode] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setIsPasswordMode(false);
      setAdminPassword('');
      setPasswordError('');
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery('');
      setIsPasswordMode(false);
      setAdminPassword('');
      setPasswordError('');
    }
  }, [isOpen]);

  useEffect(() => {
    if (isPasswordMode) {
      setTimeout(() => passwordInputRef.current?.focus(), 100);
    }
  }, [isPasswordMode]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        audio.playBack();
        if (isPasswordMode) {
          setIsPasswordMode(false);
          setAdminPassword('');
          setPasswordError('');
          setTimeout(() => inputRef.current?.focus(), 50);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isPasswordMode, onClose]);

  if (!isOpen) return null;

  const isAdminQuery = query.trim().toLowerCase() === 'admin';

  const handlePasswordSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!adminPassword.trim()) {
      setPasswordError('Veuillez entrer un mot de passe.');
      audio.playBack();
      return;
    }

    if (adminCms.login(adminPassword.trim())) {
      audio.playSelect();
      onClose();
      setTvView('admin');
    } else {
      setPasswordError('Mot de passe incorrect (défaut : admin)');
      audio.playBack();
    }
  };

  const handleDigitClick = (digit: string) => {
    setAdminPassword((prev) => prev + digit);
    setPasswordError('');
    audio.playSelect();
  };

  const handleBackspace = () => {
    setAdminPassword((prev) => prev.slice(0, -1));
    setPasswordError('');
    audio.playBack();
  };

  const filtered = query.trim() === ''
    ? games
    : games.filter(
        (g) =>
          g.title.toLowerCase().includes(query.toLowerCase()) ||
          g.tagline.toLowerCase().includes(query.toLowerCase()) ||
          g.category.toLowerCase().includes(query.toLowerCase())
      );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/85 backdrop-blur-xl animate-fade-in select-none">
      <div className="w-full max-w-4xl bg-[#090C14] border border-white/15 rounded-3xl p-6 shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        {isPasswordMode ? (
          /* ======================================================== */
          /* ADMIN PASSWORD PROMPT VIEW                               */
          /* ======================================================== */
          <div className="flex flex-col h-full animate-scale-in">
            {/* Top Bar for Password Mode */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <button
                type="button"
                onClick={() => {
                  audio.playBack();
                  setIsPasswordMode(false);
                  setAdminPassword('');
                  setPasswordError('');
                  setTimeout(() => inputRef.current?.focus(), 50);
                }}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-gray-300 hover:text-white transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Retour à la recherche</span>
              </button>

              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-purple-400" />
                <span className="font-display font-black text-sm tracking-wider text-white uppercase">
                  Espace Administrateur MOOD
                </span>
              </div>

              <button
                type="button"
                onClick={() => {
                  audio.playBack();
                  onClose();
                }}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-gray-400 hover:text-white uppercase"
              >
                Fermer (Échap)
              </button>
            </div>

            {/* Password Entry Body */}
            <div className="flex-1 flex flex-col items-center justify-center py-6 px-4 max-w-md mx-auto w-full text-center space-y-5">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center shadow-[0_0_30px_rgba(147,51,234,0.4)] border border-white/20">
                <Lock className="w-8 h-8 text-white" />
              </div>

              <div>
                <h3 className="text-xl font-black font-display text-white uppercase tracking-tight">
                  Mot de Passe Administrateur
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  Accédez à la gestion complète des jeux, des images de couvertures et des réglages en direct.
                </p>
              </div>

              <form onSubmit={handlePasswordSubmit} className="w-full space-y-4">
                <div className="relative">
                  <input
                    ref={passwordInputRef}
                    type={showPassword ? 'text' : 'password'}
                    value={adminPassword}
                    onChange={(e) => {
                      setAdminPassword(e.target.value);
                      setPasswordError('');
                    }}
                    placeholder="Mot de passe (défaut : admin)"
                    className="w-full px-4 py-3 pr-12 rounded-2xl bg-[#05070D] border-2 border-white/20 text-white font-mono text-center text-lg tracking-widest focus:border-purple-500 focus:ring-4 focus:ring-purple-500/30 outline-none transition-all"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white p-1"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                {passwordError && (
                  <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500 text-rose-300 text-xs font-bold flex items-center justify-center space-x-2 animate-shake">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                    <span>{passwordError}</span>
                  </div>
                )}

                {/* On-Screen Remote Keypad */}
                <div className="pt-1">
                  <div className="text-[10px] uppercase font-bold text-gray-500 tracking-wider mb-2">
                    Clavier rapide télécommande
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                      <button
                        key={digit}
                        type="button"
                        onClick={() => handleDigitClick(digit)}
                        className="py-2.5 rounded-xl bg-white/5 hover:bg-white/15 text-white font-mono font-bold text-sm border border-white/10 active:scale-95 transition-all"
                      >
                        {digit}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={handleBackspace}
                      className="py-2.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 font-bold text-xs border border-rose-500/30 active:scale-95 transition-all"
                    >
                      Effacer
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDigitClick('0')}
                      className="py-2.5 rounded-xl bg-white/5 hover:bg-white/15 text-white font-mono font-bold text-sm border border-white/10 active:scale-95 transition-all"
                    >
                      0
                    </button>
                    <button
                      type="submit"
                      className="py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs border border-emerald-400/40 active:scale-95 transition-all flex items-center justify-center space-x-1"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>OK</span>
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-display font-black text-sm uppercase tracking-wider shadow-[0_0_25px_rgba(147,51,234,0.5)] hover:scale-102 active:scale-98 transition-all flex items-center justify-center space-x-2"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>Déverrouiller le Back-Office</span>
                </button>
              </form>
            </div>
          </div>
        ) : (
          /* ======================================================== */
          /* STANDARD SEARCH VIEW + SECRET ADMIN TRIGGER               */
          /* ======================================================== */
          <>
            {/* Top Search Input Bar */}
            <div className="flex items-center space-x-3 pb-4 border-b border-white/10">
              <div className="p-2.5 rounded-2xl bg-white/10 text-white">
                <Search className="w-6 h-6 text-purple-400" />
              </div>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    if (isAdminQuery) {
                      e.preventDefault();
                      audio.playSelect();
                      setIsPasswordMode(true);
                    }
                  }
                }}
                placeholder="Rechercher un jeu de salon (ex: Espion, Petit Bac, Ludo, Poker...)"
                className="flex-1 bg-transparent border-none text-white text-lg md:text-xl font-bold placeholder-gray-500 focus:outline-none"
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
              <button
                onClick={() => {
                  audio.playBack();
                  onClose();
                }}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-gray-300 hover:text-white uppercase tracking-wider"
              >
                Fermer (Échap)
              </button>
            </div>

            {/* Secret Admin Banner (Shown when user types "admin") */}
            {isAdminQuery && (
              <div
                onClick={() => {
                  audio.playSelect();
                  setIsPasswordMode(true);
                }}
                className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-purple-950/80 via-indigo-950/80 to-purple-900/90 border-2 border-purple-500/80 shadow-[0_0_30px_rgba(168,85,247,0.4)] cursor-pointer hover:scale-[1.01] transition-all flex items-center justify-between animate-scale-in"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-600/40 border border-purple-400 flex items-center justify-center flex-shrink-0">
                    <Shield className="w-6 h-6 text-purple-300" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-purple-300 bg-purple-500/30 px-2 py-0.5 rounded-full border border-purple-400/40">
                        Mode Administrateur Détecté
                      </span>
                    </div>
                    <h3 className="text-base font-black text-white mt-1">
                      Accéder au Panneau d'Administration MOOD
                    </h3>
                    <p className="text-xs text-gray-300">
                      Appuyez sur Entrée ou cliquez ici pour saisir le mot de passe et modifier les jeux et images.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black text-xs uppercase tracking-wider shadow-lg flex items-center space-x-2 hover:scale-105 transition-transform"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>Saisir le mot de passe</span>
                </button>
              </div>
            )}

            {/* Results Grid */}
            <div className="flex-1 overflow-y-auto pt-4 pr-1 scrollbar-none">
              <div className="flex items-center justify-between pb-3">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                  {filtered.length} {filtered.length > 1 ? 'Jeux trouvés' : 'Jeu trouvé'}
                </span>
                <span className="text-[11px] text-purple-400 font-mono font-bold">
                  Flèches ou Clic pour sélectionner
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {filtered.map((game) => (
                  <div
                    key={game.id}
                    data-tv-focus
                    tabIndex={0}
                    onClick={() => {
                      audio.playSelect();
                      onSelectGame(game);
                      onClose();
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        audio.playSelect();
                        onSelectGame(game);
                        onClose();
                      }
                    }}
                    className="group relative aspect-[2/3] rounded-2xl overflow-hidden cursor-pointer border border-white/10 bg-[#0E1322] shadow-lg transition-all duration-300 outline-none
                               focus:scale-105 focus:ring-4 focus:ring-purple-500 focus:border-purple-400 hover:scale-105 hover:border-purple-500"
                  >
                    <img
                      src={game.coverImage || game.heroImage}
                      alt={game.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90 group-hover:opacity-75 transition-opacity" />

                    <div className="absolute inset-0 p-3 flex flex-col justify-between">
                      <div className="flex justify-end">
                        <span className="px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-mono font-bold text-emerald-400 border border-white/10">
                          98% Match
                        </span>
                      </div>

                      <div>
                        <h4 className="text-xs md:text-sm font-black font-display text-white uppercase tracking-tight leading-tight line-clamp-2">
                          {game.title}
                        </h4>
                        <p className="text-[10px] text-gray-300 line-clamp-1 mt-0.5">
                          {game.tagline}
                        </p>
                        <div className="mt-2 flex items-center justify-between pt-1 border-t border-white/15">
                          <span className="text-[10px] text-gray-400 font-mono">
                            {game.minPlayers}-{game.maxPlayers}j
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              audio.playSelect();
                              onPlayGame(game);
                              onClose();
                            }}
                            className="px-2.5 py-1 rounded-full bg-purple-600 hover:bg-purple-500 text-white font-bold text-[10px] uppercase flex items-center space-x-1"
                          >
                            <Play className="w-2.5 h-2.5 fill-current" />
                            <span>Jouer</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

