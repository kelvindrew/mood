import React, { useState, useEffect, useRef } from 'react';
import { useGame } from '../../context/GameContext';
import { Gamepad2, ArrowRight, Camera, Sparkles, User, Eye, Volume2, Shield } from 'lucide-react';
import { triggerHaptic, hapticPatterns } from '../components/HapticFeedback';
import { audio } from '../../services/audio';
import { BuzzerSoundType } from '../../types/game';

const AVATAR_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];

const BUZZER_SOUNDS: { id: BuzzerSoundType; label: string }[] = [
  { id: 'arcade', label: 'Arcade' },
  { id: 'klaxon', label: 'Klaxon' },
  { id: 'laser', label: 'Laser' },
  { id: 'airhorn', label: 'Airhorn' },
  { id: 'gong', label: 'Gong' },
];

interface MobileJoinViewProps {
  defaultRoomCode?: string;
}

export const MobileJoinView: React.FC<MobileJoinViewProps> = ({ defaultRoomCode = '' }) => {
  const { joinRoom } = useGame();
  const [code, setCode] = useState(defaultRoomCode);
  const [name, setName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_LETTERS[0]);
  const [selfieImage, setSelfieImage] = useState<string | undefined>(undefined);
  const [buzzerSound, setBuzzerSound] = useState<BuzzerSoundType>('arcade');
  const [isSpectator, setIsSpectator] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const roomParam = params.get('room');
      if (roomParam) {
        setCode(roomParam);
      }
    }
  }, []);

  const handleSelfieCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setSelfieImage(base64);
        triggerHaptic(hapticPatterns.success);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePreviewBuzzer = (sound: BuzzerSoundType) => {
    setBuzzerSound(sound);
    triggerHaptic(hapticPatterns.tap);
    audio.playCustomBuzzer(sound);
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanCode = code.trim().toUpperCase();
    const cleanName = name.trim() || `Joueur ${Math.floor(10 + Math.random() * 89)}`;

    if (cleanCode.length !== 4) {
      setError('Veuillez entrer un code de salon valide à 4 caractères.');
      triggerHaptic(hapticPatterns.error);
      return;
    }

    setIsLoading(true);
    triggerHaptic(hapticPatterns.tap);
    audio.playSelect();

    const res = await joinRoom(cleanCode, cleanName, selectedAvatar, isSpectator);
    setIsLoading(false);

    if (!res.success) {
      setError(res.error || 'Impossible de rejoindre le salon');
      triggerHaptic(hapticPatterns.error);
    } else {
      triggerHaptic(hapticPatterns.success);
    }
  };

  return (
    <div className="min-h-screen p-5 flex flex-col justify-between bg-background text-white select-none">
      {/* Top Brand Banner */}
      <div className="text-center pt-2 space-y-1.5 animate-scale-in">
        <div className="w-14 h-14 mx-auto rounded-3xl bg-gradient-to-tr from-brand-red via-brand-accent to-red-500 flex items-center justify-center shadow-glow-red border border-white/20">
          <Gamepad2 className="w-8 h-8 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-black font-display tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-white via-red-100 to-brand-accent">
            PLAYFLIX
          </h1>
          <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">
            Manette Intelligente Sans Fil
          </p>
        </div>
      </div>

      {/* Main Join Form */}
      <form onSubmit={handleJoin} className="my-auto space-y-4">
        {/* Room Code */}
        <div>
          <label className="text-[11px] font-black text-gray-300 uppercase tracking-wider block mb-1">
            Code du Salon TV (4 caractères)
          </label>
          <input
            type="text"
            maxLength={4}
            autoCapitalize="characters"
            autoCorrect="off"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="Ex: 4827"
            className="w-full text-center py-3.5 px-4 rounded-2xl bg-surface-card border-2 border-brand-red/60 text-3xl font-black font-mono tracking-widest text-white placeholder-gray-600 focus:outline-none focus:border-brand-red focus:shadow-glow-red uppercase"
            required
          />
        </div>

        {/* Player Name */}
        <div>
          <label className="text-[11px] font-black text-gray-300 uppercase tracking-wider block mb-1">
            Votre Pseudo
          </label>
          <input
            type="text"
            maxLength={15}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Entrez votre prénom ou pseudo"
            className="w-full py-3 px-4 rounded-2xl bg-surface-card border border-white/15 text-sm font-bold text-white placeholder-gray-500 focus:outline-none focus:border-white/40 shadow-inner"
            required
          />
        </div>

        {/* Avatar or Selfie Camera */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-[11px] font-black text-gray-300 uppercase tracking-wider">
              Avatar ou Photo Selfie
            </label>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-[11px] font-bold text-brand-gold flex items-center space-x-1"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>{selfieImage ? 'Changer Photo' : 'Prendre Selfie'}</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="user"
              onChange={handleSelfieCapture}
              className="hidden"
            />
          </div>

          {selfieImage ? (
            <div className="flex items-center space-x-3 p-2 rounded-2xl bg-surface-card border border-brand-gold/40">
              <img src={selfieImage} alt="Selfie" className="w-12 h-12 rounded-xl object-cover border-2 border-brand-gold shadow-md" />
              <span className="text-xs font-bold text-emerald-400">Photo Selfie capturée pour la TV</span>
            </div>
          ) : (
            <div className="grid grid-cols-6 gap-1.5 p-2 bg-surface-card rounded-2xl border border-white/10 shadow-inner">
              {AVATAR_LETTERS.map((av) => (
                <button
                  key={av}
                  type="button"
                  onClick={() => {
                    triggerHaptic(hapticPatterns.tap);
                    setSelectedAvatar(av);
                  }}
                  className={`w-10 h-10 rounded-xl text-base font-black flex items-center justify-center transition-all ${
                    selectedAvatar === av
                      ? 'bg-brand-red scale-110 shadow-glow-red ring-2 ring-white text-white'
                      : 'bg-surface-light text-gray-300 hover:bg-surface-light/80'
                  }`}
                >
                  {av}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Custom Buzzer Sound Selector */}
        <div>
          <label className="text-[11px] font-black text-gray-300 uppercase tracking-wider block mb-1">
            Son de Buzzer Personnel
          </label>
          <div className="grid grid-cols-5 gap-1.5">
            {BUZZER_SOUNDS.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => handlePreviewBuzzer(s.id)}
                className={`py-2 rounded-xl text-[10px] font-bold flex flex-col items-center justify-center space-y-0.5 border transition-all ${
                  buzzerSound === s.id
                    ? 'bg-brand-gold text-background border-brand-gold font-black shadow-md scale-105'
                    : 'bg-surface-card border-white/10 text-gray-400'
                }`}
              >
                <span>{s.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Spectator Mode */}
        <div className="flex items-center justify-between p-3 rounded-2xl bg-surface-card border border-white/10">
          <div className="flex items-center space-x-2">
            <Eye className="w-4 h-4 text-brand-purple" />
            <span className="text-xs font-bold text-white">Mode Spectateur</span>
          </div>
          <input
            type="checkbox"
            checked={isSpectator}
            onChange={(e) => setIsSpectator(e.target.checked)}
            className="w-5 h-5 accent-brand-red rounded cursor-pointer"
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500 text-rose-300 text-xs font-bold text-center">
            {error}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-brand-red to-brand-accent hover:from-red-600 hover:to-brand-red text-white font-black text-base shadow-glow-red active:scale-95 transition-all flex items-center justify-center space-x-2 border border-white/20"
        >
          <span>{isLoading ? 'Connexion en cours...' : 'REJOINDRE LA PARTIE'}</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </form>

      <div className="text-center text-[11px] text-gray-400 pb-1 font-medium">
        Secouez votre smartphone pendant le jeu pour lancer les dés
      </div>
    </div>
  );
};
