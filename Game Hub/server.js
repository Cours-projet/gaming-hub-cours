const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'gamehub-secret-key-2025';

// Configuration
const CONFIG = {
    OWNER_EMAIL: 'owner@gamehub.com',
    OWNER_PASSWORD: 'GameHub2025!',
    OWNER_USERNAME: 'GameHubOwner'
};

// Middleware
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.static('.'));

// Middleware de sécurité
app.use((req, res, next) => {
    // Headers de sécurité
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    // CSP basique
    res.setHeader('Content-Security-Policy', 
        "default-src 'self'; " +
        "script-src 'self' 'unsafe-inline'; " +
        "style-src 'self' 'unsafe-inline'; " +
        "img-src 'self' data: https:; " +
        "font-src 'self' data:;"
    );
    
    next();
});

// Limitation du taux de requêtes
const loginAttempts = new Map();

const rateLimitMiddleware = (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    
    if (!loginAttempts.has(ip)) {
        loginAttempts.set(ip, { count: 1, lastAttempt: now });
        return next();
    }
    
    const attempts = loginAttempts.get(ip);
    
    // Reset après 15 minutes
    if (now - attempts.lastAttempt > 15 * 60 * 1000) {
        loginAttempts.set(ip, { count: 1, lastAttempt: now });
        return next();
    }
    
    // Limite de 10 tentatives par 15 minutes
    if (attempts.count >= 10) {
        return res.status(429).json({ 
            error: 'Trop de tentatives de connexion. Réessayez dans 15 minutes.' 
        });
    }
    
    attempts.count++;
    attempts.lastAttempt = now;
    next();
};

// Chemins des fichiers
const DATA_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const PROGRESS_FILE = path.join(DATA_DIR, 'progress.json');
const LOGS_FILE = path.join(DATA_DIR, 'logs.json');

// Initialisation des données
async function initializeData() {
    try {
        await fs.mkdir(DATA_DIR, { recursive: true });
        
        // Initialiser les fichiers s'ils n'existent pas
        const files = [
            { path: USERS_FILE, data: [] },
            { path: PROGRESS_FILE, data: {} },
            { path: LOGS_FILE, data: [] }
        ];

        for (const file of files) {
            try {
                await fs.access(file.path);
            } catch {
                await fs.writeFile(file.path, JSON.stringify(file.data, null, 2));
            }
        }

        // Créer le compte owner s'il n'existe pas
        await createOwnerAccount();
        
        console.log('✅ Données initialisées');
    } catch (error) {
        console.error('❌ Erreur initialisation:', error);
    }
}

// Créer le compte propriétaire
async function createOwnerAccount() {
    const users = await readUsers();
    const ownerExists = users.find(u => u.email === CONFIG.OWNER_EMAIL);
    
    if (!ownerExists) {
        const hashedPassword = await bcrypt.hash(CONFIG.OWNER_PASSWORD, 10);
        const owner = {
            id: 'owner-' + Date.now(),
            username: CONFIG.OWNER_USERNAME,
            email: CONFIG.OWNER_EMAIL,
            password: hashedPassword,
            role: 'owner',
            createdAt: new Date().toISOString(),
            lastLogin: null,
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=owner',
            level: 100,
            xp: 999999,
            achievements: ['owner', 'founder', 'admin']
        };
        
        users.push(owner);
        await writeUsers(users);
        console.log('👑 Compte owner créé');
        console.log(`📧 Email: ${CONFIG.OWNER_EMAIL}`);
        console.log(`🔑 Mot de passe: ${CONFIG.OWNER_PASSWORD}`);
    }
}

// Fonctions utilitaires
async function readUsers() {
    try {
        const data = await fs.readFile(USERS_FILE, 'utf8');
        return JSON.parse(data);
    } catch {
        return [];
    }
}

async function writeUsers(users) {
    await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2));
}

async function readProgress() {
    try {
        const data = await fs.readFile(PROGRESS_FILE, 'utf8');
        return JSON.parse(data);
    } catch {
        return {};
    }
}

