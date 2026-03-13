/**
 * Jeu PlayHub Battle Royale - Version Battle Royale Complète
 * @author Tomy - Lead Developer
 * @school Lycée Albert Einstein
 */

// Configuration
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// État du jeu
const gameState = {
    mode: null,
    players: [],
    bots: [],
    bullets: [],
    myId: null,
    myPlayer: null,
    keys: {},
    lastShot: 0,
    socket: null,
    connected: false,
    currentMap: null,
    
    // Nouveaux systèmes
    inventory: new Inventory(),
    lootSystem: new LootSystem(),
    safeZone: new SafeZone(1200, 800),
    mapGenerator: new MapGenerator(1200, 800),
    lastLootSpawn: 0,
    lastZoneDamage: 0,
    gameStartTime: 0
};

/**
 * Initialise le jeu
 */
async function initGame() {
    const urlParams = new URLSearchParams(window.location.search);
    gameState.mode = urlParams.get('mode') || 'online';

    document.getElementById('game-mode').textContent = 
        `Mode: ${gameState.mode === 'solo' ? 'Solo vs Bots' : 'Multijoueur'}`;

    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    const username = user?.username || 'Joueur' + Math.floor(Math.random() * 1000);
    
    document.getElementById('player-name').textContent = username;

    if (gameState.mode === 'solo') {
        initSoloMode(username);
    } else {
        initOnlineMode(username);
    }

    setupControls();
    gameLoop();
}

/**
 * Mode Solo vs Bots
 */
function initSoloMode(username) {
    gameState.myId = 'player';
    
    // Générer une map aléatoire
    gameState.currentMap = gameState.mapGenerator.generate();
    
    // Spawn aléatoire
    const spawnX = Math.random() * 1100 + 50;
    const spawnY = Math.random() * 700 + 50;
    
    gameState.myPlayer = {
        id: 'player',
        username,
        x: spawnX,
        y: spawnY,
        hp: 100,
        maxHp: 100,
        kills: 0,
        deaths: 0,
        isAlive: true,
        direction: 0
    };

    // Créer 19 bots
    gameState.bots = createBots(19);
    gameState.players = [gameState.myPlayer, ...gameState.bots.map(b => b.toJSON())];
    
    // Réinitialiser les systèmes
    gameState.inventory.reset();
    gameState.lootSystem.clear();
    gameState.safeZone.reset();
    gameState.gameStartTime = Date.now();
    
    document.getElementById('game-status').textContent = `En jeu - ${gameState.currentMap.name}`;
    updatePlayersAlive();
    
    addChatMessage(`🎮 Battle Royale - ${gameState.currentMap.name}!`);
    addChatMessage('📦 Ramassez du loot avec E');
    addChatMessage('⚠️ La tempête arrive dans 1 minute...');
}

/**
 * Mode Online
 */
function initOnlineMode(username) {
    gameState.socket = io();

    gameState.socket.on('connect', () => {
        gameState.connected = true;
        gameState.myId = gameState.socket.id;
        gameState.socket.emit('join', { username });
        addChatMessage('✅ Connecté au serveur');
    });

    gameState.socket.on('joined', (data) => {
        document.getElementById('game-status').textContent = 'Connecté';
    });

    gameState.socket.on('gameState', (state) => {
        gameState.players = state.players;
        gameState.bullets = state.bullets;
        updateUI(state);
    });

    gameState.socket.on('playerJoined', (data) => {
        addChatMessage(data.message);
    });

    gameState.socket.on('playerLeft', (data) => {
        addChatMessage(data.message);
    });

    gameState.socket.on('playerKilled', (data) => {
        addChatMessage(data.message);
        if (data.killerId === gameState.myId) {
            showNotification('💀 Élimination !');
        }
    });

    gameState.socket.on('chat', (data) => {
        addChatMessage(`${data.username}: ${data.message}`);
    });
}

/**
 * Configuration des contrôles
 */
