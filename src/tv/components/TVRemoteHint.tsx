import React from 'react';

export const TVRemoteHint: React.FC = () => (
  <aside className="mood-remote-hint" role="note" aria-label="Flèches pour déplacer, OK pour choisir, Retour pour revenir">
    <span className="mood-remote-hint__keys">↑ ↓ ← →</span><span>Déplacer</span>
    <span className="mood-remote-hint__keys mood-remote-hint__keys--ok">OK</span><span>Choisir</span>
    <span className="mood-remote-hint__keys">RETOUR</span><span>Précédent</span>
  </aside>
);
