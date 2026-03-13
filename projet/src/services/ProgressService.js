/**
 * Service de gestion de la progression des joueurs (JSON)
 * @author Tomy - Lead Developer
 */

const fs = require('fs').promises;
const path = require('path');

const DATA_DIR = path.join(process.cwd(), 'data');
const PROGRESS_FILE = path.join(DATA_DIR, 'player_progress.json');
const SETTINGS_FILE = path.join(DATA_DIR, 'player_settings.json');

class ProgressService {
    constructor() {
        this.progress = {};
        this.settings = {};
    }

    async initialize() {
        try {
            await fs.mkdir(DATA_DIR, { recursive: true });

            // Charger progression
            try {
                const data = await fs.readFile(PROGRESS_FILE, 'utf8');
                this.progress = JSON.parse(data);
            } catch (error) {
                this.progress = {};
                await this.saveProgress();
            }

            // Charger paramètres
            try {
                const data = await fs.readFile(SETTINGS_FILE, 'utf8');
                this.settings = JSON.parse(data);
            } catch (error) {
                this.settings = {};
                await this.saveSettings();
            }

            console.log(`💾 Progression chargée: ${Object.keys(this.progress).length} joueurs`);
        } catch (error) {
            console.error('❌ Erreur init progression:', error);
        }
    }

    async saveProgress() {
        await fs.writeFile(PROGRESS_FILE, JSON.stringify(this.progress, null, 2));
    }

    async saveSettings() {
        await fs.writeFile(SETTINGS_FILE, JSON.stringify(this.settings, null, 2));
    }

    // Progression
    async getProgress(userId) {
        if (!this.progress[userId]) {
            this.progress[userId] = {
                inventory: { wood: 0, stone: 0, iron_ore: 0, iron: 0 },
                craftedItems: {},
                stats: {
                    timePlayed: 0,
                    resourcesGathered: 0,
                    itemsCrafted: 0,
                    deaths: 0
                },
                lastSave: new Date().toISOString()
            };
            await this.saveProgress();
        }
        return this.progress[userId];
    }

    async updateProgress(userId, data) {
        this.progress[userId] = {
            ...this.progress[userId],
            ...data,
            lastSave: new Date().toISOString()
        };
        await this.saveProgress();
        return this.progress[userId];
    }

    async resetProgress(userId) {
        this.progress[userId] = {
            inventory: { wood: 0, stone: 0, iron_ore: 0, iron: 0 },
            craftedItems: {},
            stats: {
                timePlayed: 0,
                resourcesGathered: 0,
                itemsCrafted: 0,
                deaths: 0
            },
            lastSave: new Date().toISOString()
        };
        await this.saveProgress();
        return this.progress[userId];
    }

    // Paramètres
    async getSettings(userId) {
        if (!this.settings[userId]) {
            this.settings[userId] = {
                difficulty: 'normal',
                daynightSpeed: 5,
                volume: 50,
                showFps: false,
                showMinimap: true,
                showNotifications: true
            };
            await this.saveSettings();
        }
        return this.settings[userId];
    }

    async updateSettings(userId, data) {
        this.settings[userId] = {
            ...this.settings[userId],
            ...data
        };
        await this.saveSettings();
        return this.settings[userId];
    }
}

module.exports = new ProgressService();
