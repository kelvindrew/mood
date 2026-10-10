import React, { useEffect } from 'react';
import { useGame } from '../../context/GameContext';
import { Trophy, Award, Star, Flame, Shield, UserCheck, Gamepad2 } from 'lucide-react';
import { audio } from '../../services/audio';
import { tvNav } from '../../services/tvNavigation';
import { useTvBack } from '../hooks/useTvNav';

export const TVProfilesView: React.FC = () => {
  const { setTvView } = useGame();

  // M5 — Back télécommande = retour à l'accueil
  useTvBack(() => {
    audio.playBack();
    setTvView('home');
  });

  useEffect(() => {
    tvNav.setInitialFocus('button');
  }, []);

  const profile = {
    name: 'Kelvin',
    avatar: '👑',
    level: 14,
    xp: 4250,
    nextLevelXp: 5000,
    gamesPlayed: 48,
    wins: 31,
    winRate: '65%',
    favoriteGame: 'Ludo Deluxe',
    trophies: [
      { id: '1', title: 'Maître du Dé', desc: 'A fait trois 6 d’affilée au Ludo', icon: '🎲', unlocked: true },
      { id: '2', title: 'As des Mots', desc: 'A posé un mot de 7 lettres au Scrabble', icon: '📖', unlocked: true },
      { id: '3', title: 'Roi du Uno', desc: 'A remporté une manche sans piocher', icon: '🃏', unlocked: true },
      { id: '4', title: 'Cerveau Turbo', desc: 'A répondu en moins d’une seconde au Quiz', icon: '⚡', unlocked: true },
      { id: '5', title: 'Grand Chelem', desc: 'A remporté 5 parties consécutives', icon: '🏆', unlocked: false },
    ],
  };

  return (
    <div className="min-h-screen pt-24 px-12 pb-24 select-none flex flex-col space-y-8">
      <div>
        <span className="text-xs font-black uppercase text-amber-400 tracking-widest">SALON & JOUEURS</span>
        <h1 className="text-3xl font-black font-display text-white mt-1">Profils & Trophées du Salon</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Profile Card */}
        <div className="lg:col-span-4 p-8 rounded-3xl bg-slate-900/90 border border-slate-700/80 shadow-2xl flex flex-col items-center text-center space-y-4">
          <div className="relative">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-cyan-500 to-amber-500 flex items-center justify-center text-6xl shadow-[0_0_25px_rgba(245,158,11,0.3)]">
              {profile.avatar}
            </div>
            <span className="absolute -bottom-2 -right-2 px-3 py-1 rounded-full bg-amber-400 text-slate-950 font-black text-xs">
              NIV. {profile.level}
            </span>
          </div>

          <div>
            <h2 className="text-2xl font-black font-display text-white">{profile.name}</h2>
            <span className="text-xs font-bold text-slate-400">Joueur Principal Smart TV</span>
          </div>

          {/* XP Bar */}
          <div className="w-full space-y-1.5 pt-2">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-slate-400">Progression Niv. {profile.level + 1}</span>
              <span className="text-amber-400">{profile.xp} / {profile.nextLevelXp} XP</span>
            </div>
            <div className="w-full h-3 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
              <div className="h-full bg-gradient-to-r from-cyan-400 to-amber-400 rounded-full" style={{ width: '85%' }} />
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 gap-3 w-full pt-4">
            <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/60 text-center">
              <div className="font-mono font-black text-xl text-white">{profile.gamesPlayed}</div>
              <div className="text-[10px] font-bold text-slate-400 uppercase">Parties Jouées</div>
            </div>
            <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/60 text-center">
              <div className="font-mono font-black text-xl text-emerald-400">{profile.wins}</div>
              <div className="text-[10px] font-bold text-slate-400 uppercase">Victoires</div>
            </div>
          </div>
        </div>

        {/* Right Trophies & History */}
        <div className="lg:col-span-8 space-y-6">
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-700/80 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Trophy className="w-5 h-5 text-amber-400" />
                <h3 className="text-lg font-black font-display text-white">Trophées Débloqués</h3>
              </div>
              <span className="text-xs font-bold text-amber-400">4 / 5 Trophées</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {profile.trophies.map((tr) => (
                <div
                  key={tr.id}
                  className={`flex items-center space-x-3.5 p-4 rounded-2xl border transition-all ${
                    tr.unlocked
                      ? 'bg-slate-800/80 border-amber-400/30 text-white'
                      : 'bg-slate-950/60 border-slate-800 text-slate-600 opacity-60'
                  }`}
                >
                  <div className="text-3xl filter drop-shadow">{tr.icon}</div>
                  <div>
                    <div className="font-bold text-sm text-white">{tr.title}</div>
                    <div className="text-xs text-slate-400">{tr.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
