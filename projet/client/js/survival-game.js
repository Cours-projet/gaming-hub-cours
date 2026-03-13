/**
 * PlayHub - Open World Survival Game
 * @author Tomy - Lead Developer
 * Lycée Albert Einstein
 */

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Configuration du monde
const WORLD = {
    width: 3000,
    height: 3000,
    tileSize: 40
};

// État du jeu
const game = {
    player: {
        x: WORLD.width / 2,
        y: WORLD.height / 2,
        size: 30,
        speed: 4,
        hp: 100,
        maxHp: 100,
        hunger: 100,
        thirst: 100,
        inventory: {
            wood: 0,
            stone: 0,
            iron_ore: 0,
            iron: 0
        },
        equippedTool: 'hand',
        attackCooldown: 0,
        lastAttack: 0
    },
    camera: {
        x: 0,
        y: 0
    },
    keys: {},
    mouseDown: false,
    resources: [],
    structures: [],
    enemies: [],
    craftingSystem: new CraftingSystem(),
    craftingMenuOpen: false,
    time: 0,
    dayNightCycle: 0, // 0 = début jour, 0.666 = début nuit, 1 = fin nuit
    dayDuration: 600, // 10 minutes en secondes (600s)
    nightDuration: 300, // 5 minutes en secondes (300s)
    isNight: false,
    notifications: []
};

// Initialisation du monde
function initWorld() {
    // Générer des arbres
    for (let i = 0; i < 100; i++) {
        game.resources.push({
            type: 'tree',
            x: Math.random() * WORLD.width,
            y: Math.random() * WORLD.height,
            hp: 30,
            maxHp: 30,
            size: 40,
            color: '#2d5016'
        });
    }
    
    // Générer des rochers
    for (let i = 0; i < 80; i++) {
        game.resources.push({
            type: 'rock',
            x: Math.random() * WORLD.width,
            y: Math.random() * WORLD.height,
            hp: 40,
            maxHp: 40,
            size: 35,
            color: '#666'
        });
    }
    
    // Générer du minerai de fer
    for (let i = 0; i < 30; i++) {
        game.resources.push({
            type: 'iron_ore',
            x: Math.random() * WORLD.width,
            y: Math.random() * WORLD.height,
            hp: 50,
            maxHp: 50,
            size: 30,
            color: '#8b4513'
        });
    }
    
    // Générer des buissons (nourriture)
    for (let i = 0; i < 50; i++) {
        game.resources.push({
            type: 'bush',
            x: Math.random() * WORLD.width,
            y: Math.random() * WORLD.height,
            hp: 10,
            maxHp: 10,
            size: 25,
            color: '#228b22'
        });
    }
}

// Gestion des contrôles
document.addEventListener('keydown', (e) => {
    game.keys[e.key.toLowerCase()] = true;
    
    // Menu de craft
    if (e.key.toLowerCase() === 'c') {
        game.craftingMenuOpen = !game.craftingMenuOpen;
    }
    
    // Équiper outils (touches 1-5)
    if (e.key >= '1' && e.key <= '5') {
        const tools = ['hand', 'wooden_pickaxe', 'stone_pickaxe', 'iron_pickaxe', 'wooden_axe'];
        const toolIndex = parseInt(e.key) - 1;
        const tool = tools[toolIndex];
        if (tool === 'hand' || game.player.inventory[tool] > 0) {
            game.player.equippedTool = tool;
        }
    }
    
    // Fermer menu
    if (e.key === 'Escape') {
        game.craftingMenuOpen = false;
    }
});

document.addEventListener('keyup', (e) => {
    game.keys[e.key.toLowerCase()] = false;
});

// Gestion souris pour attaquer
document.addEventListener('mousedown', (e) => {
    if (e.button === 0) { // Clic gauche
        game.mouseDown = true;
    }
});

document.addEventListener('mouseup', (e) => {
    if (e.button === 0) {
        game.mouseDown = false;
    }
});

// Position souris
let mouseX = 0;
let mouseY = 0;
canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
});

// Clic pour craft
canvas.addEventListener('click', (e) => {
    if (game.craftingMenuOpen) {
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        const hasCraftingTable = game.player.inventory.crafting_table > 0;
        const result = game.craftingSystem.handleClick(mouseX, mouseY, game.player.inventory, hasCraftingTable);
        
        if (result) {
            if (result.success) {
                addChatMessage(result.message, '#0f0');
            } else {
                addChatMessage(result.message, '#f00');
            }
        }
    }
});