async function writeProgress(progress) {
    await fs.writeFile(PROGRESS_FILE, JSON.stringify(progress, null, 2));
}

async function readLogs() {
    try {
        const data = await fs.readFile(LOGS_FILE, 'utf8');
        return JSON.parse(data);
    } catch {
        return [];
    }
}

async function writeLogs(logs) {
    await fs.writeFile(LOGS_FILE, JSON.stringify(logs, null, 2));
}

async function addLog(action, userId, details = {}) {
    const logs = await readLogs();
    logs.push({
        id: Date.now().toString(),
        action,
        userId,
        details,
        timestamp: new Date().toISOString(),
        ip: 'localhost' // En production, utiliser req.ip
    });
    
    // Garder seulement les 1000 derniers logs
    if (logs.length > 1000) {
        logs.splice(0, logs.length - 1000);
    }
    
    await writeLogs(logs);
}

// Middleware d'authentification
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Token requis' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Token invalide' });
        }
        req.user = user;
        next();
    });
}

// Middleware admin/owner
function requireOwner(req, res, next) {
    if (req.user.role !== 'owner') {
        return res.status(403).json({ error: 'Accès refusé - Owner requis' });
    }
    next();
}

// Routes d'authentification
app.post('/api/auth/register', rateLimitMiddleware, async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ error: 'Tous les champs sont requis' });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: 'Mot de passe trop court (min 6 caractères)' });
        }

        const users = await readUsers();
        
        if (users.find(u => u.email === email || u.username === username)) {
            return res.status(400).json({ error: 'Utilisateur déjà existant' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = {
            id: Date.now().toString(),
            username,
            email,
            password: hashedPassword,
            role: 'user',
            createdAt: new Date().toISOString(),
            lastLogin: null,
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
            level: 1,
            xp: 0,
            achievements: []
        };

        users.push(newUser);
        await writeUsers(users);

        // Initialiser la progression
        const progress = await readProgress();
        progress[newUser.id] = {
            games: {},
            stats: { totalPlayTime: 0, gamesPlayed: 0, achievementsUnlocked: 0 },
            preferences: { theme: 'dark', notifications: true }
        };
        await writeProgress(progress);

        // Log
        await addLog('user_registered', newUser.id, { username, email });

        const token = jwt.sign(
            { id: newUser.id, username: newUser.username, role: newUser.role },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            message: 'Compte créé avec succès',
            token,
            user: {
                id: newUser.id,
                username: newUser.username,
                email: newUser.email,
                role: newUser.role,
                avatar: newUser.avatar,
                level: newUser.level,
                xp: newUser.xp
            }
        });

    } catch (error) {
        console.error('Erreur inscription:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

app.post('/api/auth/login', rateLimitMiddleware, async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email et mot de passe requis' });
        }

        const users = await readUsers();
        const user = users.find(u => u.email === email);

        if (!user || !await bcrypt.compare(password, user.password)) {
            await addLog('login_failed', null, { email });
            return res.status(401).json({ error: 'Identifiants invalides' });
        }

        // Mettre à jour la dernière connexion
        user.lastLogin = new Date().toISOString();
        await writeUsers(users);

        // Log
        await addLog('user_login', user.id, { username: user.username });

        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            message: 'Connexion réussie',
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                avatar: user.avatar,
                level: user.level,
                xp: user.xp,
                lastLogin: user.lastLogin
            }
        });

    } catch (error) {
        console.error('Erreur connexion:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Routes utilisateur
app.get('/api/user/profile', authenticateToken, async (req, res) => {
    try {
        const users = await readUsers();
        const user = users.find(u => u.id === req.user.id);
        
        if (!user) {
            return res.status(404).json({ error: 'Utilisateur non trouvé' });
        }

        const progress = await readProgress();
        const userProgress = progress[req.user.id] || {};

        res.json({
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
            avatar: user.avatar,
            level: user.level,
            xp: user.xp,
            createdAt: user.createdAt,
            lastLogin: user.lastLogin,
            achievements: user.achievements,
            stats: userProgress.stats || {}
        });

    } catch (error) {
        console.error('Erreur profil:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Routes de progression
app.get('/api/progress', authenticateToken, async (req, res) => {
    try {
        const progress = await readProgress();
        const userProgress = progress[req.user.id] || {
            games: {},
            stats: { totalPlayTime: 0, gamesPlayed: 0, achievementsUnlocked: 0 },
            preferences: { theme: 'dark', notifications: true }
        };

        res.json(userProgress);
    } catch (error) {
        console.error('Erreur progression:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

app.post('/api/progress/save', authenticateToken, async (req, res) => {
    try {
        const { game, data } = req.body;

        if (!game || !data) {
            return res.status(400).json({ error: 'Jeu et données requis' });
        }

        const progress = await readProgress();
        
        if (!progress[req.user.id]) {
            progress[req.user.id] = {
                games: {},
                stats: { totalPlayTime: 0, gamesPlayed: 0, achievementsUnlocked: 0 },
                preferences: { theme: 'dark', notifications: true }
            };
        }

        progress[req.user.id].games[game] = {
            ...progress[req.user.id].games[game],
            ...data,
            lastPlayed: new Date().toISOString()
        };

        if (data.playTime) {
            progress[req.user.id].stats.totalPlayTime += data.playTime;
        }

        await writeProgress(progress);
        await addLog('progress_saved', req.user.id, { game });

        res.json({ message: 'Progression sauvegardée' });

    } catch (error) {
        console.error('Erreur sauvegarde:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Routes admin/owner
app.get('/api/admin/dashboard', authenticateToken, requireOwner, async (req, res) => {
    try {
        const users = await readUsers();
        const progress = await readProgress();
        const logs = await readLogs();

        const stats = {
            users: {
                total: users.length,
                active: users.filter(u => {
                    const lastLogin = new Date(u.lastLogin);
                    const now = new Date();
                    return (now - lastLogin) < 24 * 60 * 60 * 1000; // 24h
                }).length,
                new: users.filter(u => {
                    const created = new Date(u.createdAt);
                    const now = new Date();
                    return (now - created) < 7 * 24 * 60 * 60 * 1000; // 7 jours
                }).length
            },
            games: {
                totalPlayTime: Object.values(progress).reduce((total, user) => 
                    total + (user.stats?.totalPlayTime || 0), 0),
                totalSessions: Object.values(progress).reduce((total, user) => 
                    total + (user.stats?.gamesPlayed || 0), 0)
            },
            logs: {
                total: logs.length,
                recent: logs.slice(-10).reverse()
            }
        };

        res.json(stats);
    } catch (error) {
        console.error('Erreur dashboard:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

app.get('/api/admin/users', authenticateToken, requireOwner, async (req, res) => {
    try {
        const users = await readUsers();
        const progress = await readProgress();

        const usersWithStats = users.map(user => ({
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
            level: user.level,
            xp: user.xp,
            createdAt: user.createdAt,
            lastLogin: user.lastLogin,
            achievements: user.achievements?.length || 0,
            totalPlayTime: progress[user.id]?.stats?.totalPlayTime || 0
        }));

        res.json(usersWithStats);
    } catch (error) {
        console.error('Erreur liste utilisateurs:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Route pour créer un compte serveur (admin uniquement)
app.post('/api/admin/create-server-account', authenticateToken, requireOwner, async (req, res) => {
    try {
        const { username, email, password, role = 'user' } = req.body;

        // Validation des données
        if (!username || !email || !password) {
            return res.status(400).json({ error: 'Tous les champs sont requis' });
        }

        if (password.length < 8) {
            return res.status(400).json({ error: 'Le mot de passe doit contenir au moins 8 caractères' });
        }

        // Vérifier si l'utilisateur existe déjà
        const users = await readUsers();
        const existingUser = users.find(u => u.email === email || u.username === username);
        
        if (existingUser) {
            return res.status(400).json({ error: 'Un utilisateur avec cet email ou nom d\'utilisateur existe déjà' });
        }

        // Créer le nouvel utilisateur
        const hashedPassword = await bcrypt.hash(password, 12);
        const newUser = {
            id: Date.now().toString(),
            username,
            email,
            password: hashedPassword,
            role: role, // 'user', 'admin', ou 'owner'
            level: 1,
            xp: 0,
            achievements: [],
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
            createdAt: new Date().toISOString(),
            lastLogin: null,
            createdBy: req.user.id // Traçabilité
        };

        users.push(newUser);
        await writeUsers(users);

        // Log de l'action
        await logAction('server_account_created', req.user.id, {
            newUserId: newUser.id,
            username: newUser.username,
            email: newUser.email,
            role: newUser.role,
            createdBy: req.user.username
        });

        // Retourner les infos sans le mot de passe
        const { password: _, ...userResponse } = newUser;
        res.status(201).json({
            message: 'Compte serveur créé avec succès',
            user: userResponse
        });

    } catch (error) {
        console.error('Erreur création compte serveur:', error);
        res.status(500).json({ error: 'Erreur serveur lors de la création du compte' });
    }
});

// Route pour lister les comptes serveur
app.get('/api/admin/server-accounts', authenticateToken, requireOwner, async (req, res) => {
    try {
        const users = await readUsers();
        const serverAccounts = users
            .filter(user => user.createdBy) // Comptes créés par un admin
            .map(user => ({
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                level: user.level,
                xp: user.xp,
                createdAt: user.createdAt,
                lastLogin: user.lastLogin,
                createdBy: user.createdBy
            }));

        res.json(serverAccounts);
    } catch (error) {
        console.error('Erreur liste comptes serveur:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Route pour supprimer un compte serveur
app.delete('/api/admin/server-account/:id', authenticateToken, requireOwner, async (req, res) => {
    try {
        const { id } = req.params;
        const users = await readUsers();
        
        const userIndex = users.findIndex(u => u.id === id);
        if (userIndex === -1) {
            return res.status(404).json({ error: 'Utilisateur non trouvé' });
        }

        const userToDelete = users[userIndex];
        
        // Empêcher la suppression du compte owner
        if (userToDelete.role === 'owner') {
            return res.status(403).json({ error: 'Impossible de supprimer le compte propriétaire' });
        }

        // Supprimer l'utilisateur
        users.splice(userIndex, 1);
        await writeUsers(users);

        // Supprimer aussi sa progression
        const progress = await readProgress();
        delete progress[id];
        await writeProgress(progress);

        // Log de l'action
        await logAction('server_account_deleted', req.user.id, {
            deletedUserId: id,
            deletedUsername: userToDelete.username,
            deletedBy: req.user.username
        });

        res.json({ message: 'Compte serveur supprimé avec succès' });

    } catch (error) {
        console.error('Erreur suppression compte serveur:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

app.get('/api/admin/logs', authenticateToken, requireOwner, async (req, res) => {
    try {
        const logs = await readLogs();
        const limit = parseInt(req.query.limit) || 100;
        
        res.json(logs.slice(-limit).reverse());
    } catch (error) {
        console.error('Erreur logs:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Route pour les statistiques publiques
app.get('/api/stats', async (req, res) => {
    try {
        const users = await readUsers();
        const progress = await readProgress();

        const stats = {
            totalUsers: users.length,
            totalPlayTime: Object.values(progress).reduce((total, user) => 
                total + (user.stats?.totalPlayTime || 0), 0),
            activeGames: 2, // Minecraft et Upload Labs
            onlineUsers: users.filter(u => {
                const lastLogin = new Date(u.lastLogin);
                const now = new Date();
                return (now - lastLogin) < 30 * 60 * 1000; // 30 minutes
            }).length
        };

        res.json(stats);
    } catch (error) {
        console.error('Erreur stats:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Démarrage du serveur
async function startServer() {
    await initializeData();
    
    app.listen(PORT, () => {
        console.log('🎮 ================================');
        console.log('🚀 Game Hub Server démarré !');
        console.log('🌐 URL: http://localhost:' + PORT);
        console.log('👑 Dashboard Admin: http://localhost:' + PORT + '/admin');
        console.log('🔐 Identifiants sécurisés - Voir documentation');
        console.log('🎮 ================================');
    });
}

startServer().catch(console.error);