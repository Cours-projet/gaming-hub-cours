/**
 * Configuration de la base de données JSON
 * @author Tomy - Lead Developer
 * @team Tom (Dev), Lancelot (Manager)
 * @school Lycée Albert Einstein
 */

const fs = require('fs').promises;
const path = require('path');

// Chemins des fichiers JSON
const DATA_DIR = path.join(__dirname, '../../data');
const PLAYERS_FILE = path.join(DATA_DIR, 'players.json');
const SESSIONS_FILE = path.join(DATA_DIR, 'game_sessions.json');
const TICKETS_FILE = path.join(DATA_DIR, 'support_tickets.json');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

/**
 * Initialise les fichiers de base de données
 */
async function initializeDatabase() {
    try {
        console.log('🔄 Initialisation de la base de données JSON...');
        
        // Créer le dossier data s'il n'existe pas
        try {
            await fs.mkdir(DATA_DIR, { recursive: true });
        } catch (error) {
            // Le dossier existe déjà
        }

        // Initialiser les fichiers s'ils n'existent pas
        await initFileIfNotExists(PLAYERS_FILE, []);
        await initFileIfNotExists(SESSIONS_FILE, []);
        await initFileIfNotExists(TICKETS_FILE, []);
        await initFileIfNotExists(USERS_FILE, []);

        console.log('✅ Base de données JSON initialisée');
    } catch (error) {
        console.error('❌ Erreur initialisation base de données:', error.message);
    }
}

/**
 * Initialise un fichier JSON s'il n'existe pas
 */
async function initFileIfNotExists(filePath, defaultData) {
    try {
        await fs.access(filePath);
    } catch {
        await fs.writeFile(filePath, JSON.stringify(defaultData, null, 2));
    }
}

/**
 * Lit un fichier JSON
 */
async function readJSON(filePath) {
    try {
        const data = await fs.readFile(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error(`Erreur lecture ${filePath}:`, error.message);
        return [];
    }
}

/**
 * Écrit dans un fichier JSON
 */
async function writeJSON(filePath, data) {
    try {
        await fs.writeFile(filePath, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error(`Erreur écriture ${filePath}:`, error.message);
        return false;
    }
}

/**
 * Génère un ID unique
 */
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// API de base de données JSON
const db = {
    // Utilisateurs
    users: {
        async create(email, password, username) {
            const users = await readJSON(USERS_FILE);
            const id = generateId();
            const user = {
                id,
                email,
                password, // En production, hasher le mot de passe !
                username,
                created_at: new Date().toISOString()
            };
            users.push(user);
            await writeJSON(USERS_FILE, users);
            return user;
        },

        async findByEmail(email) {
            const users = await readJSON(USERS_FILE);
            return users.find(u => u.email === email);
        },

        async findById(id) {
            const users = await readJSON(USERS_FILE);
            return users.find(u => u.id === id);
        }
    },

    // Joueurs
    players: {
        async create(userId, username) {
            const players = await readJSON(PLAYERS_FILE);
            const player = {
                id: generateId(),
                user_id: userId,
                username,
                total_kills: 0,
                total_deaths: 0,
                total_wins: 0,
                games_played: 0,
                level: 1,
                experience: 0,
                created_at: new Date().toISOString()
            };
            players.push(player);
            await writeJSON(PLAYERS_FILE, players);
            return player;
        },

        async findByUserId(userId) {
            const players = await readJSON(PLAYERS_FILE);
            return players.find(p => p.user_id === userId);
        },

        async update(userId, updates) {
            const players = await readJSON(PLAYERS_FILE);
            const index = players.findIndex(p => p.user_id === userId);
            if (index !== -1) {
                players[index] = { ...players[index], ...updates };
                await writeJSON(PLAYERS_FILE, players);
                return players[index];
            }
            return null;
        },

        async getLeaderboard(limit = 10) {
            const players = await readJSON(PLAYERS_FILE);
            return players
                .sort((a, b) => b.total_kills - a.total_kills)
                .slice(0, limit);
        }
    },

    // Sessions de jeu
    sessions: {
        async create(playerId, username, kills, deaths, duration) {
            const sessions = await readJSON(SESSIONS_FILE);
            const session = {
                id: generateId(),
                player_id: playerId,
                username,
                kills,
                deaths,
                session_duration: duration,
                created_at: new Date().toISOString()
            };
            sessions.push(session);
            await writeJSON(SESSIONS_FILE, sessions);
            return session;
        },

        async getAll() {
            return await readJSON(SESSIONS_FILE);
        }
    },

    // Tickets de support
    tickets: {
        async create(email, subject, message) {
            const tickets = await readJSON(TICKETS_FILE);
            const ticket = {
                id: generateId(),
                email,
                subject,
                message,
                status: 'open',
                created_at: new Date().toISOString()
            };
            tickets.push(ticket);
            await writeJSON(TICKETS_FILE, tickets);
            return ticket;
        },

        async getAll() {
            return await readJSON(TICKETS_FILE);
        }
    }
};

module.exports = {
    db,
    initializeDatabase
};