// Mise à jour du jeu
function update() {
    // Déplacement
    const speed = game.player.speed;
    let dx = 0, dy = 0;
    
    if (game.keys['z'] || game.keys['arrowup']) dy -= speed;
    if (game.keys['s'] || game.keys['arrowdown']) dy += speed;
    if (game.keys['q'] || game.keys['arrowleft']) dx -= speed;
    if (game.keys['d'] || game.keys['arrowright']) dx += speed;
    
    // Normaliser diagonale
    if (dx !== 0 && dy !== 0) {
        dx *= 0.707;
        dy *= 0.707;
    }
    
    // Appliquer déplacement avec limites
    game.player.x = Math.max(game.player.size, Math.min(WORLD.width - game.player.size, game.player.x + dx));
    game.player.y = Math.max(game.player.size, Math.min(WORLD.height - game.player.size, game.player.y + dy));
    
    // Récolte (touche E)
    if (game.keys['e']) {
        harvestNearbyResources();
    }
    
    // Placer structure (touche F)
    if (game.keys['f']) {
        placeStructure();
        game.keys['f'] = false;
    }
    
    // Attaque (clic souris)
    if (game.mouseDown && Date.now() - game.player.lastAttack > 500) {
        attackNearby();
        game.player.lastAttack = Date.now();
    }
    
    // Caméra suit le joueur
    game.camera.x = game.player.x - canvas.width / 2;
    game.camera.y = game.player.y - canvas.height / 2;
    
    // Limiter caméra
    game.camera.x = Math.max(0, Math.min(WORLD.width - canvas.width, game.camera.x));
    game.camera.y = Math.max(0, Math.min(WORLD.height - canvas.height, game.camera.y));
    
    // Cycle jour/nuit (10 min jour + 5 min nuit = 15 min total)
    const totalCycleDuration = game.dayDuration + game.nightDuration; // 900 secondes
    const cycleProgress = (game.time / 60) % totalCycleDuration; // Convertir frames en secondes
    
    if (cycleProgress < game.dayDuration) {
        // Jour (0 à 600s)
        game.dayNightCycle = cycleProgress / game.dayDuration * 0.666; // 0 à 0.666
        if (game.isNight) {
            game.isNight = false;
            addChatMessage('☀️ Le jour se lève!', '#ffa500');
            // Supprimer les monstres
            game.enemies = [];
        }
    } else {
        // Nuit (600s à 900s)
        const nightProgress = cycleProgress - game.dayDuration;
        game.dayNightCycle = 0.666 + (nightProgress / game.nightDuration * 0.334); // 0.666 à 1
        if (!game.isNight) {
            game.isNight = true;
            addChatMessage('🌙 La nuit tombe... Attention aux monstres!', '#8b5cf6');
            spawnNightMonsters();
        }
    }
    
    // Mise à jour des ennemis
    updateEnemies();
    
    // Faim et soif (plus lent)
    game.time++;
    if (game.time % 600 === 0) {
        game.player.hunger = Math.max(0, game.player.hunger - 1);
        game.player.thirst = Math.max(0, game.player.thirst - 1);
        
        if (game.player.hunger === 0 || game.player.thirst === 0) {
            game.player.hp = Math.max(0, game.player.hp - 5);
        }
    }
    
    // Régénération si bien nourri
    if (game.player.hunger > 50 && game.player.thirst > 50 && game.player.hp < game.player.maxHp) {
        if (game.time % 60 === 0) {
            game.player.hp = Math.min(game.player.maxHp, game.player.hp + 1);
        }
    }
    
    // Mort
    if (game.player.hp <= 0) {
        addChatMessage('💀 Vous êtes mort!', '#f00');
        setTimeout(() => {
            game.player.hp = game.player.maxHp;
            game.player.x = WORLD.width / 2;
            game.player.y = WORLD.height / 2;
            addChatMessage('🔄 Respawn!', '#0f0');
        }, 3000);
    }
    
    updateUI();
}

// Spawn des monstres la nuit
function spawnNightMonsters() {
    const monsterCount = 10 + Math.floor(Math.random() * 10);
    
    for (let i = 0; i < monsterCount; i++) {
        // Spawn loin du joueur
        let x, y;
        do {
            x = Math.random() * WORLD.width;
            y = Math.random() * WORLD.height;
        } while (Math.hypot(x - game.player.x, y - game.player.y) < 300);
        
        game.enemies.push({
            x,
            y,
            size: 25,
            hp: 30,
            maxHp: 30,
            speed: 2,
            damage: 10,
            type: 'zombie',
            lastAttack: 0
        });
    }
}

