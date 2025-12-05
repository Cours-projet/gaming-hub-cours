let scene, camera, renderer, world = {}, player, controls;
let keys = {};
let selectedBlock = 'GRASS';
let inventory = { 
    GRASS: 64, 
    DIRT: 64, 
    STONE: 64, 
    WOOD: 64,
    COBBLESTONE: 32,
    PLANKS: 32,
    COAL_ORE: 0,
    IRON_ORE: 0,
    GOLD_ORE: 0,
    DIAMOND_ORE: 0
};

const BLOCKS = {
    GRASS: 0x7CFC00,
    DIRT: 0x8B4513,
    STONE: 0x808080,
    COBBLESTONE: 0x696969,
    WOOD: 0x8B4513,
    PLANKS: 0xDEB887,
    LEAVES: 0x228B22,
    COAL_ORE: 0x2F2F2F,
    IRON_ORE: 0xD8AF93,
    GOLD_ORE: 0xFFD700,
    DIAMOND_ORE: 0x5DADE2,
    BEDROCK: 0x1a1a1a,
    SAND: 0xF4A460,
    GLASS: 0xE0FFFF,
    WATER: 0x1E90FF
};

function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB);
    scene.fog = new THREE.Fog(0x87CEEB, 0, 100);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 20, 0);

    renderer = new THREE.WebGLRenderer({ 
        canvas: document.getElementById('gameCanvas'),
        antialias: false 
    });
    renderer.setSize(window.innerWidth, window.innerHeight);

    const light = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(light);
    
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.6);
    dirLight.position.set(10, 20, 10);
    scene.add(dirLight);

    player = {
        position: new THREE.Vector3(0, 20, 0),
        velocity: new THREE.Vector3(0, 0, 0),
        rotation: new THREE.Euler(0, 0, 0, 'YXZ'),
        onGround: false
    };

    controls = {
        moveForward: false,
        moveBackward: false,
        moveLeft: false,
        moveRight: false,
        jump: false,
        sprint: false
    };

    generateWorld();
    setupControls();
    updateHUD();
    animate();
    
    console.log('✓ Jeu initialisé');
    document.getElementById('loading-screen').classList.add('hidden');
    document.getElementById('main-menu').classList.remove('hidden');
}

function generateWorld() {
    console.log('Génération du monde...');
    
    for (let x = -30; x <= 30; x++) {
        for (let z = -30; z <= 30; z++) {
            const height = 12 + Math.floor(Math.sin(x * 0.1) * 4 + Math.cos(z * 0.1) * 4);
            
            for (let y = 0; y <= height; y++) {
                if (y === 0) {
                    addBlock(x, y, z, 'BEDROCK');
                } else if (y === height) {
                    addBlock(x, y, z, 'GRASS');
                } else if (y >= height - 3) {
                    addBlock(x, y, z, 'DIRT');
                } else {
                    addBlock(x, y, z, 'STONE');
                    
                    if (y < 10 && Math.random() < 0.02) {
                        addBlock(x, y, z, 'COAL_ORE');
                    }
                    if (y < 8 && Math.random() < 0.01) {
                        addBlock(x, y, z, 'IRON_ORE');
                    }
                    if (y < 6 && Math.random() < 0.005) {
                        addBlock(x, y, z, 'GOLD_ORE');
                    }
                    if (y < 4 && Math.random() < 0.002) {
                        addBlock(x, y, z, 'DIAMOND_ORE');
                    }
                }
            }
            
            if (Math.random() < 0.02 && height > 10) {
                for (let ty = 1; ty <= 5; ty++) {
                    addBlock(x, height + ty, z, 'WOOD');
                }
                for (let dx = -2; dx <= 2; dx++) {
                    for (let dz = -2; dz <= 2; dz++) {
                        for (let dy = 4; dy <= 6; dy++) {
                            if (Math.abs(dx) + Math.abs(dz) <= 3) {
                                addBlock(x + dx, height + dy, z + dz, 'LEAVES');
                            }
                        }
                    }
                }
            }
        }
    }
    
    console.log('✓ Monde généré avec minerais');
}

function addBlock(x, y, z, type) {
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshLambertMaterial({ color: BLOCKS[type] });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, z);
    mesh.userData = { type, x, y, z };
    scene.add(mesh);
    world[`${x},${y},${z}`] = mesh;
}

function removeBlock(x, y, z) {
    const key = `${x},${y},${z}`;
    if (world[key]) {
        scene.remove(world[key]);
        world[key].geometry.dispose();
        world[key].material.dispose();
        delete world[key];
    }
}

