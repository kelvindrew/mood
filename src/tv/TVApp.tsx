import React from 'react';
import { useGame } from '../context/GameContext';
import { TVNavbar } from './components/TVNavbar';
import { TVHomeView } from './views/TVHomeView';
import { TVGameDetailView } from './views/TVGameDetailView';
import { TVLobbyView } from './views/TVLobbyView';
import { TVGamePlayView } from './views/TVGamePlayView';
import { TVResultsView } from './views/TVResultsView';
import { TVCategoriesView } from './views/TVCategoriesView';
import { TVProfilesView } from './views/TVProfilesView';
import { TVSettingsView } from './views/TVSettingsView';
import { TVAdminView } from './views/TVAdminView';
import { TVRemoteHint } from './components/TVRemoteHint';
import { TVToast } from './components/TVToast';
import { SimulatorDrawer } from './components/SimulatorDrawer';

export const TVApp: React.FC = () => {
  const { tvView } = useGame();

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
        {renderCurrentView()}
      </main>

      {/* Animated Floating Reactions and Toast Notifications */}
      <TVToast />

      {/* Bottom Remote Control Hint (hidden in full gameplay) */}
      {!isFullScreenGame && <TVRemoteHint />}

      {/* Simulator Drawer for Dual-screen PC testing */}
      <SimulatorDrawer />
    </div>
  );
};
