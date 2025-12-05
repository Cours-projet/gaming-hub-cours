class World {
    constructor() {
        this.chunks = new Map();
        this.seed = Math.random() * 10000;
        this.initPerlin();
    }

    getChunkKey(chunkX, chunkZ) {
        return `${chunkX},${chunkZ}`;
    }

    getChunk(chunkX, chunkZ) {
        const key = this.getChunkKey(chunkX, chunkZ);
        if (!this.chunks.has(key)) {
            this.generateChunk(chunkX, chunkZ);
        }
        return this.chunks.get(key);
    }

    generateChunk(chunkX, chunkZ) {
        const chunk = [];
        const key = this.getChunkKey(chunkX, chunkZ);

        for (let x = 0; x < CONFIG.CHUNK_SIZE; x++) {
            chunk[x] = [];
            for (let z = 0; z < CONFIG.CHUNK_SIZE; z++) {
                chunk[x][z] = [];
                
                const worldX = chunkX * CONFIG.CHUNK_SIZE + x;
                const worldZ = chunkZ * CONFIG.CHUNK_SIZE + z;
                
                const height = this.getTerrainHeight(worldX, worldZ);
                
                for (let y = 0; y < CONFIG.WORLD_HEIGHT; y++) {
                    if (y === 0) {
                        chunk[x][z][y] = 'BEDROCK';
                    } else if (y < height - 4) {
                        chunk[x][z][y] = 'STONE';
                        if (y > 5 && y < 15 && Math.random() < 0.008) {
                            chunk[x][z][y] = 'COAL_ORE';
                        }
                        if (y > 8 && y < 20 && Math.random() < 0.004) {
                            chunk[x][z][y] = 'IRON_ORE';
                        }
                        if (y > 5 && y < 18 && Math.random() < 0.002) {
                            chunk[x][z][y] = 'GOLD_ORE';
                        }
                        if (y > 5 && y < 12 && Math.random() < 0.001) {
                            chunk[x][z][y] = 'DIAMOND_ORE';
                        }
                    } else if (y < height - 1) {
                        chunk[x][z][y] = 'DIRT';
                    } else if (y < height) {
                        chunk[x][z][y] = 'GRASS';
                    } else {
                        chunk[x][z][y] = 'AIR';
                    }
                }
                
                if (Math.random() < 0.015 && height > 18 && height < 28) {
                    this.generateTree(chunk, x, z, height);
                }
            }
        }

        this.chunks.set(key, chunk);
    }

    getTerrainHeight(x, z) {
        const noise1 = this.noise(x * 0.01, z * 0.01);
        const noise2 = this.noise(x * 0.05, z * 0.05);
        const height = 18 + noise1 * 8 + noise2 * 3;
        return Math.floor(Math.max(10, Math.min(28, height)));
    }

    noise(x, z) {
        const X = Math.floor(x) & 255;
        const Z = Math.floor(z) & 255;
        x -= Math.floor(x);
        z -= Math.floor(z);
        const u = this.fade(x);
        const v = this.fade(z);
        const a = this.p[X] + Z;
        const b = this.p[X + 1] + Z;
        return this.lerp(v,
            this.lerp(u, this.grad(this.p[a], x, z), this.grad(this.p[b], x - 1, z)),
            this.lerp(u, this.grad(this.p[a + 1], x, z - 1), this.grad(this.p[b + 1], x - 1, z - 1))
        );
    }

    fade(t) {
        return t * t * t * (t * (t * 6 - 15) + 10);
    }

    lerp(t, a, b) {
        return a + t * (b - a);
    }

    grad(hash, x, z) {
        const h = hash & 15;
        const u = h < 8 ? x : z;
        const v = h < 4 ? z : h === 12 || h === 14 ? x : 0;
        return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
    }

    initPerlin() {
        this.p = new Array(512);
        const permutation = [];
        for (let i = 0; i < 256; i++) permutation[i] = i;
        for (let i = 255; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [permutation[i], permutation[j]] = [permutation[j], permutation[i]];
        }
        for (let i = 0; i < 512; i++) {
            this.p[i] = permutation[i % 256];
        }
    }

    generateTree(chunk, x, z, baseY) {
        try {
            const treeHeight = 5 + Math.floor(Math.random() * 3);
            
            for (let y = 0; y < treeHeight; y++) {
                if (baseY + y < CONFIG.WORLD_HEIGHT && chunk[x] && chunk[x][z]) {
                    chunk[x][z][baseY + y] = 'WOOD';
                }
            }
            
            for (let dy = -2; dy <= 1; dy++) {
                for (let dx = -2; dx <= 2; dx++) {
                    for (let dz = -2; dz <= 2; dz++) {
                        const newX = x + dx;
                        const newZ = z + dz;
                        const newY = baseY + treeHeight + dy;
                        
                        if (newX >= 0 && newX < CONFIG.CHUNK_SIZE &&
                            newZ >= 0 && newZ < CONFIG.CHUNK_SIZE &&
                            newY >= 0 && newY < CONFIG.WORLD_HEIGHT &&
                            chunk[newX] && chunk[newX][newZ] && chunk[newX][newZ][newY]) {
                            if (Math.abs(dx) + Math.abs(dz) <= 3) {
                                if (chunk[newX][newZ][newY] === 'AIR') {
                                    chunk[newX][newZ][newY] = 'LEAVES';
                                }
                            }
                        }
                    }
                }
            }
        } catch (error) {
            console.warn('Erreur génération arbre:', error);
        }
    }

    getBlock(x, y, z) {
        if (y < 0 || y >= CONFIG.WORLD_HEIGHT) return 'AIR';
        
        const chunkX = Math.floor(x / CONFIG.CHUNK_SIZE);
        const chunkZ = Math.floor(z / CONFIG.CHUNK_SIZE);
        const localX = ((x % CONFIG.CHUNK_SIZE) + CONFIG.CHUNK_SIZE) % CONFIG.CHUNK_SIZE;
        const localZ = ((z % CONFIG.CHUNK_SIZE) + CONFIG.CHUNK_SIZE) % CONFIG.CHUNK_SIZE;
        
        const chunk = this.getChunk(chunkX, chunkZ);
        return chunk[localX][localZ][y];
    }

    setBlock(x, y, z, blockType) {
        if (y < 0 || y >= CONFIG.WORLD_HEIGHT) return;
        
        const chunkX = Math.floor(x / CONFIG.CHUNK_SIZE);
        const chunkZ = Math.floor(z / CONFIG.CHUNK_SIZE);
        const localX = ((x % CONFIG.CHUNK_SIZE) + CONFIG.CHUNK_SIZE) % CONFIG.CHUNK_SIZE;
        const localZ = ((z % CONFIG.CHUNK_SIZE) + CONFIG.CHUNK_SIZE) % CONFIG.CHUNK_SIZE;
        
        const chunk = this.getChunk(chunkX, chunkZ);
        chunk[localX][localZ][y] = blockType;
    }
}
