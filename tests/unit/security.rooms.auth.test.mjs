// Tests unitaires de sécurité : authentification des joueurs, reconnexion,
// autorisations d'hôtes, spectateurs et étanchéité des états publics
import { describe, it, expect, beforeEach } from 'vitest';
import { RoomManager } from '../../server/rooms.js';
import { NavalBattleEngine } from '../../server/games/navalBattleEngine.js';
import { MemeFactoryEngine } from '../../server/games/memeFactoryEngine.js';
import { WordEngine } from '../../server/games/wordEngine.js';
import { PokerEngine } from '../../server/games/pokerEngine.js';
import { WerewolfEngine } from '../../server/games/werewolfEngine.js';
import { SpyEngine } from '../../server/games/spyEngine.js';

describe('Sécurité des salons, joueurs et reconnexions', () => {
  let mockIo;
  let roomManager;
  let emittedEvents;

  beforeEach(() => {
    emittedEvents = [];
    mockIo = {
      to: (target) => ({
        emit: (event, data) => {
          emittedEvents.push({ target, event, data });
        },
      }),
    };
    roomManager = new RoomManager(mockIo, '192.168.1.50');
  });

  it('génère un sessionToken secret difficile à deviner à l’entrée et ne l’expose pas dans l’état public', () => {
    const room = roomManager.createRoom('socket_host_tv', 'quiz');
    const joinRes = roomManager.joinRoom(room.code, 'socket_player_1', { name: 'Alice' });

    expect(joinRes.success).toBe(true);
    expect(joinRes.sessionToken).toBeDefined();
    expect(typeof joinRes.sessionToken).toBe('string');
    expect(joinRes.sessionToken.length).toBeGreaterThanOrEqual(32);

    // Le sessionToken ne doit JAMAIS apparaître dans le joueur assaini ni dans l'état public
    expect(joinRes.player.sessionToken).toBeUndefined();
    const publicState = roomManager.getPublicRoomState(room);
    expect(publicState.players[0].sessionToken).toBeUndefined();
    expect(JSON.stringify(publicState)).not.toContain(joinRes.sessionToken);
  });

  it('reconnexion avec justificatif valide : restaure le joueur et envoie le fragment privé', () => {
    const room = roomManager.createRoom('socket_host_tv', 'scrabble');
    const joinRes = roomManager.joinRoom(room.code, 'socket_p1_initial', { name: 'Bob' });
    const p1Id = joinRes.player.id;
    const token = joinRes.sessionToken;

    // Déconnexion simulée
    const p = room.players.find((pl) => pl.id === p1Id);
    p.connected = false;

    // Lancement de partie pour générer du contenu privé
    roomManager.startGame(room.code, 'socket_host_tv');
    emittedEvents = []; // réinitialisation du log d'émissions

    // Reconnexion avec le token secret valide sur un nouveau socket
    const reconnected = roomManager.reconnectPlayer(room.code, 'socket_p1_new', p1Id, token);
    expect(reconnected).not.toBeNull();
    expect(reconnected.id).toBe(p1Id);
    expect(p.socketId).toBe('socket_p1_new');
    expect(p.connected).toBe(true);

    // Vérifie qu'un fragment privé a bien été envoyé au nouveau socket de Bob
    const privateEmit = emittedEvents.find((e) => e.target === 'socket_p1_new' && e.event === 'private_state');
    expect(privateEmit).toBeDefined();
    expect(privateEmit.data.playerRacks[p1Id]).toBeDefined();
  });

  it('rejet de la reconnexion avec identifiant seul ou justificatif invalide (anti-usurpation)', () => {
    const room = roomManager.createRoom('socket_host_tv', 'quiz');
    const joinRes = roomManager.joinRoom(room.code, 'socket_victim', { name: 'Victime' });
    const victimId = joinRes.player.id;

    // 1. Tentative de reconnexion avec identifiant seul (sans token)
    const resNoToken = roomManager.reconnectPlayer(room.code, 'socket_attacker', victimId, null);
    expect(resNoToken).toBeNull();
    expect(room.players.find((p) => p.id === victimId).socketId).toBe('socket_victim');

    // 2. Tentative avec token bidon / falsifié
    const resBadToken = roomManager.reconnectPlayer(room.code, 'socket_attacker', victimId, 'fake_token_12345');
    expect(resBadToken).toBeNull();
    expect(room.players.find((p) => p.id === victimId).socketId).toBe('socket_victim');

    // 3. Tentative via joinRoom en réutilisant l'id public sans sessionToken
    const joinHijack = roomManager.joinRoom(room.code, 'socket_attacker', { id: victimId, name: 'Attaquant' });
    expect(joinHijack.success).toBe(false);
    expect(joinHijack.error).toMatch(/usurpation|invalide/i);
    expect(room.players.find((p) => p.id === victimId).socketId).toBe('socket_victim');
  });

  it('rejet de l’usurpation d’acteur via payload.playerId dans handleGameAction', () => {
    const room = roomManager.createRoom('socket_host_tv', 'ludo');
    const p1 = roomManager.joinRoom(room.code, 'socket_alice', { name: 'Alice' });
    const p2 = roomManager.joinRoom(room.code, 'socket_bob', { name: 'Bob' });

    roomManager.startGame(room.code, 'socket_host_tv');

    // Attaquant avec un socket non membre tentant d'agir au nom d'Alice
    const hijackAttempt = roomManager.handleGameAction(room.code, 'socket_attacker', 'ludo_roll_dice', {
      playerId: p1.player.id,
    });
    expect(hijackAttempt.success).toBe(false);
    expect(hijackAttempt.error).toMatch(/non (authentifié|membre|autorisée)/i);

    // Bob tente d'agir en fournissant le playerId d'Alice dans le payload
    // L'action doit être résolue STRICTEMENT selon le socket de Bob
    const bobPlayer = room.players.find((p) => p.id === p2.player.id);
    const alicePlayer = room.players.find((p) => p.id === p1.player.id);
    expect(bobPlayer.socketId).toBe('socket_bob');
    expect(alicePlayer.socketId).toBe('socket_alice');
  });

  it('refus des actions d’administration (add_bot, select_game, start_game, etc.) par un non-hôte', () => {
    const room = roomManager.createRoom('socket_tv_creator', 'quiz');
    const p1 = roomManager.joinRoom(room.code, 'socket_p1', { name: 'Player1' });
    expect(p1.player.isHost).toBe(true);
    const guest = roomManager.joinRoom(room.code, 'socket_guest_mobile', { name: 'Invité' });
    expect(guest.player.isHost).toBe(false);

    // Un non-hôte tente d'ajouter un bot
    const addBotRes = roomManager.addBot(room.code, 'socket_guest_mobile');
    expect(addBotRes.success).toBe(false);
    expect(addBotRes.error).toMatch(/hôte/i);

    // Un non-hôte tente de changer le jeu
    const selectRes = roomManager.selectGame(room.code, 'socket_guest_mobile', 'scrabble');
    expect(selectRes.success).toBe(false);
    expect(selectRes.error).toMatch(/hôte/i);

    // Un non-hôte tente de lancer la partie
    const startRes = roomManager.startGame(room.code, 'socket_guest_mobile');
    expect(startRes.success).toBe(false);
    expect(startRes.error).toMatch(/hôte/i);

    // En revanche, l'hôte créateur TV est autorisé
    const startByTv = roomManager.startGame(room.code, 'socket_tv_creator');
    expect(startByTv.success).toBe(true);
  });

  it('refus des actions de jeu par un spectateur ou un non-membre', () => {
    const room = roomManager.createRoom('socket_tv', 'quiz');
    roomManager.joinRoom(room.code, 'socket_player', { name: 'Player1' });
    const spec = roomManager.joinRoom(room.code, 'socket_spectator', { name: 'Watcher' }, true);
    expect(spec.player.isSpectator).toBe(true);

    roomManager.startGame(room.code, 'socket_tv');

    // Le spectateur tente d'envoyer une réponse quiz
    const actionSpec = roomManager.handleGameAction(room.code, 'socket_spectator', 'quiz_answer', { optionIndex: 0 });
    expect(actionSpec.success).toBe(false);
    expect(actionSpec.error).toMatch(/spectateur/i);

    // Un socket externe inconnu tente d'envoyer une action
    const actionUnknown = roomManager.handleGameAction(room.code, 'socket_stranger', 'quiz_answer', { optionIndex: 0 });
    expect(actionUnknown.success).toBe(false);
    expect(actionUnknown.error).toMatch(/non (authentifié|membre|autorisée)/i);
  });

  it('absence de données privées dans les états publics de tous les jeux à secret', () => {
    // 1. Scrabble : pas de chevalets
    const wordEngine = new WordEngine([{ id: 'p1', name: 'Alice' }, { id: 'p2', name: 'Bob' }], () => {}, () => {});
    const pubWord = wordEngine.getPublicState();
    expect(pubWord.playerRacks).toBeUndefined();
    const privWord = wordEngine.getPrivateState('p1');
    expect(privWord.playerRacks['p1']).toBeDefined();
    expect(privWord.playerRacks['p2']).toBeUndefined();
    wordEngine.destroy();

    // 2. Poker : pas de mains de cartes cachées
    const pokerEngine = new PokerEngine([{ id: 'p1', name: 'Alice' }, { id: 'p2', name: 'Bob' }], () => {}, () => {});
    const pubPoker = pokerEngine.getPublicState();
    expect(pubPoker.playerHands).toBeUndefined();
    const privPoker = pokerEngine.getPrivateState('p1');
    expect(privPoker.playerHands['p1']).toBeDefined();
    expect(privPoker.playerHands['p2']).toBeUndefined();
    pokerEngine.destroy();

    // 3. Loup-Garou : pas de rôles ni de cibles
    const werewolfEngine = new WerewolfEngine([{ id: 'p1', name: 'Alice' }, { id: 'p2', name: 'Bob' }, { id: 'p3', name: 'Charlie' }], () => {}, () => {});
    const pubWerewolf = werewolfEngine.getPublicState();
    for (const p of Object.values(pubWerewolf.players)) {
      expect(p.role).toBeUndefined();
      expect(p.targetId).toBeUndefined();
    }
    const privWerewolf = werewolfEngine.getPrivateState('p1');
    expect(privWerewolf.myRole).toBeDefined();
    werewolfEngine.destroy();

    // 4. Espion : pas de mots secrets
    const spyEngine = new SpyEngine([{ id: 'p1', name: 'Alice' }, { id: 'p2', name: 'Bob' }, { id: 'p3', name: 'Charlie' }], () => {}, () => {});
    const pubSpy = spyEngine.getPublicState();
    expect(pubSpy.civilWord).toBeUndefined();
    expect(pubSpy.spyWord).toBeUndefined();
    const privSpy = spyEngine.getPrivateState('p1');
    expect(privSpy.myWord).toBeDefined();
    spyEngine.destroy();

    // 5. Bataille Navale : pas de navires adverses découverts
    const navalEngine = new NavalBattleEngine([{ id: 'p1', name: 'Alice' }, { id: 'p2', name: 'Bob' }], () => {}, () => {});
    const pubNaval = navalEngine.getPublicState();
    expect(pubNaval.p1.ships).toBeUndefined();
    expect(pubNaval.p2.ships).toBeUndefined();
    const privNaval = navalEngine.getPrivateState('p1');
    expect(privNaval.p1.ships).toBeDefined();
    expect(privNaval.p2.ships).toBeUndefined();

    // 6. Meme Factory : anonymisation des auteurs pendant les votes
    const memeEngine = new MemeFactoryEngine([{ id: 'p1', name: 'Alice' }, { id: 'p2', name: 'Bob' }], () => {}, () => {});
    memeEngine.submissions = [
      { id: 'sub_1', playerId: 'p1', playerName: 'Alice', text: 'Drôle', votes: [] },
    ];
    memeEngine.phase = 'voting';
    const pubMeme = memeEngine.getPublicState();
    expect(pubMeme.submissions[0].authorName).toBeUndefined();
  });
});
