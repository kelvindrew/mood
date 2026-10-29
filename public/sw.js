/**
 * MOOD Local Cache Service Worker
 * Optimisé pour Smart TV Hisense et manettes mobiles
 * Garantit 0ms de latence pour tous les scripts, composants de jeu, affiches et styles.
 */

const CACHE_VERSION = 'mood-cache-v1';
const RUNTIME_CACHE = 'mood-runtime-v1';

// Fichiers statiques prioritaires à mettre immédiatement en cache local
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon.svg',

  // Affiches des 23 jeux de salon
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

  // Bannières panoramiques TV
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

// Installation : pré-chargement en arrière-plan sans bloquer
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then(async (cache) => {
      // Préchargement résilient : chaque fichier est isolé pour éviter l'échec global
      await Promise.allSettled(
        PRECACHE_URLS.map(async (url) => {
          try {
            const response = await fetch(url, { cache: 'no-cache' });
            if (response.ok) {
              await cache.put(url, response);
            }
          } catch (e) {
            // Ignorer silencieusement si un fichier externe est temporairement inaccessible
          }
        })
      );
    }).then(() => self.skipWaiting())
  );
});

// Activation : purge des anciennes versions du cache pour garantir la fraîcheur
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_VERSION && name !== RUNTIME_CACHE)
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// Interception des requêtes réseau : priorité vitesse locale (0ms)
self.addEventListener('fetch', (event) => {
  const request = event.request;

  // Ignorer les requêtes non-GET
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Ne JAMAIS intercepter les connexions Socket.io en direct (WebSockets/Polling en temps réel)
  if (url.pathname.includes('/socket.io')) return;

  // Ignorer les requêtes non-HTTP (comme chrome-extension:)
  if (!url.protocol.startsWith('http')) return;

  // STRATÉGIE 1 : Fichiers statiques immuables Vite (/assets/), jeux, images, polices
  // -> CACHE-FIRST (Réponse instantanée 0ms depuis le stockage local)
  const isStaticAsset =
    url.pathname.startsWith('/assets/') ||
    url.pathname.startsWith('/games/') ||
    url.pathname.startsWith('/landscapes/') ||
    url.pathname.startsWith('/themes/') ||
    url.hostname.includes('fonts.gstatic.com') ||
    request.destination === 'script' ||
    request.destination === 'style' ||
    request.destination === 'image' ||
    request.destination === 'font';

  if (isStaticAsset) {
    event.respondWith(
      caches.match(request).then(async (cachedResponse) => {
        if (cachedResponse) {
          // Déjà en local ! Retour immédiat
          return cachedResponse;
        }

        // Sinon, téléchargement, mise en cache local pour la prochaine fois et retour
        try {
          const networkResponse = await fetch(request);
          if (networkResponse && networkResponse.status === 200) {
            const cache = await caches.open(RUNTIME_CACHE);
            cache.put(request, networkResponse.clone());
          }
          return networkResponse;
        } catch (error) {
          // En cas de panne réseau, tente de renvoyer un fallback si disponible
          return cachedResponse || new Response('Asset indisponible hors-ligne', { status: 503 });
        }
      })
    );
    return;
  }

  // STRATÉGIE 2 : Google Fonts CSS (Stale-While-Revalidate)
  if (url.hostname === 'fonts.googleapis.com') {
    event.respondWith(
      caches.match(request).then((cached) => {
        const fetchPromise = fetch(request).then((networkRes) => {
          if (networkRes.ok) {
            caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, networkRes.clone()));
          }
          return networkRes;
        }).catch(() => cached);
        return cached || fetchPromise;
      })
    );
    return;
  }

  // STRATÉGIE 3 : Navigation HTML principale (Network-First avec Fallback Cache Instantané)
  if (request.mode === 'navigate' || request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      (async () => {
        try {
          // Tente de récupérer la version la plus fraîche avec un court timeout
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 2000);
          const networkResponse = await fetch(request, { signal: controller.signal });
          clearTimeout(timeoutId);

          if (networkResponse && networkResponse.status === 200) {
            const cache = await caches.open(CACHE_VERSION);
            cache.put('/', networkResponse.clone());
            cache.put('/index.html', networkResponse.clone());
            return networkResponse;
          }
        } catch (err) {
          // Si le réseau est lent, absent ou en timeout : retour immédiat de la version en cache local
        }

        const cachedHtml = await caches.match('/index.html') || await caches.match('/');
        if (cachedHtml) {
          return cachedHtml;
        }
        return new Response('Application hors ligne', {
          headers: { 'Content-Type': 'text/html; charset=utf-8' },
          status: 200
        });
      })()
    );
    return;
  }

  // Par défaut : réseau avec mise en cache transparente
  event.respondWith(
    caches.match(request).then((cached) => {
      return cached || fetch(request).then((res) => {
        if (res.ok && res.status === 200) {
          caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, res.clone()));
        }
        return res;
      });
    })
  );
});

// Écoute des ordres de préchargement de modules dynamique envoyés par l'application
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'PRELOAD_URLS' && Array.isArray(event.data.urls)) {
    caches.open(RUNTIME_CACHE).then(async (cache) => {
      for (const url of event.data.urls) {
        try {
          const match = await cache.match(url);
          if (!match) {
            const response = await fetch(url);
            if (response.ok) {
              await cache.put(url, response);
            }
          }
        } catch (e) {
          // Ignorer
        }
      }
    });
  }
});
