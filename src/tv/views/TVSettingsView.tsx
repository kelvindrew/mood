import React, { useState, useEffect } from 'react';
import { useGame } from '../../context/GameContext';
import { Settings, Volume2, Tv, Wifi, Shield, Cpu, Smartphone, Check } from 'lucide-react';
import { audio } from '../../services/audio';
import { tvNav } from '../../services/tvNavigation';
import { useTvBack } from '../hooks/useTvNav';

export const TVSettingsView: React.FC = () => {
  const { serverLanIp, setTvView } = useGame();
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [tvPlatform, setTvPlatform] = useState('Hisense VIDAA OS');
  const [resolution, setResolution] = useState('4K Ultra HD (3840x2160)');

  // M5 — Back télécommande = retour à l'accueil
  useTvBack(() => {
    audio.playBack();
    setTvView('home');
  });

  useEffect(() => {
    tvNav.setInitialFocus('button');
  }, []);

  const handleToggleSound = () => {
    const muted = audio.toggleMute();
    setSoundEnabled(!muted);
  };

  return (
    <div className="min-h-screen pt-24 px-12 pb-24 select-none flex flex-col space-y-8 max-w-5xl">
      <div>
        <span className="text-xs font-black uppercase text-brand-red tracking-widest">CONFIGURATION DU SYSTÈME</span>
        <h1 className="text-3xl font-black font-display text-white mt-1">Paramètres Smart TV & Réseau</h1>
      </div>

      <div className="space-y-6">

        {/* Audio Card */}
        <div className="p-6 rounded-3xl bg-surface-card border border-white/15 backdrop-blur-xl shadow-xl flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-brand-red/20 border border-brand-red/40 flex items-center justify-center">
              <Volume2 className="w-6 h-6 text-brand-red" />
            </div>
            <div>
              <h3 className="text-lg font-black font-display text-white">Effets Sonores & Ambiance</h3>
              <p className="text-xs text-gray-400">Sons de télécommande, lancers de dés et fanfares de victoire</p>
            </div>
          </div>

          <button
            data-tv-focus
            tabIndex={0}
            onClick={handleToggleSound}
            className={`px-6 py-3 rounded-2xl font-black text-xs border transition-all outline-none ${
              soundEnabled
                ? 'bg-emerald-600 text-white border-emerald-500 shadow-glow-emerald'
                : 'bg-surface-light text-gray-400 border-white/10'
            }`}
          >
            {soundEnabled ? 'ACTIVÉ (ON)' : 'MUTÉ (OFF)'}
          </button>
        </div>

        {/* Smart TV Multiplatform Engine */}
        <div className="p-6 rounded-3xl bg-surface-card border border-white/15 backdrop-blur-xl shadow-xl space-y-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-brand-cyan/20 border border-brand-cyan/40 flex items-center justify-center">
              <Tv className="w-6 h-6 text-brand-cyan" />
            </div>
            <div>
              <h3 className="text-lg font-black font-display text-white">Plateforme Smart TV Détectée</h3>
              <p className="text-xs text-gray-400">Couche d'abstraction universelle HTML5 / W3C Smart TV</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
            {[
              'Hisense VIDAA OS',
              'Google TV / Android TV',
              'Samsung Tizen',
              'LG webOS',
            ].map((os) => (
              <button
                key={os}
                data-tv-focus
                tabIndex={0}
                onClick={() => setTvPlatform(os)}
                className={`p-3.5 rounded-2xl border text-left text-xs font-bold transition-all outline-none ${
                  tvPlatform === os
                    ? 'bg-brand-cyan/20 border-brand-cyan text-white shadow-glow-cyan'
                    : 'bg-surface-light border-white/10 text-gray-400 hover:text-white'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-[10px] text-gray-400">OS TV</span>
                  {tvPlatform === os && <Check className="w-3.5 h-3.5 text-brand-cyan" />}
                </div>
                <div className="font-display font-black text-sm text-white">{os}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Network & Local Host Information */}
        <div className="p-6 rounded-3xl bg-surface-card border border-white/15 backdrop-blur-xl shadow-xl space-y-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
              <Wifi className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-lg font-black font-display text-white">Réseau Local (Wi-Fi Domestique)</h3>
              <p className="text-xs text-gray-400">Adresse IP utilisée pour connecter les smartphones instantanément</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-surface-dark border border-white/10 flex items-center justify-between">
            <div className="text-xs">
              <span className="text-gray-400 block">IP Locale Smart TV & Serveur :</span>
              <span className="font-mono font-black text-emerald-400 text-base">{serverLanIp}</span>
            </div>
            <div className="flex items-center space-x-2 text-xs font-bold text-emerald-400">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span>Prêt pour connexions mobiles</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
