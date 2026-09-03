import React, { useEffect, Suspense } from 'react';
import { useGame } from '../context/GameContext';
import { TVNavbar } from './components/TVNavbar';
import { TVHomeView } from './views/TVHomeView';
import { TVLobbyView } from './views/TVLobbyView';
import { TVGamePlayView } from './views/TVGamePlayView';
import { TVRemoteHint } from './components/TVRemoteHint';
import { TVToast } from './components/TVToast';
import { SimulatorDrawer } from './components/SimulatorDrawer';
import { Loader2 } from 'lucide-react';

// Vues secondaires chargées à la demande pour alléger le bundle initial TV
const TVGameDetailView = React.lazy(() => import('./views/TVGameDetailView').then(m => ({ default: m.TVGameDetailView })));
const TVResultsView = React.lazy(() => import('./views/TVResultsView').then(m => ({ default: m.TVResultsView })));
const TVCategoriesView = React.lazy(() => import('./views/TVCategoriesView').then(m => ({ default: m.TVCategoriesView })));
const TVProfilesView = React.lazy(() => import('./views/TVProfilesView').then(m => ({ default: m.TVProfilesView })));
const TVSettingsView = React.lazy(() => import('./views/TVSettingsView').then(m => ({ default: m.TVSettingsView })));
const TVAdminView = React.lazy(() => import('./views/TVAdminView').then(m => ({ default: m.TVAdminView })));

const ViewLoader: React.FC = () => (
  <div className="flex items-center justify-center min-h-screen bg-[#050A08]">
    <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
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
      case 'detail':
      case 'game_detail':
        return <TVGameDetailView />;
      case 'lobby':
        return <TVLobbyView />;
      case 'playing':
      case 'gameplay':
        return <TVGamePlayView />;
      case 'results':
        return <TVResultsView />;
      case 'categories':
        return <TVCategoriesView />;
      case 'profiles':
      case 'profile':
        return <TVProfilesView />;
      case 'settings':
        return <TVSettingsView />;
      case 'admin':
        return <TVAdminView />;
      default:
        return <TVHomeView />;
    }
  };

  const isFullScreenGame = tvView === 'playing' || tvView === 'gameplay';

  return (
    <div className="relative min-h-screen bg-background text-white overflow-x-hidden font-sans select-none">
      {/* Top TV Navigation Bar (hidden during active gameplay for full immersion) */}
      {!isFullScreenGame && <TVNavbar />}

      {/* Main View Display */}
      <main className="relative z-10">
        <Suspense fallback={<ViewLoader />}>
          {renderCurrentView()}
        </Suspense>
      </main>

      {/* Animated Floating Reactions and Toast Notifications */}
      <TVToast />

      {/* Bottom Remote Control Hint (hidden on home and gameplay) */}
      {!isFullScreenGame && tvView !== 'home' && <TVRemoteHint />}

      {/* Simulator Drawer for Dual-screen PC testing */}
      <SimulatorDrawer />
    </div>
  );
};
