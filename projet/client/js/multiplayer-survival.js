/**
 * PlayHub - Multiplayer Survival Game
 * @author Tomy - Lead Developer
 */

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Configuration
const WORLD = {
    width: 3000,
    height: 3000
};

// État du jeu
const game = {
    socket: null,
    player: {
        id: null,
        username: 'Joueur',
        x: 1500,
        y: 1500,
        size: 30,
        speed: 4,
        hp: 100,
        hunger: 100,
        thirst: 100,
        inventory: {
            wood: 0,
            stone: 0,
            iron_ore: 0
        },
        equippedTool: 'hand'
    },
    otherPlayers: new Map(),
    camera: { x: 0, y: 0 },
    keys: {},
    resources: [],
    water: [],
    craftingSystem: new CraftingSystem(),
    craftingMenuOpen: false,
    chatOpen: false,
    chatMessages: [],
    chatInput: ''
};

// Connexion Socket.IO
function connectToServer() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    game.player.username = user.username || 'Joueur';
    
    game.socket = io();
    
    game.socket.on('connect', () => {
        console.log('✅ Connecté au serveur');
        game.player.id = game.socket.id;
        game.socket.emit('player:join', {
            username: game.player.username
        });
    });
    
    // Initialisation du monde
    game.socket.on('world:init', (data) => {
        game.resources = data.resources;
        game.water = data.water;
        data.players.forEach(p => {
            if (p.id !== game.socket.id) {
                game.otherPlayers.set(p.id, p);
            }
        });
        addChatMessage('🌍 Monde chargé! Bienvenue!', '#8b5cf6');
    });
    
    // Nouveau joueur
    game.socket.on('player:joined', (player) => {
        game.otherPlayers.set(player.id, player);
        addChatMessage(`👋 ${player.username} a rejoint le jeu`, '#0f0');
    });
    
    // Joueur déplacé
    game.socket.on('player:moved', (data) => {
        const player = game.otherPlayers.get(data.id);
        if (player) {
            player.x = data.x;
            player.y = data.y;
        }
    });
    
    // Ressource mise à jour
    game.socket.on('resource:updated', (data) => {
        const resource = game.resources.find(r => r.id === data.id);
        if (resource) {
            resource.hp = data.hp;
        }
    });
    
    // Ressource détruite
    game.socket.on('resource:destroyed', (data) => {
        const index = game.resources.findIndex(r => r.id === data.id);
        if (index !== -1) {
            game.resources.splice(index, 1);
        }
    });
    
    // Ressource respawn
    game.socket.on('resource:respawned', (resource) => {
        game.resources.push(resource);
    });
    
    // Message chat
    game.socket.on('chat:message', (data) => {
        addChatMessage(`${data.username}: ${data.message}`, '#fff');
    });
    
    // Joueur parti
    game.socket.on('player:left', (playerId) => {
        const player = game.otherPlayers.get(playerId);
        if (player) {
            addChatMessage(`👋 ${player.username} a quitté le jeu`, '#f00');
            game.otherPlayers.delete(playerId);
        }
    });
}

// Contrôles
document.addEventListener('keydown', (e) => {
    game.keys[e.key.toLowerCase()] = true;
    
    // Chat
    if (e.key === 'Enter') {
        if (game.chatOpen) {
            sendChatMessage();
        } else {
            game.chatOpen = true;
        }
    }
    
    if (e.key === 'Escape') {
        game.chatOpen = false;
        game.craftingMenuOpen = false;
    }
    
    if (e.key.toLowerCase() === 'c' && !game.chatOpen) {
        game.craftingMenuOpen = !game.craftingMenuOpen;
    }
    
    // Équiper outils
    if (e.key >= '1' && e.key <= '5' && !game.chatOpen) {
        const tools = ['hand', 'wooden_pickaxe', 'stone_pickaxe', 'iron_pickaxe', 'wooden_axe'];
        const tool = tools[parseInt(e.key) - 1];
        if (tool === 'hand' || game.player.inventory[tool] > 0) {
            game.player.equippedTool = tool;
        }
    }
});

