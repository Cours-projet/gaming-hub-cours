class World {
    constructor() {
        this.blocks = {};
        this.generateWorld();
    }

    generateWorld() {
        console.log('Génération du monde simple...');
        
        for (let x = -20; x < 20; x++) {
            for (let z = -20; z < 20; z++) {
                const height = 10 + Math.floor(Math.sin(x * 0.1) * 3 + Math.cos(z * 0.1) * 3);
                
                for (let y = 0; y <= height; y++) {
                    if (y === 0) {
                        this.setBlock(x, y, z, 'BEDROCK');
                    } else if (y < height - 3) {
                        this.setBlock(x, y, z, 'STONE');
                    } else if (y < height) {
                        this.setBlock(x, y, z, 'DIRT');
                    } else {
                        this.setBlock(x, y, z, 'GRASS');
                    }
                }
                
                if (Math.random() < 0.05 && height > 8) {
                    for (let ty = 0; ty < 5; ty++) {
                        this.setBlock(x, height + 1 + ty, z, 'WOOD');
                    }
                    for (let dx = -2; dx <= 2; dx++) {
                        for (let dz = -2; dz <= 2; dz++) {
                            if (Math.abs(dx) + Math.abs(dz) <= 3) {
                                this.setBlock(x + dx, height + 5, z + dz, 'LEAVES');
                                this.setBlock(x + dx, height + 6, z + dz, 'LEAVES');
                            }
                        }
                    }
                }
            }
        }
        
        console.log('✓ Monde généré');
    }

    getBlockKey(x, y, z) {
        return `${x},${y},${z}`;
    }

    getBlock(x, y, z) {
        return this.blocks[this.getBlockKey(x, y, z)] || 'AIR';
    }

    setBlock(x, y, z, type) {
        if (type === 'AIR') {
            delete this.blocks[this.getBlockKey(x, y, z)];
        } else {
            this.blocks[this.getBlockKey(x, y, z)] = type;
        }
    }
}
