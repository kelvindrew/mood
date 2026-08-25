// Smart TV Remote Spatial Navigation Engine for PLAYFLIX
// Compatible with Hisense VIDAA, Google TV/Android TV, Samsung Tizen, LG webOS, TCL
//
// E7 / M4 / M5 / M6 :
//  - les INPUT/TEXTAREA conservent leur comportement natif (flèches, Backspace) ;
//  - la détection de visibilité n'utilise PLUS offsetParent (les éléments
//    position:fixed comme la navbar et la barre flottante sont navigables) ;
//  - UNE SEULE source de vérité : les vues peuvent enregistrer des handlers
//    directionnels via registerKeyHandler() au lieu d'ajouter leurs propres
//    listeners window (fini le double traitement du CoverFlow) ;
//  - focus scopes empilables pour les modales (focus trap + Back = fermer) ;
//  - anneau de focus toujours visible sur l'élément piloté à la télécommande ;
//  - Back reste fonctionnel même quand la navigation spatiale est désactivée
//    (vue gameplay) et fonctionne dans toutes les vues qui s'enregistrent.
import { audio } from './audio';

export type TVDirection = 'up' | 'down' | 'left' | 'right';
export type TVAction = TVDirection | 'select';
export type TVNavAction = TVDirection | 'select';

const TV_KEYS: Record<string, TVDirection | 'select' | 'back' | 'red' | 'green' | 'yellow' | 'blue'> = {
  // Standard Web Keyboard
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',
  Enter: 'select',
  ' ': 'select',
  Escape: 'back',
  Backspace: 'back',

  // Samsung Tizen & LG webOS legacy / hardware codes
  '38': 'up',
  '40': 'down',
  '37': 'left',
  '39': 'right',
  '13': 'select',
  '10009': 'back', // Tizen Back
  '461': 'back',   // webOS Back
  '27': 'back',

  // Color keys on TV remotes (réservées, non gérées par le moteur)
  '403': 'red',
  '404': 'green',
  '405': 'yellow',
  '406': 'blue',
};

type NavAction = TVDirection | 'select' | 'back';
const NAV_ACTION_KEYS = new Set<string>(['up', 'down', 'left', 'right', 'select', 'back']);

const FOCUSABLE_SELECTOR =
  '[data-tv-focus], button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

const RING_CLASS = 'tv-focus-ring';
const RING_STYLE_ID = 'tv-nav-ring-style';
const RING_CSS = `
.${RING_CLASS}{outline:4px solid #FBBF24 !important;outline-offset:3px !important;box-shadow:0 0 26px rgba(251,191,36,0.6) !important;}
`;

function isEditableTarget(el: EventTarget | null): boolean {
  const t = el as HTMLElement | null;
  if (!t || typeof t.tagName !== 'string') return false;
  const tag = t.tagName.toUpperCase();
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
  return !!t.isContentEditable;
}

interface FocusScope {
  root: HTMLElement;
}
type KeyHandler = (action: TVNavAction, e: KeyboardEvent) => boolean;

