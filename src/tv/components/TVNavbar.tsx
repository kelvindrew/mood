import React from 'react';
import { useGame } from '../../context/GameContext';
import { Radio, Settings } from 'lucide-react';
import { audio } from '../../services/audio';
import { WindowsSpinner } from '../../components/WindowsSpinner';

export const TVNavbar: React.FC = () => {
  const { room, setTvView, setSelectedCategory, connectionState } = useGame();

  const goHome = () => {
    audio.playSelect();
    setSelectedCategory('all');
    setTvView('home');
  };

  return (
    <header className="mood-tv-navbar fixed inset-x-0 top-0 z-40 flex h-[clamp(68px,8vh,92px)] items-center justify-between gap-5 px-[5vw] select-none">
      <button
        data-tv-focus
        tabIndex={0}
        onClick={goHome}
        className="mood-tv-brand relative inline-flex flex-shrink-0 items-center gap-2.5 rounded-xl px-1 py-1 text-left outline-none"
        aria-label="MOOD TV, accueil"
      >
        <span className="font-display text-3xl font-black tracking-[-0.07em] text-white md:text-4xl">MOOD</span>
        <span className="rounded-md border border-lime-200/20 bg-lime-200/[0.08] px-2 py-1 text-[9px] font-black uppercase tracking-[0.16em] text-lime-200">TV</span>
      </button>

      <div className="relative flex flex-shrink-0 items-center gap-2.5">
        {(connectionState === 'connecting' || connectionState === 'reconnecting') && (
          <div className="mood-tv-status hidden items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-lime-200 sm:flex" role="status">
            <WindowsSpinner size="xs" className="text-lime-300" />
            <span>{connectionState === 'connecting' ? 'Connexion…' : 'Reconnexion…'}</span>
          </div>
        )}

        {room && (
          <div className="mood-tv-room inline-flex items-center gap-2 rounded-xl px-3 py-2.5" aria-label={'Salon ' + room.code + ', ' + room.players.length + ' joueurs'}>
            <span className="h-2 w-2 rounded-full bg-lime-300" />
            <span className="font-mono text-sm font-black tracking-wider text-white">{room.code}</span>
            <span className="inline-flex items-center gap-1 border-l border-white/15 pl-2 text-xs font-bold text-white/60"><Radio className="h-3.5 w-3.5 text-lime-200" />{room.players.length}</span>
          </div>
        )}

        <button
          data-tv-focus
          tabIndex={0}
          onClick={() => {
            audio.playSelect();
            setTvView('admin');
          }}
          className="mood-tv-icon-button relative flex h-11 w-11 items-center justify-center rounded-xl outline-none"
          title="Réglages & Administration"
          aria-label="Réglages et administration"
        >
          <Settings className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
};
