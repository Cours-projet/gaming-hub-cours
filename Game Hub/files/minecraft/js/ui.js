class UI {
    constructor(game) {
        this.game = game;
        this.inventoryOpen = false;
        this.pauseOpen = false;
    }

    updateHotbar() {
        const hotbarSlots = document.getElementById('hotbarSlots');
        hotbarSlots.innerHTML = '';
        
        for (let i = 0; i < 9; i++) {
            const slot = document.createElement('div');
            slot.className = 'hotbar-slot';
            if (i === this.game.player.selectedSlot) {
                slot.classList.add('active');
            }
            
            const item = this.game.inventory.slots[i];
            if (item && item.type && item.count > 0) {
                const blockData = BLOCKS[item.type];
                slot.textContent = blockData.icon;
                
                if (item.count > 1) {
                    const count = document.createElement('div');
                    count.className = 'count';
                    count.textContent = item.count;
                    slot.appendChild(count);
                }
            }
            
            slot.addEventListener('click', () => {
                this.game.player.selectedSlot = i;
                this.updateHotbar();
            });
            
            hotbarSlots.appendChild(slot);
        }
    }

    updateHealth() {
        const hearts = document.getElementById('hearts');
        hearts.innerHTML = '';
        
        const fullHearts = Math.floor(this.game.player.health / 2);
        const halfHeart = this.game.player.health % 2;
        
        for (let i = 0; i < 10; i++) {
            const heart = document.createElement('div');
            heart.className = 'heart';
            if (i < fullHearts) {
                heart.textContent = '❤️';
            } else if (i === fullHearts && halfHeart) {
                heart.textContent = '💔';
            } else {
                heart.textContent = '🖤';
            }
            hearts.appendChild(heart);
        }
    }

    updateHunger() {
        const hunger = document.getElementById('hunger');
        hunger.innerHTML = '';
        
        const fullFood = Math.floor(this.game.player.hunger / 2);
        const halfFood = this.game.player.hunger % 2;
        
        for (let i = 0; i < 10; i++) {
            const food = document.createElement('div');
            food.className = 'food';
            if (i < fullFood) {
                food.textContent = '🍖';
            } else if (i === fullFood && halfFood) {
                food.textContent = '🥩';
            } else {
                food.textContent = '🦴';
            }
            hunger.appendChild(food);
        }
    }

    updateDebugInfo() {
        const debugInfo = document.getElementById('debugInfo');
        const pos = this.game.player.position;
        const fps = Math.round(1000 / Math.max(this.game.deltaTime, 1));
        
        debugInfo.innerHTML = `
            FPS: ${fps}<br>
            X: ${pos.x.toFixed(1)}<br>
            Y: ${pos.y.toFixed(1)}<br>
            Z: ${pos.z.toFixed(1)}<br>
            Chunks: ${this.game.world.chunks.size}
        `;
    }

    toggleInventory() {
        this.inventoryOpen = !this.inventoryOpen;
        const inventoryScreen = document.getElementById('inventory-screen');
        
        if (this.inventoryOpen) {
            inventoryScreen.classList.remove('hidden');
            this.renderInventory();
            this.game.lockPointer = false;
            document.exitPointerLock();
            document.body.classList.remove('playing');
        } else {
            inventoryScreen.classList.add('hidden');
            if (!this.pauseOpen) {
                this.game.canvas.requestPointerLock();
                this.game.lockPointer = true;
                document.body.classList.add('playing');
            }
        }
    }

    renderInventory() {
        const inventoryGrid = document.getElementById('inventoryGrid');
        inventoryGrid.innerHTML = '';
        
        for (let i = 0; i < 36; i++) {
            const slot = document.createElement('div');
            slot.className = 'inventory-slot';
            slot.dataset.index = i;
            
            const item = this.game.inventory.slots[i];
            if (item && item.type && item.count > 0) {
                const blockData = BLOCKS[item.type];
                slot.textContent = blockData.icon;
                
                if (item.count > 1) {
                    const count = document.createElement('div');
                    count.className = 'count';
                    count.textContent = item.count;
                    slot.appendChild(count);
                }
            }
            
            slot.addEventListener('click', () => {
                if (i < 9) return;
                
                const emptyHotbarSlot = this.game.inventory.slots.findIndex((s, idx) => 
                    idx < 9 && (!s.type || s.count === 0)
                );
                
                if (emptyHotbarSlot !== -1 && item && item.type && item.count > 0) {
                    this.game.inventory.swapSlots(i, emptyHotbarSlot);
                    this.renderInventory();
                    this.updateHotbar();
                }
            });
            
            inventoryGrid.appendChild(slot);
        }
    }

    togglePause() {
        this.pauseOpen = !this.pauseOpen;
        const pauseMenu = document.getElementById('pause-menu');
        
        if (this.pauseOpen) {
            pauseMenu.classList.remove('hidden');
            this.game.paused = true;
            this.game.lockPointer = false;
            document.exitPointerLock();
            document.body.classList.remove('playing');
        } else {
            pauseMenu.classList.add('hidden');
            this.game.paused = false;
            if (!this.inventoryOpen) {
                this.game.canvas.requestPointerLock();
                this.game.lockPointer = true;
                document.body.classList.add('playing');
            }
        }
    }

    update() {
        this.updateHotbar();
        this.updateHealth();
        this.updateHunger();
        this.updateDebugInfo();
    }
}
