// Wild Rush (Course 3D Multijoueur) Server Engine
// Authoritative 3D multiplayer race engine across 8 natural environments
// Manages continuous runner physical progression, obstacles, animal transformations, combos, bots & rankings.

export const WILD_RUSH_ENVIRONMENTS = [
  {
    id: 'river',
    name: 'Vallée de la Rivière',
    theme: 'river',
    trackStartDist: 0,
    trackEndDist: 125,
    weather: 'mist',
    ambientColor: '#1e3a8a',
    skyColor: '#38bdf8',
    groundColor: '#15803d',
    obstacleTitle: 'RIVIÈRE EN CRUE !',
    obstacleDescription: 'Des remous violents et des rochers glissants barrent la route. Choisis ton animal aquatique !',
    choices: [
      {
        id: 'crocodile',
        name: 'Crocodile',
        emoji: '🐊',
        tagline: 'Blindage & Nage Puissante',
        description: 'Fend les tourbillons et se propulse avec sa queue musclée.',
        efficiency: 'optimal',
        points: 200,
        speedMultiplier: 1.9,
        animalModel: 'crocodile',
      },
      {
        id: 'salmon',
        name: 'Saumon Sauvage',
        emoji: '🐟',
        tagline: 'Agilité Fluviale',
        description: 'Remonte le courant et bondit par-dessus les rapides.',
        efficiency: 'adapted',
        points: 100,
        speedMultiplier: 1.4,
        animalModel: 'salmon',
      },
      {
        id: 'elephant',
        name: 'Éléphant',
        emoji: '🐘',
        tagline: 'Force Brute',
        description: 'Patauge lourdement dans le lit de la rivière.',
        efficiency: 'risky',
        points: 40,
        speedMultiplier: 1.0,
        animalModel: 'elephant',
      },
      {
        id: 'cheetah',
        name: 'Guépard',
        emoji: '🐆',
        tagline: 'Panique Féline',
        description: 'Déteste l’eau, hésite et patine dans la boue.',
        efficiency: 'bad',
        points: -20,
        speedMultiplier: 0.5,
        animalModel: 'cheetah',
      },
    ],
  },
  {
    id: 'jungle',
    name: 'Jungle Tropicale',
    theme: 'jungle',
    trackStartDist: 125,
    trackEndDist: 250,
    weather: 'rain',
    ambientColor: '#064e3b',
    skyColor: '#10b981',
    groundColor: '#14532d',
    obstacleTitle: 'CANOPÉE IMPÉNÉTRABLE !',
    obstacleDescription: 'Lianes suspendues, troncs géants et marécages denses. Quel animal franchit la jungle ?',
    choices: [
      {
        id: 'monkey',
        name: 'Chimpanzé',
        emoji: '🐒',
        tagline: 'Voltigeur Aérien',
        description: 'Se balance de liane en liane au-dessus des obstacles terrestres.',
        efficiency: 'optimal',
        points: 200,
        speedMultiplier: 1.9,
        animalModel: 'monkey',
      },
      {
        id: 'panther',
        name: 'Panthère Noire',
        emoji: '🐆',
        tagline: 'Furtivité & Bonds',
        description: 'Slalome entre les racines géantes avec souplesse.',
        efficiency: 'adapted',
        points: 100,
        speedMultiplier: 1.4,
        animalModel: 'panther',
      },
      {
        id: 'parrot',
        name: 'Grand Perroquet',
        emoji: '🦜',
        tagline: 'Vol Entravé',
        description: 'Tente de voler mais ses ailes heurtent les feuillages denses.',
        efficiency: 'risky',
        points: 40,
        speedMultiplier: 1.0,
        animalModel: 'parrot',
      },
      {
        id: 'rhino',
        name: 'Rhinocéros',
        emoji: '🦏',
        tagline: 'Impact Frontal',
        description: 'S’encastre dans les lianes et s’empêtre dans la végétation.',
        efficiency: 'bad',
        points: -20,
        speedMultiplier: 0.5,
        animalModel: 'rhino',
      },
    ],
  },
  {
    id: 'desert',
    name: 'Désert Aride des Dunes',
    theme: 'desert',
    trackStartDist: 250,
    trackEndDist: 375,
    weather: 'heat_haze',
    ambientColor: '#78350f',
    skyColor: '#f59e0b',
    groundColor: '#d97706',
    obstacleTitle: 'DUNES BRÛLANTES & TEMPÊTE DE SABLE !',
    obstacleDescription: 'Chaleur écrasante à 50°C et sable mouvant. Choisis ton maître du désert !',
    choices: [
      {
        id: 'camel',
        name: 'Dromadaire',
        emoji: '🐪',
        tagline: 'Pieds Larges & Zéro Soif',
        description: 'Ne s’enfonce jamais dans le sable et fonce sans faiblir.',
        efficiency: 'optimal',
        points: 200,
        speedMultiplier: 1.9,
        animalModel: 'camel',
      },
      {
        id: 'fennec',
        name: 'Fennec du Sahara',
        emoji: '🦊',
        tagline: 'Agilité Légère',
        description: 'Galope sur la crête des dunes sans soulever de poussière.',
        efficiency: 'adapted',
        points: 100,
        speedMultiplier: 1.4,
        animalModel: 'fennec',
      },
      {
        id: 'ostrich',
        name: 'Autruche Géante',
        emoji: '🦤',
        tagline: 'Sprint Desséché',
        description: 'Foule le sable à grande vitesse mais s’essouffle vite.',
        efficiency: 'risky',
        points: 40,
        speedMultiplier: 1.0,
        animalModel: 'ostrich',
      },
      {
        id: 'polar_bear',
        name: 'Ours Polaire',
        emoji: '🐻‍❄️',
        tagline: 'Coup de Chaleur',
        description: 'Fourrure étouffante, s’effondre sous le soleil brûlant.',
        efficiency: 'bad',
        points: -20,
        speedMultiplier: 0.5,
        animalModel: 'polar_bear',
      },
    ],
  },
  {
    id: 'arctic',
    name: 'Banquise Polaire',
    theme: 'arctic',
    trackStartDist: 375,
    trackEndDist: 500,
    weather: 'snow',
    ambientColor: '#0f172a',
    skyColor: '#e0f2fe',
    groundColor: '#bae6fd',
    obstacleTitle: 'VERGLAS & BLIZZARD GLACIAL !',
    obstacleDescription: 'Plaques de banquise hyper glissantes et bourrasques de neige. Qui domine la glace ?',
    choices: [
      {
        id: 'polar_bear',
        name: 'Ours Polaire',
        emoji: '🐻‍❄️',
        tagline: 'Griffes Crampons',
        description: 'Adhérence maximale sur la glace et puissance inarrêtable.',
        efficiency: 'optimal',
        points: 200,
        speedMultiplier: 1.9,
        animalModel: 'polar_bear',
      },
      {
        id: 'penguin',
        name: 'Manchot Empereur',
        emoji: '🐧',
        tagline: 'Glissade Ventrale',
        description: 'Se jette sur le ventre et luge à toute vitesse sur la pente.',
        efficiency: 'adapted',
        points: 100,
        speedMultiplier: 1.4,
        animalModel: 'penguin',
      },
      {
        id: 'arctic_wolf',
        name: 'Loup Arctique',
        emoji: '🐺',
        tagline: 'Course Frileuse',
        description: 'Brave le froid mais dérape sur les plaques de verglas.',
        efficiency: 'risky',
        points: 40,
        speedMultiplier: 1.0,
        animalModel: 'arctic_wolf',
      },
      {
        id: 'giraffe',
        name: 'Girafe',
        emoji: '🦒',
        tagline: 'Chute sur Verglas',
        description: 'Longues pattes incontrôlables, grand écart involontaire.',
        efficiency: 'bad',
        points: -20,
        speedMultiplier: 0.5,
        animalModel: 'giraffe',
      },
    ],
  },
  {
    id: 'volcano',
    name: 'Cratère Volcanique',
    theme: 'volcano',
    trackStartDist: 500,
    trackEndDist: 625,
    weather: 'embers',
    ambientColor: '#450a0a',
    skyColor: '#ef4444',
    groundColor: '#292524',
    obstacleTitle: 'COULÉES DE LAVE & FUMEROLLES !',
    obstacleDescription: 'Failles brûlantes et geysers de vapeur. Quel animal survole ou esquive la lave ?',
    choices: [
      {
        id: 'eagle',
        name: 'Aigle Royal',
        emoji: '🦅',
        tagline: 'Survol Thermique',
        description: 'Plane haut dans les airs au-dessus des gouffres ardents.',
        efficiency: 'optimal',
        points: 200,
        speedMultiplier: 1.9,
        animalModel: 'eagle',
      },
      {
        id: 'lizard',
        name: 'Lézard des Roches',
        emoji: '🦎',
        tagline: 'Faufilement Éclair',
        description: 'Se glisse entre les pierres incandescentes sans brûlure.',
        efficiency: 'adapted',
        points: 100,
        speedMultiplier: 1.4,
        animalModel: 'lizard',
      },
      {
        id: 'ibex',
        name: 'Bouc Alpin',
        emoji: '🐐',
        tagline: 'Sauts Précaires',
        description: 'Bondit de pierre en pierre au bord de la coulée rougeoyante.',
        efficiency: 'risky',
        points: 40,
        speedMultiplier: 1.0,
        animalModel: 'ibex',
      },
      {
        id: 'turtle',
        name: 'Tortue Terrestre',
        emoji: '🐢',
        tagline: 'Trop Lente',
        description: 'Incapable de fuir la progression de la coulée de lave.',
        efficiency: 'bad',
        points: -20,
        speedMultiplier: 0.5,
        animalModel: 'turtle',
      },
    ],
  },
  {
    id: 'ocean',
    name: 'Récif & Océan Profond',
    theme: 'ocean',
    trackStartDist: 625,
    trackEndDist: 750,
    weather: 'clear',
    ambientColor: '#0c4a6e',
    skyColor: '#0284c7',
    groundColor: '#0891b2',
    obstacleTitle: 'HOULE OCÉANIQUE GÉANTE !',
    obstacleDescription: 'Ressac puissant et vagues géantes de haute mer. Quel champion des abysses ?',
    choices: [
      {
        id: 'dolphin',
        name: 'Dauphin Agile',
        emoji: '🐬',
        tagline: 'Sauts Hydrodynamiques',
        description: 'Prend la vague, surfe et bondit à travers les crêtes marines.',
        efficiency: 'optimal',
        points: 200,
        speedMultiplier: 1.9,
        animalModel: 'dolphin',
      },
      {
        id: 'shark',
        name: 'Requin Mako',
        emoji: '🦈',
        tagline: 'Torche Sous-Marine',
        description: 'Fend la masse d’eau à 70 km/h sous les vagues.',
        efficiency: 'adapted',
        points: 100,
        speedMultiplier: 1.4,
        animalModel: 'shark',
      },
      {
        id: 'sea_turtle',
        name: 'Tortue Luth',
        emoji: '🐢',
        tagline: 'Nage Rythmique',
        description: 'Pagaie calmement avec ses nageoires mais manque de punch.',
        efficiency: 'risky',
        points: 40,
        speedMultiplier: 1.0,
        animalModel: 'sea_turtle',
      },
      {
        id: 'rabbit',
        name: 'Lapin',
        emoji: '🐇',
        tagline: 'Naufrage Immédiat',
        description: 'Gesticule frénétiquement et coule à pic dans les remous.',
        efficiency: 'bad',
        points: -20,
        speedMultiplier: 0.5,
        animalModel: 'rabbit',
      },
    ],
  },
  {
    id: 'savannah',
    name: 'Grande Savane Africaine',
    theme: 'savannah',
    trackStartDist: 750,
    trackEndDist: 875,
    weather: 'sun',
    ambientColor: '#713f12',
    skyColor: '#fbbf24',
    groundColor: '#ca8a04',
    obstacleTitle: 'SPRINT DES GRANDES PLAINES !',
    obstacleDescription: 'Ligne droite immense d’herbes dorées et acacias. Qui est le maître de la vitesse ?',
    choices: [
      {
        id: 'cheetah',
        name: 'Guépard Doré',
        emoji: '🐆',
        tagline: 'Vitesse Éclair (110 km/h)',
        description: 'Accélération foudroyante qui dépose tous les concurrents.',
        efficiency: 'optimal',
        points: 200,
        speedMultiplier: 1.9,
        animalModel: 'cheetah',
      },
      {
        id: 'gazelle',
        name: 'Gazelle de Thomson',
        emoji: '🦌',
        tagline: 'Foulées Aériennes',
        description: 'Enchaîne les bonds gracieux à grande allure constante.',
        efficiency: 'adapted',
        points: 100,
        speedMultiplier: 1.4,
        animalModel: 'gazelle',
      },
      {
        id: 'lion',
        name: 'Lion Majestueux',
        emoji: '🦁',
        tagline: 'Charge Lourde',
        description: 'Course puissante mais manque d’endurance sur la durée.',
        efficiency: 'risky',
        points: 40,
        speedMultiplier: 1.0,
        animalModel: 'lion',
      },
      {
        id: 'sloth',
        name: 'Paresseux',
        emoji: '🦥',
        tagline: 'Ralenti Absolu',
        description: 'Avance de 3 centimètres par minute dans les herbes.',
        efficiency: 'bad',
        points: -20,
        speedMultiplier: 0.5,
        animalModel: 'sloth',
      },
    ],
  },
  {
    id: 'mountain',
    name: 'Sommets Alpins & Ligne d’Arrivée',
    theme: 'mountain',
    trackStartDist: 875,
    trackEndDist: 1000,
    weather: 'clear',
    ambientColor: '#1e293b',
    skyColor: '#60a5fa',
    groundColor: '#475569',
    obstacleTitle: 'FALAISE VERTICALE & SPRINT FINAL !',
    obstacleDescription: 'Paroi rocheuse vertigineuse avant l’arche d’arrivée ! Qui conquiert le sommet ?',
    choices: [
      {
        id: 'ibex',
        name: 'Bouquetin des Alpes',
        emoji: '🐐',
        tagline: 'Sabots Ventouses',
        description: 'Grimpe à 90° sur le roc et sprinte vers l’arche de victoire !',
        efficiency: 'optimal',
        points: 200,
        speedMultiplier: 1.9,
        animalModel: 'ibex',
      },
      {
        id: 'snow_leopard',
        name: 'Léopard des Neiges',
        emoji: '🐆',
        tagline: 'Bonds Félins Vertigineux',
        description: 'Franchit les crevasses d’un bond prodigieux vers l’arrivée.',
        efficiency: 'adapted',
        points: 100,
        speedMultiplier: 1.4,
        animalModel: 'snow_leopard',
      },
      {
        id: 'falcon',
        name: 'Faucon Pèlerin',
        emoji: '🦅',
        tagline: 'Piqué Aérien',
        description: 'Survole la paroi mais la ligne au sol demande de se poser.',
        efficiency: 'risky',
        points: 40,
        speedMultiplier: 1.0,
        animalModel: 'falcon',
      },
      {
        id: 'hippo',
        name: 'Hippopotame',
        emoji: '🦛',
        tagline: 'Poids Plomb',
        description: 'Glisse au bas de la falaise, impossible de gravir la pente.',
        efficiency: 'bad',
        points: -20,
        speedMultiplier: 0.5,
        animalModel: 'hippo',
      },
    ],
  },
];

