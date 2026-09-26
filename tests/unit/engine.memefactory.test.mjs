import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MemeFactoryEngine } from '../../server/games/memeFactoryEngine.js';

describe('MemeFactoryEngine', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('initializes with a valid meme template and players in captioning phase', () => {
    const players = [
      { id: 'p1', name: 'Alice', color: 'blue' },
      { id: 'p2', name: 'Bob', color: 'red' },
    ];
    let state = null;
    const engine = new MemeFactoryEngine(players, (s) => { state = s; }, () => {});

    expect(state).not.toBeNull();
    expect(state.phase).toBe('captioning');
    expect(state.currentMeme).not.toBeNull();
    expect(state.currentMeme.imageUrl).toContain('http');
    expect(state.players).toHaveLength(2);

    engine.destroy();
  });

  it('accepts captions and transitions to anonymous voting when all players submit', () => {
    const players = [
      { id: 'p1', name: 'Alice', color: 'blue' },
      { id: 'p2', name: 'Bob', color: 'red' },
    ];
    let state = null;
    const engine = new MemeFactoryEngine(players, (s) => { state = s; }, () => {});

    // P1 submits caption
    const resP1 = engine.handleAction('mf_submit_caption', { caption: 'Quand le code compile !' }, null, 'p1');
    expect(resP1.success).toBe(true);
    expect(state.phase).toBe('captioning');

    // P2 submits caption
    const resP2 = engine.handleAction('mf_submit_caption', { caption: 'Moi le lundi matin...' }, null, 'p2');
    expect(resP2.success).toBe(true);
    // All submitted -> transitions to voting!
    expect(state.phase).toBe('voting');
    expect(state.submissions).toHaveLength(2);

    // In voting phase, authors are anonymous (undefined)
    expect(state.submissions[0].authorName).toBeUndefined();

    engine.destroy();
  });

  it('prevents self-voting and tallies votes on reveal', () => {
    const players = [
      { id: 'p1', name: 'Alice', color: 'blue' },
      { id: 'p2', name: 'Bob', color: 'red' },
    ];
    let state = null;
    const engine = new MemeFactoryEngine(players, (s) => { state = s; }, () => {});

    engine.handleAction('mf_submit_caption', { caption: 'Joke Alice' }, null, 'p1');
    engine.handleAction('mf_submit_caption', { caption: 'Joke Bob' }, null, 'p2');

    const subAlice = engine.submissions.find((s) => s.playerId === 'p1');
    const subBob = engine.submissions.find((s) => s.playerId === 'p2');

    // Alice tries to vote for herself
    const selfVoteRes = engine.handleAction('mf_cast_vote', { submissionId: subAlice.id }, null, 'p1');
    expect(selfVoteRes.success).toBe(false);
    expect(selfVoteRes.error).toContain('ton propre meme');

    // Alice votes for Bob
    const validVoteRes = engine.handleAction('mf_cast_vote', { submissionId: subBob.id }, null, 'p1');
    expect(validVoteRes.success).toBe(true);

    // Bob votes for Alice
    engine.handleAction('mf_cast_vote', { submissionId: subAlice.id }, null, 'p2');

    // All voted -> transitions to reveal!
    expect(state.phase).toBe('reveal');
    expect(state.submissions[0].authorName).toBeDefined();

    engine.destroy();
  });
});
