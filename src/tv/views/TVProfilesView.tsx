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
        <span className="text-xs font-black uppercase text-brand-gold tracking-widest">SALON & JOUEURS</span>
        <h1 className="text-3xl font-black font-display text-white mt-1">Profils & Trophées du Salon</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Profile Card */}
        <div className="lg:col-span-4 p-8 rounded-3xl bg-surface-card border border-white/15 backdrop-blur-xl shadow-2xl flex flex-col items-center text-center space-y-4">
          <div className="relative">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-brand-red to-brand-gold flex items-center justify-center text-6xl shadow-glow-gold">
              {profile.avatar}
            </div>
            <span className="absolute -bottom-2 -right-2 px-3 py-1 rounded-full bg-brand-gold text-background font-black text-xs">
              NIV. {profile.level}
            </span>
          </div>

          <div>
            <h2 className="text-2xl font-black font-display text-white">{profile.name}</h2>
            <span className="text-xs font-bold text-gray-400">Joueur Principal Smart TV</span>
          </div>

          {/* XP Bar */}
          <div className="w-full space-y-1.5 pt-2">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-gray-400">Progression Niv. {profile.level + 1}</span>
              <span className="text-brand-gold">{profile.xp} / {profile.nextLevelXp} XP</span>
            </div>
            <div className="w-full h-3 rounded-full bg-surface-dark overflow-hidden border border-white/10">
              <div className="h-full bg-gradient-to-r from-brand-red to-brand-gold rounded-full" style={{ width: '85%' }} />
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 gap-3 w-full pt-4">
            <div className="p-3 rounded-2xl bg-surface-light border border-white/5 text-center">
              <div className="font-mono font-black text-xl text-white">{profile.gamesPlayed}</div>
              <div className="text-[10px] font-bold text-gray-400 uppercase">Parties Jouées</div>
            </div>
            <div className="p-3 rounded-2xl bg-surface-light border border-white/5 text-center">
              <div className="font-mono font-black text-xl text-emerald-400">{profile.wins}</div>
              <div className="text-[10px] font-bold text-gray-400 uppercase">Victoires</div>
            </div>
          </div>
        </div>

        {/* Right Trophies & History */}
        <div className="lg:col-span-8 space-y-6">
          <div className="p-6 rounded-3xl bg-surface-card border border-white/15 backdrop-blur-xl shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Trophy className="w-5 h-5 text-brand-gold" />
                <h3 className="text-lg font-black font-display text-white">Trophées Débloqués</h3>
              </div>
              <span className="text-xs font-bold text-brand-gold">4 / 5 Trophées</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {profile.trophies.map((tr) => (
                <div
                  key={tr.id}
                  className={`flex items-center space-x-3.5 p-4 rounded-2xl border transition-all ${
                    tr.unlocked
                      ? 'bg-surface-light border-brand-gold/30 text-white'
                      : 'bg-surface-dark/40 border-white/5 text-gray-600 opacity-60'
                  }`}
                >
                  <div className="text-3xl filter drop-shadow">{tr.icon}</div>
                  <div>
                    <div className="font-bold text-sm text-white">{tr.title}</div>
                    <div className="text-xs text-gray-400">{tr.desc}</div>
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