function setupControls() {
    document.addEventListener('keydown', (e) => {
        gameState.keys[e.key] = true;

        if (e.key === ' ') {
            e.preventDefault();
            shoot();
        }

        // Changement d'arme (1-3)
        if (['1', '2', '3'].includes(e.key)) {
            const weapon = gameState.inventory.switchWeapon(parseInt(e.key) - 1);
            if (weapon) {
                addChatMessage(`🔫 ${LOOT_TYPES[weapon].name}`);
            }
        }

        // Utiliser soin (H)
        if (e.key === 'h' || e.key === 'H') {
            useHeal();
        }

        // Ramasser (E)
        if (e.key === 'e' || e.key === 'E') {
            pickupLoot();
        }

        // Changement de map (M) - Nouvelle map aléatoire
        if (e.key === 'm' || e.key === 'M') {
            gameState.currentMap = gameState.mapGenerator.generate();
            addChatMessage(`🗺️ Nouvelle map: ${gameState.currentMap.name}`);
        }
    });

    document.addEventListener('keyup', (e) => {
        gameState.keys[e.key] = false;
    });

    // Chat
    const chatInput = document.getElementById('chat-input');
    chatInput?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && e.target.value.trim()) {
            if (gameState.mode === 'online' && gameState.socket) {
                gameState.socket.emit('chat', e.target.value.trim());
            } else {
                addChatMessage(`Vous: ${e.target.value.trim()}`);
            }
            e.target.value = '';
        }
    });
}

/**
 * Ramasser du loot
 */
function pickupLoot() {
    if (!gameState.myPlayer || !gameState.myPlayer.isAlive) return;

    const item = gameState.lootSystem.checkPickup(
        gameState.myPlayer.x,
        gameState.myPlayer.y
    );

    if (item) {
        if (item.data.type === 'weapon') {
            const result = gameState.inventory.addWeapon(item.type);
            addChatMessage(`📦 ${result.message}`);
        } else if (item.data.type === 'heal') {
            const result = gameState.inventory.addHeal(item.type);
            addChatMessage(`💊 ${result.message}`);
        }
        updateInventoryUI();
    }
}

/**
 * Utiliser un soin
 */
function useHeal() {
    if (!gameState.myPlayer || !gameState.myPlayer.isAlive) return;

    const result = gameState.inventory.useHeal();
    if (result.success) {
        gameState.myPlayer.hp = Math.min(gameState.myPlayer.maxHp, gameState.myPlayer.hp + result.heal);
        addChatMessage(`💚 ${result.message}`);
        showNotification(result.message);
    } else {
        addChatMessage(`❌ ${result.message}`);
    }
    updateInventoryUI();
}

/**
 * Changer de map
 */
function changeMap() {
    gameState.currentMap = gameState.mapGenerator.generate();
    addChatMessage(`🗺️ Nouvelle map: ${gameState.currentMap.name}`);
}

/**
 * Boucle principale
 */
function gameLoop() {
    update();
    render();
    requestAnimationFrame(gameLoop);
}

/**
 * Mise à jour
 */
function update() {
    if (gameState.mode === 'solo') {
        updateSoloMode();
    } else {
        updateOnlineMode();
    }
}

/**
 * Mise à jour mode solo
 */
function updateSoloMode() {
    if (!gameState.myPlayer) return;

    // Spawn du loot
    const now = Date.now();
    if (now - gameState.lastLootSpawn > 3000) {
        gameState.lootSystem.spawnLoot();
        gameState.lastLootSpawn = now;
    }

    // Mise à jour de la zone
    const zoneEvent = gameState.safeZone.update();
    if (zoneEvent) {
        addChatMessage(zoneEvent.message);
    }

    // Dégâts de zone
    if (gameState.myPlayer.isAlive && now - gameState.lastZoneDamage > 1000) {
        const zoneDamage = gameState.safeZone.getDamage(
            gameState.myPlayer.x + 8,
            gameState.myPlayer.y + 8
        );
        if (zoneDamage > 0) {
            gameState.myPlayer.hp -= zoneDamage;
            if (gameState.myPlayer.hp <= 0) {
                gameState.myPlayer.hp = 0;
                gameState.myPlayer.isAlive = false;
                gameState.myPlayer.deaths++;
                addChatMessage('💀 Vous êtes mort dans la zone');
                setTimeout(() => respawnPlayer(), 5000);
            }
        }
        gameState.lastZoneDamage = now;
    }

    // Déplacement du joueur
    if (gameState.myPlayer.isAlive) {
        let moved = false;
        let newX = gameState.myPlayer.x;
        let newY = gameState.myPlayer.y;

        const speed = 4;
        if (gameState.keys['ArrowUp'] || gameState.keys['z'] || gameState.keys['Z']) {
            newY -= speed;
            gameState.myPlayer.direction = -Math.PI / 2;
            moved = true;
        }
        if (gameState.keys['ArrowDown'] || gameState.keys['s'] || gameState.keys['S']) {
            newY += speed;
            gameState.myPlayer.direction = Math.PI / 2;
            moved = true;
        }
        if (gameState.keys['ArrowLeft'] || gameState.keys['q'] || gameState.keys['Q']) {
            newX -= speed;
            gameState.myPlayer.direction = Math.PI;
            moved = true;
        }
        if (gameState.keys['ArrowRight'] || gameState.keys['d'] || gameState.keys['D']) {
            newX += speed;
            gameState.myPlayer.direction = 0;
            moved = true;
        }

        if (moved) {
            gameState.myPlayer.x = Math.max(0, Math.min(1184, newX));
            gameState.myPlayer.y = Math.max(0, Math.min(784, newY));
        }
    }

    // Mise à jour des bots
    gameState.bots.forEach(bot => {
        const action = bot.update(gameState.players, gameState.currentMap.obstacles);
        if (action && action.shoot) {
            createBullet(action.x, action.y, action.direction, bot.id, 'pistol');
        }
    });

    // Mise à jour des balles
    updateBullets();

    // Mise à jour de la liste des joueurs
    gameState.players = [gameState.myPlayer, ...gameState.bots.map(b => b.toJSON())];
    updatePlayersAlive();
}

