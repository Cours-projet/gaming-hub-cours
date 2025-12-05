class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d', { alpha: false });
        this.width = canvas.width;
        this.height = canvas.height;
        this.depthBuffer = [];
    }

    resize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        console.log(`Canvas redimensionné: ${this.width}x${this.height}`);
    }

    clear() {
        try {
            const gradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
            gradient.addColorStop(0, '#87CEEB');
            gradient.addColorStop(0.5, '#B0E0E6');
            gradient.addColorStop(1, '#90EE90');
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(0, 0, this.width, this.height);
            
            this.depthBuffer = new Array(this.width * this.height).fill(Infinity);
        } catch (error) {
            console.error('Erreur lors du clear:', error);
            this.ctx.fillStyle = '#87CEEB';
            this.ctx.fillRect(0, 0, this.width, this.height);
        }
    }

    render(world, player) {
        this.clear();
        
        try {
            const playerChunkX = Math.floor(player.position.x / CONFIG.CHUNK_SIZE);
            const playerChunkZ = Math.floor(player.position.z / CONFIG.CHUNK_SIZE);
            const playerY = Math.floor(player.position.y);
            
            const blocks = [];
            const maxDistance = CONFIG.RENDER_DISTANCE * CONFIG.CHUNK_SIZE;
            
            for (let cx = -CONFIG.RENDER_DISTANCE; cx <= CONFIG.RENDER_DISTANCE; cx++) {
                for (let cz = -CONFIG.RENDER_DISTANCE; cz <= CONFIG.RENDER_DISTANCE; cz++) {
                    const chunkX = playerChunkX + cx;
                    const chunkZ = playerChunkZ + cz;
                    
                    try {
                        const chunk = world.getChunk(chunkX, chunkZ);
                        
                        for (let x = 0; x < CONFIG.CHUNK_SIZE; x += 1) {
                            for (let z = 0; z < CONFIG.CHUNK_SIZE; z += 1) {
                                const minY = Math.max(0, playerY - 10);
                                const maxY = Math.min(CONFIG.WORLD_HEIGHT, playerY + 10);
                                
                                for (let y = minY; y < maxY; y++) {
                                    const blockType = chunk[x][z][y];
                                    if (blockType !== 'AIR') {
                                        const worldX = chunkX * CONFIG.CHUNK_SIZE + x;
                                        const worldZ = chunkZ * CONFIG.CHUNK_SIZE + z;
                                        
                                        const dx = worldX - player.position.x;
                                        const dy = y - player.position.y;
                                        const dz = worldZ - player.position.z;
                                        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
                                        
                                        if (distance < maxDistance) {
                                            blocks.push({
                                                x: worldX,
                                                y: y,
                                                z: worldZ,
                                                type: blockType,
                                                distance: distance
                                            });
                                        }
                                    }
                                }
                            }
                        }
                    } catch (chunkError) {
                        console.error(`Erreur chunk ${chunkX},${chunkZ}:`, chunkError);
                    }
                }
            }
            
            blocks.sort((a, b) => b.distance - a.distance);
            
            const maxBlocks = Math.min(blocks.length, CONFIG.MAX_BLOCKS_RENDER);
            let rendered = 0;
            
            for (let i = 0; i < maxBlocks; i++) {
                try {
                    this.renderBlock(blocks[i], player);
                    rendered++;
                } catch (blockError) {
                    console.error('Erreur rendu bloc:', blockError);
                }
            }
            
            this.ctx.fillStyle = '#fff';
            this.ctx.font = '12px Arial';
            this.ctx.textAlign = 'left';
            this.ctx.fillText(`Blocs: ${rendered}/${blocks.length}`, 10, this.height - 10);
            
            if (rendered === 0) {
                this.ctx.font = '20px Arial';
                this.ctx.textAlign = 'center';
                this.ctx.fillText('Chargement du monde...', this.width / 2, this.height / 2);
            }
            
        } catch (error) {
            console.error('Erreur de rendu globale:', error);
            this.ctx.fillStyle = '#fff';
            this.ctx.font = '16px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('Erreur de rendu', this.width / 2, this.height / 2);
        }
    }

    renderBlock(block, player) {
        const blockData = BLOCKS[block.type];
        if (!blockData) return;
        
        const relX = block.x + 0.5 - player.position.x;
        const relY = block.y + 0.5 - (player.position.y + player.eyeHeight);
        const relZ = block.z + 0.5 - player.position.z;
        
        const yaw = player.rotation.yaw;
        const pitch = player.rotation.pitch;
        
        const cosYaw = Math.cos(yaw);
        const sinYaw = Math.sin(yaw);
        const cosPitch = Math.cos(pitch);
        const sinPitch = Math.sin(pitch);
        
        const x1 = relX * cosYaw + relZ * sinYaw;
        const z1 = -relX * sinYaw + relZ * cosYaw;
        const y1 = relY * cosPitch - z1 * sinPitch;
        const z2 = relY * sinPitch + z1 * cosPitch;
        
        if (z2 < 0.1) return;
        
        const scale = (this.width / 2) / Math.tan(CONFIG.FOV * Math.PI / 360);
        const screenX = (x1 / z2) * scale + this.width / 2;
        const screenY = (y1 / z2) * scale + this.height / 2;
        const size = (CONFIG.BLOCK_SIZE / z2) * scale * 1.5;
        
        if (screenX + size < 0 || screenX - size > this.width ||
            screenY + size < 0 || screenY - size > this.height) {
            return;
        }
        
        const brightness = Math.max(0.4, 1 - z2 / (CONFIG.RENDER_DISTANCE * CONFIG.CHUNK_SIZE * 0.8));
        const color = blockData.color;
        
        const r = Math.floor(color[0] * 255 * brightness);
        const g = Math.floor(color[1] * 255 * brightness);
        const b = Math.floor(color[2] * 255 * brightness);
        const a = color[3] !== undefined ? color[3] : 1;
        
        this.ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${a})`;
        this.ctx.fillRect(screenX - size / 2, screenY - size / 2, size, size);
        
        this.ctx.strokeStyle = `rgba(0, 0, 0, ${0.4 * brightness})`;
        this.ctx.lineWidth = Math.max(1, size / 20);
        this.ctx.strokeRect(screenX - size / 2, screenY - size / 2, size, size);
        
        if (size > 20 && blockData.icon) {
            this.ctx.font = `${size * 0.6}px Arial`;
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(blockData.icon, screenX, screenY);
        }
    }
}
