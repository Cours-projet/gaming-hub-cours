class Player {
    constructor(world) {
        this.world = world;
        this.position = { x: 8, y: 50, z: 8 };
        this.velocity = { x: 0, y: 0, z: 0 };
        this.rotation = { yaw: 0, pitch: 0 };
        this.onGround = false;
        this.health = 20;
        this.hunger = 20;
        this.selectedSlot = 0;
        this.isSprinting = false;
        this.isSneaking = false;
        this.width = 0.6;
        this.height = 1.8;
        this.eyeHeight = 1.62;
        
        for (let y = 60; y > 0; y--) {
            const block = this.world.getBlock(Math.floor(this.position.x), y, Math.floor(this.position.z));
            if (BLOCKS[block] && BLOCKS[block].solid) {
                this.position.y = y + 2;
                break;
            }
        }
    }

    update(keys, deltaTime) {
        this.handleMovement(keys, deltaTime);
        this.applyGravity(deltaTime);
        this.checkCollisions();
        this.updatePosition(deltaTime);
    }

    handleMovement(keys, deltaTime) {
        const speed = this.isSprinting ? CONFIG.SPRINT_SPEED : CONFIG.MOVE_SPEED;
        let forward = 0;
        let strafe = 0;

        if (keys.forward) forward += 1;
        if (keys.backward) forward -= 1;
        if (keys.left) strafe -= 1;
        if (keys.right) strafe += 1;

        if (forward !== 0 || strafe !== 0) {
            const angle = this.rotation.yaw;
            const moveX = (Math.sin(angle) * forward + Math.cos(angle) * strafe) * speed;
            const moveZ = (Math.cos(angle) * forward - Math.sin(angle) * strafe) * speed;
            
            this.velocity.x = moveX;
            this.velocity.z = moveZ;
        } else {
            this.velocity.x *= 0.8;
            this.velocity.z *= 0.8;
        }

        if (keys.jump && this.onGround) {
            this.velocity.y = CONFIG.JUMP_FORCE;
            this.onGround = false;
        }

        this.isSprinting = keys.sprint && forward > 0;
        this.isSneaking = keys.sneak;
    }

    applyGravity(deltaTime) {
        if (!this.onGround) {
            this.velocity.y -= CONFIG.GRAVITY * deltaTime;
        }
    }

    checkCollisions() {
        this.onGround = false;
        
        const minX = Math.floor(this.position.x - this.width / 2);
        const maxX = Math.ceil(this.position.x + this.width / 2);
        const minY = Math.floor(this.position.y);
        const maxY = Math.ceil(this.position.y + this.height);
        const minZ = Math.floor(this.position.z - this.width / 2);
        const maxZ = Math.ceil(this.position.z + this.width / 2);

        for (let x = minX; x <= maxX; x++) {
            for (let y = minY; y <= maxY; y++) {
                for (let z = minZ; z <= maxZ; z++) {
                    const block = this.world.getBlock(x, y, z);
                    const blockData = BLOCKS[block];
                    
                    if (blockData && blockData.solid) {
                        const blockMinX = x;
                        const blockMaxX = x + 1;
                        const blockMinY = y;
                        const blockMaxY = y + 1;
                        const blockMinZ = z;
                        const blockMaxZ = z + 1;
                        
                        const playerMinX = this.position.x - this.width / 2;
                        const playerMaxX = this.position.x + this.width / 2;
                        const playerMinY = this.position.y;
                        const playerMaxY = this.position.y + this.height;
                        const playerMinZ = this.position.z - this.width / 2;
                        const playerMaxZ = this.position.z + this.width / 2;
                        
                        if (playerMaxX > blockMinX && playerMinX < blockMaxX &&
                            playerMaxY > blockMinY && playerMinY < blockMaxY &&
                            playerMaxZ > blockMinZ && playerMinZ < blockMaxZ) {
                            
                            if (this.velocity.y < 0) {
                                this.position.y = blockMaxY;
                                this.velocity.y = 0;
                                this.onGround = true;
                            } else if (this.velocity.y > 0) {
                                this.position.y = blockMinY - this.height;
                                this.velocity.y = 0;
                            }
                            
                            if (this.velocity.x > 0) {
                                this.position.x = blockMinX - this.width / 2 - 0.01;
                                this.velocity.x = 0;
                            } else if (this.velocity.x < 0) {
                                this.position.x = blockMaxX + this.width / 2 + 0.01;
                                this.velocity.x = 0;
                            }
                            
                            if (this.velocity.z > 0) {
                                this.position.z = blockMinZ - this.width / 2 - 0.01;
                                this.velocity.z = 0;
                            } else if (this.velocity.z < 0) {
                                this.position.z = blockMaxZ + this.width / 2 + 0.01;
                                this.velocity.z = 0;
                            }
                        }
                    }
                }
            }
        }
    }

    updatePosition(deltaTime) {
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
        this.position.z += this.velocity.z;
    }

    rotate(deltaYaw, deltaPitch) {
        this.rotation.yaw += deltaYaw;
        this.rotation.pitch += deltaPitch;
        
        this.rotation.pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.rotation.pitch));
    }

    getViewDirection() {
        const yaw = this.rotation.yaw;
        const pitch = this.rotation.pitch;
        
        return {
            x: Math.sin(yaw) * Math.cos(pitch),
            y: -Math.sin(pitch),
            z: Math.cos(yaw) * Math.cos(pitch)
        };
    }

    raycast() {
        const start = {
            x: this.position.x,
            y: this.position.y + this.eyeHeight,
            z: this.position.z
        };
        
        const dir = this.getViewDirection();
        const step = 0.1;
        
        for (let i = 0; i < CONFIG.REACH_DISTANCE / step; i++) {
            const x = Math.floor(start.x + dir.x * i * step);
            const y = Math.floor(start.y + dir.y * i * step);
            const z = Math.floor(start.z + dir.z * i * step);
            
            const block = this.world.getBlock(x, y, z);
            const blockData = BLOCKS[block];
            
            if (blockData && blockData.solid) {
                return { x, y, z, block };
            }
        }
        
        return null;
    }

    takeDamage(amount) {
        this.health = Math.max(0, this.health - amount);
    }

    heal(amount) {
        this.health = Math.min(20, this.health + amount);
    }
}