export class WildRushEngine {
  constructor(players, onStateChange, onGameOver, settings = {}) {
    this.rawPlayers = players || [];
    this.onStateChange = onStateChange;
    this.onGameOver = onGameOver;
    this.settings = settings;

    // Minimum 2 runners: if solo host, add 3 bots for full 4-runner experience!
    const initialPlayers = [...this.rawPlayers];
    const defaultColors = ['red', 'blue', 'green', 'yellow'];

    while (initialPlayers.length < 4) {
      const idx = initialPlayers.length;
      initialPlayers.push({
        id: `bot_rush_${Date.now()}_${idx}`,
        name: ['🤖 Zephyr Bot', '🤖 Swift AI', '🤖 Apex Runner', '🤖 Turbo Neo'][idx % 4],
        avatar: ['🐆', '🦅', '🐬', '🐺'][idx % 4],
        color: defaultColors[idx % defaultColors.length],
        isBot: true,
        botDifficulty: settings.difficulty || 'medium',
      });
    }

    // Exactly 4 runners on track
    this.runners = initialPlayers.slice(0, 4).map((p, idx) => ({
      id: p.id,
      name: p.name || `Coureur ${idx + 1}`,
      color: p.color || defaultColors[idx],
      avatar: p.avatar || '🏃',
      isBot: Boolean(p.isBot),
      botDifficulty: p.botDifficulty || 'medium',
      distance: 0, // meters (0 -> 1000m)
      progressPercent: 0,
      lane: idx, // couloir de 0 à 3
      baseSpeed: 18.0, // base m/s (1000m / ~55s racing time)
      currentSpeed: 18.0,
      rank: idx + 1,
      comboCount: 0,
      boostActive: false,
      boostTimeLeft: 0,
      activeAnimal: 'Humain Sprinter',
      activeAnimalModel: 'runner',
      lastDecision: null,
      hasChosenCurrent: false,
      isFinished: false,
      finishRank: undefined,
      finishTime: undefined,
      optimalChoicesCount: 0,
      score: 0,
    }));

    this.totalTrackLength = 1000; // 1000 meters
    this.environments = WILD_RUSH_ENVIRONMENTS;
    this.currentEnvIndex = 0;
    this.phase = 'countdown'; // 'countdown' | 'racing' | 'challenge' | 'obstacle_reaction' | 'finished'
    this.countdown = 3;
    this.challengeTimeLeft = 8;
    this.challengeTotalTime = 8;
    this.challengeActiveEnv = null;
    this.finishedPlayers = [];
    this.winnerId = null;
    this.raceStartTime = null;

    this.loopTimer = null;
    this.botDecisionTimers = [];
    this.countdownTimer = null;

    this.startCountdown();
  }

