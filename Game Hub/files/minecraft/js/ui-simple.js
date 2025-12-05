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
        
        for (let i = 0; i < 10; i++) {
            const heart = document.createElement('div');
            heart.className = 'heart';
            heart.textContent = i < Math.floor(this.game.player.health / 2) ? '❤️' : '🖤';
            hearts.appendChild(heart);
        }
    }

    updateHunger() {
        const hunger = document.getElementById('hunger');
        hunger.innerHTML = '';
        
        for (let i = 0; i < 10; i++) {
            const food = document.createElement('div');
            food.className = 'food';
            food.textContent = i < Math.floor(this.game.player.hunger / 2) ? '🍖' : '🦴';
            hunger.appendChild(food);
        }
    }

    updateDebugInfo() {
        const debugInfo = document.getElementById('debugInfo');
        const fps = Math.round(1000 / Math.max(this.game.deltaTime, 1));
        
        debugInfo.innerHTML = `
            FPS: ${fps}<br>
            X: ${this.game.player.x.toFixed(1)}<br>
            Y: ${this.game.player.y.toFixed(1)}<br>
            Z: ${this.game.player.z.toFixed(1)}
        `;
    }

    toggleInventory() {
        this.inventoryOpen = !this.inventoryOpen;
        const inventoryScreen = document.getElementById('inventory-screen');
        
        if (this.inventoryOpen) {
            inventoryScreen.classList.remove('hidden');
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
