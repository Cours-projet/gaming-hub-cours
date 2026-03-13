/**
 * Modèle de joueur
 * @author Tomy - Lead Developer
 */

const { PLAYER } = require('../config/constants');

class Player {
    constructor(id, username) {
        this.id = id;
        this.username = username;
        this.x = Math.random() * 700 + 50;
        this.y = Math.random() * 500 + 50;
        this.hp = PLAYER.MAX_HP;
        this.maxHp = PLAYER.MAX_HP;
        this.kills = 0;
        this.deaths = 0;
        this.isAlive = true;
        this.isInvincible = false;
        this.direction = 0;
        this.lastShot = 0;
        this.speed = PLAYER.SPEED;
        this.createdAt = Date.now();
    }

    /**
     * Déplace le joueur
     */
    move(x, y) {
        this.x = Math.max(0, Math.min(800 - PLAYER.SIZE, x));
        this.y = Math.max(0, Math.min(600 - PLAYER.SIZE, y));
    }

    /**
     * Inflige des dégâts au joueur
     */
    takeDamage(damage) {
        if (this.isInvincible || !this.isAlive) {
            return false;
        }

        this.hp -= damage;
        
        if (this.hp <= 0) {
            this.hp = 0;
            this.isAlive = false;
            this.deaths++;
            return true; // Joueur mort
        }

        return false;
    }

    /**
     * Réanime le joueur
     */
    respawn() {
        this.x = Math.random() * 700 + 50;
        this.y = Math.random() * 500 + 50;
        this.hp = this.maxHp;
        this.isAlive = true;
        this.isInvincible = true;

        // Retirer l'invincibilité après un délai
        setTimeout(() => {
            this.isInvincible = false;
        }, PLAYER.INVINCIBILITY_TIME);
    }

    /**
     * Incrémente les kills
     */
    addKill() {
        this.kills++;
    }

    /**
     * Vérifie si le joueur peut tirer
     */
    canShoot() {
        const now = Date.now();
        return now - this.lastShot >= 250;
    }

    /**
     * Met à jour le timestamp du dernier tir
     */
    updateLastShot() {
        this.lastShot = Date.now();
    }

    /**
     * Retourne les données du joueur pour le client
     */
    toJSON() {
        return {
            id: this.id,
            username: this.username,
            x: this.x,
            y: this.y,
            hp: this.hp,
            maxHp: this.maxHp,
            kills: this.kills,
            deaths: this.deaths,
            isAlive: this.isAlive,
            isInvincible: this.isInvincible,
            direction: this.direction
        };
    }
}

module.exports = Player;
