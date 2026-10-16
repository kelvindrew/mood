import React, { useEffect, useState } from 'react';
import { useGame } from '../../context/GameContext';
import { QRCodeSVG } from 'qrcode.react';
import { Users, Play, ArrowLeft, Smartphone, CheckCircle2, Bot, Trash2 } from 'lucide-react';
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
      <div className="min-h-screen flex items-center justify-center bg-[#07090E] select-none text-white">
        <div className="text-center space-y-4 p-8 rounded-3xl liquid-glass max-w-md">
          <p className="text-slate-300 font-bold text-lg">Aucun salon actif</p>
          <button
            onClick={() => setTvView('home')}
            className="px-8 py-3.5 rounded-xl bg-white hover:bg-neutral-200 text-neutral-950 font-display font-black text-sm uppercase tracking-wider shadow-[0_4px_25px_rgba(255,255,255,0.2)] outline-none focus:ring-4 focus:ring-white transition-all cursor-pointer"
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
    <div className="relative min-h-screen pt-20 px-[5vw] pb-10 select-none flex flex-col justify-between bg-[#07090E] text-white">
      {/* 1. Cinematic Background with Deep Vignette */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <img
          src={selectedGame.heroImage || selectedGame.coverImage}
          alt={selectedGame.title}
          className="w-full h-full object-cover object-center opacity-20 filter brightness-75 contrast-125"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#07090E]/90 via-[#07090E]/95 to-[#07090E]" />
      </div>

      {/* 2. Top Header Bar (With Button 1: Secondary Back Action) */}
      <div className="relative z-10 flex items-center justify-between border-b border-white/[0.08] pb-4">
        <div className="flex items-center space-x-4">
          {/* BOUTON D'ACTION 1 (SECONDAIRE) : RETOUR / CHANGER DE JEU */}
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
            <span className="font-display font-bold text-xs sm:text-sm uppercase tracking-wider">Changer de Jeu</span>
          </button>

          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full liquid-glass-pill text-[10px] font-bold text-slate-300 uppercase tracking-wider">
                SALON DE JEU ACTIF
              </span>
              <span className="text-slate-400 text-xs font-semibold">
                {selectedGame.title} • {room.settings.gameMode.toUpperCase()}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black font-display text-white tracking-tight mt-0.5">
              Connectez vos smartphones pour jouer
            </h1>
          </div>
        </div>

        {/* Room Code Badge */}
        <div className="flex flex-col items-end">
          <span className="text-[10px] font-black text-slate-400 tracking-widest uppercase">CODE DU SALON</span>
          <div className="px-6 py-1.5 rounded-2xl liquid-glass-elevated border border-amber-400/30 text-amber-400 font-mono font-black text-2xl sm:text-3xl tracking-widest shadow-[0_0_25px_rgba(245,158,11,0.2)]">
            {room.code}
          </div>
        </div>
      </div>

      {/* 3. Main 2-Column Split: High-Contrast QR Code on Left, Live Players on Right */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 my-auto py-4">
        {/* Left Column: High-contrast Scannable QR Stage */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center p-6 sm:p-8 rounded-3xl liquid-glass shadow-2xl space-y-4">
          <div className="text-center">
            <span className="text-slate-300 text-xs font-bold tracking-widest uppercase flex items-center justify-center space-x-1.5">
              <Smartphone className="w-4 h-4 text-slate-300" />
              <span>SCANNEZ AVEC VOTRE APPAREIL PHOTO</span>
            </span>
            <h2 className="text-xl sm:text-2xl font-black font-display text-white mt-1">
              Aucune application requise
            </h2>
          </div>

          {/* Scannable White QR Code Container (Liquid glass effects MUST NOT cover the QR SVG) */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-white shadow-[0_15px_40px_rgba(0,0,0,0.8)] border-4 border-white">
            <QRCodeSVG
              value={mobileJoinUrl}
              size={210}
              level="M"
              includeMargin={true}
              fgColor="#07090E"
              bgColor="#FFFFFF"
            />
          </div>

          {/* Quick 3-Step Guide */}
          <div className="w-full grid grid-cols-3 gap-2 pt-2 text-center">
            <div className="p-2 rounded-xl bg-white/[0.03] border border-white/[0.06]">
              <span className="block text-[10px] font-mono font-bold text-slate-400">1. SCANNEZ</span>
              <span className="text-[11px] text-slate-200 font-medium">le QR Code</span>
            </div>
            <div className="p-2 rounded-xl bg-white/[0.03] border border-white/[0.06]">
              <span className="block text-[10px] font-mono font-bold text-slate-400">2. PSEUDO</span>
              <span className="text-[11px] text-slate-200 font-medium">choisissez</span>
            </div>
            <div className="p-2 rounded-xl bg-white/[0.03] border border-white/[0.06]">
              <span className="block text-[10px] font-mono font-bold text-slate-400">3. JOUEZ</span>
              <span className="text-[11px] text-slate-200 font-medium">sur la TV</span>
            </div>
          </div>

          {/* Direct URL Fallback */}
          <div className="text-center pt-1 text-xs text-slate-400">
            <span>Ou rendez-vous sur : </span>
            <span className="font-mono text-slate-200 font-bold underline">
              {typeof window !== 'undefined' ? window.location.host : 'mood.kalvinec.workers.dev'}
            </span>
          </div>
        </div>

        {/* Right Column: Connected Player Slots & Launch Controls */}
        <div className="lg:col-span-7 flex flex-col justify-between p-6 sm:p-8 rounded-3xl liquid-glass shadow-2xl space-y-6">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2.5">
                <Users className="w-5 h-5 text-slate-300" />
                <h3 className="text-base sm:text-lg font-black font-display text-white tracking-wide uppercase">
                  Joueurs Connectés ({filledPlayers.length}/{totalSlots})
                </h3>
                {isFull && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[9px] font-black uppercase tracking-wider">
                    COMPLET
                  </span>
                )}
              </div>

              {/* Discreet inline Bot Helpers */}
              <div className="flex items-center space-x-2">
                {!isFull && (
                  <button
                    data-tv-focus
                    tabIndex={0}
                    onClick={() => {
                      audio.playSelect();
                      addBot();
                    }}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg liquid-glass-pill hover:bg-white/10 text-slate-300 hover:text-white font-bold text-xs transition-all outline-none focus:ring-2 focus:ring-white"
                  >
                    <Bot className="w-3.5 h-3.5" />
                    <span>+ Bot IA</span>
                  </button>
                )}

                {botCount > 0 && (
                  <button
                    data-tv-focus
                    tabIndex={0}
                    onClick={() => {
                      audio.playBack();
                      removeBot();
                    }}
                    className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg liquid-glass-pill hover:bg-rose-900/40 text-slate-400 hover:text-rose-300 text-xs transition-all outline-none focus:ring-2 focus:ring-rose-400"
                    title="Retirer le dernier Bot"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            {/* Players Grid with Liquid Glass Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[320px] overflow-y-auto pr-1">
              {filledPlayers.map((player) => {
                return (
                  <div
                    key={player.id}
                    className="flex items-center space-x-3.5 p-3 rounded-2xl liquid-glass border border-white/[0.08] shadow-md transition-all animate-scale-in"
                  >
                    {player.isBot ? (
                      <div className="w-10 h-10 rounded-xl bg-indigo-950/70 border border-indigo-400/30 flex items-center justify-center text-indigo-300 shadow flex-shrink-0">
                        <Bot className="w-5 h-5" />
                      </div>
                    ) : player.selfieImage ? (
                      <img
                        src={player.selfieImage}
                        alt={player.name}
                        className="w-10 h-10 rounded-xl object-cover border border-white/20 shadow flex-shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-white/[0.08] border border-white/15 flex items-center justify-center text-white font-bold text-base flex-shrink-0">
                        {player.name.charAt(0).toUpperCase()}
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-1.5">
                        <span className="font-bold text-white text-sm sm:text-base truncate">{player.name}</span>
                        {player.isHost && (
                          <span className="px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[8px] font-black uppercase">
                            HÔTE
                          </span>
                        )}
                        {player.isBot && (
                          <span className="px-1.5 py-0.5 rounded bg-indigo-400/20 text-indigo-300 border border-indigo-400/30 text-[8px] font-black uppercase">
                            BOT
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-1 mt-0.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-[11px] font-semibold text-emerald-400">
                          {player.isBot ? 'Prêt automatique' : 'Prêt'}
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
                  className="flex items-center space-x-3.5 p-3 rounded-2xl border border-dashed border-white/10 bg-white/[0.02] text-slate-500"
                >
                  <div className="w-8 h-8 rounded-full border border-dashed border-white/15 flex items-center justify-center text-slate-500 font-mono font-bold text-xs">
                    {filledPlayers.length + idx + 1}
                  </div>
                  <div>
                    <div className="font-bold text-xs text-slate-400">Slot disponible</div>
                    <div className="text-[10px] text-slate-500">Scannez pour rejoindre</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Launch Row: Information status + BOUTON D'ACTION 2 (PRIMAIRE) */}
          <div className="flex items-center justify-between pt-4 border-t border-white/[0.08]">
            <div className="text-xs text-slate-400 flex items-center space-x-2 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>
                {needsMorePlayers
                  ? `Min. ${minRequired} joueur(s) requis pour ${selectedGame.title}.`
                  : `${filledPlayers.length} joueur(s) prêt(s). La partie peut commencer !`}
              </span>
            </div>

            {/* BOUTON D'ACTION 2 (PRIMAIRE) : LANCER LA PARTIE */}
            <button
              data-tv-focus
              tabIndex={0}
              onClick={handleStartGame}
              className="flex items-center space-x-2.5 px-8 py-3.5 rounded-xl bg-white hover:bg-neutral-200 text-neutral-950 font-display font-black text-xs sm:text-sm uppercase tracking-wider shadow-[0_4px_30px_rgba(255,255,255,0.25)] transition-all outline-none focus:scale-105 focus:ring-4 focus:ring-white cursor-pointer"
            >
              <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-neutral-950 translate-x-0.5" />
              <span>LANCER LA PARTIE</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4. Launch Countdown Overlay */}
      {countdown !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#07090E]/95 backdrop-blur-xl">
          <div className="flex flex-col items-center space-y-4 animate-scale-in">
            <span className="text-xs sm:text-sm font-bold text-amber-400 tracking-widest uppercase">
              La partie commence dans
            </span>
            <span className="text-8xl sm:text-9xl font-black font-display text-white animate-pulse drop-shadow-[0_0_50px_rgba(255,255,255,0.8)]">
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