  startCountdown() {
    this.phase = 'countdown';
    this.countdown = 3;
    this.emitState();

    this.countdownTimer = setInterval(() => {
      this.countdown--;
      if (this.countdown <= 0) {
        clearInterval(this.countdownTimer);
        this.startRace();
      } else {
        this.emitState();
      }
    }, 1000);
  }

  startRace() {
    this.phase = 'racing';
    this.raceStartTime = Date.now();
    this.emitState();

    // 100ms authoritative tick rate (smooth and light for network)
    const TICK_MS = 100;
    this.loopTimer = setInterval(() => {
      this.updatePhysics(TICK_MS / 1000);
    }, TICK_MS);
  }

  updatePhysics(dt) {
    if (this.phase === 'finished') return;

    // During active challenge, runners continue to run at 40% speed while thinking
    const speedFactor = this.phase === 'challenge' ? 0.45 : 1.0;

    for (const runner of this.runners) {
      if (runner.isFinished) continue;

      // Handle boost duration
      if (runner.boostActive) {
        runner.boostTimeLeft -= dt;
        if (runner.boostTimeLeft <= 0) {
          runner.boostActive = false;
        }
      }

      // Smooth speed decay towards base speed
      const targetSpeed = runner.boostActive
        ? runner.baseSpeed * (runner.lastDecision?.efficiency === 'optimal' ? 1.8 : 1.3)
        : runner.baseSpeed;

      runner.currentSpeed += (targetSpeed - runner.currentSpeed) * (dt * 2.5);

      // Rubber-banding: trailing runners in 3rd or 4th get slight momentum boost (+10%)
      const catchupBoost = runner.rank >= 3 ? 1.12 : 1.0;

      runner.distance += runner.currentSpeed * speedFactor * catchupBoost * dt;
      runner.progressPercent = Math.min(100, Math.round((runner.distance / this.totalTrackLength) * 100));

      // Check finish line crossing
      if (runner.distance >= this.totalTrackLength && !runner.isFinished) {
        runner.isFinished = true;
        runner.distance = this.totalTrackLength;
        runner.progressPercent = 100;
        runner.finishTime = ((Date.now() - this.raceStartTime) / 1000).toFixed(1);
        runner.finishRank = this.finishedPlayers.length + 1;

        this.finishedPlayers.push({
          id: runner.id,
          name: runner.name,
          rank: runner.finishRank,
          time: runner.finishTime,
          score: runner.score,
        });

        if (!this.winnerId) {
          this.winnerId = runner.id;
        }

        // If all human runners finished OR 1st runner finished > 8s ago, wrap up race
        if (this.finishedPlayers.length >= this.runners.length || this.finishedPlayers.length === 1) {
          setTimeout(() => {
            this.finishRace();
          }, 8000);
        }
      }
    }

    // Update real-time ranks based on distance
    const sorted = [...this.runners].sort((a, b) => {
      if (a.isFinished && b.isFinished) return (a.finishRank || 0) - (b.finishRank || 0);
      if (a.isFinished) return -1;
      if (b.isFinished) return 1;
      return b.distance - a.distance;
    });

    sorted.forEach((r, idx) => {
      const runner = this.runners.find(p => p.id === r.id);
      if (runner) runner.rank = idx + 1;
    });

    // Determine current environment based on leader distance
    const leaderDist = sorted[0]?.distance || 0;
    const nextEnvIdx = this.environments.findIndex(
      env => leaderDist >= env.trackStartDist && leaderDist < env.trackEndDist
    );

    if (nextEnvIdx !== -1 && nextEnvIdx !== this.currentEnvIndex) {
      this.currentEnvIndex = nextEnvIdx;
      // Trigger new environment challenge when leader enters new terrain zone
      this.triggerChallenge(this.environments[nextEnvIdx]);
    }

    this.emitState();
  }