function setupControls() {
    document.addEventListener('keydown', (e) => {
        keys[e.key.toLowerCase()] = true;
        
        if (e.key === 'w' || e.key === 'z') controls.moveForward = true;
        if (e.key === 's') controls.moveBackward = true;
        if (e.key === 'a' || e.key === 'q') controls.moveLeft = true;
        if (e.key === 'd') controls.moveRight = true;
        if (e.key === ' ') controls.jump = true;
        if (e.key === 'Shift') controls.sprint = true;
        
        const num = parseInt(e.key);
        if (num >= 1 && num <= 9) {
            const blocks = ['GRASS', 'DIRT', 'STONE', 'COBBLESTONE', 'WOOD', 'PLANKS', 'COAL_ORE', 'IRON_ORE', 'DIAMOND_ORE'];
            if (blocks[num - 1]) {
                selectedBlock = blocks[num - 1];
                updateHUD();
            }
        }
        
        if (e.key.toLowerCase() === 'e') {
            showInventory();
        }
    });

    document.addEventListener('keyup', (e) => {
        keys[e.key.toLowerCase()] = false;
        
        if (e.key === 'w' || e.key === 'z') controls.moveForward = false;
        if (e.key === 's') controls.moveBackward = false;
        if (e.key === 'a' || e.key === 'q') controls.moveLeft = false;
        if (e.key === 'd') controls.moveRight = false;
        if (e.key === ' ') controls.jump = false;
        if (e.key === 'Shift') controls.sprint = false;
    });

    let locked = false;
    document.getElementById('gameCanvas').addEventListener('click', () => {
        if (!locked) {
            document.getElementById('gameCanvas').requestPointerLock();
        }
    });

    document.addEventListener('pointerlockchange', () => {
        locked = document.pointerLockElement === document.getElementById('gameCanvas');
        document.body.classList.toggle('playing', locked);
    });

    document.addEventListener('mousemove', (e) => {
        if (document.pointerLockElement === document.getElementById('gameCanvas')) {
            player.rotation.y -= e.movementX * 0.002;
            player.rotation.x += e.movementY * 0.002;
            player.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, player.rotation.x));
        }
    });

    document.getElementById('gameCanvas').addEventListener('mousedown', (e) => {
        if (document.pointerLockElement !== document.getElementById('gameCanvas')) return;
        
        if (e.button === 0) {
            breakBlock();
        } else if (e.button === 2) {
            placeBlock();
        }
    });

    document.getElementById('gameCanvas').addEventListener('contextmenu', (e) => {
        e.preventDefault();
    });

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

function breakBlock() {
    const raycaster = new THREE.Raycaster();
    const direction = new THREE.Vector3();
    camera.getWorldDirection(direction);
    raycaster.set(camera.position, direction);

    const intersects = raycaster.intersectObjects(scene.children);
    if (intersects.length > 0) {
        const block = intersects[0].object;
        if (block.userData.type) {
            if (block.userData.type === 'BEDROCK') {
                return;
            }
            
            let dropType = block.userData.type;
            if (block.userData.type === 'STONE') {
                dropType = 'COBBLESTONE';
            }
            
            inventory[dropType] = (inventory[dropType] || 0) + 1;
            removeBlock(block.userData.x, block.userData.y, block.userData.z);
            updateHUD();
        }
    }
}

function placeBlock() {
    if (!inventory[selectedBlock] || inventory[selectedBlock] <= 0) return;

    const raycaster = new THREE.Raycaster();
    const direction = new THREE.Vector3();
    camera.getWorldDirection(direction);
    raycaster.set(camera.position, direction);

    const intersects = raycaster.intersectObjects(scene.children);
    if (intersects.length > 0) {
        const point = intersects[0].point;
        const normal = intersects[0].face.normal;
        
        const x = Math.floor(point.x + normal.x * 0.5);
        const y = Math.floor(point.y + normal.y * 0.5);
        const z = Math.floor(point.z + normal.z * 0.5);
        
        const playerX = Math.floor(player.position.x);
        const playerY = Math.floor(player.position.y);
        const playerZ = Math.floor(player.position.z);
        
        if (x !== playerX || y !== playerY || z !== playerZ) {
            if (!world[`${x},${y},${z}`]) {
                addBlock(x, y, z, selectedBlock);
                inventory[selectedBlock]--;
                updateHUD();
            }
        }
    }
}

