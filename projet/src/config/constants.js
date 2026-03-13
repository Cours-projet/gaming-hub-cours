/**
 * Constantes du jeu PlayHub
 * @author Tomy - Lead Developer
 * @school Lycée Albert Einstein
 */

module.exports = {
    // Configuration du serveur
    SERVER: {
        PORT: parseInt(process.env.SERVER_PORT || process.env.PORT || '3000'),
        HOST: process.env.SERVER_IP || process.env.HOST || '0.0.0.0'
    },

    // Configuration du jeu
    GAME: {
        MAX_PLAYERS: 20,
        MIN_PLAYERS_TO_START: 2,
        TICK_RATE: 60, // FPS du serveur
        MAP_WIDTH: 800,
        MAP_HEIGHT: 600
    },

    // Configuration des joueurs
    PLAYER: {
        SIZE: 16,
        SPEED: 3,
        MAX_HP: 100,
        RESPAWN_TIME: 3000, // ms
        INVINCIBILITY_TIME: 2000 // ms après respawn
    },

    // Configuration des armes
    WEAPON: {
        BULLET_SIZE: 4,
        BULLET_SPEED: 8,
        BULLET_DAMAGE: 20,
        FIRE_RATE: 250, // ms entre chaque tir
        MAX_BULLETS: 100 // Limite de balles simultanées
    },

    // Messages du jeu
    MESSAGES: {
        PLAYER_JOINED: (username) => `🎮 ${username} a rejoint la partie`,
        PLAYER_LEFT: (username) => `👋 ${username} a quitté la partie`,
        PLAYER_KILLED: (killer, victim) => `💀 ${killer} a éliminé ${victim}`,
        GAME_STARTED: '🎯 La partie commence !',
        GAME_ENDED: (winner) => `🏆 ${winner} a gagné la partie !`,
        SERVER_FULL: '❌ Serveur complet (20/20)'
    }
};