  triggerChallenge(env) {
    if (this.phase === 'challenge' || this.phase === 'finished') return;

    this.phase = 'challenge';
    this.challengeActiveEnv = env;
    this.challengeTimeLeft = 8;
    this.challengeTotalTime = 8;

    // Reset decision flags for all active runners
    this.runners.forEach(r => {
      r.hasChosenCurrent = false;
    });

    // Schedule AI bot choices with realistic latency (1.5s - 5.0s)
    this.botDecisionTimers.forEach(t => clearTimeout(t));
    this.botDecisionTimers = [];

    this.runners.filter(r => r.isBot && !r.isFinished).forEach(bot => {
      const delay = Math.random() * 3000 + 1500; // 1.5 to 4.5s
      const timer = setTimeout(() => {
        if (this.phase === 'challenge') {
          const choice = this.pickBotChoice(env, bot.botDifficulty);
          if (choice) {
            this.submitChoice(bot.id, choice.id);
          }
        }
      }, delay);
      this.botDecisionTimers.push(timer);
    });

    // Countdown challenge timer
    const challengeInterval = setInterval(() => {
      if (this.phase !== 'challenge') {
        clearInterval(challengeInterval);
        return;
      }

      this.challengeTimeLeft -= 1;
      this.emitState();

      // Check if all active runners have chosen
      const allChosen = this.runners.filter(r => !r.isFinished).every(r => r.hasChosenCurrent);

      if (this.challengeTimeLeft <= 0 || allChosen) {
        clearInterval(challengeInterval);
        this.resolveChallenge(env);
      }
    }, 1000);

    this.emitState();
  }

