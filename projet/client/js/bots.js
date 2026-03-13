/**
 * Système de Bots IA
 * @author Tomy - Lead Developer
 */

class Bot {
    constructor(id, username) {
        this.id = id;
        this.username = username;
        this.x = Math.random() * 1100 + 50;
        this.y = Math.random() * 700 + 50;
        this.hp = 100;
        this.maxHp = 100;
        this.kills = 0;
        this.deaths = 0;
        this.isAlive = true;
        this.direction = Math.random() * Math.PI * 2;
        this.speed = 2;
        this.weapon = 'pistol';
        this.lastShot = 0;
        this.target = null;
        this.state = 'wander'; // wander, chase, flee
        this.stateTimer = 0;
    }

    update(players, obstacles) {
        if (!this.isAlive) return;

        this.stateTimer--;
        if (this.stateTimer <= 0) {
            this.chooseState(players);
        }

        switch (this.state) {
            case 'wander':
                this.wander(obstacles);
                break;
            case 'chase':
                this.chase(obstacles);
                break;
            case 'flee':
                this.flee(obstacles);
                break;
        }

        // Tirer sur la cible
        if (this.target && this.canShoot()) {
            const dx = this.target.x - this.x;
            const dy = this.target.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 400) {
                this.direction = Math.atan2(dy, dx);
                return {
                    shoot: true,
                    x: this.x + 8,
                    y: this.y + 8,
                    direction: this.direction,
                    weapon: this.weapon
                };
            }
        }

        return null;
    }

    chooseState(players) {
        // Trouver le joueur le plus proche
        let closest = null;
        let minDist = Infinity;

        players.forEach(player => {
            if (player.id !== this.id && player.isAlive) {
                const dx = player.x - this.x;
                const dy = player.y - this.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < minDist) {
                    minDist = dist;
                    closest = player;
                }
            }
        });

        if (closest) {
            this.target = closest;

            if (this.hp < 30) {
                this.state = 'flee';
                this.stateTimer = 180; // 3 secondes
            } else if (minDist < 500) {
                this.state = 'chase';
                this.stateTimer = 120; // 2 secondes
            } else {
                this.state = 'wander';
                this.stateTimer = 240; // 4 secondes
            }
        } else {
            this.state = 'wander';
            this.stateTimer = 240;
        }
    }

    wander(obstacles) {
        // Changer de direction aléatoirement
        if (Math.random() < 0.02) {
            this.direction = Math.random() * Math.PI * 2;
        }

        const newX = this.x + Math.cos(this.direction) * this.speed;
        const newY = this.y + Math.sin(this.direction) * this.speed;

        if (!this.checkCollision(newX, newY, obstacles)) {
            this.x = Math.max(0, Math.min(1184, newX));
            this.y = Math.max(0, Math.min(784, newY));
        } else {
            this.direction = Math.random() * Math.PI * 2;
        }
    }

    chase(obstacles) {
        if (!this.target) return;

        const dx = this.target.x - this.x;
        const dy = this.target.y - this.y;
        this.direction = Math.atan2(dy, dx);

        const newX = this.x + Math.cos(this.direction) * this.speed;
        const newY = this.y + Math.sin(this.direction) * this.speed;

        if (!this.checkCollision(newX, newY, obstacles)) {
            this.x = Math.max(0, Math.min(1184, newX));
            this.y = Math.max(0, Math.min(784, newY));
        }
    }

    flee(obstacles) {
        if (!this.target) return;

        const dx = this.x - this.target.x;
        const dy = this.y - this.target.y;
        this.direction = Math.atan2(dy, dx);

        const newX = this.x + Math.cos(this.direction) * this.speed * 1.5;
        const newY = this.y + Math.sin(this.direction) * this.speed * 1.5;

        if (!this.checkCollision(newX, newY, obstacles)) {
            this.x = Math.max(0, Math.min(1184, newX));
            this.y = Math.max(0, Math.min(784, newY));
        }
    }

    checkCollision(x, y, obstacles) {
        for (const obs of obstacles) {
            if (x > obs.x && x < obs.x + obs.width &&
                y > obs.y && y < obs.y + obs.height) {
                return true;
            }
        }
        return false;
    }

    canShoot() {
        const now = Date.now();
        const weapon = WEAPONS[this.weapon];
        if (now - this.lastShot >= weapon.fireRate) {
            this.lastShot = now;
            return true;
        }
        return false;
    }

    takeDamage(damage) {
        this.hp -= damage;
        if (this.hp <= 0) {
            this.hp = 0;
            this.isAlive = false;
            this.deaths++;
            return true;
        }
        return false;
    }

    respawn() {
        this.x = Math.random() * 1100 + 50;
        this.y = Math.random() * 700 + 50;
        this.hp = this.maxHp;
        this.isAlive = true;
        this.state = 'wander';
    }

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
            direction: this.direction,
            weapon: this.weapon
        };
    }
}

// Générer des noms de bots
const BOT_NAMES = [
    'Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon',
    'Zeta', 'Eta', 'Theta', 'Iota', 'Kappa',
    'Lambda', 'Mu', 'Nu', 'Xi', 'Omicron',
    'Pi', 'Rho', 'Sigma', 'Tau', 'Upsilon'
];

function createBots(count) {
    const bots = [];
    for (let i = 0; i < count; i++) {
        const bot = new Bot(`bot_${i}`, `Bot ${BOT_NAMES[i]}`);
        bots.push(bot);
    }
    return bots;
}
