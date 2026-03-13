/**
 * Contrôleur du jeu - Gère les événements Socket.IO
 * @author Tomy - Lead Developer
 */

const GameService = require('../services/GameService');

class GameController {
    constructor(io) {
        this.io = io;
        this.gameService = new GameService(io);
        this.setupSocketHandlers();
    }

    /**
     * Configure les gestionnaires d'événements Socket.IO
     */
    setupSocketHandlers() {
        this.io.on('connection', (socket) => {
            console.log(`🔌 Nouvelle connexion: ${socket.id}`);

            // Événement: Rejoindre la partie
            socket.on('join', (data) => {
                const result = this.gameService.addPlayer(socket.id, data.username);
                
                if (result.success) {
                    socket.emit('joined', {
                        success: true,
                        player: result.player,
                        stats: this.gameService.getStats()
                    });
                } else {
                    socket.emit('joinError', {
                        success: false,
                        message: result.message
                    });
                }
            });

            // Événement: Déplacement
            socket.on('move', (data) => {
                this.gameService.movePlayer(socket.id, data.x, data.y, data.direction);
            });

            // Événement: Tir
            socket.on('shoot', (data) => {
                this.gameService.shoot(socket.id, data);
            });

            // Événement: Message chat
            socket.on('chat', (message) => {
                const player = this.gameService.getPlayer(socket.id);
                
                if (player) {
                    this.io.emit('chat', {
                        playerId: socket.id,
                        username: player.username,
                        message: message,
                        timestamp: Date.now()
                    });
                }
            });

            // Événement: Demande de stats
            socket.on('getStats', () => {
                socket.emit('stats', this.gameService.getStats());
            });

            // Événement: Déconnexion
            socket.on('disconnect', () => {
                console.log(`🔌 Déconnexion: ${socket.id}`);
                this.gameService.removePlayer(socket.id);
            });
        });

        console.log('✅ Gestionnaires Socket.IO configurés');
    }

    /**
     * Récupère le service de jeu
     */
    getGameService() {
        return this.gameService;
    }
}

module.exports = GameController;
