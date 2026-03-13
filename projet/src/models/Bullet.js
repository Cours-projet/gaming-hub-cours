/**
 * Modèle de balle
 * @author Tomy - Lead Developer
 */

const { WEAPON } = require('../config/constants');

class Bullet {
    constructor(id, x, y, direction, ownerId) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.vx = Math.cos(direction) * WEAPON.BULLET_SPEED;
        this.vy = Math.sin(direction) * WEAPON.BULLET_SPEED;
        this.ownerId = ownerId;
        this.damage = WEAPON.BULLET_DAMAGE;
        this.createdAt = Date.now();
    }

    /**
     * Met à jour la position de la balle
     */
    update() {
        this.x += this.vx;
        this.y += this.vy;
    }

    /**
     * Vérifie si la balle est hors limites
     */
    isOutOfBounds() {
        return this.x < 0 || this.x > 800 || this.y < 0 || this.y > 600;
    }

    /**
     * Vérifie la collision avec un joueur
     */
    checkCollision(player) {
        if (player.id === this.ownerId || !player.isAlive) {
            return false;
        }

        const dx = this.x - (player.x + 8);
        const dy = this.y - (player.y + 8);
        const distance = Math.sqrt(dx * dx + dy * dy);

        return distance < 16;
    }

    /**
     * Retourne les données de la balle pour le client
     */
    toJSON() {
        return {
            id: this.id,
            x: this.x,
            y: this.y,
            ownerId: this.ownerId
        };
    }
}

module.exports = Bullet;
