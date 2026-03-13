/**
 * Générateur de maps aléatoires PlayHub
 * @author Tomy - Lead Developer
 */

class MapGenerator {
    constructor(width = 1200, height = 800) {
        this.width = width;
        this.height = height;
    }

    /**
     * Génère une map aléatoire
     */
    generate() {
        const themes = ['desert', 'city', 'forest', 'snow', 'lava'];
        const theme = themes[Math.floor(Math.random() * themes.length)];
        
        return this[`generate${theme.charAt(0).toUpperCase() + theme.slice(1)}`]();
    }

    /**
     * Génère un désert
     */
    generateDesert() {
        const obstacles = [];
        const numRocks = 15 + Math.floor(Math.random() * 10);
        
        for (let i = 0; i < numRocks; i++) {
            const size = 40 + Math.random() * 80;
            obstacles.push({
                x: Math.random() * (this.width - size),
                y: Math.random() * (this.height - size),
                width: size,
                height: size * (0.8 + Math.random() * 0.4),
                color: `hsl(30, ${30 + Math.random() * 20}%, ${35 + Math.random() * 15}%)`,
                type: 'rock'
            });
        }

        return {
            name: 'Désert',
            background: '#d4a574',
            theme: 'desert',
            obstacles
        };
    }

    /**
     * Génère une ville
     */
    generateCity() {
        const obstacles = [];
        const numBuildings = 12 + Math.floor(Math.random() * 8);
        
        for (let i = 0; i < numBuildings; i++) {
            const width = 80 + Math.random() * 120;
            const height = 100 + Math.random() * 150;
            obstacles.push({
                x: Math.random() * (this.width - width),
                y: Math.random() * (this.height - height),
                width,
                height,
                color: `hsl(0, 0%, ${15 + Math.random() * 10}%)`,
                type: 'building',
                windows: true
            });
        }

        return {
            name: 'Ville',
            background: '#4a4a4a',
            theme: 'city',
            obstacles
        };
    }

    /**
     * Génère une forêt
     */
    generateForest() {
        const obstacles = [];
        const numTrees = 20 + Math.floor(Math.random() * 15);
        
        for (let i = 0; i < numTrees; i++) {
            const radius = 20 + Math.random() * 25;
            obstacles.push({
                x: Math.random() * (this.width - radius * 2),
                y: Math.random() * (this.height - radius * 2),
                width: radius * 2,
                height: radius * 2,
                radius,
                color: `hsl(120, ${40 + Math.random() * 20}%, ${15 + Math.random() * 10}%)`,
                type: 'tree',
                leaves: true
            });
        }

        return {
            name: 'Forêt',
            background: '#2d5016',
            theme: 'forest',
            obstacles
        };
    }

    /**
     * Génère une map enneigée
     */
    generateSnow() {
        const obstacles = [];
        const numObstacles = 18 + Math.floor(Math.random() * 12);
        
        for (let i = 0; i < numObstacles; i++) {
            const size = 50 + Math.random() * 70;
            obstacles.push({
                x: Math.random() * (this.width - size),
                y: Math.random() * (this.height - size),
                width: size,
                height: size * (0.7 + Math.random() * 0.5),
                color: `hsl(200, ${30 + Math.random() * 20}%, ${70 + Math.random() * 15}%)`,
                type: 'ice'
            });
        }

        return {
            name: 'Neige',
            background: '#e8f4f8',
            theme: 'snow',
            obstacles
        };
    }

    /**
     * Génère une map de lave
     */
    generateLava() {
        const obstacles = [];
        const numRocks = 16 + Math.floor(Math.random() * 10);
        
        for (let i = 0; i < numRocks; i++) {
            const size = 60 + Math.random() * 90;
            obstacles.push({
                x: Math.random() * (this.width - size),
                y: Math.random() * (this.height - size),
                width: size,
                height: size * (0.8 + Math.random() * 0.4),
                color: `hsl(0, ${50 + Math.random() * 30}%, ${20 + Math.random() * 15}%)`,
                type: 'lavarock'
            });
        }

        return {
            name: 'Lave',
            background: '#8b2500',
            theme: 'lava',
            obstacles
        };
    }

    /**
     * Dessine les obstacles avec effets
     */
    static renderObstacle(ctx, obs) {
        ctx.save();
        
        if (obs.type === 'rock' || obs.type === 'lavarock') {
            // Ombre
            ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            ctx.fillRect(obs.x + 5, obs.y + 5, obs.width, obs.height);
            
            // Rocher
            ctx.fillStyle = obs.color;
            ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
            
            // Détails
            ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
            ctx.fillRect(obs.x + obs.width * 0.2, obs.y + obs.height * 0.3, obs.width * 0.3, obs.height * 0.2);
            
        } else if (obs.type === 'building') {
            // Ombre
            ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
            ctx.fillRect(obs.x + 8, obs.y + 8, obs.width, obs.height);
            
            // Bâtiment
            ctx.fillStyle = obs.color;
            ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
            
            // Fenêtres
            if (obs.windows) {
                ctx.fillStyle = 'rgba(255, 255, 100, 0.6)';
                const rows = Math.floor(obs.height / 25);
                const cols = Math.floor(obs.width / 25);
                for (let r = 0; r < rows; r++) {
                    for (let c = 0; c < cols; c++) {
                        if (Math.random() > 0.3) {
                            ctx.fillRect(
                                obs.x + 10 + c * 25,
                                obs.y + 10 + r * 25,
                                12, 12
                            );
                        }
                    }
                }
            }
            
            // Bordure
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.lineWidth = 2;
            ctx.strokeRect(obs.x, obs.y, obs.width, obs.height);
            
        } else if (obs.type === 'tree') {
            // Ombre
            ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            ctx.beginPath();
            ctx.ellipse(obs.x + obs.width/2, obs.y + obs.height/2 + 5, obs.radius, obs.radius * 0.5, 0, 0, Math.PI * 2);
            ctx.fill();
            
            // Tronc
            ctx.fillStyle = '#4a3020';
            ctx.fillRect(obs.x + obs.width/2 - 8, obs.y + obs.height/2 - 10, 16, 30);
            
            // Feuillage
            ctx.fillStyle = obs.color;
            ctx.beginPath();
            ctx.arc(obs.x + obs.width/2, obs.y + obs.height/2, obs.radius, 0, Math.PI * 2);
            ctx.fill();
            
            // Détails feuillage
            ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
            ctx.beginPath();
            ctx.arc(obs.x + obs.width/2 - obs.radius * 0.3, obs.y + obs.height/2 - obs.radius * 0.3, obs.radius * 0.4, 0, Math.PI * 2);
            ctx.fill();
            
        } else if (obs.type === 'ice') {
            // Ombre
            ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
            ctx.fillRect(obs.x + 3, obs.y + 3, obs.width, obs.height);
            
            // Glace
            ctx.fillStyle = obs.color;
            ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
            
            // Brillance
            ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.fillRect(obs.x + 5, obs.y + 5, obs.width * 0.3, obs.height * 0.3);
            
            // Bordure
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
            ctx.lineWidth = 2;
            ctx.strokeRect(obs.x, obs.y, obs.width, obs.height);
        }
        
        ctx.restore();
    }
}