// Mise à jour des ennemis
function updateEnemies() {
    game.enemies.forEach((enemy, index) => {
        // IA simple : suivre le joueur
        const dx = game.player.x - enemy.x;
        const dy = game.player.y - enemy.y;
        const dist = Math.hypot(dx, dy);
        
        if (dist > 10) {
            enemy.x += (dx / dist) * enemy.speed;
            enemy.y += (dy / dist) * enemy.speed;
        }
        
        // Attaquer le joueur si proche
        if (dist < 40 && Date.now() - enemy.lastAttack > 1000) {
            game.player.hp -= enemy.damage;
            enemy.lastAttack = Date.now();
            addChatMessage(`💥 Monstre vous attaque! -${enemy.damage} HP`, '#f00');
        }
        
        // Supprimer si mort
        if (enemy.hp <= 0) {
            game.enemies.splice(index, 1);
            addChatMessage('💀 Monstre éliminé!', '#0f0');
        }
    });
}

// Attaquer les ennemis proches
function attackNearby() {
    const attackRange = 60;
    const tool = TOOLS[game.player.equippedTool] || TOOLS.hand;
    
    game.enemies.forEach(enemy => {
        const dist = Math.hypot(enemy.x - game.player.x, enemy.y - game.player.y);
        if (dist < attackRange) {
            enemy.hp -= tool.damage;
            addChatMessage(`⚔️ Attaque! -${tool.damage} HP`, '#ffa500');
        }
    });
}

// Récolte de ressources
function harvestNearbyResources() {
    const harvestRange = 60;
    const tool = TOOLS[game.player.equippedTool] || TOOLS.hand;
    
    for (let i = game.resources.length - 1; i >= 0; i--) {
        const resource = game.resources[i];
        const dist = Math.hypot(resource.x - game.player.x, resource.y - game.player.y);
        
        if (dist < harvestRange) {
            // Vérifier si l'outil est adapté
            const canHarvest = 
                (resource.type === 'tree' && (game.player.equippedTool.includes('axe') || game.player.equippedTool === 'hand')) ||
                (resource.type === 'rock' && (game.player.equippedTool.includes('pickaxe') || game.player.equippedTool === 'hand')) ||
                (resource.type === 'iron_ore' && game.player.equippedTool.includes('pickaxe')) ||
                (resource.type === 'bush');
            
            if (canHarvest) {
                resource.hp -= tool.miningSpeed;
                
                if (resource.hp <= 0) {
                    // Donner ressources
                    if (resource.type === 'tree') {
                        game.player.inventory.wood += 3 + Math.floor(Math.random() * 3);
                        addChatMessage('+3-5 Bois', '#0f0');
                    } else if (resource.type === 'rock') {
                        game.player.inventory.stone += 2 + Math.floor(Math.random() * 3);
                        addChatMessage('+2-4 Pierre', '#0f0');
                    } else if (resource.type === 'iron_ore') {
                        game.player.inventory.iron_ore += 1 + Math.floor(Math.random() * 2);
                        addChatMessage('+1-2 Minerai de fer', '#0f0');
                    } else if (resource.type === 'bush') {
                        game.player.hunger = Math.min(100, game.player.hunger + 10);
                        game.player.thirst = Math.min(100, game.player.thirst + 5);
                        addChatMessage('+10 Faim, +5 Soif', '#0f0');
                    }
                    
                    game.resources.splice(i, 1);
                }
            }
            break;
        }
    }
}

// Placer une structure
function placeStructure() {
    // Vérifier si on a une structure à placer
    const structures = ['crafting_table', 'furnace', 'chest'];
    let structureToPlace = null;
    
    for (const struct of structures) {
        if (game.player.inventory[struct] > 0) {
            structureToPlace = struct;
            break;
        }
    }
    
    if (!structureToPlace) {
        addChatMessage('Aucune structure à placer', '#f00');
        return;
    }
    
    // Placer devant le joueur
    game.structures.push({
        type: structureToPlace,
        x: game.player.x,
        y: game.player.y - 50,
        size: 40
    });
    
    game.player.inventory[structureToPlace]--;
    addChatMessage(`${structureToPlace} placé!`, '#0f0');
}

