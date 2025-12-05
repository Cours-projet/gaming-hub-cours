class Game {
    constructor() {
        console.log('Initialisation du jeu simple...');
        this.canvas = document.getElementById('gameCanvas');
        this.world = new World();
        this.player = new Player(this.world);
        this.renderer = new Renderer(this.canvas);
        this.inventory = new Inventory();
        this.ui = new UI(this);
        
        this.keys = {
            forward: false,
            backward: false,
            left: false,
            right: false,
            jump: false,
            sprint: false
        };
        
        this.mouseMovement = { x: 0, y: 0 };
        this.lockPointer = false;
        this.paused = false;
        this.lastTime = performance.now();
        this.deltaTime = 0;
        
        this.initControls();
        this.resize();
        
        console.log('✓ Jeu initialisé');
    }

    initControls() {
        window.addEventListener('keydown', (e) => {
            const key = e.key.toLowerCase();
            if (KEYS.FORWARD.includes(key)) this.keys.forward = true;
            if (KEYS.BACKWARD.includes(key)) this.keys.backward = true;
            if (KEYS.LEFT.includes(key)) this.keys.left = true;
            if (KEYS.RIGHT.includes(key)) this.keys.right = true;
            if (KEYS.JUMP.includes(key)) this.keys.jump = true;
            if (KEYS.SPRINT.includes(key)) this.keys.sprint = true;
            
            if (KEYS.INVENTORY.includes(key)) this.ui.toggleInventory();
            if (KEYS.PAUSE.includes(key)) this.ui.togglePause();
            
            const num = parseInt(key);
            if (num >= 1 && num <= 9) {
                this.player.selectedSlot = num - 1;
                this.ui.updateHotbar();
            }
        });

        window.addEventListener('keyup', (e) => {
            const key = e.key.toLowerCase();
            if (KEYS.FORWARD.includes(key)) this.keys.forward = false;
            if (KEYS.BACKWARD.includes(key)) this.keys.backward = false;
            if (KEYS.LEFT.includes(key)) this.keys.left = false;
            if (KEYS.RIGHT.includes(key)) this.keys.right = false;
            if (KEYS.JUMP.includes(key)) this.keys.jump = false;
            if (KEYS.SPRINT.includes(key)) this.keys.sprint = false;
        });

        this.canvas.addEventListener('click', () => {
            if (!this.lockPointer && !this.ui.inventoryOpen && !this.pauseOpen) {
                this.canvas.requestPointerLock();
                this.lockPointer = true;
                document.body.classList.add('playing');
            }
        });

        document.addEventListener('pointerlockchange', () => {
            this.lockPointer = document.pointerLockElement === this.canvas;
            if (!this.lockPointer) {
                document.body.classList.remove('playing');
            }
        });

        document.addEventListener('mousemove', (e) => {
            if (this.lockPointer) {
                this.mouseMovement.x = e.movementX;
                this.mouseMovement.y = CONFIG.INVERT_MOUSE ? -e.movementY : e.movementY;
            }
        });

        this.canvas.addEventListener('mousedown', (e) => {
            if (!this.lockPointer) return;
            if (e.button === 0) this.breakBlock();
            else if (e.button === 2) this.placeBlock();
        });

        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
        window.addEventListener('resize', () => this.resize());
    }

    breakBlock() {
        const target = this.player.raycast();
        if (target) {
            const blockData = BLOCKS[target.block];
            if (blockData.unbreakable) return;
            
            const dropType = blockData.drops || target.block;
            this.inventory.addItem(dropType, 1);
            this.world.setBlock(target.x, target.y, target.z, 'AIR');
            this.ui.updateHotbar();
        }
    }

    placeBlock() {
        const target = this.player.raycast();
        if (!target) return;
        
        const selectedItem = this.inventory.getSelectedItem(this.player.selectedSlot);
        if (!selectedItem || !selectedItem.type || selectedItem.count === 0) return;
        
        const dir = {
            x: Math.sin(this.player.yaw) * Math.cos(this.player.pitch),
            y: -Math.sin(this.player.pitch),
            z: Math.cos(this.player.yaw) * Math.cos(this.player.pitch)
        };
        
        let placeX = target.x;
        let placeY = target.y;
        let placeZ = target.z;
        
        for (let i = 0; i < 50; i++) {
            const testX = Math.floor(this.player.x + dir.x * i * 0.1);
            const testY = Math.floor(this.player.y + 1.6 + dir.y * i * 0.1);
            const testZ = Math.floor(this.player.z + dir.z * i * 0.1);
            
            if (testX === target.x && testY === target.y && testZ === target.z) {
                if (i > 0) {
                    placeX = Math.floor(this.player.x + dir.x * (i - 1) * 0.1);
                    placeY = Math.floor(this.player.y + 1.6 + dir.y * (i - 1) * 0.1);
                    placeZ = Math.floor(this.player.z + dir.z * (i - 1) * 0.1);
                }
                break;
            }
        }
        
        if (this.world.getBlock(placeX, placeY, placeZ) === 'AIR') {
            this.world.setBlock(placeX, placeY, placeZ, selectedItem.type);
            this.inventory.removeItem(selectedItem.type, 1);
            this.ui.updateHotbar();
        }
    }

    resize() {
        this.renderer.resize();
    }

    update() {
        const currentTime = performance.now();
        this.deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        if (this.paused) return;
        
        if (this.lockPointer) {
            this.player.rotate(
                this.mouseMovement.x * CONFIG.MOUSE_SENSITIVITY,
                this.mouseMovement.y * CONFIG.MOUSE_SENSITIVITY
            );
            this.mouseMovement.x = 0;
            this.mouseMovement.y = 0;
        }
        
        this.player.update(this.keys, this.deltaTime / 16.67);
        this.ui.update();
    }

    render() {
        this.renderer.render(this.world, this.player);
    }

    loop() {
        this.update();
        this.render();
        requestAnimationFrame(() => this.loop());
    }

    start() {
        console.log('Démarrage du jeu...');
        document.getElementById('game-container').classList.remove('hidden');
        this.resize();
        this.ui.update();
        this.paused = false;
        this.lastTime = performance.now();
        this.loop();
        
        setTimeout(() => {
            this.canvas.requestPointerLock();
            this.lockPointer = true;
            document.body.classList.add('playing');
        }, 100);
        
        console.log('✓ Jeu démarré');
    }
}
