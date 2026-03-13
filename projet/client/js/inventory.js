/**
 * Système d'inventaire PlayHub
 * @author Tomy - Lead Developer
 */

class Inventory {
    constructor() {
        this.weapons = []; // Max 3 armes
        this.currentWeaponIndex = 0;
        this.heals = []; // Objets de soin
        this.maxWeapons = 3;
        this.maxHeals = 5;
    }

    /**
     * Ajoute une arme à l'inventaire
     */
    addWeapon(weaponType) {
        // Vérifier si on a déjà cette arme
        if (this.weapons.includes(weaponType)) {
            return { success: false, message: 'Vous avez déjà cette arme' };
        }

        // Si inventaire plein, remplacer l'arme actuelle
        if (this.weapons.length >= this.maxWeapons) {
            const oldWeapon = this.weapons[this.currentWeaponIndex];
            this.weapons[this.currentWeaponIndex] = weaponType;
            return { 
                success: true, 
                message: `${LOOT_TYPES[weaponType].name} remplace ${LOOT_TYPES[oldWeapon].name}`,
                replaced: oldWeapon
            };
        }

        this.weapons.push(weaponType);
        return { 
            success: true, 
            message: `${LOOT_TYPES[weaponType].name} ajouté` 
        };
    }

    /**
     * Ajoute un objet de soin
     */
    addHeal(healType) {
        if (this.heals.length >= this.maxHeals) {
            return { success: false, message: 'Inventaire de soins plein' };
        }

        this.heals.push(healType);
        return { 
            success: true, 
            message: `${LOOT_TYPES[healType].name} ajouté` 
        };
    }

    /**
     * Utilise un objet de soin
     */
    useHeal() {
        if (this.heals.length === 0) {
            return { success: false, message: 'Pas de soins disponibles' };
        }

        const healType = this.heals.shift();
        const healData = LOOT_TYPES[healType];
        
        return { 
            success: true, 
            heal: healData.heal,
            message: `+${healData.heal} HP` 
        };
    }

    /**
     * Change d'arme
     */
    switchWeapon(index) {
        if (index >= 0 && index < this.weapons.length) {
            this.currentWeaponIndex = index;
            return this.weapons[index];
        }
        return null;
    }

    /**
     * Arme suivante
     */
    nextWeapon() {
        if (this.weapons.length === 0) return null;
        this.currentWeaponIndex = (this.currentWeaponIndex + 1) % this.weapons.length;
        return this.weapons[this.currentWeaponIndex];
    }

    /**
     * Arme précédente
     */
    previousWeapon() {
        if (this.weapons.length === 0) return null;
        this.currentWeaponIndex = (this.currentWeaponIndex - 1 + this.weapons.length) % this.weapons.length;
        return this.weapons[this.currentWeaponIndex];
    }

    /**
     * Obtenir l'arme actuelle
     */
    getCurrentWeapon() {
        return this.weapons[this.currentWeaponIndex] || null;
    }

    /**
     * Réinitialiser l'inventaire
     */
    reset() {
        this.weapons = [];
        this.heals = [];
        this.currentWeaponIndex = 0;
    }

    /**
     * Obtenir l'état de l'inventaire
     */
    getState() {
        return {
            weapons: this.weapons,
            currentWeaponIndex: this.currentWeaponIndex,
            heals: this.heals
        };
    }
}
