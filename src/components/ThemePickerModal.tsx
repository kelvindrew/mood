import React, { useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { AVAILABLE_THEMES, ThemeId } from '../styles/themes';
import { X, Check, Sun, Moon, Palette } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-4xl rounded-2xl bg-[#0F131D]/95 border border-white/10 shadow-2xl p-5 sm:p-6 flex flex-col max-h-[88vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center space-x-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shadow-md"
              style={{
                backgroundColor: 'var(--theme-primary, #00F2FE)',
                color: 'var(--theme-primary-text, #000)',
              }}
            >
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">
                DESIGN SYSTEM
              </span>
              <h2 className="text-xl sm:text-2xl font-black font-display text-white">
                Changer de Thème Visuel
              </h2>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Dark / Light Toggle */}
            <button
              data-tv-focus
              tabIndex={0}
              onClick={toggleMode}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-white font-bold text-xs transition-all outline-none focus:scale-105 focus:bg-white focus:text-black"
              title="Basculer Mode Clair / Sombre"
            >
              {mode === 'dark' ? (
                <>
                  <Moon className="w-3.5 h-3.5 text-indigo-300" />
                  <span>SOMBRE</span>
                </>
              ) : (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span>CLAIR</span>
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
              className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center text-gray-300 hover:text-white transition-all outline-none focus:scale-110 focus:bg-rose-600 focus:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 5 Sleek Theme Cards Grid */}
        <div className="flex-1 overflow-y-auto py-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {AVAILABLE_THEMES.map((th) => {
            const isSelected = activeTheme === th.id;
            const preview = th.preview;

            return (
              <button
                key={th.id}
                data-tv-focus
                tabIndex={0}
                onClick={() => setTheme(th.id as ThemeId)}
                className={`group relative rounded-xl p-3 text-left border flex flex-col justify-between transition-all outline-none focus:scale-105 ${
                  isSelected
                    ? 'bg-white/15 border-white shadow-xl ring-2 ring-white/25'
                    : 'bg-white/5 border-white/10 hover:border-white/25 hover:bg-white/10'
                }`}
              >
                {/* Active check mark */}
                {isSelected && (
                  <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-md animate-scale-in">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                )}

                {/* Sleek Theme Preview Swatch */}
                <div
                  className="w-full h-18 rounded-lg mb-2.5 p-2 flex flex-col justify-between border relative overflow-hidden transition-transform group-hover:scale-102"
                  style={{
                    backgroundColor: preview.bgPreview,
                    borderColor: preview.primaryColor + '40',
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className="text-[9px] font-black px-1.5 py-0.5 rounded"
                      style={{
                        backgroundColor: preview.primaryColor + '25',
                        color: preview.primaryColor,
                      }}
                    >
                      {th.emoji}
                    </span>
                    <div className="flex items-center space-x-1">
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: preview.primaryColor }} />
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: preview.secondaryColor }} />
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: preview.accentColor }} />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div
                      className="w-12 h-1.5 rounded"
                      style={{ backgroundColor: preview.textPreview, opacity: 0.6 }}
                    />
                    <span
                      className="text-[8px] font-bold px-2 py-0.5 rounded text-white"
                      style={{ backgroundColor: preview.primaryColor }}
                    >
                      OK
                    </span>
                  </div>
                </div>

                {/* Info */}
                <div>
                  <div className="flex items-center space-x-1 mb-0.5">
                    <span className="text-base">{th.emoji}</span>
                    <h3 className="font-display font-black text-xs text-white truncate">
                      {th.name}
                    </h3>
                  </div>
                  <p className="text-[10px] font-bold text-amber-300/90 truncate mb-1">
                    {th.tagline}
                  </p>
                  <p className="text-[10px] text-gray-400 line-clamp-2 leading-tight">
                    {th.description}
                  </p>
                </div>

                {/* Active status */}
                <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between text-[9px]">
                  <span className={`font-bold uppercase ${isSelected ? 'text-emerald-400' : 'text-gray-500'}`}>
                    {isSelected ? 'ACTIF' : 'CHOISIR'}
                  </span>
                  <div
                    className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                      isSelected ? 'bg-white border-white' : 'border-white/30'
                    }`}
                  >
                    {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-black" />}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-gray-400">
          <span>
            Thème actif : <strong className="text-white font-mono">{activeTheme.toUpperCase()}</strong> ({mode.toUpperCase()})
          </span>
          <span className="hidden sm:inline text-[10px]">
            Navigation : Flèches + Entrée pour valider • Échap pour fermer
          </span>
        </div>
      </div>
    </div>
  );
};
