// Système d'intégration pour les jeux avec sauvegarde de progression
class GameIntegration {
    constructor(gameName) {
        this.gameName = gameName;
        this.auth = window.GameHubAuth;
        this.progress = null;
        this.sessionStartTime = Date.now();
        this.autoSaveInterval = null;
        
        this.init();
    }

    async init() {
        // Attendre que l'authentification soit prête
        if (this.auth.isLoggedIn()) {
            await this.loadProgress();
        } else {
            // Écouter les événements d'authentification
            document.addEventListener('progressLoaded', (e) => {
                this.loadProgress();
            });
        }

        // Démarrer la sauvegarde automatique
        this.startAutoSave();
        
        // Sauvegarder avant de quitter
        window.addEventListener('beforeunload', () => {
            this.saveProgress();
        });
    }

    async loadProgress() {
        if (!this.auth.isLoggedIn()) return;

        try {
            this.progress = this.auth.getProgress(this.gameName) || this.getDefaultProgress();
            console.log(`Progression chargée pour ${this.gameName}:`, this.progress);
            
            // Déclencher un événement pour le jeu
            this.dispatchGameEvent('progressLoaded', this.progress);
        } catch (error) {
            console.error('Erreur lors du chargement de la progression:', error);
            this.progress = this.getDefaultProgress();
        }
    }

    getDefaultProgress() {
        // Structure de base pour la progression d'un jeu
        return {
            level: 1,
            score: 0,
            achievements: [],
            settings: {},
            saveData: {},
            stats: {
                playTime: 0,
                sessionsPlayed: 0,
                lastPlayed: null
            }
        };
    }

    async saveProgress(data = null) {
        if (!this.auth.isLoggedIn()) return;

        try {
            // Calculer le temps de jeu de cette session
            const sessionTime = Math.floor((Date.now() - this.sessionStartTime) / 1000 / 60); // en minutes
            
            // Mettre à jour les données de progression
            if (data) {
                this.progress = { ...this.progress, ...data };
            }
            
            // Mettre à jour les statistiques
            this.progress.stats.playTime += sessionTime;
            this.progress.stats.lastPlayed = new Date().toISOString();
            this.progress.stats.sessionsPlayed += 1;

            // Sauvegarder sur le serveur
            await this.auth.saveProgress(this.gameName, {
                ...this.progress,
                playTime: sessionTime // Temps de cette session pour les stats globales
            });

            console.log(`Progression sauvegardée pour ${this.gameName}`);
            this.dispatchGameEvent('progressSaved', this.progress);
            
            // Réinitialiser le temps de session
            this.sessionStartTime = Date.now();
            
        } catch (error) {
            console.error('Erreur lors de la sauvegarde:', error);
        }
    }

    startAutoSave() {
        // Sauvegarder automatiquement toutes les 2 minutes
        this.autoSaveInterval = setInterval(() => {
            if (this.auth.isLoggedIn()) {
                this.saveProgress();
            }
        }, 2 * 60 * 1000);
    }

    stopAutoSave() {
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
            this.autoSaveInterval = null;
        }
    }

    // Méthodes utilitaires pour les jeux
    updateScore(newScore) {
        if (this.progress) {
            this.progress.score = Math.max(this.progress.score, newScore);
        }
    }

    updateLevel(newLevel) {
        if (this.progress) {
            this.progress.level = Math.max(this.progress.level, newLevel);
        }
    }

    unlockAchievement(achievementId, achievementName) {
        if (this.progress && !this.progress.achievements.includes(achievementId)) {
            this.progress.achievements.push(achievementId);
            this.showAchievementNotification(achievementName);
        }
    }

    updateSaveData(key, value) {
        if (this.progress) {
            this.progress.saveData[key] = value;
        }
    }

    getSaveData(key, defaultValue = null) {
        return this.progress?.saveData?.[key] || defaultValue;
    }

    updateSettings(key, value) {
        if (this.progress) {
            this.progress.settings[key] = value;
        }
    }

    getSettings(key, defaultValue = null) {
        return this.progress?.settings?.[key] || defaultValue;
    }

    showAchievementNotification(achievementName) {
        // Créer une notification de succès
        const notification = document.createElement('div');
        notification.className = 'achievement-notification';
        notification.innerHTML = `
            <div class="achievement-icon">🏆</div>
            <div class="achievement-text">
                <div class="achievement-title">Succès débloqué !</div>
                <div class="achievement-name">${achievementName}</div>
            </div>
        `;

        document.body.appendChild(notification);

        // Animation d'apparition
        setTimeout(() => notification.classList.add('show'), 100);

        // Suppression automatique
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 4000);
    }

    dispatchGameEvent(eventName, data) {
        const event = new CustomEvent(`game_${eventName}`, {
            detail: { game: this.gameName, data }
        });
        document.dispatchEvent(event);
    }

    // Méthodes publiques
    getProgress() {
        return this.progress;
    }

    isLoggedIn() {
        return this.auth.isLoggedIn();
    }

    getUser() {
        return this.auth.getUser();
    }

    requireLogin() {
        if (!this.auth.isLoggedIn()) {
            this.auth.showModal();
            return false;
        }
        return true;
    }
}

// Styles pour les notifications de succès
const achievementStyles = `
    .achievement-notification {
        position: fixed;
        top: 100px;
        right: 20px;
        background: var(--bg-card);
        border: 1px solid var(--border-primary);
        border-radius: 12px;
        padding: 16px;
        display: flex;
        align-items: center;
        gap: 12px;
        box-shadow: var(--shadow-xl), var(--shadow-glow);
        transform: translateX(400px);
        transition: transform 0.3s ease;
        z-index: 9999;
        max-width: 300px;
    }

    .achievement-notification.show {
        transform: translateX(0);
    }

    .achievement-icon {
        font-size: 2rem;
        animation: bounce 0.6s ease;
    }

    .achievement-title {
        font-weight: 600;
        color: var(--primary);
        font-size: 0.9rem;
        margin-bottom: 2px;
    }

    .achievement-name {
        color: var(--text-secondary);
        font-size: 0.8rem;
    }

    @keyframes bounce {
        0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
        40% { transform: translateY(-10px); }
        60% { transform: translateY(-5px); }
    }
`;

// Injecter les styles
const styleSheet = document.createElement('style');
styleSheet.textContent = achievementStyles;
document.head.appendChild(styleSheet);

// Exposer la classe globalement
window.GameIntegration = GameIntegration;