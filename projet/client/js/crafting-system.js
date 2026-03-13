/**
 * Système de Craft - PlayHub
 * @author Tomy - Lead Developer
 */

// Recettes de craft
const RECIPES = {
    // Outils
    wooden_pickaxe: {
        name: 'Pioche en bois',
        requires: { wood: 5 },
        category: 'tools',
        icon: '⛏️',
        color: '#8b4513'
    },
    stone_pickaxe: {
        name: 'Pioche en pierre',
        requires: { wood: 3, stone: 5 },
        category: 'tools',
        icon: '⛏️',
        color: '#666'
    },
    iron_pickaxe: {
        name: 'Pioche en fer',
        requires: { wood: 3, iron_ore: 5 },
        category: 'tools',
        icon: '⛏️',
        color: '#c0c0c0'
    },
    wooden_axe: {
        name: 'Hache en bois',
        requires: { wood: 5 },
        category: 'tools',
        icon: '🪓',
        color: '#8b4513'
    },
    stone_axe: {
        name: 'Hache en pierre',
        requires: { wood: 3, stone: 5 },
        category: 'tools',
        icon: '🪓',
        color: '#666'
    },
    
    // Structures
    crafting_table: {
        name: 'Table de craft',
        requires: { wood: 10 },
        category: 'structures',
        icon: '🔨',
        color: '#8b4513'
    },
    furnace: {
        name: 'Four',
        requires: { stone: 20 },
        category: 'structures',
        icon: '🔥',
        color: '#555'
    },
    chest: {
        name: 'Coffre',
        requires: { wood: 15 },
        category: 'structures',
        icon: '📦',
        color: '#8b4513'
    },
    
    // Smelting (four)
    iron_ingot: {
        name: 'Lingot de fer',
        requires: { iron_ore: 1 },
        category: 'smelting',
        icon: '⚙️',
        needsFurnace: true,
        color: '#c0c0c0'
    }
};

// Outils et leurs bonus
const TOOLS = {
    hand: { miningSpeed: 1, damage: 5 },
    wooden_pickaxe: { miningSpeed: 2, damage: 8 },
    stone_pickaxe: { miningSpeed: 3, damage: 12 },
    iron_pickaxe: { miningSpeed: 5, damage: 18 },
    wooden_axe: { miningSpeed: 2, damage: 8 },
    stone_axe: { miningSpeed: 3, damage: 12 }
};

class CraftingSystem {
    constructor() {
        this.craftingMenuOpen = false;
    }
    
    /**
     * Vérifie si on peut crafter
     */
    canCraft(recipe, inventory) {
        for (const [item, amount] of Object.entries(recipe.requires)) {
            if ((inventory[item] || 0) < amount) {
                return false;
            }
        }
        return true;
    }
    
    /**
     * Craft un item
     */
    craft(recipeId, inventory) {
        const recipe = RECIPES[recipeId];
        if (!recipe) return false;
        
        if (!this.canCraft(recipe, inventory)) {
            return { success: false, message: 'Ressources insuffisantes' };
        }
        
        // Consommer les ressources
        for (const [item, amount] of Object.entries(recipe.requires)) {
            inventory[item] -= amount;
        }
        
        // Ajouter l'item crafté
        const isFirstCraft = !inventory[recipeId] || inventory[recipeId] === 0;
        inventory[recipeId] = (inventory[recipeId] || 0) + 1;
        
        // Messages spéciaux pour premiers crafts
        let message = `${recipe.name} crafté!`;
        if (isFirstCraft) {
            if (recipeId === 'wooden_pickaxe') {
                message = '🎉 Première pioche! Vous pouvez maintenant miner la pierre!';
            } else if (recipeId === 'crafting_table') {
                message = '🎉 Table de craft! Appuyez sur F pour la placer!';
            } else if (recipeId === 'iron_pickaxe') {
                message = '🎉 Pioche en fer! La meilleure pioche du jeu!';
            } else if (recipeId === 'furnace') {
                message = '🎉 Four crafté! Placez-le pour fondre du minerai!';
            }
        }
        
        return { success: true, message };
    }
    
