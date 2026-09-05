import { describe, it, expect } from 'vitest';
import { FourPicsEngine } from '../../server/games/fourPicsEngine.js';
import { getStage, FOUR_PICS_1000_STAGES, LEVEL_DEFINITIONS } from '../../server/games/fourPicsData.js';

describe('4 Images 1 Mot — Niveaux & Progression', () => {
  it('le Niveau 1 commence au Stage 1 avec le mot CHAT et 4 images dédiées', () => {
    const stage1 = getStage(1, 1);
    expect(stage1.level).toBe(1);
    expect(stage1.stageNumber).toBe(1);
    expect(stage1.word).toBe('CHAT');
    expect(stage1.images).toHaveLength(4);
    expect(stage1.images.every(url => typeof url === 'string' && url.startsWith('http'))).toBe(true);
  });

  it('le Niveau 1 enchaîne sur des mots faciles et progressifs sans répétition immédiate', () => {
    const stage2 = getStage(1, 2);
    const stage3 = getStage(1, 3);
    const stage4 = getStage(1, 4);
    const stage5 = getStage(1, 5);

    expect(stage2.word).toBe('EAU');
    expect(stage3.word).toBe('FEU');
    expect(stage4.word).toBe('POMME');
    expect(stage5.word).toBe('PAIN');
  });

  it('tous les 10 niveaux ont des définitions complètes et cohérentes', () => {
    expect(LEVEL_DEFINITIONS).toHaveLength(10);
    LEVEL_DEFINITIONS.forEach((def, idx) => {
      expect(def.level).toBe(idx + 1);
      expect(def.name).toBeDefined();
      expect(def.badge).toBeDefined();
      expect(def.color).toMatch(/^#[0-9A-Fa-f]{6}$/);
    });
  });

  it('le moteur démarre au Niveau 1 Stage 1 par défaut', () => {
    const engine = new FourPicsEngine(['joueur1'], () => {}, () => {});
    expect(engine.currentLevel).toBe(1);
    expect(engine.currentStageNumber).toBe(1);
    expect(engine.currentPuzzle.word).toBe('CHAT');
    engine.destroy?.();
  });

  it('nextAdventureStage fait passer du Stage 1 au Stage 2 avec le nouveau puzzle EAU', () => {
    const engine = new FourPicsEngine(['joueur1'], () => {}, () => {}, { level: 1, stageNumber: 1 });
    expect(engine.currentPuzzle.word).toBe('CHAT');

    engine.nextAdventureStage();
    expect(engine.currentLevel).toBe(1);
    expect(engine.currentStageNumber).toBe(2);
    expect(engine.currentPuzzle.word).toBe('EAU');
    engine.destroy?.();
  });
});
