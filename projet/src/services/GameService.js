/**
 * Service de gestion du jeu
 * @author Tomy - Lead Developer
 * @school Lycée Albert Einstein
 */

const Player = require('../models/Player');
const Bullet = require('../models/Bullet');
const { GAME, MESSAGES, WEAPON } = require('../config/constants');
const DatabaseService = require('./DatabaseService');

class GameService {
    constructor(io) {
        this.io = io;
        this.players = new Map();
        this.bullets = [];
        this.gameStarted = false;
        this.bulletIdCounter = 0;
        
        // Démarrer la boucle de jeu
        this.startGameLoop();
    }

    /**
     * Ajoute un joueur à la partie
     */
    addPlayer(socketId, username) {
        if (this.players.size >= GAME.MAX_PLAYERS) {
            return { success: false, message: MESSAGES.SERVER_FULL };
        }

        const player = new Player(socketId, username);
        this.players.set(socketId, player);

        // Notifier tous les joueurs
        this.io.emit('playerJoined', {
            player: player.toJSON(),
            message: MESSAGES.PLAYER_JOINED(username)
        });

        // Vérifier si on peut démarrer la partie
        this.checkGameStart();

        console.log(`✅ ${username} a rejoint (${this.players.size}/${GAME.MAX_PLAYERS})`);

        return { success: true, player: player.toJSON() };
    }

    /**
     * Retire un joueur de la partie
     */
    removePlayer(socketId) {
        const player = this.players.get(socketId);
        
        if (player) {
            this.players.delete(socketId);
            
            // Sauvegarder les stats
            DatabaseService.updatePlayerStats(player);

            this.io.emit('playerLeft', {
                playerId: socketId,
                message: MESSAGES.PLAYER_LEFT(player.username)
            });

            console.log(`👋 ${player.username} a quitté (${this.players.size}/${GAME.MAX_PLAYERS})`);
        }
    }

    /**
     * Déplace un joueur
     */
    movePlayer(socketId, x, y, direction) {
        const player = this.players.get(socketId);
        
        if (player && player.isAlive) {
            player.move(x, y);
            player.direction = direction;
        }
    }

    /**
     * Gère le tir d'un joueur
     */
    shoot(socketId, data) {
        const player = this.players.get(socketId);
        
        if (!player || !player.isAlive || !player.canShoot()) {
            return;
        }

        // Limiter le nombre de balles
        if (this.bullets.length >= WEAPON.MAX_BULLETS) {
            return;
        }

        player.updateLastShot();

        const bullet = new Bullet(
            this.bulletIdCounter++,
            data.x,
            data.y,
            data.direction,
            socketId
        );

        this.bullets.push(bullet);
    }

    /**
     * Met à jour les balles
     */
    updateBullets() {
        this.bullets = this.bullets.filter(bullet => {
            bullet.update();

            // Retirer si hors limites
            if (bullet.isOutOfBounds()) {
                return false;
            }

            // Vérifier les collisions
            for (const [playerId, player] of this.players) {
                if (bullet.checkCollision(player)) {
                    const isDead = player.takeDamage(bullet.damage);

                    if (isDead) {
                        this.handlePlayerDeath(playerId, bullet.ownerId);
                    }

                    return false; // Retirer la balle
                }
            }

            return true;
        });
    }

    /**
     * Gère la mort d'un joueur
     */
    handlePlayerDeath(victimId, killerId) {
        const victim = this.players.get(victimId);
        const killer = this.players.get(killerId);

        if (!victim || !killer) return;

        killer.addKill();

        this.io.emit('playerKilled', {
            victimId,
            victimName: victim.username,
            killerId,
            killerName: killer.username,
            message: MESSAGES.PLAYER_KILLED(killer.username, victim.username)
        });

        // Respawn après un délai
        setTimeout(() => {
            if (this.players.has(victimId)) {
                victim.respawn();
                this.io.emit('playerRespawned', {
                    playerId: victimId,
                    player: victim.toJSON()
                });
            }
        }, 3000);
    }

    /**
     * Vérifie si la partie peut démarrer
     */
    checkGameStart() {
        if (!this.gameStarted && this.players.size >= GAME.MIN_PLAYERS_TO_START) {
            this.gameStarted = true;
            this.io.emit('gameStarted', {
                message: MESSAGES.GAME_STARTED
            });
            console.log('🎯 Partie démarrée !');
        }
    }

    /**
     * Boucle principale du jeu
     */
    startGameLoop() {
        setInterval(() => {
            this.updateBullets();
            this.broadcastGameState();
        }, 1000 / GAME.TICK_RATE);

        console.log(`🎮 Boucle de jeu démarrée (${GAME.TICK_RATE} FPS)`);
    }

    /**
     * Diffuse l'état du jeu à tous les clients
     */
    broadcastGameState() {
        const gameState = {
            players: Array.from(this.players.values()).map(p => p.toJSON()),
            bullets: this.bullets.map(b => b.toJSON()),
            playerCount: this.players.size,
            gameStarted: this.gameStarted
        };

        this.io.emit('gameState', gameState);
    }

    /**
     * Récupère un joueur
     */
    getPlayer(socketId) {
        return this.players.get(socketId);
    }

    /**
     * Récupère le nombre de joueurs
     */
    getPlayerCount() {
        return this.players.size;
    }

    /**
     * Récupère les statistiques du serveur
     */
    getStats() {
        return {
            players: this.players.size,
            maxPlayers: GAME.MAX_PLAYERS,
            bullets: this.bullets.length,
            gameStarted: this.gameStarted
        };
    }
}

module.exports = GameService;