document.addEventListener('keyup', (e) => {
    game.keys[e.key.toLowerCase()] = false;
});

// Chat
function sendChatMessage() {
    if (game.chatInput.trim()) {
        game.socket.emit('chat:message', {
            message: game.chatInput.trim()
        });
        game.chatInput = '';
    }
    game.chatOpen = false;
}

function addChatMessage(message, color = '#fff') {
    game.chatMessages.push({
        text: message,
        color,
        time: Date.now()
    });
    
    // Limiter à 50 messages
    if (game.chatMessages.length > 50) {
        game.chatMessages.shift();
    }
}

// Update
function update() {
    if (!game.socket || !game.socket.connected) return;
    
    // Déplacement
    const speed = game.player.speed;
    let dx = 0, dy = 0;
    
    if (!game.chatOpen) {
        if (game.keys['z'] || game.keys['arrowup']) dy -= speed;
        if (game.keys['s'] || game.keys['arrowdown']) dy += speed;
        if (game.keys['q'] || game.keys['arrowleft']) dx -= speed;
        if (game.keys['d'] || game.keys['arrowright']) dx += speed;
    }
    
    if (dx !== 0 && dy !== 0) {
        dx *= 0.707;
        dy *= 0.707;
    }
    
    if (dx !== 0 || dy !== 0) {
        game.player.x = Math.max(15, Math.min(WORLD.width - 15, game.player.x + dx));
        game.player.y = Math.max(15, Math.min(WORLD.height - 15, game.player.y + dy));
        
        // Envoyer position au serveur
        game.socket.emit('player:move', {
            x: game.player.x,
            y: game.player.y
        });
    }
    
    // Caméra
    game.camera.x = game.player.x - canvas.width / 2;
    game.camera.y = game.player.y - canvas.height / 2;
    game.camera.x = Math.max(0, Math.min(WORLD.width - canvas.width, game.camera.x));
    game.camera.y = Math.max(0, Math.min(WORLD.height - canvas.height, game.camera.y));
    
    // Récolte dans l'eau (restaure soif)
    game.water.forEach(w => {
        const dist = Math.hypot(w.x - game.player.x, w.y - game.player.y);
        if (dist < (w.radius || 50)) {
            if (game.player.thirst < 100) {
                game.player.thirst = Math.min(100, game.player.thirst + 0.1);
            }
        }
    });
}

