import React, { useEffect, useState } from 'react';
import { useGame } from '../../context/GameContext';
import { QRCodeSVG } from 'qrcode.react';
import { Users, Play, ArrowLeft, Smartphone, CheckCircle2, Bot, Trash2, Shield, Radio } from 'lucide-react';
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
      <div className="min-h-screen flex items-center justify-center bg-[#07090E] select-none">
        <div className="text-center space-y-4">
          <p className="text-[#B8C2D8] font-bold text-lg">Aucun salon actif</p>
          <button
            onClick={() => setTvView('home')}
            className="px-8 py-3.5 rounded-2xl bg-[#E50914] text-white font-black text-base shadow-[0_0_25px_rgba(229,9,20,0.6)]"
          >
            Retour au Launcher
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
    <div className="relative min-h-screen pt-20 px-[5vw] pb-16 select-none flex flex-col justify-between forest-sunlight-bg">
      {/* Background Ambient Glow */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <img
          src="https://images.unsplash.com/photo-1511497584788-87676104235f?auto=format&fit=crop&w=1920&q=85"
          alt="Forest Sunlight Background"
          className="w-full h-full object-cover object-center opacity-30 filter blur-xl scale-110"
        />
        <div className="absolute inset-0 bg-[#070D0B]/85" />
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
            className="flex items-center space-x-2 px-5 py-3 rounded-2xl bg-white/10 border border-white/20 text-white hover:text-white focus:bg-white focus:text-black focus:ring-4 focus:ring-[#FBBF24] transition-all outline-none"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="font-black text-sm">Changer de Jeu</span>
          </button>

          <div>
            <div className="flex items-center space-x-2">
              <span className="px-3 py-0.5 rounded-full bg-gradient-to-r from-[#10B981] to-[#059669] text-white text-[11px] font-black uppercase tracking-wider shadow-md border border-white/20">
                SALON MULTIJOUEUR
              </span>
              <span className="text-[#D1D5DB] text-xs font-bold">
                {selectedGame.title} • Mode {room.settings.gameMode.toUpperCase()}
              </span>
            </div>
            <h1 className="text-3xl font-black font-display text-white tracking-tight mt-0.5">
              Connectez vos smartphones ou ajoutez des Bots IA
            </h1>
          </div>
        </div>

        {/* Room Code Badge */}
        <div className="flex items-center space-x-4">
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-black text-[#9CA3AF] tracking-widest uppercase">CODE DU SALON</span>
            <div className="px-8 py-2.5 rounded-2xl sparkle-gold-box text-[#FBBF24] font-mono font-black text-4xl tracking-widest">
              {room.code}
            </div>
          </div>
        </div>
      </div>

      {/* Main 2-Column Grid */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 my-auto py-6">
        {/* Left Column: High-contrast QR Code & PIN instructions */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center p-8 rounded-3xl glass-forest-card shadow-2xl space-y-5">
          <div className="text-center">
            <span className="text-[#34D399] text-xs font-black tracking-widest uppercase flex items-center justify-center space-x-1.5">
              <Smartphone className="w-4 h-4 text-[#34D399]" />
              <span>SCANNEZ AVEC VOTRE APPAREIL PHOTO</span>
            </span>
            <h2 className="text-2xl font-black font-display text-white mt-1">
              Pas d'application à installer
            </h2>
            <p className="text-xs text-[#D1D5DB] mt-1 max-w-xs leading-relaxed font-medium">
              Visez le QR Code pour transformer immédiatement votre smartphone en manette.
            </p>
          </div>

          {/* Ultra-sharp High-Contrast QR Code */}
          <div className="p-4 rounded-3xl bg-white shadow-[0_0_35px_rgba(16,185,129,0.3)] border-4 border-[#10B981]">
            <QRCodeSVG
              value={mobileJoinUrl}
              size={210}
              level="H"
              includeMargin={false}
              fgColor="#07090E"
              bgColor="#FFFFFF"
            />
          </div>

          {/* Join Link & PIN Details */}
          <div className="w-full flex flex-col items-center space-y-2">
            <div className="flex items-center space-x-2 text-xs text-gray-200 bg-black/40 px-4 py-2.5 rounded-xl border border-white/10 shadow-inner">
              <span className="text-[#9CA3AF] font-bold">Site :</span>
              <span className="font-mono text-[#34D399] font-black truncate max-w-[260px]">
                {typeof window !== 'undefined' ? window.location.host : 'mood.kalvinec.workers.dev'}
              </span>
            </div>
            <div className="text-xs text-[#D1D5DB] flex items-center space-x-2 pt-1 font-bold">
              <span>Code du salon :</span>
              <span className="text-[#FBBF24] font-mono text-2xl font-black px-4 py-1 rounded-xl bg-black/50 border border-[#FBBF24]/50 shadow-sm">
                {room.code}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Connected Player Slots & Launch Controls */}
        <div className="lg:col-span-7 flex flex-col justify-between p-8 rounded-3xl glass-forest-card shadow-2xl space-y-6">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-[#00F2FE]" />
                <h3 className="text-xl font-black font-display text-white tracking-wide">
                  JOUEURS CONNECTÉS ({filledPlayers.length}/{totalSlots})
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
                    className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs shadow-md border border-indigo-400/40 focus:scale-105 focus:bg-white focus:text-indigo-900 transition-all outline-none"
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
                    className="flex items-center space-x-1 px-3 py-2 rounded-xl bg-[#181F33] border border-white/10 text-rose-400 hover:text-white text-xs font-bold focus:bg-rose-600 focus:text-white transition-all outline-none"
                    title="Retirer le dernier Bot"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Retirer Bot</span>
                  </button>
                )}
              </div>
            </div>

            {/* Players Grid with High-Contrast Cards */}
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
                const colorStyle = colorMap[player.color] || 'border-white/20 bg-[#181F33] text-white';

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
                      <div className="w-12 h-12 rounded-2xl bg-[#181F33] border border-white/20 flex items-center justify-center text-white font-bold text-lg">
                        {player.name.charAt(0).toUpperCase()}
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-1.5">
                        <span className="font-black text-white text-base truncate">{player.name}</span>
                        {player.isHost && (
                          <span className="px-2 py-0.5 rounded bg-[#FFB800]/20 text-[#FFB800] text-[10px] font-black uppercase">
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
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />
                        <span className="text-xs font-black text-[#10B981]">
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
                  className="flex items-center space-x-4 p-4 rounded-2xl border-2 border-dashed border-white/15 bg-[#07090E]/60 text-gray-500"
                >
                  <div className="w-10 h-10 rounded-full border border-dashed border-gray-600 flex items-center justify-center text-gray-400 font-bold text-xs">
                    {filledPlayers.length + idx + 1}
                  </div>
                  <div>
                    <div className="font-bold text-sm text-[#B8C2D8]">SLOT LIBRE</div>
                    <div className="text-[11px] text-gray-500">Scannez le QR code pour rejoindre</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Launch Button */}
          <div className="flex items-center justify-between pt-6 border-t border-white/10">
            <div className="text-xs text-[#B8C2D8] flex items-center space-x-2 font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] animate-pulse" />
              <span>
                {filledPlayers.length >= 1
                  ? `${filledPlayers.length} joueur(s) connecté(s). Vous pouvez lancer la partie.`
                  : 'Scannez le QR Code ou ajoutez un Bot pour démarrer.'}
              </span>
            </div>

            <div className="flex items-center space-x-4">
              <button
                data-tv-focus
                tabIndex={0}
                onClick={handleStartGame}
                className="flex items-center space-x-3 px-10 py-4 rounded-2xl bg-gradient-to-r from-[#10B981] via-[#059669] to-[#F59E0B] text-white font-black text-xl shadow-[0_0_35px_rgba(16,185,129,0.6)] transition-all duration-200 outline-none
                           focus:scale-110 focus:bg-white focus:text-[#064E3B] focus:ring-4 focus:ring-[#FBBF24] focus:shadow-[0_0_40px_rgba(251,191,36,0.85)]"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md">
          <div className="flex flex-col items-center space-y-4 animate-scale-in">
            <span className="text-xl font-bold text-[#FBBF24] tracking-widest uppercase">
              La partie commence dans
            </span>
            <span className="text-9xl font-black font-display text-white animate-pulse drop-shadow-[0_0_50px_rgba(251,191,36,0.8)]">
              {countdown}
            </span>
            <span className="text-base font-bold text-gray-200">
              Regardez la Smart TV & Préparez vos manettes !
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
