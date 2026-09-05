import React, { useState, useEffect } from 'react';
import {
  fourPicsProgress,
  FourPicsProgressState,
} from '../../services/fourPicsProgressService';
import {
  LEVEL_DEFINITIONS,
  LevelDefinition,
} from '../../types/fourPicsConstants';
import {
  Trophy,
  Star,
  Lock,
  Play,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Award,
  Sparkles,
  Zap,
  RotateCcw,
} from 'lucide-react';
import { audio } from '../../services/audio';
import { playSoundFX } from '../../engine/PlaySoundFX';
import { tvNav } from '../../services/tvNavigation';
import { useTvBack } from '../hooks/useTvNav';

interface FourPicsStageSelectorTVProps {
  onSelectStage: (level: number, stageNumber: number) => void;
  onStartRandomMode: () => void;
  onBack: () => void;
}

export const FourPicsStageSelectorTV: React.FC<FourPicsStageSelectorTVProps> = ({
  onSelectStage,
  onStartRandomMode,
  onBack,
}) => {
  const [progress, setProgress] = useState<FourPicsProgressState>(fourPicsProgress.getState());
  const [selectedLevel, setSelectedLevel] = useState<number>(progress.unlockedLevel || 1);
  const [stagePage, setStagePage] = useState<number>(0); // 0 = stages 1-50, 1 = stages 51-100
  const [confirmReset, setConfirmReset] = useState<boolean>(false);

  // M5 — Back télécommande = retour au plateau
  useTvBack(onBack);

  useEffect(() => {
    tvNav.setInitialFocus('button');
  }, [selectedLevel, stagePage]);

  const levelStats = fourPicsProgress.getLevelStats(selectedLevel);
  const globalStats = fourPicsProgress.getGlobalStats();

  const handleLevelClick = (lvl: number) => {
    if (lvl > progress.unlockedLevel) {
      playSoundFX.playHop();
      return;
    }
    audio.playSelect();
    setSelectedLevel(lvl);
    setStagePage(0);
  };

  const handleStageClick = (stageNum: number) => {
    const isUnlocked = fourPicsProgress.isStageUnlocked(selectedLevel, stageNum);
    if (!isUnlocked) {
      playSoundFX.playHop();
      return;
    }
    audio.playSelect();
    onSelectStage(selectedLevel, stageNum);
  };

  const handleStartFromBeginning = () => {
    audio.playSelect();
    onSelectStage(1, 1);
  };

  const handleResetProgress = () => {
    audio.playSelect();
    fourPicsProgress.resetProgress();
    setProgress(fourPicsProgress.getState());
    setSelectedLevel(1);
    setStagePage(0);
    setConfirmReset(false);
    onSelectStage(1, 1);
  };

  const stagesToDisplay = Array.from({ length: 50 }, (_, i) => stagePage * 50 + i + 1);

  return (
    <div className="relative min-h-screen bg-[#07090E] text-white px-[4vw] py-4 flex flex-col justify-between select-none">
      {/* 1. Header: Back button, Title, Global Stats & Action Buttons */}
      <header className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center space-x-3">
          <button
            data-tv-focus
            tabIndex={0}
            onClick={() => {
              audio.playBack();
              onBack();
            }}
            className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-[#101420] border border-white/15 hover:bg-white hover:text-black focus:bg-white focus:text-black transition-all outline-none"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="font-black text-xs uppercase">Retour</span>
          </button>

          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 text-black text-[10px] font-black uppercase tracking-wider shadow-sm">
                4 IMAGES 1 MOT • CAMPAGNE
              </span>
              <span className="text-xs font-bold text-amber-400">
                ⭐ {globalStats.totalStars} ÉTOILES • {globalStats.totalCompleted}/1 000 STAGES
              </span>
            </div>
            <h1 className="text-2xl font-black font-display text-white tracking-tight mt-0.5">
              Carte & Progression des Niveaux
            </h1>
          </div>
        </div>

        {/* Right side: Quick Action Buttons */}
        <div className="flex items-center space-x-3">
          <button
            data-tv-focus
            tabIndex={0}
            onClick={handleStartFromBeginning}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-black font-display font-black text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:scale-105 active:scale-95 transition-all outline-none focus:ring-2 focus:ring-white"
            title="Reprendre au tout premier niveau"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>DÉBUTER AU NIVEAU 1</span>
          </button>

          <button
            data-tv-focus
            tabIndex={0}
            onClick={() => setConfirmReset(true)}
            className="flex items-center space-x-1.5 px-3 py-2.5 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 hover:bg-rose-600 hover:text-white font-bold text-xs uppercase transition-all outline-none"
            title="Réinitialiser tous les niveaux à zéro"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>RÉINITIALISER</span>
          </button>

          <button
            data-tv-focus
            tabIndex={0}
            onClick={() => {
              audio.playSelect();
              onStartRandomMode();
            }}
            className="flex items-center space-x-1.5 px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white font-bold text-xs uppercase transition-all outline-none"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>ALÉATOIRE</span>
          </button>
        </div>
      </header>

      {/* 2. Main Content: Left Level Picker (1-10) + Right 50 Stages Grid */}
      <main className="grid grid-cols-12 gap-5 my-auto py-3">
        {/* Left Column: 10 Levels Carousel / List */}
        <div className="col-span-4 flex flex-col space-y-2 overflow-y-auto max-h-[66vh] pr-2">
          {LEVEL_DEFINITIONS.map((def: LevelDefinition) => {
            const isUnlocked = def.level <= progress.unlockedLevel;
            const isSelected = def.level === selectedLevel;
            const lvlStat = fourPicsProgress.getLevelStats(def.level);

            return (
              <button
                key={`lvl_btn_${def.level}`}
                data-tv-focus
                tabIndex={0}
                disabled={!isUnlocked}
                onClick={() => handleLevelClick(def.level)}
                className={`p-3 rounded-xl border transition-all flex items-center justify-between text-left outline-none ${
                  isSelected
                    ? 'bg-[#181F33] border-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.3)] scale-102 ring-2 ring-amber-400/40'
                    : isUnlocked
                    ? 'bg-[#101420] border-white/10 hover:border-white/30 focus:border-white'
                    : 'bg-[#07090E]/60 border-white/5 opacity-40 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center font-black font-mono text-sm border shadow-sm"
                    style={{ backgroundColor: `${def.color}25`, borderColor: def.color, color: def.color }}
                  >
                    {isUnlocked ? def.level : <Lock className="w-3.5 h-3.5 text-gray-500" />}
                  </div>

                  <div>
                    <div className="flex items-center space-x-1.5">
                      <h3 className="font-black text-xs text-white">NIVEAU {def.level}</h3>
                      <span
                        className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase"
                        style={{ backgroundColor: `${def.color}30`, color: def.color }}
                      >
                        {def.name}
                      </span>
                    </div>
                    <span className="text-[10px] text-gray-400 font-medium">
                      {isUnlocked ? `${lvlStat.completedCount}/100 Stages • ⭐ ${lvlStat.starsCount}` : 'Terminez le niveau précédent'}
                    </span>
                  </div>
                </div>

                {isUnlocked && (
                  <span className="font-mono font-black text-xs text-emerald-400">
                    {lvlStat.percent}%
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Right Column: 100 Stages Interactive Grid */}
        <div className="col-span-8 flex flex-col justify-between p-5 rounded-2xl bg-[#101420] border border-white/15 shadow-xl">
          <div>
            {/* Level Title & Pagination */}
            <div className="flex items-center justify-between border-b border-white/10 pb-2.5 mb-3">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">
                  NIVEAU {selectedLevel} SUR 10
                </span>
                <h2 className="text-xl font-black font-display text-white">
                  Stages {stagePage * 50 + 1} à {stagePage * 50 + 50}
                </h2>
              </div>

              {/* Pagination toggle (Stages 1-50 / 51-100) */}
              <div className="flex items-center space-x-2">
                <button
                  data-tv-focus
                  tabIndex={0}
                  onClick={() => setStagePage(0)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                    stagePage === 0
                      ? 'bg-white text-black shadow-md'
                      : 'bg-white/10 text-gray-300 hover:text-white'
                  }`}
                >
                  Stages 1-50
                </button>
                <button
                  data-tv-focus
                  tabIndex={0}
                  onClick={() => setStagePage(1)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                    stagePage === 1
                      ? 'bg-white text-black shadow-md'
                      : 'bg-white/10 text-gray-300 hover:text-white'
                  }`}
                >
                  Stages 51-100
                </button>
              </div>
            </div>

            {/* 50 Stages Grid (10 columns x 5 rows) */}
            <div className="grid grid-cols-10 gap-2">
              {stagesToDisplay.map((stageNum) => {
                const isUnlocked = fourPicsProgress.isStageUnlocked(selectedLevel, stageNum);
                const stgProg = fourPicsProgress.getStageProgress(selectedLevel, stageNum);
                const isCurrent =
                  selectedLevel === progress.unlockedLevel && stageNum === progress.unlockedStage;

                return (
                  <button
                    key={`stg_btn_${selectedLevel}_${stageNum}`}
                    data-tv-focus
                    tabIndex={0}
                    disabled={!isUnlocked}
                    onClick={() => handleStageClick(stageNum)}
                    className={`h-13 rounded-xl border flex flex-col items-center justify-center transition-all relative outline-none ${
                      isCurrent
                        ? 'bg-gradient-to-tr from-emerald-500 to-teal-400 border-white text-black font-black shadow-[0_0_20px_rgba(16,185,129,0.7)] scale-105 animate-pulse'
                        : stgProg.completed
                        ? 'bg-[#181F33] border-amber-400/70 text-white hover:scale-105'
                        : isUnlocked
                        ? 'bg-[#121726] border-white/20 text-gray-300 hover:border-white hover:text-white'
                        : 'bg-[#0A0D14] border-white/5 text-gray-600 opacity-40 cursor-not-allowed'
                    }`}
                  >
                    <span className="font-mono font-black text-xs leading-none">
                      {isUnlocked ? stageNum : <Lock className="w-3 h-3 text-gray-600" />}
                    </span>

                    {/* Golden Stars display */}
                    {stgProg.completed && (
                      <div className="flex items-center space-x-0.5 mt-0.5">
                        {Array.from({ length: 3 }).map((_, sIdx) => (
                          <Star
                            key={`star_${stageNum}_${sIdx}`}
                            className={`w-2.5 h-2.5 ${
                              sIdx < stgProg.stars ? 'fill-amber-400 text-amber-400' : 'text-gray-600'
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Level Summary Footer */}
          <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs text-gray-400 font-bold">
            <span>
              Complétion du niveau : <strong className="text-white">{levelStats.completedCount}/100</strong>
            </span>
            <span className="text-amber-400 font-mono font-black">
              ⭐ {levelStats.starsCount} / 300 étoiles
            </span>
          </div>
        </div>
      </main>

      {/* Confirmation Modal for Resetting Progress */}
      {confirmReset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md select-none">
          <div className="max-w-md w-full p-6 rounded-2xl bg-[#101420] border border-rose-500/40 text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
              <RotateCcw className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black font-display text-white">
              Réinitialiser la progression ?
            </h3>
            <p className="text-xs text-gray-300">
              Voulez-vous réinitialiser tous les niveaux à zéro et recommencer l'aventure 4 Images 1 Mot depuis le Niveau 1, Stage 1 ?
            </p>
            <div className="flex items-center justify-center space-x-3 pt-2">
              <button
                onClick={() => setConfirmReset(false)}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs"
              >
                Annuler
              </button>
              <button
                onClick={handleResetProgress}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs uppercase shadow-lg"
              >
                Confirmer le Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
