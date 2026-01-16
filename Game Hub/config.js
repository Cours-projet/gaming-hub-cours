/**
 * Configuration du Game Hub
 * Centralise tous les paramètres du système
 */

const config = {
    // Serveur
    server: {
        port: process.env.PORT || 3000,
        host: process.env.HOST || 'localhost',
        environment: process.env.NODE_ENV || 'development'
    },

    // Sécurité
    security: {
        jwtSecret: process.env.JWT_SECRET || 'gamehub-secret-key-2025',
        jwtExpiration: '7d',
        bcryptRounds: 10,
        maxLoginAttempts: 5,
        lockoutTime: 15 * 60 * 1000 // 15 minutes
    },

    // Base de données
    database: {
        type: 'json',
        dataDir: './data',
        backupInterval: 24 * 60 * 60 * 1000, // 24 heures
        maxBackups: 7
    },

    // Compte administrateur par défaut
    admin: {
        email: 'owner@gamehub.com',
        password: 'GameHub2025!',
        username: 'GameHubOwner'
    },

    // Jeux
    games: {
        autoSaveInterval: 2 * 60 * 1000, // 2 minutes
        maxProgressSize: 1024 * 1024, // 1MB par utilisateur
        supportedGames: ['minecraft', 'upload-labs']
    },

    // Logs
    logging: {
        maxLogs: 1000,
        logLevel: process.env.LOG_LEVEL || 'info',
        logToFile: true,
        logToConsole: true
    },

    // Limites
    limits: {
        maxUsersPerHour: 100,
        maxRequestsPerMinute: 60,
        maxFileSize: 10 * 1024 * 1024, // 10MB
        sessionTimeout: 30 * 60 * 1000 // 30 minutes
    },

    // Interface
    ui: {
        theme: 'dark',
        language: 'fr',
        animationsEnabled: true,
        notificationsEnabled: true
    },

    // API
    api: {
        version: '1.0.0',
        rateLimit: {
            windowMs: 15 * 60 * 1000, // 15 minutes
            max: 100 // limite par IP
        },
        cors: {
            origin: process.env.CORS_ORIGIN || '*',
            credentials: true
        }
    }
};

// Validation de la configuration
function validateConfig() {
    const required = [
        'server.port',
        'security.jwtSecret',
        'admin.email',
        'admin.password'
    ];

    for (const path of required) {
        const value = path.split('.').reduce((obj, key) => obj?.[key], config);
        if (!value) {
            throw new Error(`Configuration manquante: ${path}`);
        }
    }

    // Vérifications de sécurité
    if (config.security.jwtSecret.length < 32) {
        console.warn('⚠️  JWT Secret trop court, utilisez au moins 32 caractères');
    }

    if (config.admin.password.length < 8) {
        console.warn('⚠️  Mot de passe admin trop court');
    }

    console.log('✅ Configuration validée');
}

// Export pour Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { config, validateConfig };
}

// Export pour le navigateur
if (typeof window !== 'undefined') {
    window.GameHubConfig = config;
}