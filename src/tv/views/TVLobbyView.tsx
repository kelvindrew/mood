import React, { useEffect, useState } from 'react';
import { useGame } from '../../context/GameContext';
import { QRCodeSVG } from 'qrcode.react';
import { Users, Play, ArrowLeft, Smartphone, CheckCircle2, Bot, Trash2, Wifi, Shield, Sparkles, Radio } from 'lucide-react';
import { audio } from '../../services/audio';
import { tvNav } from '../../services/tvNavigation';

export const TVLobbyView: React.FC = () => {
  const { room, selectedGame, startGame, setTvView, serverLanIp, addBot, removeBot } = useGame();
  const [countdown, setCountdown] = useState<number | null>(null);

  useEffect(() => {
    tvNav.setInitialFocus('button');
  }, []);

  if (!room) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400">Aucun salon actif</p>
          <button
            onClick={() => setTvView('home')}
            className="mt-4 px-8 py-3 rounded-2xl bg-brand-red text-white font-black"
          >
            Retour au launcher
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
      // In web production (Cloudflare): always use the live public origin URL
      mobileJoinUrl = `${window.location.origin}/?room=${room.code}`;
    }
  }

  const handleStartGame = async () => {
    audio.playSelect();
    setCountdown(3);
    const countInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(countInterval);
          startGame();
          return null;
        }
        audio.playDiceRoll();
        return prev - 1;
      });
    }, 1000);
  };

  const totalSlots = room.settings.maxPlayers || 6;
  const filledPlayers = room.players || [];
  const emptySlotsCount = Math.max(0, totalSlots - filledPlayers.length);
  const botCount = filledPlayers.filter(p => p.isBot).length;

  return (
    <div className="relative min-h-screen pt-20 px-12 pb-16 select-none flex flex-col justify-between">
      {/* Background with Ambient Glow */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <img
          src={selectedGame.heroImage}
          alt={selectedGame.title}
          className="w-full h-full object-cover object-center opacity-25 filter blur-3xl scale-110"
        />
        <div className="absolute inset-0 bg-[#07090E]/90" />
      </div>

      {/* Top Header */}
      <div className="relative z-10 flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center space-x-4">
          <button
            data-tv-focus
            tabIndex={0}
            onClick={() => {
              audio.playBack();
              setTvView('home');
            }}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-2xl bg-surface-card border border-white/10 text-gray-300 hover:text-white focus:bg-white focus:text-background focus:ring-4 focus:ring-brand-accent transition-all outline-none"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="font-black text-xs">Changer de Jeu</span>
          </button>

          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-brand-red to-brand-accent text-white text-[10px] font-black uppercase tracking-wider shadow-glow-red">
                SALON MULTIJOUEUR
              </span>
              <span className="text-gray-400 text-xs font-semibold">
                {selectedGame.title} • Mode {room.settings.gameMode.toUpperCase()}
              </span>
            </div>
            <h1 className="text-3xl font-black font-display text-white tracking-tight mt-0.5">
              Rejoignez avec vos smartphones ou ajoutez des Bots
            </h1>
          </div>
        </div>

        {/* Room Code Badge Banner */}
        <div className="flex items-center space-x-4">
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-bold text-gray-400 tracking-widest uppercase">CODE DU SALON</span>
            <div className="px-7 py-2 rounded-2xl bg-gradient-to-r from-brand-red via-brand-accent to-red-500 text-white font-mono font-black text-3xl tracking-widest shadow-glow-red border border-white/20">
              {room.code}
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 my-auto py-6">
        {/* Left Card: High-contrast QR Code */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center p-8 rounded-3xl bg-surface-card/90 border border-white/15 backdrop-blur-2xl shadow-2xl space-y-5">
          <div className="text-center">
            <span className="text-brand-cyan text-xs font-black tracking-widest uppercase flex items-center justify-center space-x-1.5">
              <Smartphone className="w-4 h-4 text-brand-cyan" />
              <span>SCANNEZ AVEC VOTRE TÉLÉPHONE</span>
            </span>
            <h2 className="text-2xl font-black font-display text-white mt-1">
              Pas d'application requise
            </h2>
            <p className="text-xs text-gray-300 mt-1 max-w-xs leading-relaxed">
              Ouvrez l'appareil photo de votre smartphone pour ouvrir instantanément votre manette.
            </p>
          </div>

          {/* High-Contrast QR Code */}
          <div className="p-4 rounded-3xl bg-white shadow-2xl border-4 border-white transform hover:scale-105 transition-transform duration-300">
            <QRCodeSVG
              value={mobileJoinUrl}
              size={210}
              level="H"
              includeMargin={false}
              fgColor="#07090E"
              bgColor="#FFFFFF"
            />
          </div>

          {/* Clear join instructions */}
          <div className="w-full flex flex-col items-center space-y-2">
            <div className="flex items-center space-x-2 text-xs text-gray-200 bg-surface-light/90 px-4 py-2 rounded-xl border border-white/10 shadow-inner">
              <span className="text-gray-400 font-medium">Adresse :</span>
              <span className="font-mono text-brand-cyan font-bold truncate max-w-[260px]">
                {typeof window !== 'undefined' ? window.location.host : 'mood.kalvinec.workers.dev'}
              </span>
            </div>
            <div className="text-xs text-gray-300 flex items-center space-x-1.5 pt-1">
              <span>Code du salon :</span>
              <span className="text-brand-gold font-mono text-lg font-black px-3 py-0.5 rounded-xl bg-surface-dark border border-white/15 shadow-sm">
                {room.code}
              </span>
            </div>
          </div>
        </div>

        {/* Right Card: Connected Players Podiums */}
        <div className="lg:col-span-7 flex flex-col justify-between p-8 rounded-3xl bg-surface-card/90 border border-white/15 backdrop-blur-2xl shadow-2xl space-y-6">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-brand-cyan" />
                <h3 className="text-xl font-black font-display text-white tracking-wide">
                  JOUEURS DANS LE SALON ({filledPlayers.length}/{totalSlots})
                </h3>
              </div>

              {/* Add & Remove Bot Buttons */}
              <div className="flex items-center space-x-2">
                {emptySlotsCount > 0 && (
                  <button
                    data-tv-focus
                    tabIndex={0}
                    onClick={() => {
                      audio.playSelect();
                      addBot();
                    }}
                    className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-indigo-600/90 hover:bg-indigo-600 text-white font-black text-xs shadow-md border border-indigo-400/40 focus:scale-105 focus:bg-white focus:text-indigo-900 transition-all outline-none"
                  >
                    <Bot className="w-4 h-4" />
                    <span>+ AJOUTER UN BOT IA</span>
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
                    className="flex items-center space-x-1 px-3 py-2 rounded-xl bg-surface-light border border-white/10 text-rose-400 hover:text-white text-xs font-bold focus:bg-rose-600 focus:text-white transition-all outline-none"
                    title="Retirer le dernier Bot"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Retirer Bot</span>
                  </button>
                )}
              </div>
            </div>

            {/* Players Grid with Clean Indicators */}
            <div className="grid grid-cols-2 gap-4">
              {filledPlayers.map((player) => {
                const colorMap: Record<string, string> = {
                  red: 'border-red-500 bg-red-950/40 text-red-400',
                  blue: 'border-blue-500 bg-blue-950/40 text-blue-400',
                  green: 'border-emerald-500 bg-emerald-950/40 text-emerald-400',
                  yellow: 'border-amber-500 bg-amber-950/40 text-amber-400',
                  purple: 'border-purple-500 bg-purple-950/40 text-purple-400',
                  cyan: 'border-cyan-500 bg-cyan-950/40 text-cyan-400',
                };
                const colorStyle = colorMap[player.color] || 'border-white/20 bg-surface-light text-white';

                return (
                  <div
                    key={player.id}
                    className={`flex items-center space-x-4 p-4 rounded-2xl border-2 ${colorStyle} shadow-lg transition-all animate-scale-in`}
                  >
                    {player.isBot ? (
                      <div className="w-12 h-12 rounded-2xl bg-indigo-600/60 border-2 border-indigo-400 flex items-center justify-center text-indigo-200 shadow-md flex-shrink-0">
                        <Bot className="w-7 h-7" />
                      </div>
                    ) : player.selfieImage ? (
                      <img
                        src={player.selfieImage}
                        alt={player.name}
                        className="w-12 h-12 rounded-xl object-cover border-2 border-white shadow-md flex-shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-2xl bg-surface-light border border-white/20 flex items-center justify-center text-white font-bold text-lg">
                        {player.name.charAt(0).toUpperCase()}
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-1.5">
                        <span className="font-black text-white text-base truncate">{player.name}</span>
                        {player.isHost && (
                          <span className="px-2 py-0.5 rounded bg-brand-gold/20 text-brand-gold text-[10px] font-black uppercase">
                            HÔTE
                          </span>
                        )}
                        {player.isBot && (
                          <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-[10px] font-black uppercase border border-indigo-400/40">
                            BOT IA
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-1 mt-0.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-xs font-bold text-emerald-400">
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
                  className="flex items-center space-x-4 p-4 rounded-2xl border-2 border-dashed border-white/10 bg-surface-dark/40 text-gray-500"
                >
                  <div className="w-10 h-10 rounded-full border border-dashed border-gray-600 flex items-center justify-center text-gray-500 font-bold text-xs">
                    {filledPlayers.length + idx + 1}
                  </div>
                  <div>
                    <div className="font-bold text-sm text-gray-400">SLOT LIBRE</div>
                    <div className="text-[11px] text-gray-600">Scannez ou ajoutez un Bot</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Launch Bar */}
          <div className="flex items-center justify-between pt-6 border-t border-white/10">
            <div className="text-xs text-gray-300 flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>
                {filledPlayers.length >= 1
                  ? `${filledPlayers.length} joueur(s) prêt(s). Vous pouvez lancer la partie.`
                  : 'Scannez le QR Code ou ajoutez un Bot pour démarrer.'}
              </span>
            </div>

            <div className="flex items-center space-x-4">
              <button
                data-tv-focus
                tabIndex={0}
                onClick={handleStartGame}
                className="flex items-center space-x-3 px-10 py-4 rounded-2xl bg-gradient-to-r from-brand-red to-brand-accent hover:from-red-600 hover:to-brand-red text-white font-black text-xl shadow-glow-red hover:scale-105 focus:scale-105 focus:bg-white focus:text-brand-red focus:ring-4 focus:ring-white transition-all outline-none"
              >
                <Play className="w-6 h-6 fill-current" />
                <span>LANCER LA PARTIE</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Launch Countdown Overlay */}
      {countdown !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-2xl">
          <div className="flex flex-col items-center space-y-4 animate-scale-in">
            <span className="text-xl font-bold text-brand-gold tracking-widest uppercase">
              La partie commence dans
            </span>
            <span className="text-9xl font-black font-display text-white animate-pulse drop-shadow-glow-red">
              {countdown}
            </span>
            <span className="text-sm font-semibold text-gray-300">
              Regardez la Smart TV & Préparez vos manettes !
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
