import React from 'react';

export interface WindowsSpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  dotClassName?: string;
  label?: string;
}

const SIZE_CLASSES: Record<NonNullable<WindowsSpinnerProps['size']>, string> = {
  xs: 'w-3.5 h-3.5',
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-12 h-12',
};

/**
 * WindowsSpinner — Authentique anneau de progression style Windows (Windows Progress Ring).
 * Composé de 6 points en rotation orbitale non-linéaire (accélération, regroupement et décélération).
 * La couleur hérite de `currentColor` par défaut (ex: `text-cyan-400`, `text-amber-400`, `text-white`).
 */
export const WindowsSpinner: React.FC<WindowsSpinnerProps> = ({
  size = 'md',
  className = '',
  dotClassName = '',
  label = 'Chargement en cours…',
}) => {
  const sizeClass = SIZE_CLASSES[size] || SIZE_CLASSES.md;

  return (
    <div
      role="progressbar"
      aria-label={label}
      className={`win-progress-ring relative inline-block ${sizeClass} ${className}`}
    >
      {[0, 1, 2, 3, 4, 5].map((index) => (
        <div
          key={index}
          className="win-dot-wrap"
          style={{ animationDelay: `${index * 0.16}s` }}
          aria-hidden="true"
        >
          <div className={`win-dot ${dotClassName}`} />
        </div>
      ))}
    </div>
  );
};
