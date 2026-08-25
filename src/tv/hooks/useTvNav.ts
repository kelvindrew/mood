import React, { useEffect, useRef } from 'react';
import { tvNav } from '../../services/tvNavigation';

/**
 * M5 — Back télécommande pour une vue entière.
 * Le handler est enregistré au montage et retiré au démontage ; la ref
 * évite de re-souscrire à chaque render.
 */
export function useTvBack(handler: () => void): void {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    return tvNav.registerBackHandler(() => handlerRef.current());
  }, []);
}

/**
 * M6 — Focus trap de modale : tant que la modale est montée,
 *  - la navigation spatiale est confinée à son conteneur (focus trap) ;
 *  - Back / Échap déclenchent onClose ;
 *  - le focus initial est posé DANS la modale (jamais sur un bouton
 *    masqué derrière l'overlay) ;
 *  - le focus précédent est restauré à la fermeture.
 */
export function useTvModalScope(onClose?: () => void): React.RefObject<HTMLDivElement> {
  const containerRef = useRef<HTMLDivElement>(null!);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return undefined;

    const previous = (document.activeElement as HTMLElement | null);

    tvNav.pushFocusScope(el);
    const unregisterBack = tvNav.registerBackHandler(() => {
      if (onCloseRef.current) onCloseRef.current();
    });
    tvNav.setInitialFocus('[data-tv-focus], button', el);

    return () => {
      unregisterBack();
      tvNav.popFocusScope(el);
      try { previous?.focus?.(); } catch { /* élément disparu */ }
    };
     
  }, []);

  return containerRef;
}
