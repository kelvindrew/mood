# 🎮 PLAYFLIX — Console de Jeux de Société pour Smart TV & Manettes Mobiles

PLAYFLIX transforme votre Smart TV en console de jeux de salon conviviale et vos smartphones en manettes intelligentes interactives.

---

## 🌟 Concept Clé

* **Smart TV = Console & Table de Jeu Partagée** :
  * Interface 10-foot UI cinématographique inspirée de Netflix et des consoles de salon.
  * Navigation spatiale fluide à la télécommande D-pad (compatible Hisense VIDAA, Google TV / Android TV, Samsung Tizen, LG webOS, TCL).
  * Grand Hero Banner, carrousels de catégories, page dédiée de présentation du jeu et règles.
  * Lobby de salon spectaculaire avec génération instantanée d'un **code court à 4 chiffres** (ex: `4827`) et d'un **QR Code haute définition**.
  * Catalogue étendu de jeux : **Ludo Deluxe**, **Mots Croisés / Scrabble**, **Card Party (8 Américain / Uno)**, **Quiz Mega Show**, **Bataille Navale**, **Meme Factory**, **Petit Bac**, **Fake News**, **Menteur**, **Poker**, **Wild Rush 3D**, etc.
  * Podium de victoire avec statistiques et relance de partie immédiate avec le même groupe.

* **Smartphones = Manettes Intelligentes & Écrans Privés** :
  * **Zéro installation requise** : Un joueur scanne le QR Code avec son appareil photo et la manette s'ouvre instantanément dans le navigateur.
  * **Manettes adaptatives selon le jeu** :
    * **Ludo** : Lancer de dé haptique, sélection tactile des pions avec aperçu des cases cibles.
    * **Scrabble** : Chevalet personnel privé de 7 lettres, composeur de mot avec calcul de score et validation.
    * **Card Party / Menteur / Poker** : Main secrète de cartes (invisible sur la TV), glisser/toucher pour jouer.
    * **Bataille Navale** : Placement secret de la flotte et grille de tir radar personnelle.
    * **Quiz Arena** : 4 buzzers tactiles colorés (A, B, C, D) avec retours haptiques et bonus de rapidité.
  * **Lanceur d'Emojis de Réaction** : Emojis animés qui s'envolent et flottent en direct sur l'écran de la Smart TV.

---

## 🚀 Démarrage Rapide

### 1. Installation des dépendances
```bash
npm install
```

### 2. Lancer le serveur et l'application en mode développement
```bash
npm run dev
```
Cette commande démarre simultanément :
1. Le serveur temps réel WebSocket (Socket.IO + Express) sur le port **3001**.
2. Le client front-end Vite sur le port **5173** (accessible sur tout le réseau local LAN).

### 3. Ouvrir sur la Smart TV ou le PC
* **Sur la TV** : Ouvrez le navigateur de la TV et accédez à `http://<IP_DE_VOTRE_PC>:5173`.
* **Sur PC (Mode Testeur)** : Ouvrez `http://localhost:5173`. Cliquez sur le bouton **"Tester Manette PC"** en haut à droite pour ouvrir le simulateur de smartphone intégré.

### 4. Connecter les smartphones
* Scannez le QR Code affiché sur la TV ou saisissez l'adresse `http://<IP_DE_VOTRE_PC>:5173/?room=4827` sur le smartphone.

---

## ⚙️ Variables d'Environnement

Créez un fichier `.env` à la racine ou configurez les variables d'environnement sur votre serveur :

| Variable | Description | Valeur par défaut |
| :--- | :--- | :--- |
| `PORT` | Port d'écoute du serveur Node.js / Express / Socket.IO | `3001` |
| `VITE_SOCKET_URL` | URL du serveur WebSocket consommée par le client web en production | Origine courante (`window.location.origin`) |
| `ADMIN_API_KEY` | Clé secrète requise pour administrer le Studio de Contenu IA (`/api/ai/*`) | Définie par défaut en dev local (`playflix-admin-secret-dev`) |
| `ADMIN_PASSWORD` | Mot de passe alternatif pour l'administration et le CMS | Même valeur que `ADMIN_API_KEY` |
| `GEMINI_API_KEY` | Clé API Google Gemini pour la génération dynamique de questions et contenus | `""` (optionnel si non utilisé) |
| `CORS_ALLOWED_ORIGINS` | Liste d'origines autorisées séparées par des virgules pour les requêtes HTTP et Socket.IO | En dev : `localhost`, `127.0.0.1` et sous-réseaux LAN (`192.168.*`, `10.*`, `172.16-31.*`) |
| `NODE_ENV` | Environnement d'exécution (`development` ou `production`) | `development` |

---

## 🔒 Architecture de Sécurité & Robustesse

L'application intègre un modèle de sécurité renforcé pour les salons, les joueurs et les APIs d'IA :

### 1. Authentification des Joueurs & Reconnexion Sécurisée
* **Session Tokens Imprédictibles** : Chaque joueur reçoit lors de `join_room` un token de session cryptographique aléatoire de 256 bits (`crypto.randomBytes(32)`).
* **Sanitisation stricte de l'état public** : Les `sessionToken` sont stockés en mémoire serveur et ne sont **jamais** diffusés dans les broadcasts `room_state_update`.
* **Reconnexion vérifiée** : L'événement `reconnect_player` impose la fourniture du `sessionToken` correspondant à l'identifiant. Toute tentative d'usurpation d'un `playerId` arbitraire est rejetée.
* **Résolution stricte de l'acteur** : Les actions de jeu (`game_action`) identifient le joueur exclusivement via son socket authentifié (`socket.id`). Aucun paramètre `payload.playerId` fourni par le client n'est accepté aveuglément. Les spectateurs et sockets tiers ne peuvent pas exécuter d'actions.

