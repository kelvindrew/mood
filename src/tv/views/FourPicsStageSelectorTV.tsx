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
} from 'lucide-react';
import { audio } from '../../services/audio';
import { playSoundFX } from '../../engine/PlaySoundFX';
import { tvNav } from '../../services/tvNavigation';

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

  const stagesToDisplay = Array.from({ length: 50 }, (_, i) => stagePage * 50 + i + 1);

  return (
    <div className="relative min-h-screen bg-[#07090E] text-white px-[5vw] py-5 flex flex-col justify-between select-none">
      {/* 1. Header: Back button, Title & Global 1,000 Stages Progress */}
      <header className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center space-x-4">
          <button
            data-tv-focus
            tabIndex={0}
            onClick={() => {
              audio.playBack();
              onBack();
            }}
            className="flex items-center space-x-2 px-5 py-3 rounded-2xl bg-[#101420] border-2 border-white/15 hover:bg-white hover:text-black focus:bg-white focus:text-black transition-all outline-none"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-black text-xs uppercase">Retour</span>
          </button>

          <div>
            <div className="flex items-center space-x-2">
              <span className="px-3 py-0.5 rounded-full bg-gradient-to-r from-[#E50914] to-[#FF2E63] text-white text-[10px] font-black uppercase tracking-wider shadow-md">
                AVENTURE 1 000 STAGES
              </span>
              <span className="text-xs font-bold text-[#FFB800]">
                ⭐ {globalStats.totalStars} / {globalStats.maxStars} ÉTOILES
              </span>
            </div>
            <h1 className="text-3xl font-black font-display text-white tracking-tight mt-0.5">
              4 Images 1 Mot • Choix du Stage
            </h1>
          </div>
        </div>

        {/* Right side: Global Progress Bar & Random Mode CTA */}
        <div className="flex items-center space-x-6">
          <div className="flex flex-col items-end">
            <div className="flex items-center space-x-2 text-xs font-black">
              <span className="text-[#B8C2D8]">PROGRESSION GLOBALE :</span>
              <span className="text-[#10B981] font-mono">{globalStats.totalCompleted} / 1 000 ({globalStats.percent}%)</span>
            </div>
            <div className="w-56 h-3.5 rounded-full bg-[#181F33] overflow-hidden mt-1 border border-white/15 shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-[#E50914] via-[#FFB800] to-[#10B981] transition-all duration-500 rounded-full"
                style={{ width: `${Math.min(100, Math.max(2, parseFloat(globalStats.percent)))}%` }}
              />
            </div>
          </div>

          <button
            data-tv-focus
            tabIndex={0}
            onClick={() => {
              audio.playSelect();
              onStartRandomMode();
            }}
            className="flex items-center space-x-2 px-6 py-3.5 rounded-2xl bg-[#181F33] border-2 border-[#00F2FE]/50 text-[#00F2FE] hover:bg-[#00F2FE] hover:text-black focus:bg-[#00F2FE] focus:text-black font-black text-xs shadow-lg transition-all outline-none"
          >
            <Zap className="w-4 h-4" />
            <span>MODE ALÉATOIRE</span>
          </button>
        </div>
      </header>

      {/* 2. Main Content: Left Level Picker (1-10) + Right 100 Stages Grid */}
      <main className="grid grid-cols-12 gap-6 my-auto py-4">
        {/* Left Column: 10 Levels Carousel / List */}
        <div className="col-span-4 flex flex-col space-y-2.5 overflow-y-auto max-h-[68vh] pr-2">
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
                className={`p-3.5 rounded-2xl border-2 transition-all flex items-center justify-between text-left outline-none ${
                  isSelected
                    ? 'bg-[#181F33] border-[#FFB800] shadow-[0_0_25px_rgba(255,184,0,0.4)] scale-102'
                    : isUnlocked
                    ? 'bg-[#101420] border-white/15 hover:border-white/40 focus:border-white'
                    : 'bg-[#07090E]/60 border-white/5 opacity-40 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center font-black font-mono text-base border shadow-md"
                    style={{ backgroundColor: `${def.color}25`, borderColor: def.color, color: def.color }}
                  >
                    {isUnlocked ? def.level : <Lock className="w-4 h-4 text-gray-500" />}
                  </div>

                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-black text-sm text-white">NIVEAU {def.level}</h3>
                      <span
                        className="px-2 py-0.2 rounded text-[9px] font-black uppercase"
                        style={{ backgroundColor: `${def.color}30`, color: def.color }}
                      >
                        {def.name}
                      </span>
                    </div>
                    <span className="text-[11px] text-[#B8C2D8] font-bold">
                      {isUnlocked ? `${lvlStat.completedCount}/100 Stages • ⭐ ${lvlStat.starsCount}` : 'Terminez le niveau précédent'}
                    </span>
                  </div>
                </div>

                {isUnlocked && (
                  <span className="font-mono font-black text-xs text-[#10B981]">
                    {lvlStat.percent}%
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Right Column: 100 Stages Interactive Grid (50 per page) */}
        <div className="col-span-8 flex flex-col justify-between p-6 rounded-3xl bg-[#101420] border-2 border-white/15 shadow-2xl">
          <div>
            {/* Level Title & Pagination */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
              <div>
                <h2 className="text-xl font-black font-display text-white">
                  NIVEAU {selectedLevel} : {LEVEL_DEFINITIONS[selectedLevel - 1]?.name.toUpperCase()} (100 STAGES)
                </h2>
                <div className="flex items-center space-x-4 text-xs font-bold text-[#B8C2D8] mt-0.5">
                  <span>Complétés : {levelStats.completedCount}/100</span>
                  <span>⭐ {levelStats.starsCount}/300 étoiles</span>
                  <span>⭐⭐⭐ {levelStats.threeStarsCount}</span>
                </div>
              </div>

              {/* Page Selector (Stages 1-50 vs 51-100) */}
              <div className="flex items-center space-x-2">
                <button
                  data-tv-focus
                  tabIndex={0}
                  onClick={() => {
                    playSoundFX.playHop();
                    setStagePage(0);
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-black border transition-all outline-none ${
                    stagePage === 0
                      ? 'bg-[#E50914] text-white border-white shadow-md'
                      : 'bg-[#181F33] text-gray-300 border-white/15 hover:text-white'
                  }`}
                >
                  Stages 1 — 50
                </button>
                <button
                  data-tv-focus
                  tabIndex={0}
                  onClick={() => {
                    playSoundFX.playHop();
                    setStagePage(1);
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-black border transition-all outline-none ${
                    stagePage === 1
                      ? 'bg-[#E50914] text-white border-white shadow-md'
                      : 'bg-[#181F33] text-gray-300 border-white/15 hover:text-white'
                  }`}
                >
                  Stages 51 — 100
                </button>
              </div>
            </div>

            {/* 50 Stages Grid (10 columns x 5 rows) */}
            <div className="grid grid-cols-10 gap-2.5">
              {stagesToDisplay.map((stageNum) => {
                const isUnlocked = fourPicsProgress.isStageUnlocked(selectedLevel, stageNum);
                const stageProg = fourPicsProgress.getStageProgress(selectedLevel, stageNum);

                return (
                  <button
                    key={`stage_btn_${stageNum}`}
                    data-tv-focus
                    tabIndex={0}
                    disabled={!isUnlocked}
                    onClick={() => handleStageClick(stageNum)}
                    className={`aspect-square rounded-2xl border-2 flex flex-col items-center justify-center p-1 transition-all outline-none ${
                      stageProg.completed
                        ? 'bg-emerald-950/40 border-[#10B981] text-white hover:scale-110 focus:scale-110 focus:bg-white focus:text-black shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                        : isUnlocked
                        ? 'bg-[#181F33] border-white/20 text-white hover:scale-110 hover:border-[#FFB800] focus:scale-110 focus:bg-white focus:text-black shadow-md'
                        : 'bg-[#07090E]/60 border-white/5 text-gray-600 cursor-not-allowed opacity-30'
                    }`}
                  >
                    {isUnlocked ? (
                      <>
                        <span className="font-mono font-black text-xs leading-none">{stageNum}</span>
                        <div className="flex items-center space-x-0.5 mt-1">
                          {stageProg.stars > 0 ? (
                            Array.from({ length: stageProg.stars }).map((_, sIdx) => (
                              <Star
                                key={`star_${sIdx}`}
                                className="w-2.5 h-2.5 fill-[#FFB800] text-[#FFB800]"
                              />
                            ))
                          ) : (
                            <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
                          )}
                        </div>
                      </>
                    ) : (
                      <Lock className="w-3.5 h-3.5 text-gray-600" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bottom Milestone Callout */}
          <div className="flex items-center justify-between pt-4 border-t border-white/10 mt-3 text-xs font-bold text-[#B8C2D8]">
            <div className="flex items-center space-x-2">
              <Trophy className="w-4 h-4 text-[#FFB800]" />
              <span>Récompense aux 100 stages : Médaille & Thème Exclusif Débloqué !</span>
            </div>
            <span className="text-[#00F2FE]">Sélectionnez un stage pour lancer</span>
          </div>
        </div>
      </main>
    </div>
  );
};
