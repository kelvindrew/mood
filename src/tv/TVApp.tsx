import React, { useEffect, Suspense } from 'react';
import { useGame } from '../context/GameContext';
import { TVNavbar } from './components/TVNavbar';
import { TVHomeView } from './views/TVHomeView';
import { TVLobbyView } from './views/TVLobbyView';
import { TVGamePlayView } from './views/TVGamePlayView';
import { TVToast } from './components/TVToast';
import { Loader2 } from 'lucide-react';

const TVResultsView = React.lazy(() => import('./views/TVResultsView').then(m => ({ default: m.TVResultsView })));
const TVAdminView = React.lazy(() => import('./views/TVAdminView').then(m => ({ default: m.TVAdminView })));
const TVCategoriesView = React.lazy(() => import('./views/TVCategoriesView').then(m => ({ default: m.TVCategoriesView })));
const TVGameDetailView = React.lazy(() => import('./views/TVGameDetailView').then(m => ({ default: m.TVGameDetailView })));
const TVProfilesView = React.lazy(() => import('./views/TVProfilesView').then(m => ({ default: m.TVProfilesView })));
const TVSettingsView = React.lazy(() => import('./views/TVSettingsView').then(m => ({ default: m.TVSettingsView })));

const ViewLoader: React.FC = () => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-[#0A0F1D] text-white select-none space-y-4 animate-fade-in">
    <div className="relative flex items-center justify-center">
      <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center shadow-[0_0_25px_rgba(6,182,212,0.25)]">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
      </div>
      <div className="absolute inset-0 rounded-2xl bg-cyan-400/20 blur-xl animate-pulse pointer-events-none" />
    </div>
    <div className="flex flex-col items-center space-y-1">
      <span className="font-display font-black text-sm tracking-widest text-cyan-300 uppercase">
        MOOD TV
      </span>
      <span className="text-[11px] font-semibold text-slate-400 tracking-wider">
        Chargement de l'écran…
      </span>
    </div>
  </div>
);

export const TVApp: React.FC = () => {
  const { tvView } = useGame();

  // Couche CSS TV (scaling typographique, perf, focus) — jamais appliquée au mobile
  useEffect(() => {
    document.documentElement.classList.add('tv-ui');
    return () => {
      document.documentElement.classList.remove('tv-ui');
    };
  }, []);

  const renderCurrentView = () => {
    switch (tvView) {
      case 'home':
        return <TVHomeView />;
      case 'lobby':
        return <TVLobbyView />;
      case 'playing':
      case 'gameplay':
        return <TVGamePlayView />;
      case 'results':
        return <TVResultsView />;
      case 'categories':
        return <TVCategoriesView />;
      case 'detail':
      case 'game_detail':
        return <TVGameDetailView />;
      case 'profile':
      case 'profiles':
        return <TVProfilesView />;
      case 'settings':
        return <TVSettingsView />;
      case 'admin':
        return <TVAdminView />;
      default:
        return <TVHomeView />;
    }
  };

  const isFullScreenGame = tvView === 'playing' || tvView === 'gameplay' || tvView === 'admin';

  return (
    <div className="relative min-h-screen bg-[#0A0F1D] text-white overflow-x-hidden font-sans select-none">
      {/* Top TV Header (discreet logo and status) */}
      {!isFullScreenGame && <TVNavbar />}

      {/* Main View Display */}
      <main className="relative z-10">
        <Suspense fallback={<ViewLoader />}>
          {renderCurrentView()}
        </Suspense>
      </main>

      {/* Toast Notifications */}
      <TVToast />
    </div>
  );
};
