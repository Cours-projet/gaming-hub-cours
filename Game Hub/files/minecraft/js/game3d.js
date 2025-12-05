class Game {
    constructor() {
        console.log('Initialisation du jeu 3D...');
        this.canvas = document.getElementById('gameCanvas');
        if (!this.canvas) {
            throw new Error('Canvas introuvable !');
        }
        
        console.log('Création du monde...');
        this.world = new World();
        
        console.log('Création du joueur...');
        this.player = new Player(this.world);
        
        console.log('Initialisation du renderer 3D...');
        this.renderer = new Renderer3D(this.canvas);
        
        console.log('Création de l\'inventaire...');
        this.inventory = new Inventory();
        
        console.log('Création de la table de craft...');
        this.crafting = new CraftingTable();
        
        console.log('Initialisation de l\'UI...');
        this.ui = new UI(this);
        
        this.keys = {
            forward: false,
            backward: false,
            left: false,
            right: false,
            jump: false,
            sprint: false,
            sneak: false
        };
        
        this.mouseMovement = { x: 0, y: 0 };
        this.lockPointer = false;
        this.paused = false;
        this.lastTime = performance.now();
        this.deltaTime = 0;
        
        console.log('Configuration des contrôles...');
        this.initControls();
        
        console.log('Redimensionnement...');
        this.resize();
        
        console.log('✓ Game 3D initialisé avec succès');
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
            if (KEYS.SNEAK.includes(key)) this.keys.sneak = true;
            
            if (KEYS.INVENTORY.includes(key)) {
                this.ui.toggleInventory();
            }
            
            if (KEYS.PAUSE.includes(key)) {
                this.ui.togglePause();
            }
            
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
            if (KEYS.SNEAK.includes(key)) this.keys.sneak = false;
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
            
            if (e.button === 0) {
                this.breakBlock();
            } else if (e.button === 2) {
                this.placeBlock();
            }
        });

        this.canvas.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });

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
            this.renderer.removeBlock(target.x, target.y, target.z);
            this.ui.updateHotbar();
        }
    }

    placeBlock() {
        const target = this.player.raycast();
        if (!target) return;
        
        const selectedItem = this.inventory.getSelectedItem(this.player.selectedSlot);
        if (!selectedItem || !selectedItem.type || selectedItem.count === 0) return;
        
        const dir = this.player.getViewDirection();
        const step = 0.1;
        let placeX = target.x;
        let placeY = target.y;
        let placeZ = target.z;
        
        const start = {
            x: this.player.position.x,
            y: this.player.position.y + this.player.eyeHeight,
            z: this.player.position.z
        };
        
        for (let i = 0; i < CONFIG.REACH_DISTANCE / step; i++) {
            const testX = Math.floor(start.x + dir.x * i * step);
            const testY = Math.floor(start.y + dir.y * i * step);
            const testZ = Math.floor(start.z + dir.z * i * step);
            
            if (testX === target.x && testY === target.y && testZ === target.z) {
                if (i > 0) {
                    placeX = Math.floor(start.x + dir.x * (i - 1) * step);
                    placeY = Math.floor(start.y + dir.y * (i - 1) * step);
                    placeZ = Math.floor(start.z + dir.z * (i - 1) * step);
                }
                break;
            }
        }
        
        if (this.world.getBlock(placeX, placeY, placeZ) === 'AIR') {
            const playerBlockX = Math.floor(this.player.position.x);
            const playerBlockY = Math.floor(this.player.position.y);
            const playerBlockZ = Math.floor(this.player.position.z);
            
            if (placeX === playerBlockX && placeY === playerBlockY && placeZ === playerBlockZ) {
                return;
            }
            
            const blockData = BLOCKS[selectedItem.type];
            if (blockData) {
                this.world.setBlock(placeX, placeY, placeZ, selectedItem.type);
                this.renderer.addBlock(placeX, placeY, placeZ, selectedItem.type);
                this.inventory.removeItem(selectedItem.type, 1);
                this.ui.updateHotbar();
            }
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
        try {
            this.renderer.render(this.world, this.player);
        } catch (error) {
            console.error('Erreur de rendu:', error);
        }
    }

    loop() {
        try {
            this.update();
            this.render();
        } catch (error) {
            console.error('Erreur dans la boucle de jeu:', error);
        }
        requestAnimationFrame(() => this.loop());
    }

    start() {
        try {
            console.log('Affichage du conteneur de jeu...');
            const gameContainer = document.getElementById('game-container');
            if (!gameContainer) {
                throw new Error('Conteneur de jeu introuvable !');
            }
            gameContainer.classList.remove('hidden');
            
            console.log('Initialisation du rendu...');
            this.resize();
            
            console.log('Premier rendu...');
            this.render();
            
            console.log('Mise à jour de l\'UI...');
            this.ui.update();
            
            console.log('Démarrage de la boucle de jeu...');
            this.paused = false;
            this.lastTime = performance.now();
            this.loop();
            
            console.log('Demande de verrouillage du pointeur...');
            setTimeout(() => {
                try {
                    this.canvas.requestPointerLock();
                    this.lockPointer = true;
                    document.body.classList.add('playing');
                    console.log('✓ Pointeur verrouillé');
                } catch (e) {
                    console.warn('Impossible de verrouiller le pointeur:', e);
                }
            }, 100);
            
            console.log('✓ Jeu 3D démarré avec succès !');
        } catch (error) {
            console.error('❌ Erreur dans start():', error);
            throw error;
        }
    }
}