function updatePlayer() {
    const speed = controls.sprint ? 0.15 : 0.1;
    const direction = new THREE.Vector3();

    if (controls.moveForward) direction.z -= 1;
    if (controls.moveBackward) direction.z += 1;
    if (controls.moveLeft) direction.x -= 1;
    if (controls.moveRight) direction.x += 1;

    direction.normalize();
    direction.applyEuler(new THREE.Euler(0, player.rotation.y, 0));

    player.velocity.x = direction.x * speed;
    player.velocity.z = direction.z * speed;

    if (controls.jump && player.onGround) {
        player.velocity.y = 0.3;
        player.onGround = false;
    }

    player.velocity.y -= 0.01;

    player.position.add(player.velocity);

    player.onGround = false;
    const checkY = Math.floor(player.position.y - 1.8);
    const checkX = Math.floor(player.position.x);
    const checkZ = Math.floor(player.position.z);

    if (world[`${checkX},${checkY},${checkZ}`]) {
        player.position.y = checkY + 2.8;
        player.velocity.y = 0;
        player.onGround = true;
    }

    if (player.position.y < 0) {
        player.position.y = 20;
        player.velocity.y = 0;
    }

    camera.position.copy(player.position);
    camera.rotation.copy(player.rotation);
}

function updateHUD() {
    const hotbar = document.getElementById('hotbarSlots');
    hotbar.innerHTML = '';
    
    const hotbarBlocks = ['GRASS', 'DIRT', 'STONE', 'COBBLESTONE', 'WOOD', 'PLANKS', 'COAL_ORE', 'IRON_ORE', 'DIAMOND_ORE'];
    
    hotbarBlocks.forEach((block, i) => {
        const slot = document.createElement('div');
        slot.className = 'hotbar-slot';
        if (block === selectedBlock) slot.classList.add('active');
        
        slot.style.background = `#${BLOCKS[block].toString(16).padStart(6, '0')}`;
        slot.style.border = block === selectedBlock ? '3px solid #fff' : '2px solid #000';
        
        const count = document.createElement('div');
        count.className = 'count';
        count.textContent = inventory[block] || 0;
        count.style.color = '#fff';
        count.style.textShadow = '1px 1px 0 #000';
        slot.appendChild(count);
        
        const num = document.createElement('div');
        num.style.position = 'absolute';
        num.style.top = '2px';
        num.style.left = '4px';
        num.style.fontSize = '10px';
        num.style.color = '#fff';
        num.style.textShadow = '1px 1px 0 #000';
        num.textContent = i + 1;
        slot.appendChild(num);
        
        slot.addEventListener('click', () => {
            selectedBlock = block;
            updateHUD();
        });
        
        hotbar.appendChild(slot);
    });

    document.getElementById('debugInfo').innerHTML = `
        FPS: 60<br>
        X: ${player.position.x.toFixed(1)}<br>
        Y: ${player.position.y.toFixed(1)}<br>
        Z: ${player.position.z.toFixed(1)}<br>
        Blocs: ${Object.keys(world).length}
    `;
}

function showInventory() {
    const invScreen = document.getElementById('inventory-screen');
    if (invScreen.classList.contains('hidden')) {
        invScreen.classList.remove('hidden');
        document.exitPointerLock();
        
        const grid = document.getElementById('inventoryGrid');
        grid.innerHTML = '';
        
        Object.keys(inventory).forEach(block => {
            if (inventory[block] > 0) {
                const slot = document.createElement('div');
                slot.className = 'inventory-slot';
                slot.style.background = `#${BLOCKS[block].toString(16).padStart(6, '0')}`;
                
                const name = document.createElement('div');
                name.style.fontSize = '0.4rem';
                name.style.color = '#fff';
                name.style.textShadow = '1px 1px 0 #000';
                name.textContent = block.replace('_', ' ');
                slot.appendChild(name);
                
                const count = document.createElement('div');
                count.style.fontSize = '0.6rem';
                count.style.color = '#55ff55';
                count.style.textShadow = '1px 1px 0 #000';
                count.textContent = inventory[block];
                slot.appendChild(count);
                
                grid.appendChild(slot);
            }
        });
    } else {
        invScreen.classList.add('hidden');
        document.getElementById('gameCanvas').requestPointerLock();
    }
}

function animate() {
    requestAnimationFrame(animate);
    updatePlayer();
    updateHUD();
    renderer.render(scene, camera);
}

window.addEventListener('DOMContentLoaded', () => {
    document.getElementById('loadingProgress').style.width = '100%';
    setTimeout(init, 500);
});

document.getElementById('singleplayerBtn').addEventListener('click', () => {
    document.getElementById('main-menu').classList.add('hidden');
    document.getElementById('game-container').classList.remove('hidden');
    setTimeout(() => {
        document.getElementById('gameCanvas').requestPointerLock();
    }, 100);
});

document.getElementById('quitBtn').addEventListener('click', () => {
    if (confirm('Quitter le jeu ?')) {
        window.history.back();
    }
});
