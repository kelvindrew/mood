/**
 * Resilient Image Fallback Generator for PLAYFLIX
 * Generates an instant high-resolution SVG poster if an external image fails to load.
 */
export function getGameFallbackPoster(title: string = 'PLAYFLIX'): string {
  const cleanTitle = (title || 'PLAYFLIX').replace(/[<>&"]/g, '');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500">
    <defs>
      <radialGradient id="bg" cx="50%" cy="40%" r="70%">
        <stop offset="0%" stop-color="#182E25"/>
        <stop offset="60%" stop-color="#0E1B15"/>
        <stop offset="100%" stop-color="#060C0A"/>
      </radialGradient>
      <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#FBBF24"/>
        <stop offset="100%" stop-color="#34D399"/>
      </linearGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#bg)"/>
    <circle cx="400" cy="230" r="120" fill="#10B981" opacity="0.12"/>
    <text x="50%" y="44%" text-anchor="middle" fill="url(#accent)" font-family="system-ui, -apple-system, BlinkMacSystemFont, sans-serif" font-weight="900" font-size="32" letter-spacing="2">${cleanTitle.toUpperCase()}</text>
    <text x="50%" y="56%" text-anchor="middle" fill="#9CA3AF" font-family="system-ui, sans-serif" font-weight="700" font-size="14" letter-spacing="5">PLAYFLIX CONSOLE TV</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>, title?: string) => {
  const target = e.currentTarget;
  if (!target.getAttribute('data-fallback-applied')) {
    target.setAttribute('data-fallback-applied', 'true');
    target.src = getGameFallbackPoster(title || target.alt || 'JEU');
  }
};