/**
 * Mise à jour mode online
 */
function updateOnlineMode() {
    if (!gameState.connected || !gameState.myId) return;

    gameState.myPlayer = gameState.players.find(p => p.id === gameState.myId);
    if (!gameState.myPlayer || !gameState.myPlayer.isAlive) return;

    let moved = false;
    let newX = gameState.myPlayer.x;
    let newY = gameState.myPlayer.y;
    let direction = gameState.myPlayer.direction;

    const speed = 4;
    if (gameState.keys['ArrowUp'] || gameState.keys['z'] || gameState.keys['Z']) {
        newY -= speed;
        direction = -Math.PI / 2;
        moved = true;
    }
    if (gameState.keys['ArrowDown'] || gameState.keys['s'] || gameState.keys['S']) {
        newY += speed;
        direction = Math.PI / 2;
        moved = true;
    }
    if (gameState.keys['ArrowLeft'] || gameState.keys['q'] || gameState.keys['Q']) {
        newX -= speed;
        direction = Math.PI;
        moved = true;
    }
    if (gameState.keys['ArrowRight'] || gameState.keys['d'] || gameState.keys['D']) {
        newX += speed;
        direction = 0;
        moved = true;
    }

    newX = Math.max(0, Math.min(1184, newX));
    newY = Math.max(0, Math.min(784, newY));

    if (moved) {
        gameState.socket.emit('move', { x: newX, y: newY, direction });
    }
}

/**
 * Tir
 */
function shoot() {
    const currentWeapon = gameState.inventory.getCurrentWeapon();
    if (!currentWeapon) {
        addChatMessage('❌ Pas d\'arme équipée');
        return;
    }

    const now = Date.now();
    const weapon = WEAPONS[currentWeapon];
    
    if (now - gameState.lastShot < weapon.fireRate) return;
    if (!gameState.myPlayer || !gameState.myPlayer.isAlive) return;

    gameState.lastShot = now;

    if (gameState.mode === 'solo') {
        if (weapon.bullets) {
            for (let i = 0; i < weapon.bullets; i++) {
                const spread = (Math.random() - 0.5) * weapon.spread;
                createBullet(
                    gameState.myPlayer.x + 8,
                    gameState.myPlayer.y + 8,
                    gameState.myPlayer.direction + spread,
                    gameState.myId,
                    currentWeapon
                );
            }
        } else {
            createBullet(
                gameState.myPlayer.x + 8,
                gameState.myPlayer.y + 8,
                gameState.myPlayer.direction,
                gameState.myId,
                currentWeapon
            );
        }
    } else {
        gameState.socket.emit('shoot', {
            x: gameState.myPlayer.x + 8,
            y: gameState.myPlayer.y + 8,
            direction: gameState.myPlayer.direction,
            weapon: currentWeapon
        });
    }
}

/**
 * Créer une balle
 */
function createBullet(x, y, direction, ownerId, weapon) {
    const weaponData = WEAPONS[weapon];
    gameState.bullets.push({
        id: Date.now() + Math.random(),
        x,
        y,
        vx: Math.cos(direction) * weaponData.bulletSpeed,
        vy: Math.sin(direction) * weaponData.bulletSpeed,
        ownerId,
        damage: weaponData.damage,
        size: weaponData.bulletSize,
        color: weaponData.color
    });
}

/**
 * Mise à jour des balles
 */
