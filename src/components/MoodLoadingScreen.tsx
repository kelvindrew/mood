import React from 'react';
import { Gamepad2 } from 'lucide-react';
import { WindowsSpinner } from './WindowsSpinner';

export const MoodLoadingScreen: React.FC<{ label?: string; fullScreen?: boolean }> = ({
  label = 'Préparation de votre écran…',
  fullScreen = true,
}) => (
  <div className={'mood-loading-screen ' + (fullScreen ? 'mood-loading-screen--full' : '')} role="status" aria-live="polite">
    <div className="mood-loading-screen__mark" aria-hidden="true"><Gamepad2 className="h-8 w-8" /></div>
    <div className="mood-loading-screen__brand">MOOD <span>TV</span></div>
    <p className="mood-loading-screen__label">{label}</p>
    <WindowsSpinner size="lg" className="text-lime-300" />
  </div>
);
