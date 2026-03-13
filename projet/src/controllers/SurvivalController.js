/**
 * Contrôleur Multijoueur Survival - PlayHub
 * @author Tomy - Lead Developer
 */

class SurvivalController {
    constructor(io) {
        this.io = io;
        this.players = new Map(); // socketId -> player data
        this.worldResources = this.generateWorldResources();
        this.worldWater = this.generateWaterBodies();
        
        this.setupSocketHandlers();
        this.startGameLoop();
    }

    /**
     * Génère les ressources du monde
     */
    generateWorldResources() {
        const resources = [];
        const WORLD_SIZE = 3000;
        
        // Arbres
        for (let i = 0; i < 100; i++) {
            resources.push({
                id: `tree_${i}`,
                type: 'tree',
                x: Math.random() * WORLD_SIZE,
                y: Math.random() * WORLD_SIZE,
                hp: 30,
                maxHp: 30
            });
        }
        
        // Rochers
        for (let i = 0; i < 80; i++) {
            resources.push({
                id: `rock_${i}`,
                type: 'rock',
                x: Math.random() * WORLD_SIZE,
                y: Math.random() * WORLD_SIZE,
                hp: 40,
                maxHp: 40
            });
        }
        
        // Minerai de fer
        for (let i = 0; i < 30; i++) {
            resources.push({
                id: `iron_${i}`,
                type: 'iron_ore',
                x: Math.random() * WORLD_SIZE,
                y: Math.random() * WORLD_SIZE,
                hp: 50,
                maxHp: 50
            });
        }
        
        // Buissons
        for (let i = 0; i < 50; i++) {
            resources.push({
                id: `bush_${i}`,
                type: 'bush',
                x: Math.random() * WORLD_SIZE,
                y: Math.random() * WORLD_SIZE,
                hp: 10,
                maxHp: 10
            });
        }
        
        return resources;
    }

    /**
     * Génère des points d'eau
     */
    generateWaterBodies() {
        const water = [];
        const WORLD_SIZE = 3000;
        
        // Lacs
        for (let i = 0; i < 5; i++) {
            water.push({
                id: `lake_${i}`,
                type: 'lake',
                x: Math.random() * WORLD_SIZE,
                y: Math.random() * WORLD_SIZE,
                radius: 80 + Math.random() * 120
            });
        }
        
        // Rivières (simplifiées)
        for (let i = 0; i < 3; i++) {
            water.push({
                id: `river_${i}`,
                type: 'river',
                x: Math.random() * WORLD_SIZE,
                y: Math.random() * WORLD_SIZE,
                width: 40 + Math.random() * 40,
                length: 300 + Math.random() * 500,
                angle: Math.random() * Math.PI * 2
            });
        }
        
        return water;
    }

    /**
     * Configure les gestionnaires Socket.IO
     */
    setupSocketHandlers() {
        this.io.on('connection', (socket) => {
            console.log(`🎮 Joueur connecté: ${socket.id}`);

            // Nouveau joueur rejoint
            socket.on('player:join', (data) => {
                const player = {
                    id: socket.id,
                    username: data.username || 'Joueur',
                    x: 1500 + (Math.random() - 0.5) * 200,
                    y: 1500 + (Math.random() - 0.5) * 200,
                    hp: 100,
                    hunger: 100,
                    thirst: 100,
                    inventory: {
                        wood: 0,
                        stone: 0,
                        iron_ore: 0
                    },
                    equippedTool: 'hand',
                    lastUpdate: Date.now()
                };

                this.players.set(socket.id, player);

                // Envoyer l'état du monde au nouveau joueur
                socket.emit('world:init', {
                    resources: this.worldResources,
                    water: this.worldWater,
                    players: Array.from(this.players.values())
                });

                // Notifier les autres joueurs
                socket.broadcast.emit('player:joined', player);
                
                console.log(`✅ ${player.username} a rejoint le jeu`);
            });

            // Mise à jour position joueur
            socket.on('player:move', (data) => {
                const player = this.players.get(socket.id);
                if (player) {
                    player.x = data.x;
                    player.y = data.y;
                    player.lastUpdate = Date.now();
                    
                    // Broadcast aux autres joueurs
                    socket.broadcast.emit('player:moved', {
                        id: socket.id,
                        x: data.x,
                        y: data.y
                    });
                }
            });

            // Récolte de ressource
            socket.on('resource:harvest', (data) => {
                const resource = this.worldResources.find(r => r.id === data.resourceId);
                if (resource && resource.hp > 0) {
                    resource.hp -= data.damage;
                    
                    // Broadcast la mise à jour
                    this.io.emit('resource:updated', {
                        id: resource.id,
                        hp: resource.hp
                    });
                    
                    // Si ressource détruite
                    if (resource.hp <= 0) {
                        this.io.emit('resource:destroyed', {
                            id: resource.id,
                            type: resource.type
                        });
                        
                        // Respawn après 60 secondes
                        setTimeout(() => {
                            resource.hp = resource.maxHp;
                            this.io.emit('resource:respawned', resource);
                        }, 60000);
                    }
                }
            });

            // Mise à jour inventaire
            socket.on('player:inventory', (data) => {
                const player = this.players.get(socket.id);
                if (player) {
                    player.inventory = data.inventory;
                    player.equippedTool = data.equippedTool;
                }
            });

            // Chat
            socket.on('chat:message', (data) => {
                const player = this.players.get(socket.id);
                if (player) {
                    this.io.emit('chat:message', {
                        username: player.username,
                        message: data.message,
                        timestamp: Date.now()
                    });
                }
            });

            // Déconnexion
            socket.on('disconnect', () => {
                const player = this.players.get(socket.id);
                if (player) {
                    console.log(`👋 ${player.username} a quitté le jeu`);
                    this.players.delete(socket.id);
                    this.io.emit('player:left', socket.id);
                }
            });
        });
    }

    /**
     * Boucle de jeu serveur
     */
    startGameLoop() {
        setInterval(() => {
            // Nettoyer les joueurs inactifs (>30s)
            const now = Date.now();
            for (const [id, player] of this.players.entries()) {
                if (now - player.lastUpdate > 30000) {
                    this.players.delete(id);
                    this.io.emit('player:left', id);
                }
            }
        }, 5000);
    }
}

module.exports = SurvivalController;