### 2. Autorisation des Salons & Rôles
* Les actions d'administration du salon (`add_bot`, `remove_bot`, `update_settings`, `select_game`, `start_game`, `replay_game`, `return_to_lobby`) sont strictement réservées à **l'hôte authentifié** (écran TV créateur ou premier joueur désigné hôte muni de son jeton).

### 3. Confidentialité & Fragments Privés
* **États de jeu publics** : L'état diffusé à l'ensemble du salon (`game_state_update`) ne contient aucune donnée sensible (chevalets Scrabble, cartes en main, coordonnées secrètes des navires de Bataille Navale, votes anonymes non révélés).
* **Fragments privés unicast** : Les informations confidentielles sont transmises individuellement via l'événement `private_state` uniquement au socket authentifié du joueur concerné.

### 4. Protection du Studio IA (`/api/ai/*`)
* **Authentification obligatoire** : Les endpoints `/api/ai/config`, `/api/ai/generate` et `/api/ai/publish` exigent un token d'administration valide (`Bearer <token>`, header `x-admin-key` ou `x-admin-password`).
* **Rate Limiting** : Plafond strict de requêtes (10 requêtes par minute) pour prévenir les abus de génération IA.
* **Validation des Schémas & Limites de Charge** : Les corps de requêtes sont limités à **500 Ko** et validés rigoureusement (types de jeux autorisés, cardinalités des lots, formats de questions).
* **Protection des Secrets** : La clé Gemini est transmise via l'en-tête HTTP `x-goog-api-key` (jamais exposée dans l'URL) et nettoyée de tout log applicatif.

---

## 🌐 Déploiement : Local vs Production

### Développement Local (LAN)
* En mode développement (`NODE_ENV=development`), le serveur détecte automatiquement les adresses IP locales et autorise les connexions depuis les appareils du réseau local (PC, smartphones, TV connectée au Wi-Fi domestique).
* Les variables d'environnement par défaut permettent une prise en main immédiate sans configuration complexe.

### Déploiement en Production
1. **Activer le mode production** :
   ```bash
   NODE_ENV=production
   ```
2. **Restreindre les origines CORS** :
   Définissez explicitement vos domaines autorisés :
   ```bash
   CORS_ALLOWED_ORIGINS=https://tv.mondomaine.com,https://play.mondomaine.com
   ```
3. **Sécuriser les Clés & Secrets** :
   * Définir un `ADMIN_API_KEY` fort et imprédictible.
   * Fournir `GEMINI_API_KEY` via les secrets d'environnement de votre hébergeur (ne jamais commiter de fichier `.env` contenant des clés réelles).
4. **HTTPS / WSS** :
   * Déployez derrière un reverse-proxy HTTPS/TLS (Nginx, Caddy, Cloudflare, etc.) afin de chiffrer les flux WebSocket et les tokens de session en transit.
5. **Construire le client web** :
   ```bash
   npm run build
   ```

---

## 🧪 Tests & Validation

Le projet dispose d'une suite de tests automatisés couvrant les moteurs de jeux, la sécurité des salons et les endpoints d'API :

```bash
# Exécuter les tests unitaires (moteurs de jeux, sécurité, auth, IA)
npm test

# Exécuter les tests d'intégration (cycle de vie complet Socket.IO, reconnexion, sessions)
npm run test:integration

# Exécuter tous les tests
npm run test:all

# Vérification du code (ESLint)
npm run lint

# Vérification TypeScript et build Vite
npm run build
```

---

## 🛠️ Architecture Technique

```
salon/
├── server/
│   ├── index.js                  # Serveur WebSocket + Express, middleware auth & CORS
│   ├── rooms.js                  # Salons, sessions imprédictibles, rôles hôte & sécurité
│   ├── services/
│   │   └── geminiService.js      # Intégration Google Gemini sécurisée (headers, sanitisation)
│   └── games/                    # Moteurs de jeux temps réel (états publics & privés)
│       ├── ludoEngine.js         # Moteur Ludo
│       ├── wordEngine.js         # Moteur Scrabble (chevalets privés)
│       ├── cardEngine.js         # Moteur Cartes Uno/8 Américain
│       ├── quizEngine.js         # Moteur Quiz TV
│       ├── navalBattleEngine.js  # Moteur Bataille Navale (flottes privées)
│       ├── memeFactoryEngine.js  # Moteur Meme Factory
│       ├── wildRushEngine.js     # Moteur Wild Rush 3D
│       └── ...
├── src/
│   ├── tv/                       # Interface 10-foot Smart TV
│   │   ├── TVApp.tsx             # Routeur et conteneur TV
│   │   ├── components/           # Navigation spatiale, Hero, Carrousels
│   │   ├── views/                # Accueil, Détail, Lobby, Jeu, Admin, Résultats
│   │   └── boards/               # Plateaux de jeux TV
│   ├── mobile/                   # Manettes Smartphones
│   │   ├── MobileApp.tsx         # Routeur Manette Mobile
│   │   └── views/controllers/    # Manettes adaptées par jeu
│   ├── services/
│   │   ├── socket.ts             # Client Socket.IO avec persistance des tokens de session
│   │   ├── aiContentStudioService.ts # Client Studio IA avec transmission sécurisée de la clé
│   │   └── tvNavigation.ts       # Moteur de navigation spatiale télécommande D-pad
│   └── context/
│       └── GameContext.tsx       # Gestionnaire d'état React global et socket
└── tests/
    ├── unit/                     # Tests unitaires de règles, moteurs et sécurité
    └── integration/              # Tests d'intégration du cycle de vie des salons
```
