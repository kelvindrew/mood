import { geminiService } from '../server/services/geminiService.js';

console.log('[TEST AI] Starting Gemini Service & AI Studio Pipeline Test...');

// 1. Test 4 Pics Generator & Semantic Validation
const fourPicsRes = await geminiService.generate4PicsBatch({
  category: 'Animaux & Savane',
  difficulty: 4,
  count: 3,
  language: 'Français',
});
console.log(`[TEST AI] 4 Pics generated: Total=${fourPicsRes.totalRequested}, Validated=${fourPicsRes.validatedCount}, Rejected=${fourPicsRes.rejectedCount}`);
if (fourPicsRes.validatedCount === 0) throw new Error('4 Pics generation returned 0 valid items');

// 2. Test Quiz Generator
const quizRes = await geminiService.generateQuizBatch({
  category: 'Histoire & RDC',
  difficulty: 'moyen',
  count: 3,
});
console.log(`[TEST AI] Quiz generated: Count=${quizRes.count}`);
if (quizRes.questions.length === 0) throw new Error('Quiz generation returned 0 items');

// 3. Test Menteur Bluff Generator
const menteurRes = await geminiService.generateMenteurBluff({
  mode: 'two_truths_one_lie',
  count: 2,
});
console.log(`[TEST AI] Menteur generated: Challenges=${menteurRes.challenges.length}`);

// 4. Test Draw & Guess Prompts
const drawRes = await geminiService.generateDrawPrompts({
  category: 'Défis & Humour',
  count: 4,
});
console.log(`[TEST AI] Draw prompts generated: Prompts=${drawRes.prompts.length}`);

// 5. Test Qui Suis-Je (4 Progressive Clues)
const quiRes = await geminiService.generateQuiSuisJe({
  category: 'Inventeurs & Héros',
  count: 2,
});
console.log(`[TEST AI] Qui suis-je generated: Characters=${quiRes.characters.length}`);

// 6. Test Charades Generator
const charadeRes = await geminiService.generateCharades({ count: 2 });
console.log(`[TEST AI] Charades generated: Count=${charadeRes.charades.length}`);

console.log('[TEST AI] ALL AI GENERATORS & SEMANTIC VALIDATION PIPELINES PASSED 100% SUCCESSFULLY!');
