// Smart TV Remote Spatial Navigation Engine for PLAYFLIX
// Compatible with Hisense VIDAA, Google TV/Android TV, Samsung Tizen, LG webOS, TCL
import { audio } from './audio';

export type TVDirection = 'up' | 'down' | 'left' | 'right';

// Remote KeyCode map for various Smart TV operating systems
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

  // Color keys on TV remotes
  '403': 'red',
  '404': 'green',
  '405': 'yellow',
  '406': 'blue',
};

class TVNavigationService {
  private currentFocusElement: HTMLElement | null = null;
  private isEnabled: boolean = true;
  private listeners: ((direction: TVDirection) => void)[] = [];
  private backListeners: (() => void)[] = [];

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', this.handleKeyDown.bind(this));
    }
  }

  public setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
  }

  public registerBackHandler(callback: () => void): () => void {
    this.backListeners.push(callback);
    return () => {
      this.backListeners = this.backListeners.filter(cb => cb !== callback);
    };
  }

  public onNavigate(callback: (direction: TVDirection) => void): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  public focusElement(el: HTMLElement | null) {
    if (!el || !document.body.contains(el)) return;
    try {
      this.currentFocusElement?.blur();
      this.currentFocusElement = el;
      el.focus();
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

  public setInitialFocus(selector: string = '[data-tv-focus]') {
    setTimeout(() => {
      try {
        const candidates = Array.from(document.querySelectorAll<HTMLElement>(selector))
          .filter(el => !el.hasAttribute('disabled') && el.offsetParent !== null && document.body.contains(el));
        if (candidates.length > 0) {
          this.focusElement(candidates[0]);
        }
      } catch {
        // Fallback safely
      }
    }, 150);
  }

  private handleKeyDown(e: KeyboardEvent) {
    if (!this.isEnabled) return;

    try {
      const key = e.key || e.keyCode?.toString() || '';
      const action = TV_KEYS[key] || TV_KEYS[e.keyCode?.toString()];

      if (!action) return;

      // Handle Back / Escape
      if (action === 'back') {
        e.preventDefault();
        audio.playBack();
        if (this.backListeners.length > 0) {
          const lastListener = this.backListeners[this.backListeners.length - 1];
          if (typeof lastListener === 'function') {
            lastListener();
          }
        }
        return;
      }

      // Handle Enter / OK
      if (action === 'select') {
        const activeEl = (document.activeElement as HTMLElement) || this.currentFocusElement;
        if (activeEl && (activeEl.tagName === 'BUTTON' || activeEl.hasAttribute('data-tv-focus'))) {
          audio.playSelect();
        }
        return;
      }

      // Handle Directional Spatial Navigation (D-Pad)
      if (action === 'up' || action === 'down' || action === 'left' || action === 'right') {
        e.preventDefault();
        this.moveFocus(action);
        this.listeners.forEach(fn => {
          try { fn(action); } catch {}
        });
      }
    } catch {
      // Safe fallback
    }
  }

  public moveFocus(direction: TVDirection) {
    try {
      const currentEl = this.getFocusedElement();
      const allFocusables = Array.from(document.querySelectorAll<HTMLElement>('[data-tv-focus], button, a, input, select, textarea'))
        .filter(el => !el.hasAttribute('disabled') && el.offsetParent !== null && !el.classList.contains('hidden') && document.body.contains(el));

      if (allFocusables.length === 0) return;

      if (!currentEl || !allFocusables.includes(currentEl)) {
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
          isCandidate = dy < -8; // clearly above
          primaryDist = Math.abs(dy);
          secondaryDist = Math.abs(dx);
          break;
        case 'down':
          isCandidate = dy > 8; // clearly below
          primaryDist = Math.abs(dy);
          secondaryDist = Math.abs(dx);
          break;
        case 'left':
          isCandidate = dx < -8; // clearly to the left
          primaryDist = Math.abs(dx);
          secondaryDist = Math.abs(dy);
          break;
        case 'right':
          isCandidate = dx > 8; // clearly to the right
          primaryDist = Math.abs(dx);
          secondaryDist = Math.abs(dy);
          break;
      }

      if (isCandidate) {
        // Weighted distance prioritizing movement in primary axis
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