  pickBotChoice(env, difficulty = 'medium') {
    const choices = env.choices;
    const optimal = choices.find(c => c.efficiency === 'optimal');
    const adapted = choices.find(c => c.efficiency === 'adapted');
    const risky = choices.find(c => c.efficiency === 'risky');
    const bad = choices.find(c => c.efficiency === 'bad');

    const rand = Math.random();
    if (difficulty === 'hard') {
      return rand < 0.85 ? optimal : adapted;
    } else if (difficulty === 'easy') {
      if (rand < 0.40) return optimal;
      if (rand < 0.70) return adapted;
      if (rand < 0.90) return risky;
      return bad;
    } else {
      // medium
      if (rand < 0.65) return optimal;
      if (rand < 0.90) return adapted;
      return risky;
    }
  }

  submitChoice(playerId, choiceId) {
    if (this.phase !== 'challenge') return;
    const runner = this.runners.find(r => r.id === playerId);
    if (!runner || runner.isFinished || runner.hasChosenCurrent) return;

    const env = this.challengeActiveEnv || this.environments[this.currentEnvIndex];
    if (!env) return;

    const choice = env.choices.find(c => c.id === choiceId);
    if (!choice) return;

    runner.hasChosenCurrent = true;
    runner.activeAnimal = choice.name;
    runner.activeAnimalModel = choice.animalModel;

    // Calculate score, combo and boost effects
    let bonusText;
    if (choice.efficiency === 'optimal') {
      runner.comboCount += 1;
      runner.optimalChoicesCount += 1;
      const comboMult = runner.comboCount >= 3 ? 1.5 : 1.0;
      const earned = Math.round(choice.points * comboMult);
      runner.score += earned;
      runner.boostActive = true;
      runner.boostTimeLeft = 4.0; // 4 seconds of super speed
      bonusText = runner.comboCount >= 3 ? `🔥 COMBO x${runner.comboCount} (+${earned} pts)` : `⚡ BOOST OPTIMAL (+${earned} pts)`;
    } else if (choice.efficiency === 'adapted') {
      runner.score += choice.points;
      runner.boostActive = true;
      runner.boostTimeLeft = 2.0;
      bonusText = `👍 CHOIX ADAPTÉ (+${choice.points} pts)`;
    } else if (choice.efficiency === 'risky') {
      runner.comboCount = 0; // combo break
      runner.score += choice.points;
      bonusText = `⚠️ CHOIX RISQUÉ (+${choice.points} pts)`;
    } else {
      // bad choice
      runner.comboCount = 0; // combo break
      runner.score = Math.max(0, runner.score + choice.points);
      runner.currentSpeed = runner.baseSpeed * 0.4; // slowdown penalty
      bonusText = `❌ MALUS DE VITESSE (-20 pts)`;
    }

    runner.lastDecision = {
      choiceId: choice.id,
      animalName: choice.name,
      efficiency: choice.efficiency,
      bonusText,
      submittedAt: Date.now(),
    };

    // If all runners have answered, resolve challenge immediately without waiting for timeout
    const allChosen = this.runners.filter(r => !r.isFinished).every(r => r.hasChosenCurrent);
    if (allChosen) {
      this.resolveChallenge(env);
    } else {
      this.emitState();
    }
  }

