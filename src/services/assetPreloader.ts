/**
 * MOOD Smart Asset & Module Preloader
 * Permet de télécharger et garder en mémoire/cache local tous les scripts,
 * moteurs 3D, plateaux de jeux TV et manettes mobiles pour une vitesse instantanée (0ms).
 */

const PRECACHE_IMAGES = [
  // Affiches des jeux
  '/games/blackjack.jpg',
  '/games/blind_test.jpg',
  '/games/bomb_party.jpg',
  '/games/card_party.jpg',
  '/games/connect_four.jpg',
  '/games/draw_and_guess.jpg',
  '/games/fake_news.jpg',
  '/games/four_pics.jpg',
  '/games/inter.jpg',
  '/games/jeu_de_pays.jpg',
  '/games/ludo.jpg',
  '/games/meme_factory.jpg',
  '/games/menteur.jpg',
  '/games/naval_battle.jpg',
  '/games/petit_bac.jpg',
  '/games/poker.jpg',
  '/games/president.jpg',
  '/games/quick_games.jpg',
  '/games/quiz.jpg',
  '/games/scrabble.jpg',
  '/games/spy.jpg',
  '/games/werewolf.jpg',
  '/games/wild_rush.jpg',

  // Bannières paysages
  '/landscapes/banner_1_fuji.jpg',
  '/landscapes/banner_2_dolomites.jpg',
  '/landscapes/banner_3_aurora.jpg',
  '/landscapes/banner_4_sahara.jpg',
  '/landscapes/banner_5_lagoon.jpg',
  '/landscapes/banner_6_moraine.jpg',
  '/landscapes/banner_7_halong.jpg',
  '/landscapes/banner_8_santorini.jpg',
  '/landscapes/banner_9_redwoods.jpg',
  '/landscapes/banner_10_patagonia.jpg',
  '/landscapes/banner_11_grand_canyon.jpg',
  '/landscapes/banner_12_maldives.jpg',

  // Thèmes d'ambiance
  '/themes/canyon.png',
  '/themes/emerald.png',
  '/themes/sunset.png'
];

// Lazy module loaders pour le salon TV et les manettes
const TV_BOARD_LOADERS: (() => Promise<unknown>)[] = [
  // Moteur Ludo & 3D (prioritaire)
  () => import('../tv/boards/LudoBoardTV'),
  () => import('../tv/boards/LudoBoard3D'),
  () => import('../tv/views/TVGameDetailView'),
  () => import('../tv/views/TVResultsView'),
  () => import('../tv/views/TVCategoriesView'),
  () => import('../tv/views/TVSettingsView'),

  // Autres plateaux de jeu
  () => import('../tv/boards/WordBoardTV'),
  () => import('../tv/boards/CardBoardTV'),
  () => import('../tv/boards/QuizBoardTV'),
  () => import('../tv/boards/DrawBoardTV'),
  () => import('../tv/boards/WerewolfBoardTV'),
  () => import('../tv/boards/BlindTestBoardTV'),
  () => import('../tv/boards/PresidentBoardTV'),
  () => import('../tv/boards/PokerBoardTV'),
  () => import('../tv/boards/BlackjackBoardTV'),
  () => import('../tv/boards/MenteurBoardTV'),
  () => import('../tv/boards/InterBoardTV'),
  () => import('../tv/boards/FourPicsBoardTV'),
  () => import('../tv/boards/QuickGamesBoardTV'),
  () => import('../tv/boards/SpyBoardTV'),
  () => import('../tv/boards/PetitBacBoardTV'),
  () => import('../tv/boards/FakeNewsBoardTV'),
  () => import('../tv/boards/BombPartyBoardTV'),
  () => import('../tv/boards/NavalBattleBoardTV'),
  () => import('../tv/boards/MemeFactoryBoardTV'),
  () => import('../tv/boards/ConnectFourBoardTV'),
  () => import('../tv/boards/WildRushBoardTV'),
  () => import('../tv/boards/JeuDePaysBoardTV'),
];

