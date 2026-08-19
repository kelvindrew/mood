# 🎮 PLAYFLIX — Console de Jeux de Société pour Smart TV & Manettes Mobiles

PLAYFLIX transforme votre Smart TV en console de jeux de société conviviale et vos smartphones en manettes intelligentes interactives.

---

## 🌟 Concept Clé

* **Smart TV = Console & Table de Jeu Partagée** :
  * Interface 10-foot UI cinématographique inspirée de Netflix et des consoles next-gen.
  * Navigation spatiale fluide à la télécommande D-pad (compatible Hisense VIDAA, Google TV / Android TV, Samsung Tizen, LG webOS, TCL).
  * Grand Hero Banner, carrousels de catégories, page dédiée de présentation du jeu et règles.
  * Lobby de salon spectaculaire avec génération instantanée d'un **code court à 4 chiffres** (ex: `4827`) et d'un **QR Code haute définition**.
  * Plateaux de jeux en direct : **Ludo Deluxe**, **Mots Croisés / Scrabble**, **Card Party (8 Américain / Uno)**, et **Quiz Mega Show**.
  * Podium de victoire avec confettis, statistiques et relance de partie immédiate avec le même groupe.

* **Smartphones = Manettes Intelligentes & Écrans Privés** :
  * **Zéro installation requise** : Un joueur scanne le QR Code avec son appareil photo et la manette s'ouvre instantanément dans le navigateur.
  * **Manettes adaptatives selon le jeu** :
    * **Ludo** : Bouton de lancer de dé avec vibration haptique, sélection tactile des pions avec aperçu des cases cibles.
    * **Scrabble** : Chevalet personnel privé de 7 lettres, composeur de mot avec calcul de score potentiel et validation.
    * **Card Party** : Main secrète de cartes (invisible sur la TV), glisser/toucher pour jouer une carte, sélecteur de couleur joker, buzzer UNO !
    * **Quiz Arena** : 4 énormes buzzers tactiles colorés (A, B, C, D) avec retours haptiques et bonus de rapidité.
  * **Lanceur d'Emojis de Réaction** : Emojis animés qui s'envolent et flottent en direct sur l'écran de la Smart TV.

---

## 🚀 Démarrage Rapide

### 1. Lancer le serveur et l'application en mode développement
```bash
npm run dev
```
Cette commande démarre simultanément :
1. Le serveur temps réel WebSocket (Socket.IO + Express) sur le port **3001**.
2. Le client front-end Vite sur le port **5173** (accessible sur tout le réseau local LAN).

### 2. Ouvrir sur la Smart TV ou le PC
* **Sur la TV** : Ouvrez le navigateur de la TV et accédez à `http://<IP_DE_VOTRE_PC>:5173` (ou utilisez l'application Smart TV dédiée).
* **Sur PC (Mode Testeur)** : Ouvrez `http://localhost:5173`. Cliquez sur le bouton **"Tester Manette PC"** en haut à droite pour ouvrir le simulateur de smartphone intégré !

### 3. Connecter les smartphones
* Scannez simplement le QR Code affiché sur la TV ou saisissez l'adresse `http://<IP_DE_VOTRE_PC>:5173/?room=4827` sur le smartphone.

---

## 📺 Déploiement Multiplateforme Smart TV

L'application a été conçue selon les standards W3C Smart TV pour garantir une compatibilité native :

1. **Hisense VIDAA OS** :
   * Packaging WebApp / Hosted App VIDAA via le portail développeur Hisense.
2. **Google TV / Android TV** :
   * Déploiement via WebView / Capacitor TV ou Trusted Web Activity (TWA).
3. **Samsung Tizen TV** :
   * Packaging WGT (`tizen-manifest.xml`) avec support des touches `VK_ENTER`, `VK_BACK` (10009).
4. **LG webOS TV** :
   * Packaging IPK (`appinfo.json`) avec gestion des événements télécommande webOS (461).

---

## 🛠️ Architecture Technique

```
salon/
├── server/
│   ├── index.js                  # Serveur WebSocket + Express avec détection IP LAN
│   ├── rooms.js                  # Gestionnaire de salons, codes à 4 chiffres, rôles
│   └── games/
│       ├── ludoEngine.js         # Moteur Ludo (piste 52 cases, captures, étoiles)
│       ├── wordEngine.js         # Moteur Scrabble (chevalets 7 lettres, bonus MT/MD/LT/LD)
│       ├── cardEngine.js         # Moteur Cartes Uno/8 Américain (mains secrètes, effets)
│       └── quizEngine.js         # Moteur Quiz TV (questions, buzzers, bonus de vitesse)
├── src/
│   ├── tv/                       # Interface 10-foot Smart TV
│   │   ├── TVApp.tsx             # Routeur et conteneur TV
│   │   ├── components/           # Navbar, Hero, Carrousels, Simulateur PC
│   │   ├── views/                # Accueil, Détail, Lobby, Jeu, Résultats, Profils
│   │   └── boards/               # Plateaux Ludo, Scrabble, Cartes, Quiz
│   ├── mobile/                   # Manettes Smartphones
│   │   ├── MobileApp.tsx         # Routeur Manette Mobile
│   │   ├── views/                # Connexion, Lobby, Spectateur
│   │   └── views/controllers/    # Manettes Ludo, Scrabble, Cartes, Quiz
│   ├── services/
│   │   ├── socket.ts             # Client Socket.IO avec reconnexion
│   │   ├── tvNavigation.ts       # Moteur de navigation spatiale D-pad télécommande
│   │   └── audio.ts              # Synthétiseur sonore Web Audio API
│   └── data/
│       └── gamesCatalog.ts       # Catalogue complet des jeux et règles
```
