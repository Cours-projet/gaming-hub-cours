/**
 * Système de loot PlayHub
 * @author Tomy - Lead Developer
 */

// Types de loot
const LOOT_TYPES = {
    // Armes
    pistol: { type: 'weapon', name: 'Pistolet', color: '#888', rarity: 'common' },
    rifle: { type: 'weapon', name: 'Fusil', color: '#4a90e2', rarity: 'uncommon' },
    sniper: { type: 'weapon', name: 'Sniper', color: '#9b59b6', rarity: 'rare' },
    shotgun: { type: 'weapon', name: 'Shotgun', color: '#e74c3c', rarity: 'rare' },
    smg: { type: 'weapon', name: 'SMG', color: '#f39c12', rarity: 'uncommon' },
    
    // Soins
    medkit: { type: 'heal', name: 'Medkit', heal: 50, color: '#2ecc71', rarity: 'uncommon' },
    bandage: { type: 'heal', name: 'Bandage', heal: 25, color: '#27ae60', rarity: 'common' },
    shield: { type: 'heal', name: 'Bouclier', heal: 100, color: '#3498db', rarity: 'rare' }
};

class LootSystem {
    constructor() {
        this.items = [];
        this.spawnInterval = 5000; // Spawn toutes les 5 secondes
        this.maxItems = 30;
    }

    /**
     * Génère du loot aléatoire sur la map
     */
    spawnLoot(mapWidth = 1200, mapHeight = 800) {
        if (this.items.length >= this.maxItems) return;

        const lootKeys = Object.keys(LOOT_TYPES);
        const randomLoot = lootKeys[Math.floor(Math.random() * lootKeys.length)];
        
        const item = {
            id: Date.now() + Math.random(),
            type: randomLoot,
            x: Math.random() * (mapWidth - 40) + 20,
            y: Math.random() * (mapHeight - 40) + 20,
            data: LOOT_TYPES[randomLoot]
        };

        this.items.push(item);
        return item;
    }

    /**
     * Vérifie si un joueur ramasse du loot
     */
    checkPickup(playerX, playerY, playerSize = 16) {
        const pickupRadius = 30;
        
        for (let i = this.items.length - 1; i >= 0; i--) {
            const item = this.items[i];
            const dx = (playerX + playerSize/2) - item.x;
            const dy = (playerY + playerSize/2) - item.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < pickupRadius) {
                const pickedItem = this.items.splice(i, 1)[0];
                return pickedItem;
            }
        }
        return null;
    }

    /**
     * Dessine le loot sur le canvas
     */
    render(ctx) {
        this.items.forEach(item => {
            const time = Date.now() / 1000;
            const pulse = Math.sin(time * 3) * 0.3 + 0.7;
            const float = Math.sin(time * 2) * 2;
            
            // Ombre
            ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
            ctx.beginPath();
            ctx.ellipse(item.x, item.y + 4, 10, 4, 0, 0, Math.PI * 2);
            ctx.fill();

            // Aura
            ctx.globalAlpha = pulse * 0.4;
            ctx.fillStyle = item.data.color;
            ctx.beginPath();
            ctx.arc(item.x, item.y + float, 15, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1;

            // Item principal
            ctx.fillStyle = item.data.color;
            ctx.beginPath();
            ctx.arc(item.x, item.y + float, 9, 0, Math.PI * 2);
            ctx.fill();

            // Bordure brillante
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Icône selon le type
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 12px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            const icon = item.data.type === 'weapon' ? '⚔' : '💊';
            ctx.fillText(icon, item.x, item.y + float);

            // Effet de brillance animé
            ctx.globalAlpha = pulse;
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(item.x - 3, item.y + float - 3, 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1;
            
            // Nom du loot
            ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
            ctx.fillRect(item.x - 30, item.y + float + 15, 60, 16);
            ctx.fillStyle = item.data.color;
            ctx.font = 'bold 9px Arial';
            ctx.fillText(item.data.name, item.x, item.y + float + 23);
        });
    }

    /**
     * Nettoie tous les items
     */
    clear() {
        this.items = [];
    }
}
