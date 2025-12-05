class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = canvas.width = window.innerWidth;
        this.height = canvas.height = window.innerHeight;
        
        this.blockTextures = this.createTextures();
    }

    createTextures() {
        const textures = {};
        
        for (const [name, block] of Object.entries(BLOCKS)) {
            if (block.id === 0) continue;
            
            const canvas = document.createElement('canvas');
            canvas.width = 16;
            canvas.height = 16;
            const ctx = canvas.getContext('2d');
            
            const r = Math.floor(block.color[0] * 255);
            const g = Math.floor(block.color[1] * 255);
            const b = Math.floor(block.color[2] * 255);
            
            ctx.fillStyle = `rgb(${r},${g},${b})`;
            ctx.fillRect(0, 0, 16, 16);
            
            ctx.strokeStyle = `rgb(${r * 0.7},${g * 0.7},${b * 0.7})`;
            ctx.lineWidth = 1;
            for (let i = 0; i < 16; i += 4) {
                ctx.strokeRect(i, i, 4, 4);
            }
            
            textures[name] = canvas;
        }
        
        return textures;
    }

    resize() {
        this.width = this.canvas.width = window.innerWidth;
        this.height = this.canvas.height = window.innerHeight;
    }

    render(world, player) {
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(0.7, '#B0E0E6');
        gradient.addColorStop(1, '#90EE90');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        const blocks = [];
        
        for (let x = Math.floor(player.x) - 15; x < Math.floor(player.x) + 15; x++) {
            for (let z = Math.floor(player.z) - 15; z < Math.floor(player.z) + 15; z++) {
                for (let y = Math.floor(player.y) - 5; y < Math.floor(player.y) + 10; y++) {
                    const block = world.getBlock(x, y, z);
                    if (block !== 'AIR') {
                        const dx = x - player.x;
                        const dy = y - player.y - 1.6;
                        const dz = z - player.z;
                        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
                        
                        blocks.push({ x, y, z, type: block, dist });
                    }
                }
            }
        }
        
        blocks.sort((a, b) => b.dist - a.dist);
        
        blocks.slice(0, 300).forEach(block => {
            this.renderBlock(block, player);
        });
        
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '12px Arial';
        this.ctx.fillText(`Blocs: ${blocks.length}`, 10, this.height - 10);
    }

    renderBlock(block, player) {
        const dx = block.x + 0.5 - player.x;
        const dy = block.y + 0.5 - player.y - 1.6;
        const dz = block.z + 0.5 - player.z;
        
        const cosYaw = Math.cos(player.yaw);
        const sinYaw = Math.sin(player.yaw);
        const cosPitch = Math.cos(player.pitch);
        const sinPitch = Math.sin(player.pitch);
        
        const x1 = dx * cosYaw + dz * sinYaw;
        const z1 = -dx * sinYaw + dz * cosYaw;
        const y1 = dy * cosPitch - z1 * sinPitch;
        const z2 = dy * sinPitch + z1 * cosPitch;
        
        if (z2 < 0.1) return;
        
        const scale = 400 / z2;
        const screenX = x1 * scale + this.width / 2;
        const screenY = y1 * scale + this.height / 2;
        const size = scale * 0.8;
        
        if (screenX + size < 0 || screenX - size > this.width ||
            screenY + size < 0 || screenY - size > this.height) {
            return;
        }
        
        const brightness = Math.max(0.4, 1 - z2 / 30);
        
        this.ctx.save();
        this.ctx.globalAlpha = brightness;
        
        const texture = this.blockTextures[block.type];
        if (texture) {
            this.ctx.drawImage(texture, screenX - size / 2, screenY - size / 2, size, size);
        }
        
        this.ctx.strokeStyle = `rgba(0,0,0,${0.3 * brightness})`;
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(screenX - size / 2, screenY - size / 2, size, size);
        
        this.ctx.restore();
    }
}
