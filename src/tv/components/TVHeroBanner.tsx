import React from 'react';
import { GameCatalogItem } from '../../types/game';
import { Play, Info, Sparkles, Smartphone, Bot, Users, Clock } from 'lucide-react';
import { audio } from '../../services/audio';

interface TVHeroBannerProps {
  game: GameCatalogItem;
  onPlay: (game: GameCatalogItem) => void;
  onMoreInfo: (game: GameCatalogItem) => void;
}

export const TVHeroBanner: React.FC<TVHeroBannerProps> = ({ game, onPlay, onMoreInfo }) => {
  // 3 cinematic scene previews inspired by the user's reference design
  const previewScenes = [
    {
      id: 'sc1',
      title: 'Forêt Émeraude',
      tag: 'Sunlight Rays',
      img: 'https://images.unsplash.com/photo-1511497584788-87676104235f?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'sc2',
      title: 'Sanctuaire Magique',
      tag: 'Golden Hues',
      img: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'sc3',
      title: 'Arène Multijoueur',
      tag: '3D Gameplay',
      img: game.coverImage || 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=600&q=80',
    },
  ];

  return (
    <div className="relative w-full min-h-[72vh] flex items-center px-[5vw] pt-24 pb-8 overflow-hidden select-none">
      {/* 1. Background Forest & Sunbeams Image */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1511497584788-87676104235f?auto=format&fit=crop&w=1920&q=85"
          alt="Forest Sunlight Background"
          className="w-full h-full object-cover object-center filter brightness-90 contrast-105"
        />

        {/* Sunlight Volumetric Radial Glows */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#070D0B] via-[#070D0B]/85 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#070D0B] via-[#070D0B]/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#070D0B]/70 via-transparent to-[#070D0B]" />
        
        {/* Soft Golden Sunbeam Overlay */}
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-amber-400/20 via-emerald-500/10 to-transparent blur-3xl pointer-events-none" />
      </div>

      {/* 2. Glassmorphic Main Hero Card (Exact aesthetic of reference image) */}
      <div className="relative z-10 w-full rounded-3xl glass-forest-card p-8 lg:p-10 flex flex-col lg:flex-row items-center justify-between gap-8 animate-scale-in">
        {/* Left Side: Typographic Masterpiece & Actions */}
        <div className="flex-1 max-w-2xl flex flex-col space-y-4">
          {/* Header Keywords & Tag */}
          <div className="space-y-1">
            <h2 className="text-3xl lg:text-4xl font-black font-display tracking-wide text-white uppercase drop-shadow-md">
              {game.title || 'PLAYFLIX GAMING UNIVERSE'}
            </h2>
            <div className="text-xs font-black uppercase tracking-widest text-[#FBBF24] flex items-center space-x-2">
              <span>KEYWORD : SUNLIGHT PENETRATING THE FOREST • {game.category?.toUpperCase() || 'MULTIJOUEUR'}</span>
            </div>
          </div>

          {/* Prompt / Description Box */}
          <div className="p-4 rounded-2xl bg-black/40 border border-white/10 shadow-inner">
            <span className="text-[11px] font-mono font-bold text-[#F59E0B] uppercase block mb-1">
              PROMPT :
            </span>
            <p className="text-xs lg:text-sm text-gray-200 font-sans leading-relaxed">
              "{game.description || 'Digital illustration, Sunlight penetrating a dense forest with tall trees and rich green foliage, rays of sunlight creating a magical atmosphere with soft golden hues.'}"
            </p>
          </div>

          {/* Metadata Badges (Players, Duration, Difficulty) */}
          <div className="flex items-center space-x-3 text-xs font-bold pt-1">
            <div className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-white/10 border border-white/15 text-white">
              <Users className="w-3.5 h-3.5 text-[#34D399]" />
              <span>{game.minPlayers}–{game.maxPlayers} Joueurs</span>
            </div>
            <div className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-white/10 border border-white/15 text-[#FBBF24]">
              <Clock className="w-3.5 h-3.5 text-[#FBBF24]" />
              <span>{game.durationMinutes}</span>
            </div>
            <div className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-white/10 border border-white/15 text-[#38BDF8]">
              <Smartphone className="w-3.5 h-3.5" />
              <span>Manettes Mobiles</span>
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
              className="flex items-center space-x-2.5 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-[#10B981] via-[#059669] to-[#047857] text-white font-black text-sm uppercase tracking-wider shadow-[0_0_30px_rgba(16,185,129,0.6)] transition-all duration-200 outline-none
                         focus:scale-110 focus:bg-white focus:text-[#064E3B] focus:ring-4 focus:ring-[#FBBF24] focus:shadow-[0_0_40px_rgba(251,191,36,0.85)]"
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
              <span>Détails & Règles</span>
            </button>
          </div>
        </div>

        {/* Center / Right: 3D Character Hero + Golden Sparkle Box + 3 Preview Cards */}
        <div className="flex flex-col items-center lg:items-end space-y-4">
          {/* Character Render & Golden Sparkle Box */}
          <div className="relative w-64 h-64 lg:w-72 lg:h-72 rounded-3xl overflow-hidden shadow-2xl border border-white/20">
            <img
              src="https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=85"
              alt="Emerald Heroine"
              className="w-full h-full object-cover object-top filter brightness-105"
            />
            {/* Ambient golden rim overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A1612] via-transparent to-transparent" />

            {/* Floating Golden Sparkle Badge (From User's Reference) */}
            <div className="absolute bottom-3 left-3 w-12 h-12 rounded-2xl sparkle-gold-box flex items-center justify-center animate-bounce">
              <Sparkles className="w-6 h-6 text-[#FBBF24] fill-current" />
            </div>
          </div>

          {/* 3 Bottom Scene Variations (Exact Reference Layout) */}
          <div className="flex items-center space-x-3">
            {previewScenes.map((sc) => (
              <div
                key={sc.id}
                className="w-20 h-14 lg:w-24 lg:h-16 rounded-xl overflow-hidden border border-white/20 shadow-md relative group cursor-pointer hover:scale-105 transition-transform"
              >
                <img src={sc.img} alt={sc.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <span className="absolute bottom-1 left-1.5 text-[8px] font-black text-white truncate max-w-[80px]">
                  {sc.title}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
