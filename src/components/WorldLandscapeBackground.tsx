import React, { useState, useEffect, useRef } from 'react';

export interface WorldLandscapeItem {
  id: string;
  name: string;
  country: string;
  url: string;
}

// Collection de paysages emblématiques du monde (haute résolution, optimisés web)
export const WORLD_LANDSCAPES: WorldLandscapeItem[] = [
  {
    id: 'japan-fuji',
    name: 'Mont Fuji & Pagode Chureito',
    country: 'Japon',
    url: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=1920&auto=format&fit=crop',
  },
  {
    id: 'italy-dolomites',
    name: 'Pics Alpins des Dolomites',
    country: 'Italie',
    url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1920&auto=format&fit=crop',
  },
  {
    id: 'iceland-aurora',
    name: 'Fjords & Aurore Boréale',
    country: 'Islande',
    url: 'https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?q=80&w=1920&auto=format&fit=crop',
  },
  {
    id: 'morocco-sahara',
    name: 'Dunes de Merzouga au Crépuscule',
    country: 'Maroc',
    url: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?q=80&w=1920&auto=format&fit=crop',
  },
  {
    id: 'canada-banff',
    name: 'Lac Moraine & Forêts Boréales',
    country: 'Canada',
    url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1920&auto=format&fit=crop',
  },
  {
    id: 'vietnam-halong',
    name: 'Baie d’Hạ Long',
    country: 'Vietnam',
    url: 'https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=1920&auto=format&fit=crop',
  },
  {
    id: 'greece-santorini',
    name: 'Falaises & Mer Égée',
    country: 'Grèce',
    url: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?q=80&w=1920&auto=format&fit=crop',
  },
];

interface WorldLandscapeBackgroundProps {
  /** Opacité de base de l'assombrissement pour garantir la lisibilité (défaut: 0.85) */
  overlayDarkness?: number;
  /** Afficher la discrète étiquette de localisation (défaut: true) */
  showLocationBadge?: boolean;
  /** Teinte supplémentaire spécifique au jeu (ex: vert émeraude pour Scrabble) */
  tintClass?: string;
}

export const WorldLandscapeBackground: React.FC<WorldLandscapeBackgroundProps> = ({
  overlayDarkness = 0.82,
  showLocationBadge = true,
  tintClass = 'from-emerald-950/40 via-[#070D0B]/70 to-[#070D0B]/90',
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loadedIndices, setLoadedIndices] = useState<Set<number>>(new Set([0]));
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Rotation automatique toutes les 5 secondes
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => {
        const next = (prev + 1) % WORLD_LANDSCAPES.length;
        // Préchargement de l'image suivante
        const preloadNext = (next + 1) % WORLD_LANDSCAPES.length;
        const img = new Image();
        img.src = WORLD_LANDSCAPES[preloadNext].url;
        img.onload = () => {
          setLoadedIndices((current) => new Set([...current, preloadNext]));
        };
        return next;
      });
    }, 5000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const currentLandscape = WORLD_LANDSCAPES[currentIndex];

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden select-none z-0">
      {/* 1. Fond sombre de base pour éviter tout flash blanc lors du premier chargement */}
      <div className="absolute inset-0 bg-[#070D0B]" />

      {/* 2. Couche d'images avec transition fluide croisée (crossfade sans à-coup) */}
      {WORLD_LANDSCAPES.map((landscape, index) => {
        const isCurrent = index === currentIndex;
        return (
          <div
            key={landscape.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out will-change-[opacity] ${
              isCurrent ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            <img
              src={landscape.url}
              alt={`${landscape.name}, ${landscape.country}`}
              loading={index <= 1 ? 'eager' : 'lazy'}
              className="w-full h-full object-cover object-center filter brightness-[0.70] contrast-[1.08] transform scale-105"
            />
          </div>
        );
      })}

      {/* 3. Masque sombre protecteur : assure un contraste absolu pour les tuiles et textes */}
      <div
        className="absolute inset-0 z-20 pointer-events-none transition-colors duration-1000"
        style={{
          backgroundColor: `rgba(7, 13, 11, ${overlayDarkness})`,
        }}
      />

      {/* 4. Vignette radiale & Dégradé d'ambiance harmonisé avec le design */}
      <div className={`absolute inset-0 z-20 bg-gradient-to-b ${tintClass} pointer-events-none`} />
      <div className="absolute inset-0 z-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-[#070D0B]/60 to-[#070D0B]/95 pointer-events-none" />

      {/* 5. Discrète étiquette de lieu en bas (élégante et non intrusive) */}
      {showLocationBadge && (
        <div className="absolute bottom-3 left-6 z-30 pointer-events-none flex items-center space-x-2 text-[11px] font-sans font-medium text-slate-400/80 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 shadow-lg animate-fade-in transition-all">
          <span className="text-amber-400">🌍</span>
          <span className="truncate">
            <strong className="text-slate-200 font-bold">{currentLandscape.name}</strong> • {currentLandscape.country}
          </span>
        </div>
      )}
    </div>
  );
};
