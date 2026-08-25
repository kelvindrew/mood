// ESLint 9+ flat config — PLAYFLIX
// Objectif : détecter les vrais bugs (hooks, variables mortes, erreurs de
// syntaxe) sans imposer une réécriture stylistique du code existant.
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';

export default tseslint.config(
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      'scratch/**',           // brouillons explicites
      'server/test*.js',      // harnesses manuels legacy remplacés par tests/unit + tests/integration
      '**/*.vsix',
    ],
  },

  // ---- Serveur Node (JS pur) ----
  {
    files: ['server/**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: { ...globals.node },
    },
    plugins: { js },
    rules: {
      ...js.configs.recommended.rules,
      'no-empty': 'off',          // catch{} défensifs volontaires
      'no-console': 'off',        // logs serveur intentionnels
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    },
  },

  // ---- Fichiers de config racine ----
  {
    files: ['*.config.js', '*.config.ts'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: { ...globals.node },
    },
    rules: { ...js.configs.recommended.rules },
  },

  // ---- Front TypeScript / React ----
  ...tseslint.configs.recommended.map((c) => ({
    ...c,
    files: ['src/**/*.{ts,tsx}', 'tests/**/*.{ts,tsx,mjs}'],
  })),
  {
    files: ['src/**/*.{ts,tsx}', 'tests/**/*.{ts,tsx,mjs}'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: { ...globals.browser, ...globals.node, ...globals.es2022 },
    },
    plugins: {
      'react-hooks': reactHooks,
    },
    rules: {
      // Bugs réels => erreur
      'react-hooks/rules-of-hooks': 'error',
      // Qualité deps => avertissement (nombreuses closures volontaires)
      'react-hooks/exhaustive-deps': 'warn',

      '@typescript-eslint/no-unused-vars': ['warn', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
      }],
      // Le codebase utilise beaucoup `any` côté payloads réseau — dette
      // assumée, signalée mais non bloquante.
      '@typescript-eslint/no-explicit-any': 'warn',
      // Les casts `as XGameState` sur les payloads Socket.IO sont le pattern
      // central du projet (état typé serveur -> client).
      '@typescript-eslint/no-unsafe-member-access': 'off',
    },
  },
);
