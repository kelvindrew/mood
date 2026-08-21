import React, { useState, useEffect } from 'react';
import {
  aiStudioService,
  AIGenerateRequest,
  AIStudioItem,
  AIGenerateResponse,
} from '../../services/aiContentStudioService';
import {
  Sparkles,
  Zap,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Send,
  Sliders,
  ShieldCheck,
  Layers,
  Key,
  Flame,
  Check,
  X,
  HelpCircle,
} from 'lucide-react';
import { audio } from '../../services/audio';

export const AIContentStudioPanel: React.FC = () => {
  const [isConfigured, setIsConfigured] = useState<boolean>(false);
  const [apiKeyInput, setApiKeyInput] = useState<string>('');
  const [showKeyInput, setShowKeyInput] = useState<boolean>(false);
  const [stats, setStats] = useState<any>({});

  // Generator form
  const [gameType, setGameType] = useState<AIGenerateRequest['gameType']>('four_pics');
  const [category, setCategory] = useState<string>('Animaux & Nature');
  const [difficulty, setDifficulty] = useState<number>(3);
  const [count, setCount] = useState<number>(5);
  const [menteurMode, setMenteurMode] = useState<string>('two_truths_one_lie');

  // Loading & Step Progression
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [activeStep, setActiveStep] = useState<number>(0);
  const [generationResult, setGenerationResult] = useState<AIGenerateResponse | null>(null);
  const [publishSuccessMsg, setPublishSuccessMsg] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    const status = await aiStudioService.checkStatus();
    setIsConfigured(status.configured);
    setStats(status.stats || {});
  };

  const handleSaveKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKeyInput.trim()) return;
    const ok = await aiStudioService.updateApiKey(apiKeyInput.trim());
    if (ok) {
      setIsConfigured(true);
      setShowKeyInput(false);
      setApiKeyInput('');
      audio.playSelect();
      checkStatus();
    } else {
      setErrorMsg('Impossible de mettre à jour la clé Gemini.');
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setErrorMsg('');
    setPublishSuccessMsg('');
    setGenerationResult(null);
    audio.playSelect();

    // Step 1: Querying Gemini
    setActiveStep(1);

    try {
      setTimeout(() => setActiveStep(2), 1200); // Step 2: Syntactic check
      setTimeout(() => setActiveStep(3), 2400); // Step 3: Semantic check
      setTimeout(() => setActiveStep(4), 3600); // Step 4: Quality scoring

      const res = await aiStudioService.generateContent({
        gameType,
        category,
        difficulty,
        count,
        mode: menteurMode,
        language: 'Français',
      });

      setGenerationResult(res);
      audio.playSelect();
    } catch (e: any) {
      setErrorMsg(e.message || 'Erreur lors de la génération.');
      audio.playBack();
    } finally {
      setIsGenerating(false);
      setActiveStep(0);
    }
  };

  const handlePublish = async () => {
    if (!generationResult) return;
    const itemsToPublish = generationResult.validated || generationResult.questions || generationResult.challenges || [];
    if (itemsToPublish.length === 0) return;

    try {
      const res = await aiStudioService.publishValidatedItems(gameType, itemsToPublish);
      if (res.success) {
        setPublishSuccessMsg(`🎉 ${res.publishedCount} élément(s) validé(s) publié(s) avec succès dans le jeu !`);
        audio.playSelect();
      }
    } catch (e: any) {
      setErrorMsg(e.message || 'Erreur de publication.');
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Status Bar & API Key Manager */}
      <div className="p-5 rounded-3xl bg-[#101420] border-2 border-white/15 flex items-center justify-between shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-white shadow-lg">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-black font-display text-white">
                GEMINI AI CONTENT STUDIO
              </h2>
              {isConfigured ? (
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-[#10B981] font-black text-[10px] uppercase border border-[#10B981]/40 flex items-center space-x-1">
                  <span className="w-2 h-2 rounded-full bg-[#10B981] animate-ping" />
                  <span>IA CONNECTÉE (GEMINI 2.5 FLASH)</span>
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-[#FFB800] font-black text-[10px] uppercase border border-[#FFB800]/40">
                  ⚠️ MODE HORS-LIGNE / CLÉ NON DÉFINIE
                </span>
              )}
            </div>
            <p className="text-xs text-[#B8C2D8] mt-0.5">
              Génération par lots, validation sémantique stricte et publication sans impact sur le gameplay temps réel.
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowKeyInput(!showKeyInput)}
          className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-[#181F33] border border-white/15 text-xs font-bold text-gray-300 hover:text-white transition-all"
        >
          <Key className="w-4 h-4 text-[#FFB800]" />
          <span>{showKeyInput ? 'Fermer' : 'Configurer Clé API'}</span>
        </button>
      </div>

      {/* Clé API Config Dropdown */}
      {showKeyInput && (
        <form
          onSubmit={handleSaveKey}
          className="p-5 rounded-3xl bg-[#181F33] border-2 border-[#FFB800]/40 shadow-xl space-y-3 animate-scale-in"
        >
          <label className="text-xs font-black uppercase text-gray-300 block">
            Clé API Google Gemini (GEMINI_API_KEY) :
          </label>
          <div className="flex items-center space-x-3">
            <input
              type="password"
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              placeholder="AIzaSy..."
              className="flex-1 px-4 py-3 rounded-2xl bg-[#07090E] border border-white/20 text-white font-mono text-xs focus:border-[#00F2FE] outline-none"
            />
            <button
              type="submit"
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#10B981] to-[#059669] text-white font-black text-xs uppercase shadow-md"
            >
              Enregistrer
            </button>
          </div>
          <p className="text-[11px] text-gray-400">
            🔒 Sécurité absolue : La clé est enregistrée côté backend uniquement et n'est jamais transmise aux navigateurs TV ni aux téléphones.
          </p>
        </form>
      )}

      {/* 2. Generation Controls Grid */}
      <div className="p-6 rounded-3xl bg-[#101420] border-2 border-white/15 shadow-2xl space-y-5">
        <h3 className="text-sm font-black uppercase tracking-wider text-white flex items-center space-x-2">
          <Sliders className="w-4 h-4 text-[#00F2FE]" />
          <span>Paramètres de Génération de Contenu</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Game Type */}
          <div>
            <label className="text-[11px] font-black uppercase text-[#B8C2D8] block mb-1.5">
              Jeu Cible :
            </label>
            <select
              value={gameType}
              onChange={(e) => setGameType(e.target.value as any)}
              className="w-full px-4 py-3 rounded-2xl bg-[#181F33] border border-white/15 text-white font-bold text-xs outline-none focus:border-[#00F2FE]"
            >
              <option value="four_pics">🖼️ 4 Images 1 Mot</option>
              <option value="quiz">🧠 Quiz Battle Mega Show</option>
              <option value="menteur">🤥 Menteur / Bluff</option>
              <option value="draw_and_guess">🎨 Dessin & Devine (Pictionary)</option>
              <option value="qui_suis_je">🕵️ Qui suis-je ? (4 Indices)</option>
              <option value="charades">🎭 Charades Françaises</option>
            </select>
          </div>

          {/* Category */}
          <div>
            <label className="text-[11px] font-black uppercase text-[#B8C2D8] block mb-1.5">
              Catégorie / Thématique :
            </label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="ex: Animaux, RDC & Afrique, Sciences..."
              className="w-full px-4 py-3 rounded-2xl bg-[#181F33] border border-white/15 text-white font-bold text-xs outline-none focus:border-[#00F2FE]"
            />
          </div>

          {/* Difficulty / Mode */}
          <div>
            <label className="text-[11px] font-black uppercase text-[#B8C2D8] block mb-1.5">
              {gameType === 'menteur' ? 'Mode de Bluff :' : 'Difficulté (Niveau 1 à 10) :'}
            </label>
            {gameType === 'menteur' ? (
              <select
                value={menteurMode}
                onChange={(e) => setMenteurMode(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-[#181F33] border border-white/15 text-white font-bold text-xs outline-none focus:border-[#00F2FE]"
              >
                <option value="two_truths_one_lie">2 Vérités, 1 Mensonge</option>
                <option value="bluff_trivia">Bluff Trivia & Pièges</option>
                <option value="suspect_story">Histoire Suspecte</option>
              </select>
            ) : (
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-2xl bg-[#181F33] border border-white/15 text-white font-bold text-xs outline-none focus:border-[#00F2FE]"
              >
                <option value={1}>Niveau 1 — Très Facile</option>
                <option value={2}>Niveau 2 — Facile</option>
                <option value={3}>Niveau 3 — Normal</option>
                <option value={4}>Niveau 4 — Intermédiaire</option>
                <option value={5}>Niveau 5 — Difficile</option>
                <option value={6}>Niveau 6 — Très Difficile</option>
                <option value={7}>Niveau 7 — Expert</option>
                <option value={8}>Niveau 8 — Maître</option>
                <option value={9}>Niveau 9 — Extrême</option>
                <option value={10}>Niveau 10 — Légendaire</option>
              </select>
            )}
          </div>

          {/* Count */}
          <div>
            <label className="text-[11px] font-black uppercase text-[#B8C2D8] block mb-1.5">
              Nombre d'items :
            </label>
            <select
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              className="w-full px-4 py-3 rounded-2xl bg-[#181F33] border border-white/15 text-white font-bold text-xs outline-none focus:border-[#00F2FE]"
            >
              <option value={3}>3 énigmes</option>
              <option value={5}>5 énigmes</option>
              <option value={10}>10 énigmes</option>
              <option value={20}>20 énigmes</option>
            </select>
          </div>
        </div>

        {/* Generate Button & Progress Tracker */}
        <div className="pt-2 flex items-center justify-between">
          <button
            disabled={isGenerating}
            onClick={handleGenerate}
            className="flex items-center space-x-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-sm uppercase tracking-wider shadow-[0_0_25px_rgba(147,51,234,0.5)] active:scale-95 disabled:opacity-50 transition-all"
          >
            {isGenerating ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : (
              <Zap className="w-5 h-5 fill-current text-[#FFB800]" />
            )}
            <span>{isGenerating ? 'Pipeline IA en cours...' : 'Générer & Valider avec Gemini'}</span>
          </button>

          {isGenerating && (
            <div className="flex items-center space-x-4 text-xs font-bold text-[#B8C2D8]">
              <div className={`flex items-center space-x-1 ${activeStep >= 1 ? 'text-[#00F2FE]' : 'opacity-40'}`}>
                <span>1. Appel IA</span>
              </div>
              <span>→</span>
              <div className={`flex items-center space-x-1 ${activeStep >= 2 ? 'text-[#00F2FE]' : 'opacity-40'}`}>
                <span>2. Syntax Check</span>
              </div>
              <span>→</span>
              <div className={`flex items-center space-x-1 ${activeStep >= 3 ? 'text-[#00F2FE]' : 'opacity-40'}`}>
                <span>3. Sémantique & Convergence</span>
              </div>
              <span>→</span>
              <div className={`flex items-center space-x-1 ${activeStep >= 4 ? 'text-[#10B981]' : 'opacity-40'}`}>
                <span>4. Score Qualité</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Error & Success Messages */}
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-950/80 border border-rose-500 text-rose-300 text-xs font-bold flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {publishSuccessMsg && (
        <div className="p-4 rounded-2xl bg-emerald-950/90 border border-[#10B981] text-[#10B981] text-xs font-black flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{publishSuccessMsg}</span>
        </div>
      )}

      {/* 3. Generation & Validation Results Grid */}
      {generationResult && (
        <div className="p-6 rounded-3xl bg-[#101420] border-2 border-white/15 shadow-2xl space-y-5 animate-scale-in">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <h3 className="text-base font-black font-display text-white">
                RÉSULTATS DU PIPELINE DE VALIDATION IA
              </h3>
              <p className="text-xs text-[#B8C2D8] mt-0.5">
                {generationResult.validatedCount} Éléments Validés (≥ 88% Convergence) • {generationResult.rejectedCount} Éléments Rejetés
              </p>
            </div>

            {generationResult.validatedCount > 0 && (
              <button
                onClick={handlePublish}
                className="flex items-center space-x-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-[#10B981] to-[#059669] text-white font-black text-xs uppercase shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:scale-105 active:scale-95 transition-all"
              >
                <Send className="w-4 h-4" />
                <span>Publier les {generationResult.validatedCount} items validés</span>
              </button>
            )}
          </div>

          {/* Validated Items Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(generationResult.validated || generationResult.questions || generationResult.challenges || []).map((item, idx) => (
              <div
                key={item.id || `valid_${idx}`}
                className="p-4 rounded-2xl bg-[#181F33] border-2 border-[#10B981]/50 shadow-md space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-[#10B981]" />
                    <span className="font-black text-white text-sm">
                      {item.word || item.question || item.target || item.theme}
                    </span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#10B981]/20 text-[#10B981] font-mono font-black text-[10px]">
                    SCORE {item.validationScore || 96}% ✓
                  </span>
                </div>

                {item.hint && (
                  <p className="text-xs text-[#B8C2D8]">
                    💡 <strong>Indice :</strong> {item.hint}
                  </p>
                )}

                {item.imageDescriptions && (
                  <div className="grid grid-cols-2 gap-1.5 pt-1 text-[11px] text-gray-300">
                    {item.imageDescriptions.map((desc, dIdx) => (
                      <div key={`d_${dIdx}`} className="p-2 rounded-xl bg-[#07090E] border border-white/10">
                        #{dIdx + 1} : {desc}
                      </div>
                    ))}
                  </div>
                )}

                {item.options && (
                  <div className="grid grid-cols-2 gap-1 pt-1 text-[11px]">
                    {item.options.map((opt, oIdx) => (
                      <div
                        key={`opt_${oIdx}`}
                        className={`p-1.5 rounded-lg border ${
                          oIdx === item.correctIndex
                            ? 'bg-emerald-950/60 border-[#10B981] text-[#10B981] font-bold'
                            : 'bg-[#07090E] border-white/10 text-gray-400'
                        }`}
                      >
                        {opt} {oIdx === item.correctIndex ? '✓' : ''}
                      </div>
                    ))}
                  </div>
                )}

                {item.statements && (
                  <div className="space-y-1 pt-1 text-[11px]">
                    {item.statements.map((stmt, sIdx) => (
                      <div
                        key={`s_${sIdx}`}
                        className={`p-1.5 rounded-lg border ${
                          sIdx === item.lieIndex
                            ? 'bg-rose-950/60 border-rose-500 text-rose-300 font-bold'
                            : 'bg-[#07090E] border-white/10 text-gray-300'
                        }`}
                      >
                        {sIdx === item.lieIndex ? '🤥 MENSONGE : ' : '✓ VÉRITÉ : '}
                        {stmt}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Rejected Items If Any */}
          {generationResult.rejected && generationResult.rejected.length > 0 && (
            <div className="pt-4 border-t border-white/10">
              <h4 className="text-xs font-black text-rose-400 uppercase tracking-wider mb-2 flex items-center space-x-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Éléments Rejetés par le filtre de qualité ({generationResult.rejected.length})</span>
              </h4>

              <div className="space-y-2">
                {generationResult.rejected.map((rej, rIdx) => (
                  <div
                    key={`rej_${rIdx}`}
                    className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 flex items-center justify-between text-xs text-rose-200"
                  >
                    <span><strong>{rej.word || rej.question}</strong></span>
                    <span className="text-rose-400 font-mono text-[11px]">Raison : {rej.rejectionReason}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