    /**
     * Affiche le menu de craft
     */
    renderCraftingMenu(ctx, inventory, hasCraftingTable) {
        const menuWidth = 500;
        const menuHeight = 550;
        const x = (ctx.canvas.width - menuWidth) / 2;
        const y = (ctx.canvas.height - menuHeight) / 2;
        
        // Fond avec blur
        ctx.fillStyle = 'rgba(0, 0, 0, 0.95)';
        ctx.fillRect(x, y, menuWidth, menuHeight);
        
        // Bordure violette
        ctx.strokeStyle = '#8b5cf6';
        ctx.lineWidth = 3;
        ctx.strokeRect(x, y, menuWidth, menuHeight);
        
        // Titre
        ctx.fillStyle = '#8b5cf6';
        ctx.font = '700 24px Inter';
        ctx.textAlign = 'center';
        ctx.fillText('⚒️ CRAFTING', x + menuWidth / 2, y + 35);
        
        // Sous-titre
        ctx.fillStyle = '#999';
        ctx.font = '400 12px Inter';
        ctx.fillText(hasCraftingTable ? 'Table de craft disponible' : 'Recettes de base uniquement', x + menuWidth / 2, y + 55);
        
        // Recettes
        let offsetY = 80;
        const categories = hasCraftingTable ? ['tools', 'structures', 'smelting'] : ['tools'];
        
        for (const category of categories) {
            const recipes = Object.entries(RECIPES).filter(([_, r]) => r.category === category);
            
            // Titre de catégorie
            ctx.fillStyle = '#8b5cf6';
            ctx.font = '600 14px Inter';
            ctx.textAlign = 'left';
            const categoryNames = {
                'tools': '🔧 OUTILS',
                'structures': '🏗️ STRUCTURES',
                'smelting': '🔥 FONDERIE'
            };
            ctx.fillText(categoryNames[category], x + 30, y + offsetY);
            offsetY += 25;
            
            recipes.forEach(([id, recipe], i) => {
                const itemY = y + offsetY + i * 55;
                
                // Vérifier si craftable
                const canCraft = this.canCraft(recipe, inventory);
                
                // Fond de l'item
                if (canCraft) {
                    ctx.fillStyle = 'rgba(139, 92, 246, 0.3)';
                } else {
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
                }
                ctx.fillRect(x + 20, itemY, menuWidth - 40, 45);
                
                // Bordure
                ctx.strokeStyle = canCraft ? '#8b5cf6' : '#333';
                ctx.lineWidth = 2;
                ctx.strokeRect(x + 20, itemY, menuWidth - 40, 45);
                
                // Icône colorée
                ctx.fillStyle = recipe.color || '#fff';
                ctx.font = '24px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(recipe.icon, x + 50, itemY + 30);
                
                // Nom
                ctx.fillStyle = canCraft ? '#fff' : '#666';
                ctx.font = '600 15px Inter';
                ctx.textAlign = 'left';
                ctx.fillText(recipe.name, x + 80, itemY + 20);
                
                // Ressources requises
                ctx.font = '400 12px Inter';
                let reqText = '';
                const resourceNames = {
                    'wood': '🌲',
                    'stone': '🪨',
                    'iron_ore': '⛏️',
                    'iron': '⚙️'
                };
                for (const [item, amount] of Object.entries(recipe.requires)) {
                    const has = inventory[item] || 0;
                    const color = has >= amount ? '#0f0' : '#f00';
                    reqText += `${resourceNames[item] || item}: ${has}/${amount}  `;
                }
                ctx.fillStyle = canCraft ? '#0f0' : '#f00';
                ctx.fillText(reqText, x + 80, itemY + 38);
                
                // Bouton craft
                if (canCraft) {
                    ctx.fillStyle = '#8b5cf6';
                    ctx.fillRect(x + menuWidth - 110, itemY + 10, 80, 25);
                    ctx.fillStyle = '#fff';
                    ctx.font = '600 12px Inter';
                    ctx.textAlign = 'center';
                    ctx.fillText('CRAFT', x + menuWidth - 70, itemY + 27);
                }
            });
            
            offsetY += recipes.length * 55 + 15;
        }
        
        // Instructions
        ctx.fillStyle = '#666';
        ctx.font = '400 13px Inter';
        ctx.textAlign = 'center';
        ctx.fillText('Cliquez sur CRAFT pour fabriquer - ESC pour fermer', x + menuWidth / 2, y + menuHeight - 20);
    }
    
    /**
     * Gère le clic sur le menu
     */
    handleClick(mouseX, mouseY, inventory, hasCraftingTable) {
        const menuWidth = 500;
        const menuHeight = 550;
        const x = (canvas.width - menuWidth) / 2;
        const y = (canvas.height - menuHeight) / 2;
        
        let offsetY = 80;
        const categories = hasCraftingTable ? ['tools', 'structures', 'smelting'] : ['tools'];
        
        for (const category of categories) {
            const recipes = Object.entries(RECIPES).filter(([_, r]) => r.category === category);
            
            // Skip category title
            offsetY += 25;
            
            for (let i = 0; i < recipes.length; i++) {
                const [id, recipe] = recipes[i];
                const itemY = y + offsetY + i * 55;
                
                // Check if clicking on craft button
                if (mouseX >= x + menuWidth - 110 && mouseX <= x + menuWidth - 30 &&
                    mouseY >= itemY + 10 && mouseY <= itemY + 35) {
                    return this.craft(id, inventory);
                }
            }
            
            offsetY += recipes.length * 55 + 15;
        }
        
        return null;
    }
}