function updateBullets() {
    gameState.bullets = gameState.bullets.filter(bullet => {
        bullet.x += bullet.vx;
        bullet.y += bullet.vy;

        if (bullet.x < 0 || bullet.x > 1200 || bullet.y < 0 || bullet.y > 800) {
            return false;
        }

        for (const player of gameState.players) {
            if (player.id === bullet.ownerId || !player.isAlive) continue;

            const dx = bullet.x - (player.x + 8);
            const dy = bullet.y - (player.y + 8);
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 16) {
                if (player.id === 'player') {
                    gameState.myPlayer.hp -= bullet.damage;
                    if (gameState.myPlayer.hp <= 0) {
                        gameState.myPlayer.hp = 0;
                        gameState.myPlayer.isAlive = false;
                        gameState.myPlayer.deaths++;
                        addChatMessage('💀 Vous êtes mort');
                        setTimeout(() => respawnPlayer(), 5000);
                    }
                } else {
                    const bot = gameState.bots.find(b => b.id === player.id);
                    if (bot && bot.takeDamage(bullet.damage)) {
                        gameState.myPlayer.kills++;
                        addChatMessage(`💀 Élimination: ${bot.username}`);
                        showNotification('💀 +1 Kill');
                        setTimeout(() => bot.respawn(), 5000);
                    }
                }
                return false;
            }
        }

        return true;
    });
}

/**
 * Respawn du joueur
 */
function respawnPlayer() {
    gameState.myPlayer.x = Math.random() * 1100 + 50;
    gameState.myPlayer.y = Math.random() * 700 + 50;
    gameState.myPlayer.hp = 100;
    gameState.myPlayer.isAlive = true;
    gameState.inventory.reset();
    addChatMessage('🔄 Respawn');
    updateInventoryUI();
}

/**
 * Rendu
 */
function render() {
    if (!gameState.currentMap) return;
    
    // Fond
    ctx.fillStyle = gameState.currentMap.background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Grille subtile
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 50) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 50) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }

    // Zone de sécurité
    gameState.safeZone.render(ctx);

    // Obstacles avec effets
    gameState.currentMap.obstacles.forEach(obs => {
        MapGenerator.renderObstacle(ctx, obs);
    });

    // Loot
    gameState.lootSystem.render(ctx);

    // Joueurs
    gameState.players.forEach(player => {
        if (!player.isAlive) return;

        const isMe = player.id === gameState.myId || player.id === 'player';
        const centerX = player.x + 8;
        const centerY = player.y + 8;
        
        // Ombre
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.beginPath();
        ctx.arc(centerX, centerY + 3, 10, 0, Math.PI * 2);
        ctx.fill();
        
        // Aura pour le joueur
        if (isMe) {
            const time = Date.now() / 1000;
            const pulse = Math.sin(time * 3) * 0.3 + 0.7;
            ctx.globalAlpha = pulse * 0.3;
            ctx.fillStyle = '#00ff88';
            ctx.beginPath();
            ctx.arc(centerX, centerY, 15, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1;
        }
        
        // Corps (hexagone)
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(Date.now() / 2000);
        ctx.fillStyle = isMe ? '#00ff88' : '#ff0044';
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i;
            const x = Math.cos(angle) * 10;
            const y = Math.sin(angle) * 10;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
        
        // Bordure brillante
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();
        
        // Direction (flèche)
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(player.direction);
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.moveTo(12, 0);
        ctx.lineTo(8, -3);
        ctx.lineTo(8, 3);
        ctx.closePath();
        ctx.fill();
        ctx.restore();

        // Nom avec fond
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(centerX - 30, player.y - 18, 60, 14);
        ctx.fillStyle = isMe ? '#00ff88' : '#fff';
        ctx.font = 'bold 10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(player.username, centerX, player.y - 8);

        // Barre de vie stylée
        const hpWidth = 30 * (player.hp / player.maxHp);
        const hpX = centerX - 15;
        const hpY = player.y - 25;
        
        // Fond
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(hpX - 1, hpY - 1, 32, 6);
        
        // Barre rouge
        ctx.fillStyle = '#ff0044';
        ctx.fillRect(hpX, hpY, 30, 4);
        
        // Barre verte
        const hpColor = player.hp > 50 ? '#00ff88' : player.hp > 25 ? '#f39c12' : '#ff0044';
        ctx.fillStyle = hpColor;
        ctx.fillRect(hpX, hpY, hpWidth, 4);
        
        // Bordure
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        ctx.strokeRect(hpX, hpY, 30, 4);
    });

    // Balles
    gameState.bullets.forEach(bullet => {
        // Traînée
        ctx.globalAlpha = 0.3;
        ctx.fillStyle = bullet.color || '#ffaa00';
        for (let i = 1; i <= 3; i++) {
            ctx.beginPath();
            ctx.arc(
                bullet.x - bullet.vx * i * 0.5,
                bullet.y - bullet.vy * i * 0.5,
                (bullet.size || 4) * (1 - i * 0.2),
                0,
                Math.PI * 2
            );
            ctx.fill();
        }
        ctx.globalAlpha = 1;
        
        // Balle principale
        ctx.fillStyle = bullet.color || '#ffaa00';
        ctx.beginPath();
        ctx.arc(bullet.x, bullet.y, bullet.size || 4, 0, Math.PI * 2);
        ctx.fill();
        
        // Brillance
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(bullet.x - 1, bullet.y - 1, (bullet.size || 4) * 0.4, 0, Math.PI * 2);
        ctx.fill();
        
        // Bordure
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(bullet.x, bullet.y, bullet.size || 4, 0, Math.PI * 2);
        ctx.stroke();
    });

    // UI
    updateUI();
}

