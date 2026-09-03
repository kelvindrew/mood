import React, { useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { AVAILABLE_THEMES, ThemeId } from '../styles/themes';
import { X, Check, Sun, Moon, Sparkles } from 'lucide-react';
import { audio } from '../services/audio';
import { tvNav } from '../services/tvNavigation';

export const ThemePickerModal: React.FC = () => {
  const {
    theme: activeTheme,
    setTheme,
    mode,
    toggleMode,
    isThemePickerOpen,
    setIsThemePickerOpen,
  } = useTheme();

  useEffect(() => {
    if (isThemePickerOpen) {
      tvNav.setInitialFocus('button');
    }
  }, [isThemePickerOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isThemePickerOpen) {
        audio.playBack();
        setIsThemePickerOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isThemePickerOpen, setIsThemePickerOpen]);

  if (!isThemePickerOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-xl animate-fade-in select-none">
      <div className="relative w-full max-w-5xl rounded-3xl bg-[#0C101A]/95 border border-white/15 shadow-2xl p-6 sm:p-8 flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-6 border-b border-white/10">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center shadow-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-[11px] font-black uppercase tracking-widest text-amber-400">
                DESIGN SYSTEM & IDENTITÉ VISUELLE
              </span>
              <h2 className="text-2xl sm:text-3xl font-black font-display text-white">
                Choisissez votre Thème
              </h2>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Dark / Light Toggle */}
            <button
              data-tv-focus
              tabIndex={0}
              onClick={toggleMode}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 text-white font-bold text-xs transition-all outline-none focus:scale-105 focus:bg-white focus:text-black"
              title="Basculer Mode Clair / Sombre"
            >
              {mode === 'dark' ? (
                <>
                  <Moon className="w-4 h-4 text-indigo-300" />
                  <span>MODE SOMBRE</span>
                </>
              ) : (
                <>
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span>MODE CLAIR</span>
                </>
              )}
            </button>

            {/* Close Button */}
            <button
              data-tv-focus
              tabIndex={0}
              onClick={() => {
                audio.playBack();
                setIsThemePickerOpen(false);
              }}
              className="w-10 h-10 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center text-gray-300 hover:text-white transition-all outline-none focus:scale-110 focus:bg-rose-600 focus:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Theme Cards Grid */}
        <div className="flex-1 overflow-y-auto py-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {AVAILABLE_THEMES.map((th) => {
            const isSelected = activeTheme === th.id;
            const preview = th.preview;

            return (
              <button
                key={th.id}
                data-tv-focus
                tabIndex={0}
                onClick={() => setTheme(th.id as ThemeId)}
                className={`group relative rounded-2xl p-4 text-left border-2 flex flex-col justify-between transition-all outline-none focus:scale-105 ${
                  isSelected
                    ? 'bg-white/10 border-white shadow-2xl scale-102 ring-4 ring-white/20'
                    : 'bg-white/5 border-white/10 hover:border-white/30 hover:bg-white/10'
                }`}
              >
                {/* Active check indicator */}
                {isSelected && (
                  <div className="absolute -top-2.5 -right-2.5 w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg animate-scale-in">
                    <Check className="w-4 h-4 stroke-[3]" />
                  </div>
                )}

                {/* Real Miniature Visual Preview */}
                <div
                  className="w-full h-32 rounded-xl mb-4 p-3 flex flex-col justify-between border relative overflow-hidden transition-transform group-hover:scale-102"
                  style={{
                    backgroundColor: preview.bgPreview,
                    borderColor: preview.primaryColor + '40',
                  }}
                >
                  {/* Miniature Header */}
                  <div className="flex items-center justify-between">
                    <span
                      className="text-[10px] font-black px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: preview.primaryColor + '25',
                        color: preview.primaryColor,
                      }}
                    >
                      {th.emoji} Aperçu
                    </span>
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: preview.accentColor }} />
                  </div>

                  {/* Miniature Card Body */}
                  <div
                    className="p-2 rounded-lg border shadow-sm"
                    style={{
                      backgroundColor: preview.cardPreview,
                      borderColor: preview.primaryColor + '30',
                    }}
                  >
                    <div
                      className="w-16 h-2 rounded mb-1"
                      style={{ backgroundColor: preview.textPreview, opacity: 0.8 }}
                    />
                    <div
                      className="w-10 h-1.5 rounded"
                      style={{ backgroundColor: preview.textPreview, opacity: 0.4 }}
                    />
                  </div>

                  {/* Miniature Button */}
                  <div className="flex justify-end">
                    <span
                      className="text-[9px] font-black px-2.5 py-1 rounded text-white shadow-sm"
                      style={{ backgroundColor: preview.primaryColor }}
                    >
                      Bouton
                    </span>
                  </div>
                </div>

                {/* Theme Description & Meta */}
                <div>
                  <div className="flex items-center space-x-1.5 mb-1">
                    <span className="text-xl">{th.emoji}</span>
                    <h3 className="font-display font-black text-base text-white truncate">
                      {th.name}
                    </h3>
                  </div>
                  <p className="text-[11px] font-bold text-amber-300/90 mb-2">
                    {th.tagline}
                  </p>
                  <p className="text-[11px] text-gray-400 line-clamp-2 leading-relaxed">
                    {th.description}
                  </p>
                </div>

                {/* Select Badge */}
                <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    {isSelected ? 'ACTIF' : 'CLIQUER POUR CHOISIR'}
                  </span>
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                      isSelected ? 'bg-white border-white' : 'border-white/30'
                    }`}
                  >
                    {isSelected && <div className="w-2 h-2 rounded-full bg-black" />}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-400">
          <span>
            Thème actuel : <strong className="text-white font-mono">{activeTheme.toUpperCase()}</strong> ({mode.toUpperCase()})
          </span>
          <span className="text-[11px] text-gray-400 mt-1 sm:mt-0">
            Navigation télécommande : Touches fléchées + Entrée pour valider • Échap pour fermer
          </span>
        </div>
      </div>
    </div>
  );
};
