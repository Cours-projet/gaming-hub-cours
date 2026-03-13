/**
 * Système de zone (storm) PlayHub
 * @author Tomy - Lead Developer
 */

class SafeZone {
    constructor(mapWidth = 1200, mapHeight = 800) {
        this.mapWidth = mapWidth;
        this.mapHeight = mapHeight;
        
        // Zone actuelle (commence grande)
        this.currentX = mapWidth / 2;
        this.currentY = mapHeight / 2;
        this.currentRadius = Math.min(mapWidth, mapHeight) * 0.6;
        
        // Zone cible
        this.targetX = mapWidth / 2;
        this.targetY = mapHeight / 2;
        this.targetRadius = this.currentRadius;
        
        // Paramètres
        this.shrinkSpeed = 1;
        this.damage = 1;
        this.phase = 0;
        this.maxPhases = 6;
        this.lastShrink = Date.now();
        this.gameStartTime = Date.now();
        this.gameDuration = 10 * 60 * 1000; // 10 minutes
        
        // Phases optimisées pour 10 minutes
        this.phases = [
            { time: 60000, radius: 0.75, damage: 1, speed: 0.8 },   // 1min - 75%
            { time: 120000, radius: 0.55, damage: 2, speed: 1.0 },  // 2min - 55%
            { time: 180000, radius: 0.40, damage: 5, speed: 1.2 },  // 3min - 40%
            { time: 240000, radius: 0.28, damage: 8, speed: 1.5 },  // 4min - 28%
            { time: 360000, radius: 0.18, damage: 12, speed: 1.8 }, // 6min - 18%
            { time: 480000, radius: 0.08, damage: 20, speed: 2.0 }  // 8min - 8%
        ];
        
        this.isShrinking = false;
    }

    /**
     * Met à jour la zone
     */
    update() {
        const now = Date.now();
        const elapsed = now - this.gameStartTime;
        
        // Vérifier si on doit passer à la phase suivante
        if (this.phase < this.maxPhases) {
            const nextPhase = this.phases[this.phase];
            if (elapsed >= nextPhase.time && !this.isShrinking) {
                return this.startShrink();
            }
        }

        // Rétrécir progressivement
        if (this.isShrinking) {
            const radiusDiff = this.currentRadius - this.targetRadius;
            if (radiusDiff > 1) {
                this.currentRadius -= this.shrinkSpeed;
            } else {
                this.currentRadius = this.targetRadius;
                this.isShrinking = false;
            }

            // Déplacer le centre
            const dx = this.targetX - this.currentX;
            const dy = this.targetY - this.currentY;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance > 1) {
                this.currentX += (dx / distance) * this.shrinkSpeed;
                this.currentY += (dy / distance) * this.shrinkSpeed;
            }
        }
    }

    /**
     * Démarre un nouveau rétrécissement
     */
    startShrink() {
        if (this.phase >= this.maxPhases) return null;

        const phaseData = this.phases[this.phase];
        
        // Nouvelle position aléatoire dans la zone actuelle
        const angle = Math.random() * Math.PI * 2;
        const maxOffset = this.currentRadius * 0.25;
        const offset = Math.random() * maxOffset;
        
        this.targetX = this.currentX + Math.cos(angle) * offset;
        this.targetY = this.currentY + Math.sin(angle) * offset;
        
        // Limiter dans la map
        const margin = 100;
        this.targetX = Math.max(margin, Math.min(this.mapWidth - margin, this.targetX));
        this.targetY = Math.max(margin, Math.min(this.mapHeight - margin, this.targetY));
        
        // Nouveau rayon
        const initialRadius = Math.min(this.mapWidth, this.mapHeight) * 0.6;
        this.targetRadius = initialRadius * phaseData.radius;
        
        // Mise à jour des paramètres
        this.damage = phaseData.damage;
        this.shrinkSpeed = phaseData.speed;
        this.phase++;
        this.isShrinking = true;

        return {
            phase: this.phase,
            message: `⚠️ TEMPÊTE PHASE ${this.phase}/${this.maxPhases} - ${phaseData.damage} DMG/s`
        };
    }

    /**
     * Vérifie si un joueur est dans la zone
     */
    isInZone(x, y) {
        const dx = x - this.currentX;
        const dy = y - this.currentY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance <= this.currentRadius;
    }

    /**
     * Calcule les dégâts
     */
    getDamage(x, y) {
        if (this.isInZone(x, y)) return 0;
        return this.damage;
    }

    /**
     * Dessine la zone
     */
    render(ctx) {
        // Tempête (zone dangereuse)
        ctx.save();
        ctx.fillStyle = 'rgba(138, 43, 226, 0.15)';
        ctx.fillRect(0, 0, this.mapWidth, this.mapHeight);

        // Zone sûre (découpe)
        ctx.globalCompositeOperation = 'destination-out';
        ctx.fillStyle = 'rgba(0, 0, 0, 1)';
        ctx.beginPath();
        ctx.arc(this.currentX, this.currentY, this.currentRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalCompositeOperation = 'source-over';

        // Bordure animée de la zone
        const time = Date.now() / 1000;
        const pulse = Math.sin(time * 2) * 0.3 + 0.7;
        
        ctx.strokeStyle = `rgba(138, 43, 226, ${pulse})`;
        ctx.lineWidth = 4;
        ctx.setLineDash([15, 10]);
        ctx.lineDashOffset = -time * 20;
        ctx.beginPath();
        ctx.arc(this.currentX, this.currentY, this.currentRadius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);

        // Zone cible (si en rétrécissement)
        if (this.isShrinking && Math.abs(this.currentRadius - this.targetRadius) > 10) {
            ctx.strokeStyle = 'rgba(0, 255, 136, 0.4)';
            ctx.lineWidth = 2;
            ctx.setLineDash([8, 8]);
            ctx.beginPath();
            ctx.arc(this.targetX, this.targetY, this.targetRadius, 0, Math.PI * 2);
            ctx.stroke();
            ctx.setLineDash([]);
        }

        ctx.restore();
    }

    /**
     * Temps restant avant prochaine phase
     */
    getTimeUntilNextPhase() {
        if (this.phase >= this.maxPhases) return 0;
        
        const elapsed = Date.now() - this.gameStartTime;
        const nextPhaseTime = this.phases[this.phase].time;
        const remaining = Math.max(0, nextPhaseTime - elapsed);
        
        return Math.ceil(remaining / 1000);
    }

    /**
     * Temps total écoulé
     */
    getElapsedTime() {
        return Math.floor((Date.now() - this.gameStartTime) / 1000);
    }

    /**
     * Réinitialiser
     */
    reset() {
        this.currentX = this.mapWidth / 2;
        this.currentY = this.mapHeight / 2;
        this.currentRadius = Math.min(this.mapWidth, this.mapHeight) * 0.6;
        this.targetX = this.currentX;
        this.targetY = this.currentY;
        this.targetRadius = this.currentRadius;
        this.phase = 0;
        this.damage = 1;
        this.isShrinking = false;
        this.gameStartTime = Date.now();
    }
}