const MOBILE_CONTROLLER_LOADERS: (() => Promise<unknown>)[] = [
  () => import('../mobile/views/controllers/LudoController'),
  () => import('../mobile/views/controllers/WordController'),
  () => import('../mobile/views/controllers/CardController'),
  () => import('../mobile/views/controllers/QuizController'),
  () => import('../mobile/views/controllers/DrawController'),
  () => import('../mobile/views/controllers/WerewolfController'),
  () => import('../mobile/views/controllers/BlindTestController'),
  () => import('../mobile/views/controllers/PresidentController'),
  () => import('../mobile/views/controllers/PokerController'),
  () => import('../mobile/views/controllers/BlackjackController'),
  () => import('../mobile/views/controllers/MenteurController'),
  () => import('../mobile/views/controllers/InterController'),
  () => import('../mobile/views/controllers/FourPicsController'),
  () => import('../mobile/views/controllers/QuickGamesController'),
  () => import('../mobile/views/controllers/SpyController'),
  () => import('../mobile/views/controllers/PetitBacController'),
  () => import('../mobile/views/controllers/FakeNewsController'),
  () => import('../mobile/views/controllers/BombPartyController'),
  () => import('../mobile/views/controllers/NavalBattleController'),
  () => import('../mobile/views/controllers/MemeFactoryController'),
  () => import('../mobile/views/controllers/ConnectFourController'),
  () => import('../mobile/views/controllers/WildRushController'),
  () => import('../mobile/views/controllers/JeuDePaysController'),
];

let hasInitialized = false;

/**
 * Enregistrement sécurisé du Service Worker
 */
export async function registerLocalServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/'
    });

    // Écoute des mises à jour éventuelles
    registration.addEventListener('updatefound', () => {
      const installingWorker = registration.installing;
      if (installingWorker) {
        installingWorker.addEventListener('statechange', () => {
          if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
            console.log('[MOOD Cache] Nouvelle version disponible en arrière-plan.');
          }
        });
      }
    });

    return registration;
  } catch (error) {
    console.warn('[MOOD Cache] Échec enregistrement Service Worker:', error);
    return null;
  }
}

/**
 * Déclenchement du préchargement en tâche de fond (Idle)
 * Ne bloque JAMAIS l'affichage initial ni les animations de la TV.
 */
export function startIdleAssetPreloading(mode: 'tv' | 'mobile' = 'tv') {
  if (hasInitialized || typeof window === 'undefined') return;
  hasInitialized = true;

  // Enregistrement du Service Worker
  registerLocalServiceWorker().catch(() => {});

  const runIdleTasks = () => {
    // 1. Préchargement échelonné des images pour décompression GPU
    let imgIdx = 0;
    const preloadNextImage = () => {
      if (imgIdx >= PRECACHE_IMAGES.length) return;
      const src = PRECACHE_IMAGES[imgIdx++];
      const img = new Image();
      img.src = src;
      if ('decode' in img) {
        img.decode().catch(() => {});
      }
      setTimeout(preloadNextImage, 40); // 40ms entre chaque image pour ne pas saturer le thread
    };
    preloadNextImage();

    // 2. Préchargement des modules JS Vite selon le mode
    const loaders = mode === 'mobile' ? MOBILE_CONTROLLER_LOADERS : TV_BOARD_LOADERS;
    let loaderIdx = 0;
    const preloadNextModule = () => {
      if (loaderIdx >= loaders.length) {
        // En mode TV, on peut aussi précharger les manettes mobiles en basse priorité
        if (mode === 'tv') {
          MOBILE_CONTROLLER_LOADERS.forEach((loader, i) => {
            setTimeout(() => {
              loader().catch(() => {});
            }, 1000 + i * 150);
          });
        }
        return;
      }
      const loader = loaders[loaderIdx++];
      loader().catch(() => {});
      setTimeout(preloadNextModule, 100); // 100ms entre chaque module lazy
    };

    // On démarre le préchargement des modules après un court délai
    setTimeout(preloadNextModule, 600);
  };

  // Attente que le navigateur soit totalement inoccupé
  if ('requestIdleCallback' in window) {
    (window as unknown as { requestIdleCallback: (cb: () => void) => void }).requestIdleCallback(() => {
      setTimeout(runIdleTasks, 1500);
    });
  } else {
    setTimeout(runIdleTasks, 2000);
  }
}
