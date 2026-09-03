import React from 'react';
import { GameCatalogItem } from '../../types/game';
import { Users, Clock, Sparkles, Play } from 'lucide-react';
import { audio } from '../../services/audio';

interface TVGameCardProps {
  game: GameCatalogItem;
  onSelect: (game: GameCatalogItem) => void;
  onPlayDirect: (game: GameCatalogItem) => void;
}

export const TVGameCard: React.FC<TVGameCardProps> = ({ game, onSelect, onPlayDirect }) => {
  return (
    <div
      data-tv-focus
      tabIndex={0}
      onClick={() => {
        audio.playSelect();
        onSelect(game);
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          audio.playSelect();
          onSelect(game);
        }
      }}
      className="group relative w-full h-56 rounded-2xl overflow-hidden cursor-pointer bg-[#0D111A] border border-white/10 shadow-xl transition-all duration-200 transform outline-none
                 focus:scale-105 focus:z-30 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/60 focus:shadow-[0_0_35px_rgba(16,185,129,0.6)] hover:scale-102 hover:border-white/30 flex flex-col justify-between"
    >
      {/* Background Cover Image with Hover Zoom */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <img
          src={game.coverImage || game.heroImage}
          alt={game.title}
          loading="lazy"
          className="w-full h-full object-cover object-center transform group-hover:scale-110 group-focus:scale-110 transition-transform duration-500 filter brightness-90"
        />
        {/* Cinematic Vignette Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#07090E] via-[#07090E]/65 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-transparent" />
      </div>

      {/* Top Badges Bar */}
      <div className="relative z-10 p-3.5 flex items-center justify-between">
        {game.badge ? (
          <span className="px-2.5 py-1 rounded-full bg-emerald-500/90 text-black text-[10px] font-black uppercase tracking-wider shadow-md flex items-center space-x-1">
            <Sparkles className="w-3 h-3 fill-current" />
            <span>{game.badge}</span>
          </span>
        ) : (
          <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-gray-300 text-[10px] font-bold uppercase">
            {game.category}
          </span>
        )}

        <div className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-[11px] font-black text-emerald-400 shadow-sm">
          <Users className="w-3 h-3" />
          <span>{game.minPlayers}-{game.maxPlayers}</span>
        </div>
      </div>

      {/* Bottom Content & Sleek Action Button */}
      <div className="relative z-10 p-4 flex flex-col space-y-2 bg-gradient-to-t from-[#07090E] via-[#07090E]/90 to-transparent">
        <div>
          <h4 className="text-lg font-black font-display text-white tracking-wide leading-tight group-focus:text-emerald-400 group-hover:text-emerald-300 transition-colors truncate drop-shadow">
            {game.title}
          </h4>
          <div className="flex items-center space-x-2 text-[11px] text-gray-400 font-medium mt-0.5">
            <span className="flex items-center space-x-1 text-amber-400 font-bold">
              <Clock className="w-3 h-3" />
              <span>{game.durationMinutes}</span>
            </span>
            <span>•</span>
            <span className="truncate">{game.tagline || game.difficulty}</span>
          </div>
        </div>

        {/* Footer Buttons Bar */}
        <div className="pt-2 border-t border-white/10 flex items-center justify-between">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider group-focus:text-white">
            Voir détails
          </span>

          <button
            onClick={(e) => {
              e.stopPropagation();
              audio.playSelect();
              onPlayDirect(game);
            }}
            className="flex items-center space-x-1.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-black font-display font-black text-xs uppercase tracking-wider shadow-md transition-all hover:scale-105 active:scale-95 outline-none focus:ring-2 focus:ring-white"
          >
            <Play className="w-3 h-3 fill-current" />
            <span>JOUER</span>
          </button>
        </div>
      </div>
    </div>
  );
};
