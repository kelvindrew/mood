import React, { useState, useEffect, useRef } from 'react';
import { adminCms } from '../services/adminCmsService';

export interface WorldLandscapeItem {
  id: string;
  name: string;
  country: string;
  url: string;
}

// Collection de 12 paysages panoramiques cinématiques (haute résolution, 100% sans texte)
export const WORLD_LANDSCAPES: WorldLandscapeItem[] = [
  {
    id: 'japan-fuji',
    name: 'Mont Fuji & Lac Kawaguchi',
    country: 'Japon',
    url: '/landscapes/banner_1_fuji.jpg',
  },
  {
    id: 'italy-dolomites',
    name: 'Pics Alpins des Dolomites',
    country: 'Italie',
    url: '/landscapes/banner_2_dolomites.jpg',
  },
  {
    id: 'iceland-aurora',
    name: 'Fjords & Aurore Boréale',
    country: 'Islande',
    url: '/landscapes/banner_3_aurora.jpg',
  },
  {
    id: 'morocco-sahara',
    name: 'Dunes de Merzouga au Crépuscule',
    country: 'Maroc',
    url: '/landscapes/banner_4_sahara.jpg',
  },
  {
    id: 'polynesia-lagoon',
    name: 'Lagon Turquoise & Mont Otemanu',
    country: 'Polynésie',
    url: '/landscapes/banner_5_lagoon.jpg',
  },
  {
    id: 'canada-banff',
    name: 'Lac Moraine & Forêts Boréales',
    country: 'Canada',
    url: '/landscapes/banner_6_moraine.jpg',
  },
  {
    id: 'vietnam-halong',
    name: 'Baie d’Hạ Long',
    country: 'Vietnam',
    url: '/landscapes/banner_7_halong.jpg',
  },
  {
    id: 'greece-santorini',
    name: 'Falaises & Mer Égée',
    country: 'Grèce',
    url: '/landscapes/banner_8_santorini.jpg',
  },
  {
    id: 'usa-redwoods',
    name: 'Forêt des Redwoods',
    country: 'Californie',
    url: '/landscapes/banner_9_redwoods.jpg',
  },
  {
    id: 'patagonia-peaks',
    name: 'Torres del Paine',
    country: 'Patagonie',
    url: '/landscapes/banner_10_patagonia.jpg',
  },
  {
    id: 'usa-canyon',
    name: 'Grand Canyon',
    country: 'Arizona',
    url: '/landscapes/banner_11_grand_canyon.jpg',
  },
  {
    id: 'maldives-sunset',
    name: 'Océan Indien au Crépuscule',
    country: 'Maldives',
    url: '/landscapes/banner_12_maldives.jpg',
  },
];

interface WorldLandscapeBackgroundProps {
  /** Opacité de base de l'assombrissement pour garantir la lisibilité (défaut: 0.82) */
  overlayDarkness?: number;
  /** Afficher la discrète étiquette de localisation (défaut: false pour un affichage épuré sans texte) */
  showLocationBadge?: boolean;
  /** Teinte supplémentaire spécifique au jeu (ex: vert émeraude pour Scrabble) */
  tintClass?: string;
  /** Index contrôlé externe optionnel */
  controlledIndex?: number;
  /** Callback lors du changement d'index */
  onIndexChange?: (index: number) => void;
  /** Liste personnalisée optionnelle de paysages */
  landscapes?: WorldLandscapeItem[];
  /** Délai de rotation en millisecondes (défaut: 6000ms) */
  intervalMs?: number;
}