// Rendu
function render() {
    // Fond (herbe) avec effet nuit
    const dayLight = 0.5 + Math.sin(game.dayNightCycle * Math.PI * 2) * 0.3;
    const nightDarkness = game.isNight ? 0.4 : 1;
    ctx.fillStyle = `rgb(${34 * dayLight * nightDarkness}, ${139 * dayLight * nightDarkness}, ${34 * dayLight * nightDarkness})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Overlay sombre la nuit
    if (game.isNight) {
        ctx.fillStyle = 'rgba(0, 0, 20, 0.5)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    
    // Grille (optionnel)
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.lineWidth = 1;
    for (let x = -game.camera.x % 40; x < canvas.width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
    for (let y = -game.camera.y % 40; y < canvas.height; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
    
    // Ressources
    game.resources.forEach(resource => {
        const screenX = resource.x - game.camera.x;
        const screenY = resource.y - game.camera.y;
        
        if (screenX > -50 && screenX < canvas.width + 50 && screenY > -50 && screenY < canvas.height + 50) {
            ctx.save();
            
            if (resource.type === 'tree') {
                // Ombre
                ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
                ctx.beginPath();
                ctx.ellipse(screenX, screenY + 15, 15, 5, 0, 0, Math.PI * 2);
                ctx.fill();
                
                // Tronc
                ctx.fillStyle = '#4a3020';
                ctx.fillRect(screenX - 8, screenY - 10, 16, 30);
                
                // Feuillage
                ctx.fillStyle = resource.color;
                ctx.beginPath();
                ctx.arc(screenX, screenY - 10, resource.size / 2, 0, Math.PI * 2);
                ctx.fill();
                
                // Détails feuillage
                ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
                ctx.beginPath();
                ctx.arc(screenX - 8, screenY - 15, resource.size / 3, 0, Math.PI * 2);
                ctx.fill();
                
            } else if (resource.type === 'rock') {
                // Ombre
                ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
                ctx.fillRect(screenX - resource.size / 2 + 3, screenY - resource.size / 2 + 3, resource.size, resource.size * 0.8);
                
                // Rocher
                ctx.fillStyle = resource.color;
                ctx.fillRect(screenX - resource.size / 2, screenY - resource.size / 2, resource.size, resource.size * 0.8);
                
                // Détails
                ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
                ctx.fillRect(screenX - resource.size / 4, screenY - resource.size / 4, resource.size / 3, resource.size / 4);
                
                // Bordure
                ctx.strokeStyle = '#555';
                ctx.lineWidth = 2;
                ctx.strokeRect(screenX - resource.size / 2, screenY - resource.size / 2, resource.size, resource.size * 0.8);
                
            } else if (resource.type === 'iron_ore') {
                // Ombre
                ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
                ctx.beginPath();
                ctx.arc(screenX + 2, screenY + 2, resource.size / 2, 0, Math.PI * 2);
                ctx.fill();
                
                // Minerai base
                ctx.fillStyle = resource.color;
                ctx.beginPath();
                ctx.arc(screenX, screenY, resource.size / 2, 0, Math.PI * 2);
                ctx.fill();
                
                // Points brillants de fer
                ctx.fillStyle = '#ffa500';
                ctx.beginPath();
                ctx.arc(screenX - 5, screenY - 5, 3, 0, Math.PI * 2);
                ctx.fill();
                ctx.beginPath();
                ctx.arc(screenX + 5, screenY + 3, 4, 0, Math.PI * 2);
                ctx.fill();
                ctx.beginPath();
                ctx.arc(screenX + 2, screenY - 7, 2, 0, Math.PI * 2);
                ctx.fill();
                
                // Bordure
                ctx.strokeStyle = '#654321';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(screenX, screenY, resource.size / 2, 0, Math.PI * 2);
                ctx.stroke();
                
            } else if (resource.type === 'bush') {
                // Ombre
                ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
                ctx.beginPath();
                ctx.ellipse(screenX, screenY + 8, 12, 4, 0, 0, Math.PI * 2);
                ctx.fill();
                
                // Buisson
                ctx.fillStyle = resource.color;
                ctx.beginPath();
                ctx.arc(screenX, screenY, resource.size / 2, 0, Math.PI * 2);
                ctx.fill();
                ctx.beginPath();
                ctx.arc(screenX - 8, screenY - 3, resource.size / 3, 0, Math.PI * 2);
                ctx.fill();
                ctx.beginPath();
                ctx.arc(screenX + 8, screenY - 3, resource.size / 3, 0, Math.PI * 2);
                ctx.fill();
                
                // Baies rouges
                ctx.fillStyle = '#ff0000';
                for (let i = 0; i < 5; i++) {
                    const angle = (i / 5) * Math.PI * 2;
                    const bx = screenX + Math.cos(angle) * 8;
                    const by = screenY + Math.sin(angle) * 8;
                    ctx.beginPath();
                    ctx.arc(bx, by, 2, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
            
            // Barre de vie
            if (resource.hp < resource.maxHp) {
                const barWidth = 30;
                const barHeight = 4;
                ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
                ctx.fillRect(screenX - barWidth / 2, screenY - resource.size / 2 - 12, barWidth, barHeight);
                ctx.fillStyle = '#f00';
                ctx.fillRect(screenX - barWidth / 2, screenY - resource.size / 2 - 12, barWidth, barHeight);
                ctx.fillStyle = '#0f0';
                ctx.fillRect(screenX - barWidth / 2, screenY - resource.size / 2 - 12, barWidth * (resource.hp / resource.maxHp), barHeight);
            }
            
            ctx.restore();
        }
    });
    
    // Structures
    game.structures.forEach(structure => {
        const screenX = structure.x - game.camera.x;
        const screenY = structure.y - game.camera.y;
        
        if (screenX > -50 && screenX < canvas.width + 50 && screenY > -50 && screenY < canvas.height + 50) {
            ctx.save();
            
            if (structure.type === 'crafting_table') {
                // Ombre
                ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
                ctx.fillRect(screenX - structure.size / 2 + 3, screenY - structure.size / 2 + 3, structure.size, structure.size);
                
                // Table
                ctx.fillStyle = '#8b4513';
                ctx.fillRect(screenX - structure.size / 2, screenY - structure.size / 2, structure.size, structure.size);
                
                // Grille de craft
                ctx.strokeStyle = '#654321';
                ctx.lineWidth = 2;
                ctx.strokeRect(screenX - structure.size / 2, screenY - structure.size / 2, structure.size, structure.size);
                ctx.beginPath();
                ctx.moveTo(screenX - structure.size / 6, screenY - structure.size / 2);
                ctx.lineTo(screenX - structure.size / 6, screenY + structure.size / 2);
                ctx.moveTo(screenX + structure.size / 6, screenY - structure.size / 2);
                ctx.lineTo(screenX + structure.size / 6, screenY + structure.size / 2);
                ctx.moveTo(screenX - structure.size / 2, screenY - structure.size / 6);
                ctx.lineTo(screenX + structure.size / 2, screenY - structure.size / 6);
                ctx.moveTo(screenX - structure.size / 2, screenY + structure.size / 6);
                ctx.lineTo(screenX + structure.size / 2, screenY + structure.size / 6);
                ctx.stroke();
                
                // Label
                ctx.fillStyle = '#fff';
                ctx.font = '10px Inter';
                ctx.textAlign = 'center';
                ctx.fillText('CRAFT', screenX, screenY + structure.size / 2 + 15);
                
            } else if (structure.type === 'furnace') {
                // Ombre
                ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
                ctx.fillRect(screenX - structure.size / 2 + 3, screenY - structure.size / 2 + 3, structure.size, structure.size);
                
                // Four
                ctx.fillStyle = '#555';
                ctx.fillRect(screenX - structure.size / 2, screenY - structure.size / 2, structure.size, structure.size);
                
                // Ouverture avec feu
                ctx.fillStyle = '#ff4500';
                ctx.fillRect(screenX - 12, screenY - 8, 24, 16);
                
                // Flammes animées
                ctx.fillStyle = '#ffa500';
                ctx.beginPath();
                ctx.moveTo(screenX - 8, screenY + 5);
                ctx.lineTo(screenX - 5, screenY - 5);
                ctx.lineTo(screenX - 2, screenY + 5);
                ctx.fill();
                ctx.beginPath();
                ctx.moveTo(screenX + 2, screenY + 5);
                ctx.lineTo(screenX + 5, screenY - 5);
                ctx.lineTo(screenX + 8, screenY + 5);
                ctx.fill();
                
                // Bordure
                ctx.strokeStyle = '#333';
                ctx.lineWidth = 2;
                ctx.strokeRect(screenX - structure.size / 2, screenY - structure.size / 2, structure.size, structure.size);
                
                // Label
                ctx.fillStyle = '#fff';
                ctx.font = '10px Inter';
                ctx.textAlign = 'center';
                ctx.fillText('FOUR', screenX, screenY + structure.size / 2 + 15);
                
            } else if (structure.type === 'chest') {
                // Ombre
                ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
                ctx.fillRect(screenX - structure.size / 2 + 3, screenY - structure.size / 2 + 3, structure.size, structure.size * 0.7);
                
                // Coffre
                ctx.fillStyle = '#8b4513';
                ctx.fillRect(screenX - structure.size / 2, screenY - structure.size / 2, structure.size, structure.size * 0.7);
                
                // Couvercle
                ctx.fillStyle = '#654321';
                ctx.fillRect(screenX - structure.size / 2, screenY - structure.size / 2, structure.size, structure.size * 0.3);
                
                // Serrure
                ctx.fillStyle = '#ffd700';
                ctx.fillRect(screenX - 4, screenY, 8, 6);
                ctx.fillRect(screenX - 2, screenY + 6, 4, 4);
                
                // Bordure
                ctx.strokeStyle = '#000';
                ctx.lineWidth = 2;
                ctx.strokeRect(screenX - structure.size / 2, screenY - structure.size / 2, structure.size, structure.size * 0.7);
                
                // Label
                ctx.fillStyle = '#fff';
                ctx.font = '10px Inter';
                ctx.textAlign = 'center';
                ctx.fillText('COFFRE', screenX, screenY + structure.size / 2 + 10);
            }
            
            ctx.restore();
        }
    });
    
    // Joueur
    const playerScreenX = game.player.x - game.camera.x;
    const playerScreenY = game.player.y - game.camera.y;
    
    // Ombre du joueur
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.ellipse(playerScreenX, playerScreenY + game.player.size / 2 + 3, game.player.size / 2, game.player.size / 6, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Corps du joueur (violet)
    ctx.fillStyle = '#8b5cf6';
    ctx.beginPath();
    ctx.arc(playerScreenX, playerScreenY, game.player.size / 2, 0, Math.PI * 2);
    ctx.fill();
    
    // Bordure
    ctx.strokeStyle = '#6d28d9';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(playerScreenX, playerScreenY, game.player.size / 2, 0, Math.PI * 2);
    ctx.stroke();
    
    // Yeux
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(playerScreenX - 6, playerScreenY - 3, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(playerScreenX + 6, playerScreenY - 3, 4, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(playerScreenX - 6, playerScreenY - 3, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(playerScreenX + 6, playerScreenY - 3, 2, 0, Math.PI * 2);
    ctx.fill();
    
    // Outil équipé
    if (game.player.equippedTool !== 'hand') {
        const toolIcons = {
            'wooden_pickaxe': '⛏️',
            'stone_pickaxe': '⛏️',
            'iron_pickaxe': '⛏️',
            'wooden_axe': '🪓',
            'stone_axe': '🪓'
        };
        const toolColors = {
            'wooden_pickaxe': '#8b4513',
            'stone_pickaxe': '#666',
            'iron_pickaxe': '#c0c0c0',
            'wooden_axe': '#8b4513',
            'stone_axe': '#666'
        };
        
        // Fond de l'icône
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.beginPath();
        ctx.arc(playerScreenX + 18, playerScreenY - 18, 10, 0, Math.PI * 2);
        ctx.fill();
        
        // Icône de l'outil
        ctx.fillStyle = toolColors[game.player.equippedTool] || '#fff';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(toolIcons[game.player.equippedTool], playerScreenX + 18, playerScreenY - 13);
    }
    
    // Barre de vie au-dessus
    const hpBarWidth = 40;
    const hpBarHeight = 5;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(playerScreenX - hpBarWidth / 2, playerScreenY - game.player.size / 2 - 15, hpBarWidth, hpBarHeight);
    ctx.fillStyle = '#f00';
    ctx.fillRect(playerScreenX - hpBarWidth / 2, playerScreenY - game.player.size / 2 - 15, hpBarWidth, hpBarHeight);
    ctx.fillStyle = '#0f0';
    ctx.fillRect(playerScreenX - hpBarWidth / 2, playerScreenY - game.player.size / 2 - 15, hpBarWidth * (game.player.hp / game.player.maxHp), hpBarHeight);
    
    // Ennemis (monstres)
    game.enemies.forEach(enemy => {
        const screenX = enemy.x - game.camera.x;
        const screenY = enemy.y - game.camera.y;
        
        if (screenX > -50 && screenX < canvas.width + 50 && screenY > -50 && screenY < canvas.height + 50) {
            ctx.save();
            
            // Ombre
            ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            ctx.beginPath();
            ctx.ellipse(screenX, screenY + enemy.size / 2 + 3, enemy.size / 2, enemy.size / 6, 0, 0, Math.PI * 2);
            ctx.fill();
            
            // Corps zombie (vert foncé)
            ctx.fillStyle = '#2d5016';
            ctx.beginPath();
            ctx.arc(screenX, screenY, enemy.size / 2, 0, Math.PI * 2);
            ctx.fill();
            
            // Bordure
            ctx.strokeStyle = '#1a3010';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(screenX, screenY, enemy.size / 2, 0, Math.PI * 2);
            ctx.stroke();
            
            // Yeux rouges
            ctx.fillStyle = '#f00';
            ctx.beginPath();
            ctx.arc(screenX - 5, screenY - 3, 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(screenX + 5, screenY - 3, 3, 0, Math.PI * 2);
            ctx.fill();
            
            // Barre de vie
            const barWidth = 30;
            const barHeight = 4;
            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.fillRect(screenX - barWidth / 2, screenY - enemy.size / 2 - 12, barWidth, barHeight);
            ctx.fillStyle = '#f00';
            ctx.fillRect(screenX - barWidth / 2, screenY - enemy.size / 2 - 12, barWidth, barHeight);
            ctx.fillStyle = '#0f0';
            ctx.fillRect(screenX - barWidth / 2, screenY - enemy.size / 2 - 12, barWidth * (enemy.hp / enemy.maxHp), barHeight);
            
            ctx.restore();
        }
    });
    
    // Mini-map
    renderMinimap();
    
    // Menu de craft
    if (game.craftingMenuOpen) {
        const hasCraftingTable = game.player.inventory.crafting_table > 0;
        game.craftingSystem.renderCraftingMenu(ctx, game.player.inventory, hasCraftingTable);
    }
    
    // Notifications
    renderNotifications();
    
    // Hotbar
    if (!game.craftingMenuOpen) {
        renderHotbar();
    }
    
    // Instructions
    if (!game.craftingMenuOpen) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(10, canvas.height - 190, 300, 100);
        ctx.fillStyle = '#fff';
        ctx.font = '12px Inter';
        ctx.textAlign = 'left';
        ctx.fillText('ZQSD - Déplacer', 20, canvas.height - 170);
        ctx.fillText('E - Récolter', 20, canvas.height - 155);
        ctx.fillText('CLIC - Attaquer', 20, canvas.height - 140);
        ctx.fillText('C - Menu Craft', 20, canvas.height - 125);
        ctx.fillText('F - Placer structure', 20, canvas.height - 110);
    }
}

// Mini-map
function renderMinimap() {
    const minimapSize = 150;
    const minimapX = canvas.width - minimapSize - 10;
    const minimapY = 10;
    const scale = minimapSize / WORLD.width;
    
    // Fond
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(minimapX, minimapY, minimapSize, minimapSize);
    
    // Bordure
    ctx.strokeStyle = '#8b5cf6';
    ctx.lineWidth = 2;
    ctx.strokeRect(minimapX, minimapY, minimapSize, minimapSize);
    
    // Ressources (points)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    game.resources.forEach(r => {
        ctx.fillRect(
            minimapX + r.x * scale - 1,
            minimapY + r.y * scale - 1,
            2, 2
        );
    });
    
    // Joueur
    ctx.fillStyle = '#8b5cf6';
    ctx.beginPath();
    ctx.arc(
        minimapX + game.player.x * scale,
        minimapY + game.player.y * scale,
        3, 0, Math.PI * 2
    );
    ctx.fill();
    
    // Indicateur jour/nuit
    const timeY = minimapY + minimapSize + 15;
    const dayProgress = game.dayNightCycle;
    const isDaytime = dayProgress < 0.5;
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(minimapX, timeY, minimapSize, 30);
    ctx.strokeStyle = '#8b5cf6';
    ctx.lineWidth = 2;
    ctx.strokeRect(minimapX, timeY, minimapSize, 30);
    
    // Icône soleil/lune
    ctx.font = '20px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(isDaytime ? '☀️' : '🌙', minimapX + 10, timeY + 22);
    
    // Texte
    ctx.fillStyle = '#fff';
    ctx.font = '600 12px Inter';
    ctx.textAlign = 'right';
    ctx.fillText(isDaytime ? 'JOUR' : 'NUIT', minimapX + minimapSize - 10, timeY + 20);
}

// Mise à jour UI
function updateUI() {
    document.getElementById('player-hp').textContent = Math.floor(game.player.hp);
    document.getElementById('hunger-value').textContent = Math.floor(game.player.hunger);
    document.getElementById('thirst-value').textContent = Math.floor(game.player.thirst);
    document.getElementById('wood-value').textContent = game.player.inventory.wood;
    document.getElementById('stone-value').textContent = game.player.inventory.stone;
    document.getElementById('iron-value').textContent = game.player.inventory.iron_ore;
}

// Chat
function addChatMessage(message, color = '#fff') {
    const chatDiv = document.getElementById('chat-messages');
    const msg = document.createElement('div');
    msg.style.color = color;
    msg.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
    chatDiv.appendChild(msg);
    chatDiv.scrollTop = chatDiv.scrollHeight;
    
    // Limiter à 50 messages
    while (chatDiv.children.length > 50) {
        chatDiv.removeChild(chatDiv.firstChild);
    }
    
    // Ajouter notification visuelle
    game.notifications.push({
        message,
        color,
        time: Date.now(),
        duration: 3000
    });
}

// Rendu des notifications
function renderNotifications() {
    const now = Date.now();
    game.notifications = game.notifications.filter(n => now - n.time < n.duration);
    
    let offsetY = 50;
    game.notifications.forEach(notif => {
        const age = now - notif.time;
        const alpha = Math.max(0, 1 - (age / notif.duration));
        
        ctx.save();
        ctx.globalAlpha = alpha;
        
        // Fond
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(canvas.width / 2 - 150, offsetY, 300, 40);
        
        // Bordure
        ctx.strokeStyle = notif.color;
        ctx.lineWidth = 2;
        ctx.strokeRect(canvas.width / 2 - 150, offsetY, 300, 40);
        
        // Texte
        ctx.fillStyle = notif.color;
        ctx.font = '600 14px Inter';
        ctx.textAlign = 'center';
        ctx.fillText(notif.message, canvas.width / 2, offsetY + 25);
        
        ctx.restore();
        offsetY += 50;
    });
}

// Rendu de la hotbar
function renderHotbar() {
    const hotbarWidth = 400;
    const hotbarHeight = 70;
    const hotbarX = (canvas.width - hotbarWidth) / 2;
    const hotbarY = canvas.height - hotbarHeight - 10;
    const slotSize = 60;
    const slotSpacing = 10;
    
    // Fond de la hotbar
    ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
    ctx.fillRect(hotbarX, hotbarY, hotbarWidth, hotbarHeight);
    ctx.strokeStyle = '#8b5cf6';
    ctx.lineWidth = 3;
    ctx.strokeRect(hotbarX, hotbarY, hotbarWidth, hotbarHeight);
    
    // Slots d'outils
    const tools = [
        { id: 'hand', name: 'Main', icon: '✋', key: '1' },
        { id: 'wooden_pickaxe', name: 'Pioche Bois', icon: '⛏️', key: '2', color: '#8b4513' },
        { id: 'stone_pickaxe', name: 'Pioche Pierre', icon: '⛏️', key: '3', color: '#666' },
        { id: 'iron_pickaxe', name: 'Pioche Fer', icon: '⛏️', key: '4', color: '#c0c0c0' },
        { id: 'wooden_axe', name: 'Hache Bois', icon: '🪓', key: '5', color: '#8b4513' }
    ];
    
    tools.forEach((tool, index) => {
        const slotX = hotbarX + 10 + index * (slotSize + slotSpacing);
        const slotY = hotbarY + 5;
        const isEquipped = game.player.equippedTool === tool.id;
        const hasItem = tool.id === 'hand' || (game.player.inventory[tool.id] && game.player.inventory[tool.id] > 0);
        
        // Fond du slot
        if (isEquipped) {
            ctx.fillStyle = 'rgba(139, 92, 246, 0.5)';
        } else if (hasItem) {
            ctx.fillStyle = 'rgba(139, 92, 246, 0.2)';
        } else {
            ctx.fillStyle = 'rgba(50, 50, 50, 0.5)';
        }
        ctx.fillRect(slotX, slotY, slotSize, slotSize);
        
        // Bordure du slot
        ctx.strokeStyle = isEquipped ? '#8b5cf6' : (hasItem ? '#666' : '#333');
        ctx.lineWidth = isEquipped ? 3 : 2;
        ctx.strokeRect(slotX, slotY, slotSize, slotSize);
        
        // Icône
        if (hasItem) {
            ctx.fillStyle = tool.color || '#fff';
            ctx.font = '28px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(tool.icon, slotX + slotSize / 2, slotY + slotSize / 2 + 10);
            
            // Quantité
            if (tool.id !== 'hand' && game.player.inventory[tool.id]) {
                ctx.fillStyle = '#fff';
                ctx.font = '600 12px Inter';
                ctx.fillText(game.player.inventory[tool.id], slotX + slotSize - 10, slotY + slotSize - 5);
            }
        } else {
            // Slot vide
            ctx.fillStyle = '#333';
            ctx.font = '20px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('?', slotX + slotSize / 2, slotY + slotSize / 2 + 8);
        }
        
        // Numéro de touche
        ctx.fillStyle = isEquipped ? '#8b5cf6' : '#999';
        ctx.font = '600 11px Inter';
        ctx.textAlign = 'center';
        ctx.fillText(tool.key, slotX + slotSize / 2, slotY - 5);
    });
}

// Boucle de jeu
function gameLoop() {
    update();
    render();
    requestAnimationFrame(gameLoop);
}

// Démarrage
initWorld();
addChatMessage('=== PLAYHUB SURVIVAL ===', '#8b5cf6');
addChatMessage('Bienvenue dans le monde ouvert!', '#8b5cf6');
addChatMessage('Appuyez sur C pour ouvrir le menu de craft', '#0f0');
addChatMessage('Récoltez du bois pour commencer!', '#0f0');
gameLoop();
