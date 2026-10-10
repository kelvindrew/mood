import React from 'react';
import { GameCatalogItem } from '../../types/game';
import { useGame } from '../../context/GameContext';
import { Play, Smartphone, Users, Bot, CheckCircle2 } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { audio } from '../../services/audio';

interface TVHeroBannerProps {
  game: GameCatalogItem;
  onLaunchGame: () => void;
}

export const TVHeroBanner: React.FC<TVHeroBannerProps> = ({ game, onLaunchGame }) => {
  const { room, serverLanIp, addBot } = useGame();

  const isLocalHost = typeof window !== 'undefined' && (
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1'
  );

  let mobileJoinUrl = '';
  if (room && typeof window !== 'undefined') {
    if (isLocalHost) {
      const lanIp = (room.serverLanIp && room.serverLanIp !== 'localhost') ? room.serverLanIp : serverLanIp;
      const port = window.location.port ? `:${window.location.port}` : '';
      mobileJoinUrl = `${window.location.protocol}//${lanIp !== 'localhost' ? lanIp : window.location.hostname}${port}/?room=${room.code}`;
    } else {
      mobileJoinUrl = `${window.location.origin}/?room=${room.code}`;
    }
  }

  const connectedPlayers = room?.players || [];
  const minRequired = game.minPlayers || 1;
  const canStart = connectedPlayers.length >= minRequired;

  return (
    <div className="relative w-full pt-20 md:pt-24 pb-6 px-8 md:px-12 select-none z-10">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center max-w-7xl">
        {/* Colonne Gauche : Présentation du Jeu & Bouton Lancer */}
        <div className="lg:col-span-7 flex flex-col space-y-4 animate-fade-in">
          {/* Badge Catégorie Minimaliste */}
          <div className="flex items-center space-x-3">
            <span className="px-2.5 py-0.5 rounded bg-[#E50914] text-white text-[11px] font-black uppercase tracking-wider shadow-sm">
              {game.badge || game.category.toUpperCase()}
            </span>
            <span className="text-gray-400 text-xs font-semibold">
              {game.minPlayers}–{game.maxPlayers} Joueurs • {game.durationMinutes}
            </span>
          </div>

          {/* Titre Display Widescreen */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black font-display tracking-tight text-white leading-[1.05] drop-shadow-[0_4px_25px_rgba(0,0,0,0.95)]">
            {game.title}
          </h1>

          {/* Description Épurée */}
          <p className="text-sm md:text-base text-gray-200/90 font-sans leading-relaxed max-w-xl drop-shadow line-clamp-3">
            {game.description || game.tagline}
          </p>

          {/* Joueurs Connectés en direct */}
          <div className="flex items-center space-x-2 pt-1 text-xs text-gray-300">
            <Users className="w-4 h-4 text-emerald-400" />
            <span className="font-bold">
              {connectedPlayers.length === 0
                ? 'En attente de connexion des joueurs...'
                : `${connectedPlayers.length} joueur${connectedPlayers.length > 1 ? 's' : ''} connecté${connectedPlayers.length > 1 ? 's' : ''}`}
            </span>
            {connectedPlayers.length < minRequired && (
              <span className="text-amber-400 font-medium">
                (minimum {minRequired} pour lancer)
              </span>
            )}
          </div>

          {/* Bouton Unique : LANCER LA PARTIE */}
          <div className="flex items-center space-x-4 pt-2">
            <button
              data-tv-focus
              tabIndex={0}
              onClick={() => {
                audio.playSelect();
                onLaunchGame();
              }}
              className="px-8 py-3.5 rounded-lg bg-white hover:bg-gray-200 text-black font-black text-sm md:text-base uppercase tracking-wider flex items-center space-x-3 transition-transform active:scale-95 outline-none focus:ring-4 focus:ring-[#E50914] shadow-[0_4px_20px_rgba(255,255,255,0.3)] cursor-pointer"
            >
              <Play className="w-5 h-5 fill-black" />
              <span>{canStart ? 'LANCER LA PARTIE' : 'LANCER'}</span>
            </button>
          </div>
        </div>

        {/* Colonne Droite : Le Module Connexion Code QR (Star de l'interface) */}
        {room && mobileJoinUrl ? (
          <div className="lg:col-span-5 flex flex-col items-center justify-center p-6 rounded-2xl bg-black/75 backdrop-blur-xl border border-white/20 shadow-2xl space-y-4 animate-scale-in">
            {/* Header Module QR */}
            <div className="text-center">
              <div className="inline-flex items-center space-x-1.5 text-cyan-400 text-[11px] font-black uppercase tracking-wider">
                <Smartphone className="w-3.5 h-3.5" />
                <span>MANETTES MOBILES</span>
              </div>
              <h2 className="text-lg md:text-xl font-black font-display text-white mt-0.5">
                Scannez pour rejoindre
              </h2>
            </div>

            {/* Le Code QR Haute Définition */}
            <div className="p-3 rounded-2xl bg-white shadow-[0_0_30px_rgba(6,182,212,0.35)] border-2 border-cyan-400">
              <QRCodeSVG
                value={mobileJoinUrl}
                size={180}
                level="H"
                includeMargin={false}
                fgColor="#060810"
                bgColor="#FFFFFF"
              />
            </div>

            {/* Infos Code Salon & Site */}
            <div className="w-full flex flex-col items-center space-y-1.5 text-center">
              <div className="flex items-center space-x-2 text-xs font-bold text-gray-300">
                <span>Code du salon :</span>
                <span className="font-mono text-xl font-black text-amber-400 tracking-widest px-3 py-0.5 rounded bg-white/10 border border-amber-400/40">
                  {room.code}
                </span>
              </div>
              <span className="text-[11px] font-mono text-cyan-300/80 truncate max-w-[280px]">
                {typeof window !== 'undefined' ? window.location.host : 'mood.kalvinec.workers.dev'}
              </span>
            </div>

            {/* Liste visuelle des joueurs connectés */}
            {connectedPlayers.length > 0 && (
              <div className="w-full pt-2 border-t border-white/10 flex flex-wrap items-center justify-center gap-1.5">
                {connectedPlayers.map((p) => (
                  <span
                    key={p.id}
                    className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-white/10 border border-white/20 text-xs text-white font-bold"
                  >
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <span>{p.name}</span>
                  </span>
                ))}
              </div>
            )}

            {/* Bouton discret pour ajouter un Bot IA si l'utilisateur teste seul */}
            <div className="w-full pt-1 flex justify-center">
              <button
                tabIndex={0}
                onClick={() => {
                  audio.playSelect();
                  addBot();
                }}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/15 border border-white/15 text-gray-300 text-xs font-bold transition-all outline-none"
              >
                <Bot className="w-3.5 h-3.5 text-indigo-400" />
                <span>+ Ajouter un Bot IA</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-5 flex items-center justify-center p-8 rounded-2xl bg-black/60 border border-white/10 text-gray-400 text-xs font-bold">
            Génération du salon en direct...
          </div>
        )}
      </div>
    </div>
  );
};
