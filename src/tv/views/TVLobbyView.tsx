import React, { useEffect, useState } from 'react';
import { useGame } from '../../context/GameContext';
import { QRCodeSVG } from 'qrcode.react';
import { Users, Play, ArrowLeft, Smartphone, CheckCircle2, Bot, Trash2, Shield, Radio } from 'lucide-react';
import { audio } from '../../services/audio';
import { tvNav } from '../../services/tvNavigation';

export const TVLobbyView: React.FC = () => {
  const { room, selectedGame, startGame, setTvView, serverLanIp, addBot, removeBot } = useGame();
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isStarting, setIsStarting] = useState(false);

  useEffect(() => {
    tvNav.setInitialFocus('button');
  }, []);

  if (!room) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0F1D] select-none">
        <div className="text-center space-y-4">
          <p className="text-slate-300 font-bold text-lg">Aucun salon actif</p>
          <button
            onClick={() => setTvView('home')}
            className="px-8 py-3.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-black text-base shadow-[0_4px_20px_rgba(6,182,212,0.35)] outline-none focus:ring-4 focus:ring-white"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  const isLocalHost = typeof window !== 'undefined' && (
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1'
  );

  let mobileJoinUrl = '';
  if (typeof window !== 'undefined') {
    if (isLocalHost) {
      const lanIp = (room.serverLanIp && room.serverLanIp !== 'localhost') ? room.serverLanIp : serverLanIp;
      const port = window.location.port ? `:${window.location.port}` : '';
      mobileJoinUrl = `${window.location.protocol}//${lanIp !== 'localhost' ? lanIp : window.location.hostname}${port}/?room=${room.code}`;
    } else {
      mobileJoinUrl = `${window.location.origin}/?room=${room.code}`;
    }
  }

  const handleStartGame = async () => {
    if (isStarting) return;
    setIsStarting(true);
    audio.playSelect();
    setCountdown(1);
    setTimeout(() => {
      setCountdown(null);
      startGame();
    }, 500);
  };

  const maxAllowed = Math.min(room.settings.maxPlayers || selectedGame.maxPlayers, selectedGame.maxPlayers);
  const minRequired = selectedGame.minPlayers || 1;
  const totalSlots = maxAllowed;
  const filledPlayers = room.players || [];
  const emptySlotsCount = Math.max(0, totalSlots - filledPlayers.length);
  const isFull = filledPlayers.length >= totalSlots;
  const needsMorePlayers = filledPlayers.length < minRequired;
  const botCount = filledPlayers.filter(p => p.isBot).length;

  return (
    <div className="relative min-h-screen pt-16 px-[5vw] pb-12 select-none flex flex-col justify-between bg-[#0A0F1D] text-white">
      {/* Background Dynamic Ambient Backdrop (Optimized for TV 60fps) */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <img
          src={selectedGame.heroImage || selectedGame.coverImage}
          alt={selectedGame.title}
          className="w-full h-full object-cover object-center opacity-25 scale-102"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A0F1D]/85 via-[#0A0F1D]/90 to-[#0A0F1D]" />
      </div>

      {/* Top Header */}
      <div className="relative z-10 flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-4">
          <button
            data-tv-focus
            tabIndex={0}
            onClick={() => {
              audio.playBack();
              setTvView('home');
            }}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60 text-slate-200 hover:text-white focus:bg-cyan-400 focus:text-slate-950 focus:border-cyan-300 transition-all outline-none"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="font-bold text-xs sm:text-sm">Changer de Jeu</span>
          </button>

          <div>
            <div className="flex items-center space-x-2">
              <span className="px-3 py-0.5 rounded-full bg-cyan-950/70 border border-cyan-400/30 text-cyan-300 text-[11px] font-bold uppercase tracking-wider">
                SALON DE JEU ACTIF
              </span>
              <span className="text-slate-400 text-xs font-semibold">
                {selectedGame.title} • Mode {room.settings.gameMode.toUpperCase()}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black font-display text-white tracking-tight mt-0.5">
              Connectez vos smartphones pour jouer
            </h1>
          </div>
        </div>

        {/* Room Code Badge */}
        <div className="flex items-center space-x-4">
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-black text-slate-400 tracking-widest uppercase">CODE DU SALON</span>
            <div className="px-7 py-2 rounded-2xl bg-slate-900/90 border-2 border-amber-400/60 text-amber-400 font-mono font-black text-3xl sm:text-4xl tracking-widest shadow-[0_0_20px_rgba(245,158,11,0.25)]">
              {room.code}
            </div>
          </div>
        </div>
      </div>

      {/* Main 2-Column Grid */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 my-auto py-5">
        {/* Left Column: High-contrast QR Code & PIN instructions */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center p-7 rounded-3xl bg-slate-900/90 border border-slate-700/60 shadow-xl space-y-4">
          <div className="text-center">
            <span className="text-cyan-400 text-xs font-bold tracking-widest uppercase flex items-center justify-center space-x-1.5">
              <Smartphone className="w-4 h-4 text-cyan-400" />
              <span>SCANNEZ AVEC VOTRE APPAREIL PHOTO</span>
            </span>
            <h2 className="text-xl sm:text-2xl font-black font-display text-white mt-1">
              Pas d'application à installer
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-xs leading-relaxed font-medium">
              Visez le QR Code pour transformer immédiatement votre smartphone en manette sans fil.
            </p>
          </div>

          {/* Ultra-sharp High-Contrast QR Code */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-white shadow-2xl border-2 border-cyan-400/40">
            <QRCodeSVG
              value={mobileJoinUrl}
              size={215}
              level="M"
              includeMargin={true}
              fgColor="#0A0F1D"
              bgColor="#FFFFFF"
            />
          </div>

          {/* Join Link & PIN Details */}
          <div className="w-full flex flex-col items-center space-y-2 pt-1">
            <div className="flex items-center space-x-2 text-xs text-slate-300 bg-slate-950/70 px-4 py-2 rounded-xl border border-slate-800/80">
              <span className="text-slate-400 font-medium">Ou rendez-vous sur :</span>
              <span className="font-mono text-cyan-300 font-bold truncate max-w-[260px]">
                {typeof window !== 'undefined' ? window.location.host : 'mood.kalvinec.workers.dev'}
              </span>
            </div>
            <div className="text-xs text-slate-300 flex items-center space-x-2 pt-0.5 font-bold">
              <span className="text-slate-400">Puis entrez le code :</span>
              <span className="text-amber-400 font-mono text-xl font-black px-4 py-1 rounded-xl bg-slate-950/90 border border-amber-400/50 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                {room.code}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Connected Player Slots & Launch Controls */}
        <div className="lg:col-span-7 flex flex-col justify-between p-7 rounded-3xl bg-slate-900/90 border border-slate-700/60 shadow-xl space-y-6">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-cyan-400" />
                <h3 className="text-lg sm:text-xl font-black font-display text-white tracking-wide">
                  JOUEURS CONNECTÉS ({filledPlayers.length}/{totalSlots})
                </h3>
                {isFull && (
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-black uppercase tracking-wider">
                    COMPLET
                  </span>
                )}
              </div>

              {/* Add & Remove Bot Buttons */}
              <div className="flex items-center space-x-2">
                {!isFull ? (
                  <button
                    data-tv-focus
                    tabIndex={0}
                    onClick={() => {
                      audio.playSelect();
                      addBot();
                    }}
                    className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold text-xs border border-slate-600 focus:bg-cyan-400 focus:text-slate-950 focus:border-cyan-300 transition-all outline-none"
                  >
                    <Bot className="w-4 h-4" />
                    <span>+ AJOUTER UN BOT IA</span>
                  </button>
                ) : (
                  <div className="px-3 py-1.5 rounded-xl bg-slate-950/50 border border-slate-800 text-slate-400 text-xs font-semibold">
                    Salon complet ({totalSlots} max)
                  </div>
                )}

                {botCount > 0 && (
                  <button
                    data-tv-focus
                    tabIndex={0}
                    onClick={() => {
                      audio.playBack();
                      removeBot();
                    }}
                    className="flex items-center space-x-1 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:text-white text-xs font-semibold focus:bg-rose-600 focus:text-white transition-all outline-none"
                    title="Retirer le dernier Bot"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Retirer Bot</span>
                  </button>
                )}
              </div>
            </div>

            {/* Players Grid with High-Contrast Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {filledPlayers.map((player) => {
                return (
                  <div
                    key={player.id}
                    className="flex items-center space-x-3.5 p-3.5 rounded-2xl border border-slate-700/80 bg-slate-950/60 shadow-md transition-all animate-scale-in"
                  >
                    {player.isBot ? (
                      <div className="w-11 h-11 rounded-xl bg-indigo-900/50 border border-indigo-500/40 flex items-center justify-center text-indigo-300 shadow flex-shrink-0">
                        <Bot className="w-6 h-6" />
                      </div>
                    ) : player.selfieImage ? (
                      <img
                        src={player.selfieImage}
                        alt={player.name}
                        className="w-11 h-11 rounded-xl object-cover border border-slate-600 shadow flex-shrink-0"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-xl bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center text-cyan-300 font-bold text-base flex-shrink-0">
                        {player.name.charAt(0).toUpperCase()}
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-1.5">
                        <span className="font-bold text-white text-sm sm:text-base truncate">{player.name}</span>
                        {player.isHost && (
                          <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[9px] font-black uppercase">
                            HÔTE
                          </span>
                        )}
                        {player.isBot && (
                          <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 text-[9px] font-black uppercase">
                            BOT IA
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-1 mt-0.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-[11px] font-bold text-emerald-400">
                          {player.isBot ? 'PRÊT AUTOMATIQUE' : 'PRÊT À JOUER'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Empty Slots */}
              {Array.from({ length: emptySlotsCount }).map((_, idx) => (
                <div
                  key={`empty_${idx}`}
                  className="flex items-center space-x-3.5 p-3.5 rounded-2xl border border-dashed border-slate-800 bg-slate-950/30 text-slate-500"
                >
                  <div className="w-9 h-9 rounded-full border border-dashed border-slate-700 flex items-center justify-center text-slate-500 font-bold text-xs">
                    {filledPlayers.length + idx + 1}
                  </div>
                  <div>
                    <div className="font-bold text-xs sm:text-sm text-slate-400">SLOT LIBRE</div>
                    <div className="text-[10px] sm:text-[11px] text-slate-500">Scannez le QR code pour rejoindre</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Launch Button */}
          <div className="flex items-center justify-between pt-5 border-t border-slate-800">
            <div className="text-xs text-slate-400 flex items-center space-x-2 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>
                {needsMorePlayers
                  ? `Min. ${minRequired} joueur(s) requis pour ${selectedGame.title} (complété avec des Bots IA).`
                  : `${filledPlayers.length} joueur(s) prêt(s). La partie peut commencer !`}
              </span>
            </div>

            <div className="flex items-center space-x-3">
              <button
                data-tv-focus
                tabIndex={0}
                onClick={handleStartGame}
                className="flex items-center space-x-2 px-8 py-3.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-display font-black text-xs sm:text-sm uppercase tracking-wider shadow-[0_4px_25px_rgba(6,182,212,0.35)] transition-all outline-none focus:scale-105 focus:ring-4 focus:ring-white focus:bg-white cursor-pointer"
              >
                <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
                <span>LANCER LA PARTIE</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Launch Countdown Overlay */}
      {countdown !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0A0F1D]/95">
          <div className="flex flex-col items-center space-y-4 animate-scale-in">
            <span className="text-sm sm:text-base font-bold text-amber-400 tracking-widest uppercase">
              La partie commence dans
            </span>
            <span className="text-8xl sm:text-9xl font-black font-display text-white animate-pulse drop-shadow-[0_0_40px_rgba(6,182,212,0.6)]">
              {countdown}
            </span>
            <span className="text-xs sm:text-sm font-semibold text-slate-300">
              Regardez la Smart TV & Préparez vos smartphones !
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