  resolveChallenge(env) {
    this.phase = 'obstacle_reaction';
    this.emitState();

    // Brief reaction celebration phase (2.5s) where animals sprint and jump through obstacle
    setTimeout(() => {
      if (this.phase === 'obstacle_reaction') {
        this.phase = 'racing';
        this.emitState();
      }
    }, 2500);
  }

  cheer(playerId) {
    const runner = this.runners.find(r => r.id === playerId);
    if (!runner) return;
    // Small encouraging speed bump on tapping cheer button
    runner.currentSpeed = Math.min(runner.baseSpeed * 1.5, runner.currentSpeed + 0.8);
    this.emitState();
  }

  finishRace() {
    if (this.phase === 'finished') return;
    this.phase = 'finished';

    if (this.loopTimer) {
      clearInterval(this.loopTimer);
      this.loopTimer = null;
    }
    this.botDecisionTimers.forEach(t => clearTimeout(t));

    // Fill any unfinished runners into finishedPlayers ranked by distance
    const remaining = this.runners
      .filter(r => !this.finishedPlayers.some(f => f.id === r.id))
      .sort((a, b) => b.distance - a.distance);

    remaining.forEach(r => {
      r.isFinished = true;
      r.finishRank = this.finishedPlayers.length + 1;
      this.finishedPlayers.push({
        id: r.id,
        name: r.name,
        rank: r.finishRank,
        time: ((Date.now() - this.raceStartTime) / 1000).toFixed(1),
        score: r.score,
      });
    });

    if (!this.winnerId && this.finishedPlayers.length > 0) {
      this.winnerId = this.finishedPlayers[0].id;
    }

    this.emitState();

    if (typeof this.onGameOver === 'function') {
      this.onGameOver(this.winnerId);
    }
  }

