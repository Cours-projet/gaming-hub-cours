class Player {
    constructor(world) {
        this.world = world;
        this.x = 0;
        this.y = 15;
        this.z = 0;
        this.vx = 0;
        this.vy = 0;
        this.vz = 0;
        this.yaw = 0;
        this.pitch = 0;
        this.onGround = false;
        this.health = 20;
        this.hunger = 20;
        this.selectedSlot = 0;
    }

    update(keys, dt) {
        const speed = keys.sprint ? 0.2 : 0.1;
        
        let moveX = 0;
        let moveZ = 0;
        
        if (keys.forward) moveZ += 1;
        if (keys.backward) moveZ -= 1;
        if (keys.left) moveX -= 1;
        if (keys.right) moveX += 1;
        
        if (moveX !== 0 || moveZ !== 0) {
            const angle = this.yaw;
            this.vx = (Math.sin(angle) * moveZ + Math.cos(angle) * moveX) * speed;
            this.vz = (Math.cos(angle) * moveZ - Math.sin(angle) * moveX) * speed;
        } else {
            this.vx *= 0.8;
            this.vz *= 0.8;
        }
        
        if (keys.jump && this.onGround) {
            this.vy = 0.4;
            this.onGround = false;
        }
        
        this.vy -= 0.02;
        
        this.x += this.vx;
        this.y += this.vy;
        this.z += this.vz;
        
        this.checkCollision();
    }

    checkCollision() {
        this.onGround = false;
        
        for (let dx = -0.3; dx <= 0.3; dx += 0.3) {
            for (let dz = -0.3; dz <= 0.3; dz += 0.3) {
                const blockX = Math.floor(this.x + dx);
                const blockY = Math.floor(this.y - 0.1);
                const blockZ = Math.floor(this.z + dz);
                
                if (this.world.getBlock(blockX, blockY, blockZ) !== 'AIR') {
                    this.y = blockY + 1;
                    this.vy = 0;
                    this.onGround = true;
                }
            }
        }
        
        if (this.y < 0) {
            this.y = 15;
            this.vy = 0;
        }
    }

    rotate(dx, dy) {
        this.yaw += dx;
        this.pitch += dy;
        this.pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.pitch));
    }

    raycast() {
        const dir = {
            x: Math.sin(this.yaw) * Math.cos(this.pitch),
            y: -Math.sin(this.pitch),
            z: Math.cos(this.yaw) * Math.cos(this.pitch)
        };
        
        for (let i = 0; i < 50; i++) {
            const x = Math.floor(this.x + dir.x * i * 0.1);
            const y = Math.floor(this.y + 1.6 + dir.y * i * 0.1);
            const z = Math.floor(this.z + dir.z * i * 0.1);
            
            const block = this.world.getBlock(x, y, z);
            if (block !== 'AIR') {
                return { x, y, z, block };
            }
        }
        return null;
    }
}
