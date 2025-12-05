class Renderer3D {
    constructor(canvas) {
        this.canvas = canvas;
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87CEEB);
        this.scene.fog = new THREE.Fog(0x87CEEB, 10, 80);
        
        this.camera = new THREE.PerspectiveCamera(
            CONFIG.FOV,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        
        this.renderer = new THREE.WebGLRenderer({ 
            canvas: canvas,
            antialias: false
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(1);
        
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(50, 100, 50);
        this.scene.add(directionalLight);
        
        this.blockMeshes = new Map();
        this.geometries = this.createGeometries();
        this.materials = this.createMaterials();
        
        console.log('✓ Renderer 3D initialisé');
    }
    
    createGeometries() {
        return {
            block: new THREE.BoxGeometry(1, 1, 1)
        };
    }
    
    createMaterials() {
        const materials = {};
        
        for (const [name, block] of Object.entries(BLOCKS)) {
            if (block.id === 0) continue;
            
            const color = new THREE.Color(
                block.color[0],
                block.color[1],
                block.color[2]
            );
            
            materials[name] = new THREE.MeshLambertMaterial({
                color: color,
                transparent: block.transparent || false,
                opacity: block.color[3] !== undefined ? block.color[3] : 1
            });
        }
        
        return materials;
    }
    
    resize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
    
    updateCamera(player) {
        this.camera.position.set(
            player.position.x,
            player.position.y + player.eyeHeight,
            player.position.z
        );
        
        this.camera.rotation.order = 'YXZ';
        this.camera.rotation.y = player.rotation.yaw;
        this.camera.rotation.x = player.rotation.pitch;
    }
    
    render(world, player) {
        this.updateCamera(player);
        
        const playerChunkX = Math.floor(player.position.x / CONFIG.CHUNK_SIZE);
        const playerChunkZ = Math.floor(player.position.z / CONFIG.CHUNK_SIZE);
        
        const visibleBlocks = new Set();
        
        for (let cx = -CONFIG.RENDER_DISTANCE; cx <= CONFIG.RENDER_DISTANCE; cx++) {
            for (let cz = -CONFIG.RENDER_DISTANCE; cz <= CONFIG.RENDER_DISTANCE; cz++) {
                const chunkX = playerChunkX + cx;
                const chunkZ = playerChunkZ + cz;
                
                try {
                    const chunk = world.getChunk(chunkX, chunkZ);
                    
                    for (let x = 0; x < CONFIG.CHUNK_SIZE; x++) {
                        for (let z = 0; z < CONFIG.CHUNK_SIZE; z++) {
                            for (let y = 0; y < CONFIG.WORLD_HEIGHT; y++) {
                                const blockType = chunk[x][z][y];
                                
                                if (blockType !== 'AIR') {
                                    const worldX = chunkX * CONFIG.CHUNK_SIZE + x;
                                    const worldZ = chunkZ * CONFIG.CHUNK_SIZE + z;
                                    
                                    const dx = worldX - player.position.x;
                                    const dy = y - player.position.y;
                                    const dz = worldZ - player.position.z;
                                    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
                                    
                                    if (distance < CONFIG.RENDER_DISTANCE * CONFIG.CHUNK_SIZE) {
                                        const key = `${worldX},${y},${worldZ}`;
                                        visibleBlocks.add(key);
                                        
                                        if (!this.blockMeshes.has(key)) {
                                            this.addBlock(worldX, y, worldZ, blockType);
                                        }
                                    }
                                }
                            }
                        }
                    }
                } catch (error) {
                    console.error('Erreur rendu chunk:', error);
                }
            }
        }
        
        for (const [key, mesh] of this.blockMeshes.entries()) {
            if (!visibleBlocks.has(key)) {
                this.scene.remove(mesh);
                mesh.geometry.dispose();
                mesh.material.dispose();
                this.blockMeshes.delete(key);
            }
        }
        
        this.renderer.render(this.scene, this.camera);
    }
    
    addBlock(x, y, z, blockType) {
        const material = this.materials[blockType];
        if (!material) return;
        
        const mesh = new THREE.Mesh(this.geometries.block, material);
        mesh.position.set(x, y, z);
        
        this.scene.add(mesh);
        this.blockMeshes.set(`${x},${y},${z}`, mesh);
    }
    
    removeBlock(x, y, z) {
        const key = `${x},${y},${z}`;
        const mesh = this.blockMeshes.get(key);
        
        if (mesh) {
            this.scene.remove(mesh);
            mesh.geometry.dispose();
            mesh.material.dispose();
            this.blockMeshes.delete(key);
        }
    }
}