/**
 * Mise à jour UI
 */
function updateUI() {
    if (gameState.myPlayer) {
        document.getElementById('player-hp').textContent = Math.max(0, Math.floor(gameState.myPlayer.hp));
        document.getElementById('player-kills').textContent = gameState.myPlayer.kills;
    }
    
    // Timer de la tempête
    const nextPhaseTime = gameState.safeZone.getTimeUntilNextPhase();
    if (nextPhaseTime > 0) {
        const mins = Math.floor(nextPhaseTime / 60);
        const secs = nextPhaseTime % 60;
        document.getElementById('zone-timer').textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
    } else if (gameState.safeZone.isShrinking) {
        document.getElementById('zone-timer').textContent = 'Rétrécit!';
    } else {
        document.getElementById('zone-timer').textContent = 'Finale';
    }
    
    // Temps de jeu
    const elapsed = gameState.safeZone.getElapsedTime();
    const mins = Math.floor(elapsed / 60);
    const secs = elapsed % 60;
    document.getElementById('game-time').textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Mise à jour du compteur de joueurs vivants
 */
function updatePlayersAlive() {
    const alive = gameState.players.filter(p => p.isAlive).length;
    document.getElementById('players-alive').textContent = `${alive}/20`;
}

/**
 * Mise à jour de l'UI de l'inventaire
 */
function updateInventoryUI() {
    const weaponsDiv = document.getElementById('inventory-weapons');
    const healsDiv = document.getElementById('inventory-heals');
    
    const invState = gameState.inventory.getState();
    
    // Armes
    weaponsDiv.innerHTML = '';
    invState.weapons.forEach((weapon, index) => {
        const div = document.createElement('div');
        div.className = 'weapon-item' + (index === invState.currentWeaponIndex ? ' active' : '');
        div.innerHTML = `
            <span class="weapon-name">${index + 1}. ${LOOT_TYPES[weapon].name}</span>
            <span class="weapon-damage">${WEAPONS[weapon].damage} DMG</span>
        `;
        weaponsDiv.appendChild(div);
    });
    
    if (invState.weapons.length === 0) {
        weaponsDiv.innerHTML = '<div style="color: #666; font-size: 12px;">Aucune arme</div>';
    }
    
    // Soins
    healsDiv.textContent = invState.heals.length > 0 
        ? `${invState.heals.length} soin(s) disponible(s)`
        : 'Aucun soin';
}

/**
 * Chat
 */
function addChatMessage(message) {
    const chatMessages = document.getElementById('chat-messages');
    if (!chatMessages) return;

    const msgDiv = document.createElement('div');
    msgDiv.textContent = message;
    msgDiv.style.marginBottom = '5px';
    msgDiv.style.fontSize = '11px';
    chatMessages.appendChild(msgDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    while (chatMessages.children.length > 50) {
        chatMessages.removeChild(chatMessages.firstChild);
    }
}

/**
 * Notification
 */
function showNotification(message) {
    const notif = document.createElement('div');
    notif.textContent = message;
    notif.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0, 0, 0, 0.95);
        color: #00ff88;
        padding: 20px 40px;
        border-radius: 12px;
        font-size: 24px;
        font-weight: bold;
        z-index: 1000;
        border: 3px solid #00ff88;
        box-shadow: 0 0 30px rgba(0, 255, 136, 0.5);
    `;
    document.body.appendChild(notif);

    setTimeout(() => {
        notif.remove();
    }, 2000);
}

// Démarrer
window.addEventListener('load', initGame);

// Déconnexion propre
window.addEventListener('beforeunload', () => {
    if (gameState.socket) {
        gameState.socket.disconnect();
    }
});
