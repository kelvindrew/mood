import { defineConfig } from 'vitest/config';

// Tests unitaires : moteurs de jeu + logique serveur pure (pas de réseau).
// Les tests d'intégration Socket.IO vivent dans tests/integration et sont
// lancés séparément (`npm run test:integration`) car ils démarrent un serveur.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.mjs'],
    testTimeout: 20000,
    hookTimeout: 30000,
  },
});
