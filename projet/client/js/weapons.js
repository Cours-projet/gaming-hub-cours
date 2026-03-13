/**
 * Système d'armes PlayHub
 * @author Tomy - Lead Developer
 */

const WEAPONS = {
    pistol: {
        name: 'Pistolet',
        damage: 20,
        fireRate: 250,
        bulletSpeed: 10,
        bulletSize: 4,
        color: '#ffaa00',
        icon: '🔫'
    },
    rifle: {
        name: 'Fusil',
        damage: 30,
        fireRate: 400,
        bulletSpeed: 12,
        bulletSize: 5,
        color: '#ff4400',
        icon: '🎯'
    },
    sniper: {
        name: 'Sniper',
        damage: 50,
        fireRate: 1000,
        bulletSpeed: 20,
        bulletSize: 6,
        color: '#00ffff',
        icon: '🎯'
    },
    shotgun: {
        name: 'Shotgun',
        damage: 40,
        fireRate: 800,
        bulletSpeed: 8,
        bulletSize: 8,
        bullets: 5, // Tire 5 balles
        spread: 0.3,
        color: '#ff0044',
        icon: '💥'
    },
    smg: {
        name: 'SMG',
        damage: 15,
        fireRate: 100,
        bulletSpeed: 9,
        bulletSize: 3,
        color: '#00ff88',
        icon: '⚡'
    }
};

const MAPS = {
    desert: {
        name: 'Désert',
        background: '#d4a574',
        obstacles: [
            { x: 200, y: 200, width: 100, height: 100, color: '#8b7355' },
            { x: 600, y: 400, width: 150, height: 80, color: '#8b7355' },
            { x: 900, y: 200, width: 120, height: 120, color: '#8b7355' },
            { x: 400, y: 600, width: 100, height: 100, color: '#8b7355' }
        ]
    },
    city: {
        name: 'Ville',
        background: '#4a4a4a',
        obstacles: [
            { x: 150, y: 150, width: 200, height: 150, color: '#2a2a2a' },
            { x: 500, y: 300, width: 180, height: 200, color: '#2a2a2a' },
            { x: 800, y: 150, width: 150, height: 250, color: '#2a2a2a' },
            { x: 300, y: 550, width: 200, height: 150, color: '#2a2a2a' },
            { x: 700, y: 600, width: 150, height: 100, color: '#2a2a2a' }
        ]
    },
    forest: {
        name: 'Forêt',
        background: '#2d5016',
        obstacles: [
            { x: 250, y: 250, width: 80, height: 80, color: '#1a3010', radius: 40 },
            { x: 550, y: 350, width: 100, height: 100, color: '#1a3010', radius: 50 },
            { x: 850, y: 250, width: 90, height: 90, color: '#1a3010', radius: 45 },
            { x: 350, y: 600, width: 80, height: 80, color: '#1a3010', radius: 40 },
            { x: 750, y: 550, width: 100, height: 100, color: '#1a3010', radius: 50 }
        ]
    }
};