export const WorldLandscapeBackground: React.FC<WorldLandscapeBackgroundProps> = ({
  overlayDarkness = 0.82,
  showLocationBadge = false,
  tintClass = 'from-emerald-950/40 via-[#070D0B]/70 to-[#070D0B]/90',
  controlledIndex,
  onIndexChange,
  landscapes: propLandscapes,
  intervalMs = 6000,
}) => {
  const [customLandscapes, setCustomLandscapes] = useState<WorldLandscapeItem[]>(() =>
    adminCms.getCustomLandscapes()
  );

  useEffect(() => {
    const unsub = adminCms.subscribe(() => {
      setCustomLandscapes(adminCms.getCustomLandscapes());
    });
    return () => unsub();
  }, []);

  // Si l'administrateur a défini ses propres paysages, les utiliser en priorité
  const activeLandscapes: WorldLandscapeItem[] = React.useMemo(() => {
    if (propLandscapes && propLandscapes.length > 0) return propLandscapes;
    if (customLandscapes && customLandscapes.length > 0) return customLandscapes;
    return WORLD_LANDSCAPES;
  }, [propLandscapes, customLandscapes]);

  const [internalIndex, setInternalIndex] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const currentIndex = controlledIndex !== undefined ? controlledIndex : internalIndex;

  // Remise à zéro de l'index si la liste change
  useEffect(() => {
    if (controlledIndex === undefined) {
      setInternalIndex(0);
    }
  }, [activeLandscapes.length, controlledIndex]);

  // Rotation automatique toutes les N secondes
  useEffect(() => {
    if (activeLandscapes.length <= 1 || controlledIndex !== undefined) return;

    intervalRef.current = setInterval(() => {
      setInternalIndex((prev) => {
        const next = (prev + 1) % activeLandscapes.length;
        if (onIndexChange) onIndexChange(next);
        // Préchargement de l'image suivante
        const preloadNext = (next + 1) % activeLandscapes.length;
        const img = new Image();
        img.src = activeLandscapes[preloadNext].url;
        return next;
      });
    }, intervalMs);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [activeLandscapes, intervalMs, controlledIndex, onIndexChange]);

  const currentLandscape = activeLandscapes[currentIndex] || WORLD_LANDSCAPES[0];

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden select-none z-0">
      {/* 1. Fond sombre de base pour éviter tout flash blanc lors du premier chargement */}
      <div className="absolute inset-0 bg-[#070D0B]" />

      {/* 2. Couche d'images avec transition fluide croisée et Ken Burns cinématique */}
      {activeLandscapes.map((landscape, index) => {
        const isCurrent = index === currentIndex;
        return (
          <div
            key={landscape.id || `${landscape.url}_${index}`}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out will-change-[opacity] ${
              isCurrent ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            <img
              src={landscape.url}
              alt={`${landscape.name || 'Paysage'}, ${landscape.country || ''}`}
              loading={index <= 1 ? 'eager' : 'lazy'}
              className={`w-full h-full object-cover object-center filter brightness-[0.93] contrast-[1.06] will-change-transform ${
                isCurrent ? 'animate-ken-burns' : 'scale-100'
              }`}
            />
          </div>
        );
      })}

      {/* 3. Masque sombre protecteur : contraste équilibré sans noircir ni dégrader la photo */}
      <div
        className="absolute inset-0 z-20 pointer-events-none transition-colors duration-1000"
        style={{
          backgroundColor: `rgba(7, 13, 11, ${overlayDarkness})`,
        }}
      />

      {/* 4. Vignette et dégradés d'ambiance doux préservant la clarté centrale de l'image */}
      <div className={`absolute inset-0 z-20 bg-gradient-to-b ${tintClass} pointer-events-none`} />
      <div className="absolute inset-0 z-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-[#070D0B]/30 to-[#070D0B]/80 pointer-events-none" />

      {/* 5. Discrète étiquette de lieu en bas (affichée uniquement si renseignée) */}
      {showLocationBadge && (currentLandscape.name || currentLandscape.country) && (
        <div className="absolute bottom-3 left-6 z-30 pointer-events-none flex items-center space-x-2 text-[11px] font-sans font-medium text-slate-300 bg-black/50 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/15 shadow-xl animate-fade-in transition-all">
          <span className="text-amber-400">🌍</span>
          <span className="truncate">
            {currentLandscape.name && <strong className="text-white font-bold">{currentLandscape.name}</strong>}
            {currentLandscape.name && currentLandscape.country && ' • '}
            {currentLandscape.country && <span className="text-slate-300">{currentLandscape.country}</span>}
          </span>
        </div>
      )}
    </div>
  );
};