  getState() {
    return this.getPublicState();
  }

  getPublicState() {
    return {
      phase: this.phase,
      countdown: this.countdown,
      totalTrackLength: this.totalTrackLength,
      currentEnvIndex: this.currentEnvIndex,
      currentEnvironment: this.environments[this.currentEnvIndex],
      environments: this.environments,
      players: this.runners,
      challengeTimeLeft: this.challengeTimeLeft,
      challengeTotalTime: this.challengeTotalTime,
      winnerId: this.winnerId,
      finishedPlayers: this.finishedPlayers,
      cameraMode: this.phase === 'finished' ? 'finish_cinematic' : this.phase === 'challenge' ? 'challenge_zoom' : 'follow_pack',
    };
  }

  getPrivateState(playerId) {
    const runner = this.runners.find(r => r.id === playerId);
    return {
      myChoiceId: runner?.lastDecision?.choiceId || null,
      myChoiceConfirmed: Boolean(runner?.hasChosenCurrent),
    };
  }

  emitState() {
    if (typeof this.onStateChange === 'function') {
      this.onStateChange(this.getPublicState());
    }
  }

  destroy() {
    if (this.loopTimer) clearInterval(this.loopTimer);
    if (this.countdownTimer) clearInterval(this.countdownTimer);
    this.botDecisionTimers.forEach(t => clearTimeout(t));
    this.loopTimer = null;
    this.countdownTimer = null;
  }
}
