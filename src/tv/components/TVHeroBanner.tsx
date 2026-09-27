import React from 'react';
import { GameCatalogItem } from '../../types/game';
import { Play, Info, Sparkles, Smartphone, Users, Clock, QrCode } from 'lucide-react';
import { audio } from '../../services/audio';

interface TVHeroBannerProps {
  game: GameCatalogItem;
  onPlay: (game: GameCatalogItem) => void;
  onMoreInfo: (game: GameCatalogItem) => void;
}

export const TVHeroBanner: React.FC<TVHeroBannerProps> = ({ game, onPlay, onMoreInfo }) => {
  return (
    <div className="relative w-full min-h-[62vh] flex items-center px-[4vw] pt-20 pb-8 overflow-hidden select-none">
      {/* 1. Layered Atmospheric Background (Midnight Canyon with Mesa Silhouettes) */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden mood-canyon-bg">
        {/* Dynamic Game Hero Backdrop Image with layered vignette */}
        <img
          src={game.heroImage || game.coverImage}
          alt={game.title}
          className="w-full h-full object-cover object-center filter blur-xl opacity-25 scale-110 transition-all duration-700"
        />

        {/* Vector Landscape Silhouette Layers (User inspiration reference) */}
        <svg
          className="absolute bottom-0 left-0 right-0 w-full h-44 text-[#060810]/90 preserve-3d"
          viewBox="0 0 1440 240"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Distant Ridge Layer */}
          <path
            d="M0,160 L120,140 L280,180 L420,110 L580,160 L740,90 L900,150 L1060,110 L1220,170 L1360,130 L1440,150 L1440,240 L0,240 Z"
            fill="#1E1B4B"
            fillOpacity="0.4"
          />
          {/* Mid Ridge Layer */}
          <path
            d="M0,190 L160,150 L340,180 L520,130 L680,170 L860,120 L1020,160 L1180,130 L1340,170 L1440,160 L1440,240 L0,240 Z"
            fill="#0F1424"
            fillOpacity="0.8"
          />
          {/* Foreground Plateau Layer */}
          <path
            d="M0,210 L200,180 L400,200 L600,175 L800,195 L1000,170 L1200,190 L1440,180 L1440,240 L0,240 Z"
            fill="#060810"
          />
        </svg>

        {/* Ambient Twilight Glow & Vignette */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#060810] via-[#060810]/75 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#060810] via-transparent to-transparent" />
      </div>

      {/* 2. Main Hero Showcase Container */}
      <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-8 pt-4">
        {/* Left Side: Game Showcase & Direct Remote Action CTAs */}
        <div className="flex-1 max-w-2xl flex flex-col space-y-4">
          {/* Badges Bar */}
          <div className="flex items-center space-x-2.5">
            <span className="px-3.5 py-1 rounded-full bg-gradient-to-r from-mood-coral to-mood-amber text-white font-mono text-[11px] font-black uppercase tracking-wider shadow-lg flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 fill-current" />
              <span>{game.badge || 'EN VEDETTE'}</span>
            </span>
            <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-gray-300 font-mono text-[11px] font-bold uppercase tracking-wider">
              {game.category.toUpperCase()}
            </span>
            <span className="text-gray-500">•</span>
            <span className="text-mood-cyan font-mono text-xs font-bold">SMART TV DELUXE</span>
          </div>

          {/* Main Title & Tagline */}
          <div>
            <h1 className="text-4xl lg:text-5xl font-black font-display tracking-tight text-white uppercase leading-tight drop-shadow-lg">
              {game.title}
            </h1>
            <p className="text-base lg:text-lg text-mood-amber font-medium mt-1 drop-shadow">
              {game.tagline}
            </p>
          </div>

          {/* Game Description */}
          <p className="text-sm lg:text-base text-gray-300 font-sans leading-relaxed line-clamp-3 max-w-xl">
            {game.description}
          </p>

          {/* Quick Specs (Players, Duration, Controller) */}
          <div className="flex items-center space-x-3 text-xs font-bold pt-1">
            <div className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-white/10 border border-white/15 text-white">
              <Users className="w-3.5 h-3.5 text-mood-cyan" />
              <span>{game.minPlayers}–{game.maxPlayers} Joueurs</span>
            </div>
            <div className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-white/10 border border-white/15 text-mood-amber">
              <Clock className="w-3.5 h-3.5 text-mood-amber" />
              <span>{game.durationMinutes}</span>
            </div>
            <div className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-white/10 border border-white/15 text-mood-emerald">
              <Smartphone className="w-3.5 h-3.5 text-mood-emerald" />
              <span>Manettes Smartphones</span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center space-x-4 pt-3">
            <button
              data-tv-focus
              tabIndex={0}
              onClick={() => {
                audio.playSelect();
                onPlay(game);
              }}
              className="flex items-center space-x-2.5 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-mood-coral via-rose-500 to-mood-amber text-white font-black text-sm uppercase tracking-wider shadow-[0_0_35px_rgba(255,71,87,0.5)] transition-all duration-200 outline-none
                         focus:scale-110 focus:bg-white focus:text-black focus:ring-4 focus:ring-mood-amber focus:shadow-[0_0_45px_rgba(245,158,11,0.8)]"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>CRÉER UN SALON</span>
            </button>

            <button
              data-tv-focus
              tabIndex={0}
              onClick={() => {
                audio.playSelect();
                onMoreInfo(game);
              }}
              className="flex items-center space-x-2 px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 text-white font-black text-sm tracking-wide transition-all outline-none
                         focus:scale-110 focus:bg-white focus:text-black focus:ring-4 focus:ring-white"
            >
              <Info className="w-4 h-4" />
              <span>Règles & Détails</span>
            </button>
          </div>
        </div>

        {/* Right Side: Game Poster & Smart TV Wireless Controller Card */}
        <div className="flex flex-col items-center lg:items-end space-y-4">
          {/* Main 16:9 / Cinematic Poster Card */}
          <div className="relative w-72 h-44 lg:w-96 lg:h-56 rounded-3xl overflow-hidden shadow-2xl border-2 border-white/20 group">
            <img
              src={game.coverImage || game.heroImage}
              alt={game.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#060810] via-transparent to-transparent opacity-80" />

            {/* Glowing Corner Badge */}
            <div className="absolute bottom-3 right-3 px-3 py-1 rounded-xl bg-black/60 backdrop-blur-md border border-white/20 text-white font-mono text-[11px] font-black uppercase">
              100% SANS FIL
            </div>
          </div>

          {/* Smart TV Pairing Mini Banner */}
          <div className="w-72 lg:w-96 p-3.5 rounded-2xl bg-[#0F1424]/90 border border-white/10 shadow-xl flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-mood-indigo to-mood-cyan flex items-center justify-center text-white shadow-md">
                <Smartphone className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="text-xs font-black text-white">Vos Mobiles = Manettes</div>
                <div className="text-[10px] text-gray-400">Aucune application à télécharger</div>
              </div>
            </div>

            <div className="px-2.5 py-1 rounded-lg bg-mood-emerald/20 border border-mood-emerald/40 text-mood-emerald text-[10px] font-mono font-black">
              INSTANTANÉ
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
