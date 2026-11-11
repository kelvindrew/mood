import React, { useEffect, Suspense } from 'react';
import { useGame } from '../context/GameContext';
import { TVNavbar } from './components/TVNavbar';
import { TVRemoteHint } from './components/TVRemoteHint';
import { TVHomeView } from './views/TVHomeView';
import { TVLobbyView } from './views/TVLobbyView';
import { TVGamePlayView } from './views/TVGamePlayView';
import { TVToast } from './components/TVToast';
import { MoodLoadingScreen } from '../components/MoodLoadingScreen';

const TVResultsView = React.lazy(() => import('./views/TVResultsView').then((module) => ({ default: module.TVResultsView })));
const TVAdminView = React.lazy(() => import('./views/TVAdminView').then((module) => ({ default: module.TVAdminView })));
const TVCategoriesView = React.lazy(() => import('./views/TVCategoriesView').then((module) => ({ default: module.TVCategoriesView })));
const TVGameDetailView = React.lazy(() => import('./views/TVGameDetailView').then((module) => ({ default: module.TVGameDetailView })));
const TVProfilesView = React.lazy(() => import('./views/TVProfilesView').then((module) => ({ default: module.TVProfilesView })));
const TVSettingsView = React.lazy(() => import('./views/TVSettingsView').then((module) => ({ default: module.TVSettingsView })));

export const TVApp: React.FC = () => {
  const { tvView } = useGame();

  useEffect(() => {
    document.documentElement.classList.add('tv-ui');
    return () => document.documentElement.classList.remove('tv-ui');
  }, []);

  const renderCurrentView = () => {
    switch (tvView) {
      case 'home': return <TVHomeView />;
      case 'lobby': return <TVLobbyView />;
      case 'playing':
      case 'gameplay': return <TVGamePlayView />;
      case 'results': return <TVResultsView />;
      case 'categories': return <TVCategoriesView />;
      case 'detail':
      case 'game_detail': return <TVGameDetailView />;
      case 'profile':
      case 'profiles': return <TVProfilesView />;
      case 'settings': return <TVSettingsView />;
      case 'admin': return <TVAdminView />;
      default: return <TVHomeView />;
    }
  };

  const isFullScreenGame = tvView === 'playing' || tvView === 'gameplay' || tvView === 'admin';

  return (
    <div className="mood-tv-shell relative min-h-screen overflow-x-hidden font-sans text-white select-none">
      {!isFullScreenGame && <TVNavbar />}
      <main className="relative z-10">
        <Suspense fallback={<MoodLoadingScreen label="Chargement de votre écran…" />}>
          {renderCurrentView()}
        </Suspense>
      </main>
      {!isFullScreenGame && <TVRemoteHint />}
      <TVToast />
    </div>
  );
};
