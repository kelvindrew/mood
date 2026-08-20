import React, { useState, useEffect } from 'react';
import { useGame } from '../../context/GameContext';
import { adminCms, PlatformBranding, FourPicsPuzzleItem } from '../../services/adminCmsService';
import { GameCatalogItem } from '../../types/game';
import {
  Lock,
  Unlock,
  Shield,
  Gamepad2,
  Image,
  Settings,
  Save,
  Trash2,
  Plus,
  RotateCcw,
  Download,
  Upload,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Eye,
  LogOut,
  Sparkles,
} from 'lucide-react';
import { ImageUploader } from '../components/ImageUploader';
import { audio } from '../../services/audio';

export const TVAdminView: React.FC = () => {
  const { setTvView } = useGame();

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(adminCms.isAuthenticated());
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [authError, setAuthError] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'catalog' | 'four_pics' | 'branding' | 'security'>('catalog');

  // Live CMS State
  const [games, setGames] = useState<GameCatalogItem[]>(adminCms.getGamesCatalog());
  const [puzzles, setPuzzles] = useState<FourPicsPuzzleItem[]>(adminCms.getFourPicsPuzzles());
  const [branding, setBranding] = useState<PlatformBranding>(adminCms.getPlatformBranding());

  // Editing Sub-states
  const [editingGame, setEditingGame] = useState<GameCatalogItem | null>(null);
  const [editingPuzzle, setEditingPuzzle] = useState<FourPicsPuzzleItem | null>(null);
  const [newPassword, setNewPassword] = useState<string>('');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string>('');

  useEffect(() => {
    const unsub = adminCms.subscribe(() => {
      setIsAuthenticated(adminCms.isAuthenticated());
      setGames(adminCms.getGamesCatalog());
      setPuzzles(adminCms.getFourPicsPuzzles());
      setBranding(adminCms.getPlatformBranding());
    });
    return () => unsub();
  }, []);

  const triggerToast = (msg: string) => {
    setSaveSuccessMsg(msg);
    setTimeout(() => setSaveSuccessMsg(''), 3500);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminCms.login(passwordInput)) {
      setIsAuthenticated(true);
      setAuthError('');
      audio.playSelect();
    } else {
      setAuthError('Mot de passe administrateur incorrect (défaut : admin)');
      audio.playBack();
    }
  };

  const handleLogout = () => {
    adminCms.logout();
    setIsAuthenticated(false);
    setPasswordInput('');
    audio.playBack();
  };

  // 1. Game Catalog Handlers
  const handleSaveGame = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGame) return;
    adminCms.saveGame(editingGame);
    setEditingGame(null);
    triggerToast(`Jeu "${editingGame.title}" enregistré avec succès !`);
    audio.playSelect();
  };

  const handleDeleteGame = (gameId: string) => {
    if (confirm('Voulez-vous vraiment supprimer ce jeu du catalogue ?')) {
      adminCms.deleteGame(gameId);
      triggerToast('Jeu supprimé du catalogue.');
      audio.playBack();
    }
  };

  // 2. 4 Images 1 Mot Handlers
  const handleSavePuzzle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPuzzle) return;
    adminCms.saveFourPicsPuzzle(editingPuzzle);
    setEditingPuzzle(null);
    triggerToast(`Énigme "${editingPuzzle.word}" enregistrée avec succès !`);
    audio.playSelect();
  };

  const handleDeletePuzzle = (puzzleId: string) => {
    if (confirm('Voulez-vous vraiment supprimer cette énigme ?')) {
      adminCms.deleteFourPicsPuzzle(puzzleId);
      triggerToast('Énigme supprimée.');
      audio.playBack();
    }
  };

  // 3. Branding Handlers
  const handleSaveBranding = (e: React.FormEvent) => {
    e.preventDefault();
    adminCms.savePlatformBranding(branding);
    triggerToast('Paramètres et personnalisation enregistrés !');
    audio.playSelect();
  };

  // 4. Backup & Security
  const handleExportBackup = () => {
    const jsonStr = adminCms.exportFullBackup();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `playflix_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    triggerToast('Sauvegarde exportée avec succès !');
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (adminCms.importFullBackup(content)) {
        triggerToast('Données importées et restaurées avec succès !');
        audio.playSelect();
      } else {
        alert('Fichier de sauvegarde invalide.');
      }
    };
    reader.readAsText(file);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminCms.setAdminPassword(newPassword)) {
      setNewPassword('');
      triggerToast('Nouveau mot de passe administrateur défini !');
      audio.playSelect();
    }
  };

  // ============================================================
  // LOGIN SCREEN (If not authenticated)
  // ============================================================
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-[#07090E] select-none">
        <div className="max-w-md w-full p-8 rounded-3xl bg-surface-card border-2 border-brand-red/50 shadow-glow-red space-y-6 animate-scale-in">
          <div className="flex flex-col items-center text-center space-y-2">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-red to-amber-500 flex items-center justify-center shadow-lg border border-white/20">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-black font-display text-white">
              CONNEXION ADMINISTRATEUR
            </h1>
            <p className="text-xs text-gray-400">
              Accédez au panneau de contrôle pour modifier les jeux, énigmes et contenus.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-[11px] font-black uppercase tracking-wider text-gray-300 block mb-1.5">
                Mot de passe Master :
              </label>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Entrez le mot de passe (défaut : admin)"
                className="w-full px-4 py-3 rounded-2xl bg-surface-dark border border-white/20 text-white font-mono text-sm focus:border-brand-accent focus:ring-2 focus:ring-brand-accent outline-none transition-all"
                autoFocus
              />
            </div>

            {authError && (
              <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500 text-rose-300 text-xs font-bold flex items-center space-x-2 animate-shake">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-brand-red to-amber-500 text-white font-display font-black text-sm uppercase tracking-wider shadow-glow-red hover:scale-105 active:scale-95 transition-all"
            >
              Déverrouiller le Back-Office
            </button>
          </form>

          <div className="pt-2 text-center">
            <button
              onClick={() => setTvView('home')}
              className="text-xs font-bold text-gray-400 hover:text-white flex items-center justify-center space-x-1 mx-auto"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Retour à l'accueil</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // MAIN ADMIN DASHBOARD
  // ============================================================
  return (
    <div className="min-h-screen pt-20 px-8 pb-16 bg-[#07090E] select-none text-white flex flex-col justify-between">
      {/* Top Header & Navigation Tabs */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-red to-amber-500 flex items-center justify-center shadow-glow-red">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black font-display text-white tracking-wide">
                PANNEAU D'ADMINISTRATION CMS
              </h1>
              <span className="text-[11px] font-bold text-gray-400">
                Gestion manuelle du contenu, des jeux et des énigmes en temps réel
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setTvView('home')}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-surface-card border border-white/10 text-xs font-bold text-gray-300 hover:text-white transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Voir le Site</span>
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-rose-950/70 border border-rose-500/50 text-rose-300 text-xs font-bold hover:bg-rose-900 transition-all"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Déconnexion</span>
            </button>
          </div>
        </div>

        {/* Success Toast */}
        {saveSuccessMsg && (
          <div className="p-3.5 rounded-2xl bg-emerald-950/90 border border-emerald-500 text-emerald-300 text-xs font-black flex items-center space-x-2 animate-scale-in">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{saveSuccessMsg}</span>
          </div>
        )}

        {/* Dashboard Tabs */}
        <div className="flex items-center space-x-2 border-b border-white/10 pb-3">
          {[
            { id: 'catalog', label: '🎮 Catalogue des Jeux', icon: Gamepad2 },
            { id: 'four_pics', label: '🖼️ Énigmes 4 Images 1 Mot', icon: Image },
            { id: 'branding', label: '⚙️ Branding & Paramètres', icon: Settings },
            { id: 'security', label: '🔐 Sécurité & Sauvegardes', icon: Shield },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  audio.playSelect();
                  setActiveTab(tab.id as any);
                }}
                className={`flex items-center space-x-2 px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-brand-red to-amber-500 text-white shadow-glow-red scale-105'
                    : 'bg-surface-card border border-white/10 text-gray-400 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Tab Content */}
      <main className="my-6 flex-1">
        {/* ========================================================= */}
        {/* TAB 1: GAMES CATALOG CMS */}
        {/* ========================================================= */}
        {activeTab === 'catalog' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-white">Gestion des Jeux de la Plateforme</h2>
                <p className="text-xs text-gray-400">Ajoutez, modifiez les descriptions, durées, images et règles de chaque jeu.</p>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={() => {
                    setEditingGame({
                      id: `custom_${Date.now()}` as any,
                      title: 'NOUVEAU JEU',
                      tagline: 'Sous-titre accrocheur',
                      description: 'Description détaillée du jeu...',
                      category: 'popular',
                      minPlayers: 1,
                      maxPlayers: 8,
                      durationMinutes: '10–20 min',
                      difficulty: 'Facile',
                      badge: 'NOUVEAU',
                      coverImage: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=800&q=80',
                      heroImage: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1920&q=85',
                      features: ['Fonctionnalité 1', 'Fonctionnalité 2'],
                      rules: ['Règle 1', 'Règle 2'],
                    });
                  }}
                  className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-lg transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Ajouter un Jeu</span>
                </button>

                <button
                  onClick={() => {
                    if (confirm('Réinitialiser le catalogue aux jeux par défaut ?')) {
                      adminCms.resetGamesCatalog();
                      triggerToast('Catalogue réinitialisé.');
                    }
                  }}
                  className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-surface-card border border-white/15 text-gray-400 hover:text-white text-xs font-bold transition-all"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Réinitialiser par défaut</span>
                </button>
              </div>
            </div>

            {/* Editing Form Modal */}
            {editingGame && (
              <form onSubmit={handleSaveGame} className="p-6 rounded-3xl bg-surface-card border-2 border-brand-gold/50 shadow-2xl space-y-4 animate-scale-in">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <h3 className="text-base font-black text-brand-gold uppercase">
                    Modifier / Éditer : {editingGame.title}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setEditingGame(null)}
                    className="text-xs text-gray-400 hover:text-white font-bold"
                  >
                    Fermer ✕
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase text-gray-400 block mb-1">Titre du Jeu</label>
                    <input
                      type="text"
                      value={editingGame.title}
                      onChange={(e) => setEditingGame({ ...editingGame, title: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-surface-dark border border-white/15 text-white text-xs"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase text-gray-400 block mb-1">Sous-titre (Tagline)</label>
                    <input
                      type="text"
                      value={editingGame.tagline}
                      onChange={(e) => setEditingGame({ ...editingGame, tagline: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-surface-dark border border-white/15 text-white text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase text-gray-400 block mb-1">Badge (ex: POPULAIRE, NOUVEAU, PARTY)</label>
                    <input
                      type="text"
                      value={editingGame.badge || ''}
                      onChange={(e) => setEditingGame({ ...editingGame, badge: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-surface-dark border border-white/15 text-white text-xs"
                    />
                  </div>

                  <div className="col-span-3">
                    <label className="text-[10px] font-black uppercase text-gray-400 block mb-1">Description Complète</label>
                    <textarea
                      rows={2}
                      value={editingGame.description}
                      onChange={(e) => setEditingGame({ ...editingGame, description: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-surface-dark border border-white/15 text-white text-xs"
                    />
                  </div>

                  <div className="col-span-3 grid grid-cols-2 gap-4">
                    <ImageUploader
                      label="Image de Couverture (Vignette)"
                      value={editingGame.coverImage}
                      onChange={(val) => setEditingGame({ ...editingGame, coverImage: val })}
                      aspectRatio="video"
                      placeholder="https://..."
                    />

                    <ImageUploader
                      label="Image Hero (Bannière Fond)"
                      value={editingGame.heroImage}
                      onChange={(val) => setEditingGame({ ...editingGame, heroImage: val })}
                      aspectRatio="banner"
                      placeholder="https://..."
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase text-gray-400 block mb-1">Joueurs Min - Max & Durée</label>
                    <div className="flex space-x-2">
                      <input
                        type="number"
                        min={1}
                        max={16}
                        value={editingGame.minPlayers}
                        onChange={(e) => setEditingGame({ ...editingGame, minPlayers: Number(e.target.value) })}
                        className="w-1/3 px-2 py-2 rounded-xl bg-surface-dark border border-white/15 text-white text-xs text-center"
                      />
                      <input
                        type="number"
                        min={1}
                        max={16}
                        value={editingGame.maxPlayers}
                        onChange={(e) => setEditingGame({ ...editingGame, maxPlayers: Number(e.target.value) })}
                        className="w-1/3 px-2 py-2 rounded-xl bg-surface-dark border border-white/15 text-white text-xs text-center"
                      />
                      <input
                        type="text"
                        value={editingGame.durationMinutes}
                        onChange={(e) => setEditingGame({ ...editingGame, durationMinutes: e.target.value })}
                        className="w-1/3 px-2 py-2 rounded-xl bg-surface-dark border border-white/15 text-white text-xs text-center"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingGame(null)}
                    className="px-4 py-2 rounded-xl bg-surface-dark border border-white/15 text-xs font-bold text-gray-300"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="flex items-center space-x-1.5 px-6 py-2 rounded-xl bg-gradient-to-r from-brand-red to-amber-500 text-white font-black text-xs uppercase shadow-glow-red"
                  >
                    <Save className="w-4 h-4" />
                    <span>Enregistrer les modifications</span>
                  </button>
                </div>
              </form>
            )}

            {/* Games Grid Listing */}
            <div className="grid grid-cols-3 gap-4">
              {games.map((g) => (
                <div key={g.id} className="p-4 rounded-2xl bg-surface-card border border-white/10 space-y-3 flex flex-col justify-between">
                  <div className="flex space-x-3">
                    <img src={g.coverImage} alt={g.title} className="w-20 h-20 rounded-xl object-cover border border-white/15 flex-shrink-0" />
                    <div className="overflow-hidden">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-black text-sm text-white truncate">{g.title}</h3>
                        {g.badge && <span className="px-1.5 py-0.5 rounded bg-brand-red text-white text-[9px] font-black">{g.badge}</span>}
                      </div>
                      <p className="text-[11px] text-gray-400 line-clamp-2 mt-0.5">{g.tagline}</p>
                      <span className="text-[10px] font-bold text-brand-gold mt-1 block">
                        👥 {g.minPlayers}-{g.maxPlayers} joueurs • ⏱ {g.durationMinutes}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-white/5">
                    <button
                      onClick={() => setEditingGame(g)}
                      className="px-3 py-1.5 rounded-lg bg-surface-light hover:bg-white hover:text-gray-950 text-xs font-bold transition-all"
                    >
                      ✏️ Modifier
                    </button>
                    <button
                      onClick={() => handleDeleteGame(g.id)}
                      className="px-2.5 py-1.5 rounded-lg bg-rose-950/60 text-rose-400 hover:bg-rose-900 text-xs font-bold transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: 4 IMAGES 1 MOT PUZZLES CMS */}
        {/* ========================================================= */}
        {activeTab === 'four_pics' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-white">Gestionnaire des Énigmes 4 Images 1 Mot</h2>
                <p className="text-xs text-gray-400">Personnalisez les mots à deviner et leurs 4 images associées en direct.</p>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={() => {
                    setEditingPuzzle({
                      id: `puzzle_${Date.now()}`,
                      word: 'NOUVEAU',
                      category: 'Général',
                      difficulty: 'facile',
                      hint: 'Indice facultatif',
                      images: [
                        'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
                        'https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=600&q=80',
                        'https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&w=600&q=80',
                        'https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?auto=format&fit=crop&w=600&q=80',
                      ],
                    });
                  }}
                  className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-lg transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Ajouter une Énigme</span>
                </button>

                <button
                  onClick={() => {
                    if (confirm('Réinitialiser toutes les énigmes 4 Images 1 Mot par défaut ?')) {
                      adminCms.resetFourPicsPuzzles();
                      triggerToast('Énigmes réinitialisées.');
                    }
                  }}
                  className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-surface-card border border-white/15 text-gray-400 hover:text-white text-xs font-bold transition-all"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Réinitialiser</span>
                </button>
              </div>
            </div>

            {/* Edit / Add Puzzle Form */}
            {editingPuzzle && (
              <form onSubmit={handleSavePuzzle} className="p-6 rounded-3xl bg-surface-card border-2 border-brand-gold/50 shadow-2xl space-y-4 animate-scale-in">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <h3 className="text-base font-black text-brand-gold uppercase">
                    Édition de l'Énigme : "{editingPuzzle.word}"
                  </h3>
                  <button
                    type="button"
                    onClick={() => setEditingPuzzle(null)}
                    className="text-xs text-gray-400 hover:text-white font-bold"
                  >
                    Fermer ✕
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase text-gray-400 block mb-1">Mot Cible (MAJUSCULES SANS ESPACES)</label>
                    <input
                      type="text"
                      value={editingPuzzle.word}
                      onChange={(e) => setEditingPuzzle({ ...editingPuzzle, word: e.target.value.toUpperCase().trim() })}
                      className="w-full px-3 py-2 rounded-xl bg-surface-dark border border-white/15 text-white font-display font-black text-base tracking-widest uppercase"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase text-gray-400 block mb-1">Catégorie</label>
                    <input
                      type="text"
                      value={editingPuzzle.category}
                      onChange={(e) => setEditingPuzzle({ ...editingPuzzle, category: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-surface-dark border border-white/15 text-white text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase text-gray-400 block mb-1">Indice / Hint</label>
                    <input
                      type="text"
                      value={editingPuzzle.hint || ''}
                      onChange={(e) => setEditingPuzzle({ ...editingPuzzle, hint: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-surface-dark border border-white/15 text-white text-xs"
                    />
                  </div>

                  {/* 4 Image Inputs with File Upload from PC and Live Previews */}
                  <div className="col-span-3 grid grid-cols-2 gap-3">
                    {[0, 1, 2, 3].map((imgIdx) => (
                      <ImageUploader
                        key={`puzzle_img_${imgIdx}`}
                        label={`Indice Image #${imgIdx + 1}`}
                        value={editingPuzzle.images[imgIdx]}
                        onChange={(val) => {
                          const updatedImgs = [...editingPuzzle.images] as [string, string, string, string];
                          updatedImgs[imgIdx] = val;
                          setEditingPuzzle({ ...editingPuzzle, images: updatedImgs });
                        }}
                        aspectRatio="square"
                        placeholder="https://..."
                        required
                      />
                    ))}
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingPuzzle(null)}
                    className="px-4 py-2 rounded-xl bg-surface-dark border border-white/15 text-xs font-bold text-gray-300"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="flex items-center space-x-1.5 px-6 py-2 rounded-xl bg-gradient-to-r from-brand-red to-amber-500 text-white font-black text-xs uppercase shadow-glow-red"
                  >
                    <Save className="w-4 h-4" />
                    <span>Sauvegarder l'énigme</span>
                  </button>
                </div>
              </form>
            )}

            {/* Puzzles Listing Cards */}
            <div className="grid grid-cols-2 gap-4">
              {puzzles.map((p) => (
                <div key={p.id} className="p-4 rounded-2xl bg-surface-card border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-display font-black text-lg text-brand-gold tracking-widest">
                        "{p.word}"
                      </span>
                      <span className="text-[11px] text-gray-400 ml-2">({p.category})</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setEditingPuzzle(p)}
                        className="px-2.5 py-1 rounded-lg bg-surface-light hover:bg-white hover:text-gray-950 text-xs font-bold"
                      >
                        ✏️ Éditer
                      </button>
                      <button
                        onClick={() => handleDeletePuzzle(p.id)}
                        className="p-1 rounded-lg bg-rose-950/50 text-rose-400 hover:bg-rose-900"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* 4 Thumbnails Grid */}
                  <div className="grid grid-cols-4 gap-2">
                    {p.images.map((img, i) => (
                      <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-surface-dark border border-white/10">
                        <img src={img} alt={`Indice ${i + 1}`} className="w-full h-full object-cover" />
                        <span className="absolute top-1 left-1 px-1 rounded bg-black/60 text-[9px] font-mono font-bold text-white">
                          #{i + 1}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: PLATFORM BRANDING & SETTINGS */}
        {/* ========================================================= */}
        {activeTab === 'branding' && (
          <form onSubmit={handleSaveBranding} className="max-w-2xl p-6 rounded-3xl bg-surface-card border border-white/15 space-y-5">
            <h2 className="text-lg font-black text-white">Personnalisation Globale & Ticker d'Annonce</h2>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase text-gray-400 block mb-1">Nom de la Plateforme</label>
                <input
                  type="text"
                  value={branding.platformName}
                  onChange={(e) => setBranding({ ...branding, platformName: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-surface-dark border border-white/15 text-white font-display font-black text-base"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-gray-400 block mb-1">Sous-titre / Slogan</label>
                <input
                  type="text"
                  value={branding.platformSubtitle}
                  onChange={(e) => setBranding({ ...branding, platformSubtitle: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-surface-dark border border-white/15 text-white text-xs"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-gray-400 block mb-1">Message Défilant du Salon (Ticker Bar)</label>
                <input
                  type="text"
                  value={branding.announcementTicker}
                  onChange={(e) => setBranding({ ...branding, announcementTicker: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-surface-dark border border-white/15 text-white text-xs font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-400 block mb-1">Durée par défaut du tour (sec)</label>
                  <input
                    type="number"
                    min={10}
                    max={120}
                    value={branding.defaultTurnDuration}
                    onChange={(e) => setBranding({ ...branding, defaultTurnDuration: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-surface-dark border border-white/15 text-white text-xs"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase text-gray-400 block mb-1">Nombre max de joueurs par salon</label>
                  <input
                    type="number"
                    min={2}
                    max={16}
                    value={branding.defaultMaxPlayers}
                    onChange={(e) => setBranding({ ...branding, defaultMaxPlayers: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-surface-dark border border-white/15 text-white text-xs"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="flex items-center space-x-1.5 px-6 py-3 rounded-2xl bg-gradient-to-r from-brand-red to-amber-500 text-white font-display font-black text-xs uppercase shadow-glow-red hover:scale-105 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Enregistrer les paramètres</span>
            </button>
          </form>
        )}

        {/* ========================================================= */}
        {/* TAB 4: SECURITY & BACKUP EXPORT / IMPORT */}
        {/* ========================================================= */}
        {activeTab === 'security' && (
          <div className="grid grid-cols-2 gap-6">
            {/* Change Admin Password */}
            <form onSubmit={handleChangePassword} className="p-6 rounded-3xl bg-surface-card border border-white/15 space-y-4">
              <h3 className="text-base font-black text-white flex items-center space-x-2">
                <Lock className="w-4 h-4 text-brand-gold" />
                <span>Changer le Mot de Passe Master</span>
              </h3>

              <div>
                <label className="text-[10px] font-black uppercase text-gray-400 block mb-1">Nouveau mot de passe administrateur</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 3 caractères"
                  className="w-full px-3 py-2.5 rounded-xl bg-surface-dark border border-white/15 text-white text-xs font-mono"
                  required
                />
              </div>

              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-brand-red text-white font-black text-xs uppercase shadow-glow-red hover:scale-105 transition-all"
              >
                Mettre à jour le mot de passe
              </button>
            </form>

            {/* Backup Export & Restore */}
            <div className="p-6 rounded-3xl bg-surface-card border border-white/15 space-y-4">
              <h3 className="text-base font-black text-white flex items-center space-x-2">
                <Download className="w-4 h-4 text-brand-cyan" />
                <span>Sauvegarde & Restauration (JSON)</span>
              </h3>
              <p className="text-xs text-gray-400">
                Téléchargez un fichier JSON contenant tout votre catalogue personnalisé, vos énigmes et vos paramètres pour les restaurer à tout moment.
              </p>

              <div className="flex items-center space-x-3 pt-2">
                <button
                  type="button"
                  onClick={handleExportBackup}
                  className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-surface-light hover:bg-white hover:text-gray-950 text-xs font-bold transition-all shadow-md"
                >
                  <Download className="w-4 h-4" />
                  <span>Exporter la Sauvegarde</span>
                </button>

                <label className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold cursor-pointer transition-all shadow-md">
                  <Upload className="w-4 h-4" />
                  <span>Importer JSON</span>
                  <input type="file" accept=".json" onChange={handleImportBackup} className="hidden" />
                </label>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
