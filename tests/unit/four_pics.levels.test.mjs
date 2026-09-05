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

  it('chaque niveau de 1 à 10 possède 10 stages dédiés uniques et vérifiés', () => {
    for (let lvl = 1; lvl <= 10; lvl++) {
      for (let stg = 1; stg <= 10; stg++) {
        const stage = getStage(lvl, stg);
        expect(stage.level).toBe(lvl);
        expect(stage.stageNumber).toBe(stg);
        expect(stage.word).toBeDefined();
        expect(stage.word.length).toBeGreaterThanOrEqual(3);
        // Aucun accent dans les mots (purement alphabétique ASCII)
        expect(stage.word).toMatch(/^[A-Z]+$/);
        expect(stage.images).toHaveLength(4);
      }
    }
  });

  it('le Niveau 10 Légendaire intègre des mots sophistiqués et le barème de points est multiplié', () => {
    const stage9 = getStage(10, 9);
    const stage10 = getStage(10, 10);

    expect(stage9.word).toBe('QUINTESSENCE');
    expect(stage9.word.length).toBe(12);
    expect(stage10.word).toBe('LUMINESCENCE');
    expect(stage10.word.length).toBe(12);

    // Tester le barème de points multiplié au niveau 10 (3.25x)
    const engine = new FourPicsEngine(['joueur1'], () => {}, () => {}, { level: 10, stageNumber: 9 });
    expect(engine.currentPuzzle.word).toBe('QUINTESSENCE');
    expect(engine.scrambledLetters.length).toBeGreaterThanOrEqual(16); // 12 + 4

    const result = engine.submitGuess('joueur1', 'QUINTESSENCE');
    expect(result.success).toBe(true);
    expect(result.correct).toBe(true);
    // Au Niveau 10, base 100 + speedBonus ~30 = ~130 * 3.25 = ~423 pts
    expect(result.points).toBeGreaterThanOrEqual(325);
    expect(engine.scores['joueur1']).toBe(result.points);
    engine.destroy?.();
  });
});