class TVNavigationService {
  private currentFocusElement: HTMLElement | null = null;
  private isEnabled: boolean = true;
  private listeners: ((direction: TVDirection) => void)[] = [];
  private backListeners: (() => void)[] = [];
  private keyHandlers: KeyHandler[] = [];
  private scopeStack: FocusScope[] = [];

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', this.handleKeyDown.bind(this));
      // Suit aussi le focus natif (Tab / clic) pour garder l'anneau cohérent
      document.addEventListener('focusin', this.handleFocusIn.bind(this));
      this.injectRingStyle();
    }
  }

  private injectRingStyle() {
    if (document.getElementById(RING_STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = RING_STYLE_ID;
    style.textContent = RING_CSS;
    document.head.appendChild(style);
  }

  private handleFocusIn(e: FocusEvent) {
    const el = e.target as HTMLElement | null;
    if (!el || isEditableTarget(el)) return;
    this.applyRing(el);
    this.currentFocusElement = el;
  }

  private applyRing(el: HTMLElement | null) {
    if (this.currentFocusElement && this.currentFocusElement !== el) {
      this.currentFocusElement.classList.remove(RING_CLASS);
    }
    if (el) el.classList.add(RING_CLASS);
  }

  public setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
  }

  /**
   * M5 — Enregistre un handler Back (pile LIFO : le dernier monté gagne,
   * typiquement la modale ouverte par-dessus la vue courante).
   */
  public registerBackHandler(callback: () => void): () => void {
    this.backListeners.push(callback);
    return () => {
      this.backListeners = this.backListeners.filter(cb => cb !== callback);
    };
  }

  /**
   * M4 — Source de vérité unique pour les touches directionnelles (+ Select).
   * Le handler retourne true s'il consomme l'action (la navigation spatiale
   * par défaut ne s'applique alors pas). Pile LIFO : la vue active est prioritaire.
   */
  public registerKeyHandler(handler: KeyHandler): () => void {
    this.keyHandlers.push(handler);
    return () => {
      this.keyHandlers = this.keyHandlers.filter(h => h !== handler);
    };
  }

  public onNavigate(callback: (direction: TVDirection) => void): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  /**
   * M6 — Empile une « scope » de focus : tant qu'elle est au sommet de la pile,
   * la navigation spatiale ET le focus initial sont confinés aux éléments
   * contenus dans ce conteneur (focus trap de modale).
   */
  public pushFocusScope(root: HTMLElement): void {
    this.scopeStack.push({ root });
  }

  public popFocusScope(root?: HTMLElement): void {
    if (root) {
      const idx = [...this.scopeStack].reverse().findIndex(s => s.root === root);
      if (idx !== -1) {
        this.scopeStack.splice(this.scopeStack.length - 1 - idx, 1);
        return;
      }
    }
    this.scopeStack.pop();
  }

  private currentScopeRoot(): HTMLElement | null {
    const top = this.scopeStack[this.scopeStack.length - 1];
    return top ? top.root : null;
  }

  /** E7 — visibilité fiable : offsetParent est null pour position:fixed. */
  private isVisible(el: HTMLElement): boolean {
    const rect = el.getBoundingClientRect();
    if (rect.width <= 0 && rect.height <= 0) return false;
    const style = window.getComputedStyle(el);
    if (style.display === 'none' || style.visibility === 'hidden') return false;
    return true;
  }

  private collectCandidates(rootEl?: HTMLElement | null): HTMLElement[] {
    const root = rootEl || this.currentScopeRoot() || document;
    try {
      return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR))
        .filter(el =>
          !el.hasAttribute('disabled') &&
          !el.classList.contains('hidden') &&
          this.isVisible(el) &&
          document.body.contains(el)
        );
    } catch {
      return [];
    }
  }

  public focusElement(el: HTMLElement | null) {
    if (!el || !document.body.contains(el)) return;
    try {
      this.currentFocusElement?.blur();
      this.currentFocusElement = el;
      el.focus();
      this.applyRing(el); // exigence 5 : focus toujours visible
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    } catch {
      // Ignore focus errors on Smart TV
    }
  }

  public getFocusedElement(): HTMLElement | null {
    if (this.currentFocusElement && document.body.contains(this.currentFocusElement)) {
      return this.currentFocusElement;
    }
    return (document.activeElement as HTMLElement) || null;
  }

  public setInitialFocus(selector: string = '[data-tv-focus]', rootEl?: HTMLElement | null) {
    setTimeout(() => {
      try {
        let candidates = Array.from((rootEl || this.currentScopeRoot() || document).querySelectorAll<HTMLElement>(selector))
          .filter(el => !el.hasAttribute('disabled') && this.isVisible(el) && document.body.contains(el));
        if (candidates.length === 0 && selector !== '[data-tv-focus], button') {
          candidates = this.collectCandidates(rootEl);
        }
        if (candidates.length > 0) {
          this.focusElement(candidates[0]);
        }
      } catch {
        // Fallback safely
      }
    }, 150);
  }

  private fireBack() {
    audio.playBack();
    const lastListener = this.backListeners[this.backListeners.length - 1];
    if (typeof lastListener === 'function') {
      lastListener();
    }
  }

  private handleKeyDown(e: KeyboardEvent) {
    try {
      const key = e.key || e.keyCode?.toString() || '';
      const raw = TV_KEYS[key] || TV_KEYS[e.keyCode?.toString()];
      if (!raw || !NAV_ACTION_KEYS.has(raw)) return; // ignore les touches réservées (couleurs)
      const action = raw as NavAction;

      // E7 (1)(2) — les champs de formulaire gardent leur comportement natif :
      // flèches, Backspace, espace ne sont JAMAIS interceptés. Seule Échap
      // remonte comme « Back » pour fermer la modale contenant le champ.
      if (isEditableTarget(e.target)) {
        if (action === 'back' && e.key === 'Escape') {
          e.preventDefault();
          this.fireBack();
        }
        return;
      }

      // M5 — Back fonctionne même quand la navigation spatiale est coupée
      // (vue gameplay) : seul le D-pad est désactivé par setEnabled(false).
      if (action === 'back') {
        e.preventDefault();
        this.fireBack();
        return;
      }

      if (!this.isEnabled) return;

      if (action === 'select') {
        // M4 — handlers personnalisés d'abord (ex: valider le poster central)
        for (let i = this.keyHandlers.length - 1; i >= 0; i--) {
          try {
            if (this.keyHandlers[i](action, e) === true) {
              e.preventDefault();
              return;
            }
          } catch { /* handler isolé */ }
        }
        const activeEl = (document.activeElement as HTMLElement) || this.currentFocusElement;
        if (activeEl && (activeEl.tagName === 'BUTTON' || activeEl.hasAttribute('data-tv-focus'))) {
          audio.playSelect();
        }
        return;
      }

      // Directional keys
      const dir = action as TVDirection;
      for (let i = this.keyHandlers.length - 1; i >= 0; i--) {
        try {
          if (this.keyHandlers[i](dir, e) === true) {
            e.preventDefault();
            return;
          }
        } catch { /* handler isolé */ }
      }

      e.preventDefault();
      this.moveFocus(dir);
      this.listeners.forEach(fn => {
        try { fn(dir); } catch {}
      });
    } catch {
      // Safe fallback
    }
  }

  public moveFocus(direction: TVDirection) {
    try {
      const currentEl = this.getFocusedElement();
      const allFocusables = this.collectCandidates();
      if (allFocusables.length === 0) return;

      if (!currentEl || !allFocusables.includes(currentEl)) {
        // Exigence 8 : ne jamais poser le focus sur un élément invisible —
        // collectCandidates filtre déjà ; on prend le premier visible.
        this.focusElement(allFocusables[0]);
        return;
      }

      // Si le focus courant est hors scope (modale ouverte), le ramener dedans
      const scopeRoot = this.currentScopeRoot();
      if (scopeRoot && !scopeRoot.contains(currentEl)) {
        this.focusElement(allFocusables[0]);
        return;
      }

      const currentRect = currentEl.getBoundingClientRect();
      const currentCenter = {
        x: currentRect.left + currentRect.width / 2,
        y: currentRect.top + currentRect.height / 2,
      };

      let bestCandidate: HTMLElement | null = null;
      let minDistance = Infinity;

      for (const el of allFocusables) {
        if (el === currentEl) continue;

        const rect = el.getBoundingClientRect();
        const center = {
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
        };

        const dx = center.x - currentCenter.x;
        const dy = center.y - currentCenter.y;

        let isCandidate = false;
        let primaryDist = 0;
        let secondaryDist = 0;

        switch (direction) {
          case 'up':
            isCandidate = dy < -8;
            primaryDist = Math.abs(dy);
            secondaryDist = Math.abs(dx);
            break;
          case 'down':
            isCandidate = dy > 8;
            primaryDist = Math.abs(dy);
            secondaryDist = Math.abs(dx);
            break;
          case 'left':
            isCandidate = dx < -8;
            primaryDist = Math.abs(dx);
            secondaryDist = Math.abs(dy);
            break;
          case 'right':
            isCandidate = dx > 8;
            primaryDist = Math.abs(dx);
            secondaryDist = Math.abs(dy);
            break;
        }

        if (isCandidate) {
          // Fiabilité D-pad : le déplacement doit être DOMINANT sur l'axe
          // primaire (au moins la moitié du déplacement secondaire), sinon un
          // élément presque perpendiculaire (ex: champ en diagonale basse)
          // capturait le focus au lieu de l'élément réellement à côté.
          if (primaryDist <= secondaryDist * 0.5) {
            isCandidate = false;
          }
        }

        if (isCandidate) {
          const score = primaryDist + (secondaryDist * 2.2);
          if (score < minDistance) {
            minDistance = score;
            bestCandidate = el;
          }
        }
      }

      if (bestCandidate) {
        this.focusElement(bestCandidate);
      }
    } catch {
      // Safe fallback
    }
  }
}

export const tvNav = new TVNavigationService();
