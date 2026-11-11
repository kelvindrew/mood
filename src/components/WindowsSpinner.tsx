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

/** Compact three-dot progress mark: low-cost CSS animation for older TV browsers. */
export const WindowsSpinner: React.FC<WindowsSpinnerProps> = ({
  size = 'md',
  className = '',
  dotClassName = '',
  label = 'Chargement en cours…',
}) => (
  <div role="progressbar" aria-label={label} className={'mood-loading-dots ' + (SIZE_CLASSES[size] || SIZE_CLASSES.md) + ' ' + className}>
    {[0, 1, 2].map((index) => (
      <span key={index} className={'mood-loading-dots__dot ' + dotClassName} style={{ animationDelay: (index * 0.16) + 's' }} aria-hidden="true" />
    ))}
  </div>
);