// Rendu
function render() {
    // Fond herbe
    ctx.fillStyle = '#228b22';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Eau
    game.water.forEach(w => {
        const screenX = w.x - game.camera.x;
        const screenY = w.y - game.camera.y;
        
        if (w.type === 'lake') {
            ctx.fillStyle = '#4169e1';
            ctx.beginPath();
            ctx.arc(screenX, screenY, w.radius, 0, Math.PI * 2);
            ctx.fill();
            
            // Reflets
            ctx.fillStyle = 'rgba(135, 206, 250, 0.3)';
            ctx.beginPath();
            ctx.arc(screenX - 20, screenY - 20, w.radius * 0.4, 0, Math.PI * 2);
            ctx.fill();
        } else if (w.type === 'river') {
            ctx.save();
            ctx.translate(screenX, screenY);
            ctx.rotate(w.angle);
            ctx.fillStyle = '#4169e1';
            ctx.fillRect(-w.length / 2, -w.width / 2, w.length, w.width);
            ctx.restore();
        }
    });
    
    // Ressources (simplifié)
    game.resources.forEach(r => {
        const screenX = r.x - game.camera.x;
        const screenY = r.y - game.camera.y;
        
        if (screenX > -50 && screenX < canvas.width + 50 && screenY > -50 && screenY < canvas.height + 50) {
            if (r.type === 'tree') {
                ctx.fillStyle = '#2d5016';
                ctx.beginPath();
                ctx.arc(screenX, screenY, 20, 0, Math.PI * 2);
                ctx.fill();
            } else if (r.type === 'rock') {
                ctx.fillStyle = '#666';
                ctx.fillRect(screenX - 15, screenY - 15, 30, 25);
            } else if (r.type === 'iron_ore') {
                ctx.fillStyle = '#8b4513';
                ctx.beginPath();
                ctx.arc(screenX, screenY, 15, 0, Math.PI * 2);
                ctx.fill();
            } else if (r.type === 'bush') {
                ctx.fillStyle = '#228b22';
                ctx.beginPath();
                ctx.arc(screenX, screenY, 12, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    });
    
    // Autres joueurs
    game.otherPlayers.forEach(p => {
        const screenX = p.x - game.camera.x;
        const screenY = p.y - game.camera.y;
        
        // Joueur
        ctx.fillStyle = '#ff6b6b';
        ctx.beginPath();
        ctx.arc(screenX, screenY, 15, 0, Math.PI * 2);
        ctx.fill();
        
        // Nom
        ctx.fillStyle = '#fff';
        ctx.font = '600 12px Inter';
        ctx.textAlign = 'center';
        ctx.fillText(p.username, screenX, screenY - 25);
    });
    
    // Joueur local
    const playerScreenX = game.player.x - game.camera.x;
    const playerScreenY = game.player.y - game.camera.y;
    
    ctx.fillStyle = '#8b5cf6';
    ctx.beginPath();
    ctx.arc(playerScreenX, playerScreenY, 15, 0, Math.PI * 2);
    ctx.fill();
    
    // Nom
    ctx.fillStyle = '#fff';
    ctx.font = '600 12px Inter';
    ctx.textAlign = 'center';
    ctx.fillText(game.player.username, playerScreenX, playerScreenY - 25);
    
    // Chat
    renderChat();
    
    // Compteur joueurs
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(10, 10, 200, 40);
    ctx.fillStyle = '#8b5cf6';
    ctx.font = '600 16px Inter';
    ctx.textAlign = 'left';
    ctx.fillText(`👥 Joueurs: ${game.otherPlayers.size + 1}`, 20, 35);
}

// Rendu chat
function renderChat() {
    const chatHeight = 200;
    const chatWidth = 400;
    const chatX = 10;
    const chatY = canvas.height - chatHeight - 10;
    
    // Fond
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(chatX, chatY, chatWidth, chatHeight);
    ctx.strokeStyle = '#8b5cf6';
    ctx.lineWidth = 2;
    ctx.strokeRect(chatX, chatY, chatWidth, chatHeight);
    
    // Messages
    ctx.font = '12px Inter';
    ctx.textAlign = 'left';
    const visibleMessages = game.chatMessages.slice(-8);
    visibleMessages.forEach((msg, i) => {
        ctx.fillStyle = msg.color;
        ctx.fillText(msg.text, chatX + 10, chatY + 20 + i * 20);
    });
    
    // Input
    if (game.chatOpen) {
        ctx.fillStyle = 'rgba(139, 92, 246, 0.3)';
        ctx.fillRect(chatX, chatY + chatHeight - 30, chatWidth, 25);
        ctx.fillStyle = '#fff';
        ctx.fillText('> ' + game.chatInput + '_', chatX + 10, chatY + chatHeight - 12);
    } else {
        ctx.fillStyle = '#666';
        ctx.font = '11px Inter';
        ctx.fillText('Appuyez sur ENTER pour chatter', chatX + 10, chatY + chatHeight - 12);
    }
}

// Gestion input chat
document.addEventListener('keypress', (e) => {
    if (game.chatOpen && e.key !== 'Enter') {
        if (e.key.length === 1) {
            game.chatInput += e.key;
        }
    }
});

document.addEventListener('keydown', (e) => {
    if (game.chatOpen && e.key === 'Backspace') {
        game.chatInput = game.chatInput.slice(0, -1);
    }
});

// Boucle de jeu
function gameLoop() {
    update();
    render();
    requestAnimationFrame(gameLoop);
}

// Démarrage
connectToServer();
gameLoop();
