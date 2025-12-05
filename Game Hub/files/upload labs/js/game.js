const game = {
    credits: 150,
    dataProcessed: 0,
    dataRate: 0,
    creditsPerSecond: 0,
    level: 1,
    experience: 0,
    experienceToNext: 100,
    tier: 1,
    selectedComponent: null,
    components: [],
    connections: [],
    missions: [],
    energy: { current: 0, max: 0 },
    camera: {
        x: 0,
        y: 0,
        zoom: 1,
        isDragging: false,
        dragStart: { x: 0, y: 0 }
    },
    draggedComponent: null,
    connectingFrom: null,
    connectionPreview: null,
    connectionMode: false,
    sellMode: false,
    selectedForSale: [],
    potentialDrag: null,
    dragStartTime: 0,
    unlockedComponents: ['power', 'server', 'storage'],
    collectibles: [],
    skillPoints: 0,
    selectMode: false,
    multiSelectMode: false,
    selectedComponents: [],
    skills: {
        energyBoost: 0,
        revenueBoost: 0,
        speedBoost: 0,
        costReduction: 0,
        xpBoost: 0
    }
};

const ComponentCategory = {
    POWER: 'power',
    PROCESSING: 'processing',
    STORAGE: 'storage',
    NETWORK: 'network',
    UTILITY: 'utility',
    GPU: 'gpu',
    CRYPTO: 'crypto'
};

function canConnect(comp1, comp2) {
    const cat1 = getComponentCategory(comp1.type);
    const cat2 = getComponentCategory(comp2.type);
    
    if (cat1 === ComponentCategory.POWER) {
        return comp2.energyCost;
    }
    if (cat2 === ComponentCategory.POWER) {
        return comp1.energyCost;
    }
    
    if (cat1 === ComponentCategory.PROCESSING) {
        return cat2 === ComponentCategory.STORAGE || cat2 === ComponentCategory.UTILITY || 
               cat2 === ComponentCategory.PROCESSING || cat2 === ComponentCategory.GPU || 
               cat2 === ComponentCategory.CRYPTO;
    }
    if (cat2 === ComponentCategory.PROCESSING) {
        return cat1 === ComponentCategory.STORAGE || cat1 === ComponentCategory.UTILITY || 
               cat1 === ComponentCategory.PROCESSING || cat1 === ComponentCategory.GPU || 
               cat1 === ComponentCategory.CRYPTO;
    }
    
    if (cat1 === ComponentCategory.GPU) {
        return cat2 === ComponentCategory.PROCESSING || cat2 === ComponentCategory.STORAGE || 
               cat2 === ComponentCategory.UTILITY || cat2 === ComponentCategory.GPU || 
               cat2 === ComponentCategory.CRYPTO;
    }
    if (cat2 === ComponentCategory.GPU) {
        return cat1 === ComponentCategory.PROCESSING || cat1 === ComponentCategory.STORAGE || 
               cat1 === ComponentCategory.UTILITY || cat1 === ComponentCategory.GPU || 
               cat1 === ComponentCategory.CRYPTO;
    }
    
    if (cat1 === ComponentCategory.CRYPTO) {
        return cat2 === ComponentCategory.GPU || cat2 === ComponentCategory.PROCESSING || 
               cat2 === ComponentCategory.UTILITY || cat2 === ComponentCategory.CRYPTO;
    }
    if (cat2 === ComponentCategory.CRYPTO) {
        return cat1 === ComponentCategory.GPU || cat1 === ComponentCategory.PROCESSING || 
               cat1 === ComponentCategory.UTILITY || cat1 === ComponentCategory.CRYPTO;
    }
    
    if (cat1 === ComponentCategory.STORAGE) {
        return cat2 === ComponentCategory.UTILITY || cat2 === ComponentCategory.PROCESSING;
    }
    if (cat2 === ComponentCategory.STORAGE) {
        return cat1 === ComponentCategory.UTILITY || cat1 === ComponentCategory.PROCESSING;
    }
    
    if (cat1 === ComponentCategory.UTILITY || cat2 === ComponentCategory.UTILITY) {
        return true;
    }
    
    return false;
}

function getComponentCategory(type) {
    const categories = {
        power: ComponentCategory.POWER,
        fusion: ComponentCategory.POWER,
        
        server: ComponentCategory.PROCESSING,
        generator: ComponentCategory.PROCESSING,
        miner: ComponentCategory.PROCESSING,
        turbine: ComponentCategory.PROCESSING,
        antimatter: ComponentCategory.PROCESSING,
        
        storage: ComponentCategory.STORAGE,
        
        processor: ComponentCategory.UTILITY,
        cooling: ComponentCategory.UTILITY,
        ai: ComponentCategory.UTILITY,
        quantum: ComponentCategory.UTILITY,
        
        gpu: ComponentCategory.GPU,
        gpuRig: ComponentCategory.GPU,
        superGPU: ComponentCategory.GPU,
        
        bitcoinMiner: ComponentCategory.CRYPTO,
        cryptoFarm: ComponentCategory.CRYPTO,
        asicMiner: ComponentCategory.CRYPTO,
        quantumMiner: ComponentCategory.CRYPTO
    };
    
    return categories[type] || ComponentCategory.UTILITY;
}

function getConnectionErrorMessage(comp1, comp2) {
    const cat1 = getComponentCategory(comp1.type);
    const cat2 = getComponentCategory(comp2.type);
    
    if (cat1 === cat2 && cat1 === ComponentCategory.POWER) {
        return '⚠️ Impossible de connecter deux alimentations ensemble!';
    }
    
    if (cat1 === cat2 && cat1 === ComponentCategory.STORAGE) {
        return '⚠️ Les stockages ne peuvent pas être connectés directement!';
    }
    
    return '⚠️ Ces composants ne sont pas compatibles!';
}

const levelUnlocks = {
    1: ['power', 'server', 'storage'],
    2: ['processor'],
    3: ['cooling'],
    5: ['miner', 'gpu'],
    7: ['generator'],
    10: ['ai', 'bitcoinMiner'],
    12: ['gpuRig'],
    15: ['turbine', 'cryptoFarm'],
    18: ['superGPU'],
    20: ['quantum'],
    25: ['fusion', 'asicMiner'],
    30: ['antimatter', 'quantumMiner']
};

const componentTypes = {
    power: {
        name: 'Alimentation',
        icon: '⚡',
        cost: 60,
        unlockLevel: 1,
        energy: 100,
        desc: 'Fournit 100 unités d\'énergie',
        upgrades: [
            { level: 2, cost: 80, energy: 200, desc: 'Fournit 200 unités d\'énergie' },
            { level: 3, cost: 150, energy: 400, desc: 'Fournit 400 unités d\'énergie' }
        ]
    },
    server: {
        name: 'Serveur',
        icon: '🖥️',
        cost: 50,
        unlockLevel: 1,
        dataRate: 10,
        energyCost: 20,
        revenue: 2,
        desc: '10 unités/sec | +2₵/s',
        upgrades: [
            { level: 2, cost: 100, dataRate: 25, energyCost: 35, revenue: 6, desc: '25 unités/sec | +6₵/s' },
            { level: 3, cost: 300, dataRate: 50, energyCost: 50, revenue: 15, desc: '50 unités/sec | +15₵/s' }
        ]
    },
    storage: {
        name: 'Stockage',
        icon: '💾',
        cost: 30,
        unlockLevel: 1,
        capacity: 50,
        desc: 'Capacité 50 unités',
        upgrades: [
            { level: 2, cost: 60, capacity: 150, desc: 'Capacité 150 unités' },
            { level: 3, cost: 200, capacity: 500, desc: 'Capacité 500 unités' }
        ]
    },
    processor: {
        name: 'Module traitement',
        icon: '⚙️',
        cost: 40,
        unlockLevel: 2,
        boost: 0.2,
        desc: '+20% vitesse',
        upgrades: [
            { level: 2, cost: 80, boost: 0.5, desc: '+50% vitesse' },
            { level: 3, cost: 200, boost: 1.0, desc: '+100% vitesse' }
        ]
    },
    cooling: {
        name: 'Refroidissement',
        icon: '❄️',
        cost: 50,
        unlockLevel: 3,
        stability: true,
        desc: 'Réduit surcharge',
        upgrades: [
            { level: 2, cost: 100, stability: true, desc: 'Refroidissement avancé' },
            { level: 3, cost: 250, stability: true, desc: 'Refroidissement quantique' }
        ]
    },
    miner: {
        name: 'Mineur',
        icon: '💰',
        cost: 80,
        unlockLevel: 5,
        energyCost: 15,
        revenue: 3,
        desc: 'Génère +3₵/s',
        upgrades: [
            { level: 2, cost: 150, energyCost: 25, revenue: 8, desc: 'Génère +8₵/s' },
            { level: 3, cost: 350, energyCost: 40, revenue: 18, desc: 'Génère +18₵/s' }
        ]
    },
    generator: {
        name: 'Générateur',
        icon: '📡',
        cost: 150,
        unlockLevel: 7,
        dataRate: 15,
        energyCost: 25,
        revenue: 5,
        desc: '15 unités/sec | +5₵/s',
        upgrades: [
            { level: 2, cost: 200, dataRate: 30, energyCost: 40, revenue: 10, desc: '30 unités/sec | +10₵/s' },
            { level: 3, cost: 400, dataRate: 60, energyCost: 60, revenue: 20, desc: '60 unités/sec | +20₵/s' }
        ]
    },
    ai: {
        name: 'Module IA',
        icon: '🤖',
        cost: 150,
        unlockLevel: 10,
        automation: true,
        desc: 'Automatise le flux',
        upgrades: [
            { level: 2, cost: 300, automation: true, desc: 'IA avancée' },
            { level: 3, cost: 600, automation: true, autoOptimize: true, desc: 'IA quantique - Optimisation auto' }
        ]
    },
    turbine: {
        name: 'Turbine',
        icon: '🌀',
        cost: 500,
        unlockLevel: 15,
        dataRate: 40,
        energyCost: 60,
        revenue: 25,
        desc: '40 unités/sec | +25₵/s',
        upgrades: [
            { level: 2, cost: 800, dataRate: 80, energyCost: 100, revenue: 50, desc: '80 unités/sec | +50₵/s' },
            { level: 3, cost: 1500, dataRate: 150, energyCost: 150, revenue: 100, desc: '150 unités/sec | +100₵/s' }
        ]
    },
    quantum: {
        name: 'Processeur Quantique',
        icon: '⚛️',
        cost: 1000,
        unlockLevel: 20,
        boost: 2.0,
        energyCost: 80,
        desc: '+200% vitesse',
        upgrades: [
            { level: 2, cost: 2000, boost: 4.0, energyCost: 120, desc: '+400% vitesse' },
            { level: 3, cost: 4000, boost: 8.0, energyCost: 180, desc: '+800% vitesse' }
        ]
    },
    fusion: {
        name: 'Réacteur Fusion',
        icon: '☢️',
        cost: 2000,
        unlockLevel: 25,
        energy: 1000,
        desc: 'Fournit 1000 unités d\'énergie',
        upgrades: [
            { level: 2, cost: 4000, energy: 2500, desc: 'Fournit 2500 unités d\'énergie' },
            { level: 3, cost: 8000, energy: 5000, desc: 'Fournit 5000 unités d\'énergie' }
        ]
    },
    antimatter: {
        name: 'Générateur Antimatière',
        icon: '💥',
        cost: 5000,
        unlockLevel: 30,
        dataRate: 200,
        energyCost: 200,
        revenue: 200,
        desc: '200 unités/sec | +200₵/s',
        upgrades: [
            { level: 2, cost: 10000, dataRate: 500, energyCost: 400, revenue: 500, desc: '500 unités/sec | +500₵/s' },
            { level: 3, cost: 20000, dataRate: 1000, energyCost: 600, revenue: 1000, desc: '1000 unités/sec | +1000₵/s' }
        ]
    },
    gpu: {
        name: 'GPU',
        icon: '🎮',
        cost: 120,
        unlockLevel: 5,
        dataRate: 15,
        energyCost: 30,
        revenue: 5,
        desc: 'Carte graphique | 15 unités/sec | +5₵/s',
        upgrades: [
            { level: 2, cost: 200, dataRate: 35, energyCost: 50, revenue: 12, desc: '35 unités/sec | +12₵/s' },
            { level: 3, cost: 400, dataRate: 70, energyCost: 80, revenue: 25, desc: '70 unités/sec | +25₵/s' }
        ]
    },
    gpuRig: {
        name: 'Rig GPU',
        icon: '🖼️',
        cost: 600,
        unlockLevel: 12,
        dataRate: 80,
        energyCost: 120,
        revenue: 40,
        desc: 'Rig de 6 GPU | 80 unités/sec | +40₵/s',
        upgrades: [
            { level: 2, cost: 1200, dataRate: 180, energyCost: 200, revenue: 90, desc: '180 unités/sec | +90₵/s' },
            { level: 3, cost: 2500, dataRate: 350, energyCost: 350, revenue: 180, desc: '350 unités/sec | +180₵/s' }
        ]
    },
    superGPU: {
        name: 'Super GPU',
        icon: '🎯',
        cost: 2000,
        unlockLevel: 18,
        dataRate: 150,
        energyCost: 180,
        revenue: 100,
        desc: 'GPU haute performance | 150 unités/sec | +100₵/s',
        upgrades: [
            { level: 2, cost: 4000, dataRate: 350, energyCost: 300, revenue: 250, desc: '350 unités/sec | +250₵/s' },
            { level: 3, cost: 8000, dataRate: 700, energyCost: 500, revenue: 500, desc: '700 unités/sec | +500₵/s' }
        ]
    },
    bitcoinMiner: {
        name: 'Mineur Bitcoin',
        icon: '₿',
        cost: 300,
        unlockLevel: 10,
        energyCost: 50,
        revenue: 15,
        desc: 'Mine du Bitcoin | +15₵/s',
        upgrades: [
            { level: 2, cost: 600, energyCost: 80, revenue: 35, desc: '+35₵/s' },
            { level: 3, cost: 1200, energyCost: 120, revenue: 75, desc: '+75₵/s' }
        ]
    },
    cryptoFarm: {
        name: 'Ferme Crypto',
        icon: '🏭',
        cost: 1500,
        unlockLevel: 15,
        energyCost: 200,
        revenue: 80,
        desc: 'Ferme de minage | +80₵/s',
        upgrades: [
            { level: 2, cost: 3000, energyCost: 350, revenue: 180, desc: '+180₵/s' },
            { level: 3, cost: 6000, energyCost: 500, revenue: 400, desc: '+400₵/s' }
        ]
    },
    asicMiner: {
        name: 'Mineur ASIC',
        icon: '⛏️',
        cost: 4000,
        unlockLevel: 25,
        energyCost: 300,
        revenue: 250,
        desc: 'ASIC spécialisé | +250₵/s',
        upgrades: [
            { level: 2, cost: 8000, energyCost: 500, revenue: 600, desc: '+600₵/s' },
            { level: 3, cost: 16000, energyCost: 800, revenue: 1200, desc: '+1200₵/s' }
        ]
    },
    quantumMiner: {
        name: 'Mineur Quantique',
        icon: '🌌',
        cost: 10000,
        unlockLevel: 30,
        energyCost: 500,
        revenue: 800,
        desc: 'Minage quantique | +800₵/s',
        upgrades: [
            { level: 2, cost: 20000, energyCost: 800, revenue: 2000, desc: '+2000₵/s' },
            { level: 3, cost: 40000, energyCost: 1200, revenue: 5000, desc: '+5000₵/s' }
        ]
    },
    serverOld: {
        name: 'Serveur (ancien)',
        icon: '🖥️',
        cost: 50,
        tier: 1,
        dataRate: 10,
        energyCost: 20,
        revenue: 2,
        desc: '50 unités/sec | +15₵/s'
    },
    superStorage: {
        name: 'Super stockage',
        icon: '🗄️',
        cost: 300,
        tier: 3,
        capacity: 500,
        desc: '500 unités'
    },
    aiAdvanced: {
        name: 'IA avancée',
        icon: '🧠',
        cost: 700,
        tier: 3,
        automation: true,
        autoOptimize: true,
        desc: 'Optimisation auto'
    },
    dataGenerator: {
        name: 'Générateur données',
        icon: '📡',
        cost: 250,
        tier: 3,
        dataRate: 20,
        energyCost: 25,
        revenue: 8,
        desc: '20 unités/sec | +8₵/s'
    },
    miner: {
        name: 'Mineur de crédits',
        icon: '💰',
        cost: 100,
        tier: 2,
        energyCost: 15,
        revenue: 4,
        desc: 'Génère +4₵/s'
    },
    megaMiner: {
        name: 'Méga mineur',
        icon: '💎',
        cost: 400,
        tier: 3,
        energyCost: 40,
        revenue: 12,
        desc: 'Génère +12₵/s'
    },

};

function init() {
    const hasLoadedSave = Auth.loadGame();
    document.getElementById('username').textContent = Auth.currentUser;
    
    setupCanvas();
    createShop();
    
    if (!hasLoadedSave) {
        createMissions();
    }
    
    updateUI();
    updateCanvas();
    startGameLoop();
}

function setupCanvas() {
    const container = document.getElementById('canvasContainer');
    const canvas = document.getElementById('canvas');
    
    container.addEventListener('click', (e) => {
        if (game.camera.isDragging || game.draggedComponent) return;
        if (game.sellMode || game.selectMode || game.multiSelectMode) return;
        
        const rect = container.getBoundingClientRect();
        const x = (e.clientX - rect.left - game.camera.x) / game.camera.zoom;
        const y = (e.clientY - rect.top - game.camera.y) / game.camera.zoom;
        
        placeComponent(x, y);
    });
    
    container.addEventListener('mousedown', (e) => {
        if (e.button === 0 && !e.target.classList.contains('component') && !e.target.classList.contains('connection-port')) {
            game.camera.isDragging = true;
            game.camera.dragStart = {
                x: e.clientX - game.camera.x,
                y: e.clientY - game.camera.y
            };
            container.classList.add('dragging');
        }
    });
    
    container.addEventListener('mousemove', (e) => {
        if (game.camera.isDragging) {
            game.camera.x = e.clientX - game.camera.dragStart.x;
            game.camera.y = e.clientY - game.camera.dragStart.y;
            updateCanvas();
        }
        
        if (game.draggedComponent && !game.sellMode) {
            const rect = container.getBoundingClientRect();
            const x = (e.clientX - rect.left - game.camera.x) / game.camera.zoom;
            const y = (e.clientY - rect.top - game.camera.y) / game.camera.zoom;
            
            game.draggedComponent.x = x - 30;
            game.draggedComponent.y = y - 30;
            updateCanvas();
        }
        
        if (game.connectingFrom) {
            const rect = container.getBoundingClientRect();
            const x = (e.clientX - rect.left - game.camera.x) / game.camera.zoom;
            const y = (e.clientY - rect.top - game.camera.y) / game.camera.zoom;
            
            const hoveredElement = document.elementFromPoint(e.clientX, e.clientY);
            if (hoveredElement && hoveredElement.classList.contains('component')) {
                const compId = parseInt(hoveredElement.dataset.id);
                const hoveredComp = game.components.find(c => c.id === compId);
                if (hoveredComp && hoveredComp.id !== game.connectingFrom.id) {
                    game.connectionPreview = { 
                        x: hoveredComp.x + 30, 
                        y: hoveredComp.y + 30,
                        targetComp: hoveredComp
                    };
                } else {
                    game.connectionPreview = { x, y };
                }
            } else {
                game.connectionPreview = { x, y };
            }
            
            updateCanvas();
        }
    });
    
    container.addEventListener('mouseup', (e) => {
        game.camera.isDragging = false;
        container.classList.remove('dragging');
        
        if (game.draggedComponent) {
            game.draggedComponent = null;
            updateCanvas();
            updateNetwork();
        }
        
        game.potentialDrag = null;
        
        if (game.connectingFrom && game.connectionPreview && game.connectionPreview.targetComp) {
            endConnection(game.connectionPreview.targetComp);
        }
        else if (game.connectingFrom && !e.target.classList.contains('connection-port') && !e.target.classList.contains('component')) {
            game.connectingFrom = null;
            game.connectionPreview = null;
            showMessage('Connexion annulée');
            updateCanvas();
        }
    });
    
    container.addEventListener('mouseleave', () => {
        game.camera.isDragging = false;
        container.classList.remove('dragging');
        if (game.draggedComponent) {
            game.draggedComponent = null;
            updateCanvas();
        }
    });
    
    container.addEventListener('wheel', (e) => {
        e.preventDefault();
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        const newZoom = Math.max(0.3, Math.min(3, game.camera.zoom * delta));
        
        const rect = container.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        const worldX = (mouseX - game.camera.x) / game.camera.zoom;
        const worldY = (mouseY - game.camera.y) / game.camera.zoom;
        
        game.camera.zoom = newZoom;
        game.camera.x = mouseX - worldX * game.camera.zoom;
        game.camera.y = mouseY - worldY * game.camera.zoom;
        
        updateCanvas();
        updateZoomLevel();
    });
    
    document.getElementById('zoomIn').addEventListener('click', () => {
        game.camera.zoom = Math.min(3, game.camera.zoom * 1.2);
        updateCanvas();
        updateZoomLevel();
    });
    
    document.getElementById('zoomOut').addEventListener('click', () => {
        game.camera.zoom = Math.max(0.3, game.camera.zoom * 0.8);
        updateCanvas();
        updateZoomLevel();
    });
    
    document.getElementById('resetView').addEventListener('click', () => {
        game.camera.x = 0;
        game.camera.y = 0;
        game.camera.zoom = 1;
        updateCanvas();
        updateZoomLevel();
    });
    
    document.getElementById('selectMode').addEventListener('click', () => {
        toggleSelectMode();
    });
    
    document.getElementById('multiSelectMode').addEventListener('click', () => {
        toggleMultiSelectMode();
    });
    
    document.getElementById('sellMode').addEventListener('click', () => {
        toggleSellMode();
    });
    
    document.getElementById('confirmSell').addEventListener('click', () => {
        confirmSell();
    });
    
    document.getElementById('cancelSell').addEventListener('click', () => {
        cancelSell();
    });
    
    document.getElementById('upgradeSelected').addEventListener('click', () => {
        upgradeSelectedComponents();
    });
    
    document.getElementById('deleteSelected').addEventListener('click', () => {
        deleteSelectedComponents();
    });
    
    document.getElementById('clearSelection').addEventListener('click', () => {
        clearSelection();
    });
    
    document.querySelectorAll('.hud-collapse-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const targetId = btn.dataset.target;
            toggleHUD(targetId);
        });
    });
    
    const shopToggleBtn = document.getElementById('shopToggleBtn');
    const shopBar = document.getElementById('shopBar');
    if (shopToggleBtn) {
        shopToggleBtn.addEventListener('click', () => {
            shopBar.classList.toggle('collapsed');
        });
    }
    
    document.querySelectorAll('.shop-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.shop-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            filterShop(tab.dataset.tier);
        });
    });
    
    makeHUDDraggable();
    
    updateCanvas();
}

function toggleHUD(hudId) {
    const hud = document.getElementById(hudId);
    hud.classList.toggle('collapsed');
}

function makeHUDDraggable() {
    const hudPanels = document.querySelectorAll('.hud-panel');
    
    hudPanels.forEach(panel => {
        const toggle = panel.querySelector('.hud-toggle');
        const collapseBtn = panel.querySelector('.hud-collapse-btn');
        let isDragging = false;
        let currentX;
        let currentY;
        let initialX;
        let initialY;
        let xOffset = 0;
        let yOffset = 0;
        
        const rect = panel.getBoundingClientRect();
        xOffset = rect.left;
        yOffset = rect.top;
        
        toggle.addEventListener('mousedown', dragStart);
        document.addEventListener('mousemove', drag);
        document.addEventListener('mouseup', dragEnd);
        
        function dragStart(e) {
            if (e.target === collapseBtn || collapseBtn.contains(e.target)) {
                return;
            }
            
            initialX = e.clientX - xOffset;
            initialY = e.clientY - yOffset;
            
            if (e.target === toggle || toggle.contains(e.target)) {
                isDragging = true;
                panel.classList.add('dragging');
            }
        }
        
        function drag(e) {
            if (isDragging) {
                e.preventDefault();
                
                currentX = e.clientX - initialX;
                currentY = e.clientY - initialY;
                
                xOffset = currentX;
                yOffset = currentY;
                
                const maxX = window.innerWidth - panel.offsetWidth;
                const maxY = window.innerHeight - panel.offsetHeight;
                
                xOffset = Math.max(0, Math.min(xOffset, maxX));
                yOffset = Math.max(0, Math.min(yOffset, maxY));
                
                setTranslate(xOffset, yOffset, panel);
            }
        }
        
        function dragEnd(e) {
            if (isDragging) {
                initialX = currentX;
                initialY = currentY;
                isDragging = false;
                panel.classList.remove('dragging');
            }
        }
        
        function setTranslate(xPos, yPos, el) {
            el.style.left = xPos + 'px';
            el.style.top = yPos + 'px';
            el.style.right = 'auto';
            el.style.bottom = 'auto';
            el.style.transform = 'none';
        }
    });
}

function filterShop(category) {
    const shopItems = document.querySelectorAll('.shop-item');
    shopItems.forEach((item, index) => {
        const compType = Object.keys(componentTypes)[index];
        const compCategory = getComponentCategory(compType);
        
        if (category === 'all' || compCategory === category) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
}

function toggleSelectMode() {
    game.multiSelectMode = false;
    game.sellMode = false;
    document.getElementById('multiSelectMode').classList.remove('active');
    document.getElementById('sellMode').classList.remove('active');
    document.getElementById('sellInfo').style.display = 'none';
    
    game.selectMode = !game.selectMode;
    game.selectedComponents = [];
    
    const selectBtn = document.getElementById('selectMode');
    
    if (game.selectMode) {
        selectBtn.classList.add('active');
        showMessage('👆 Mode sélection - Cliquez sur un composant pour le sélectionner');
    } else {
        selectBtn.classList.remove('active');
        showMessage('Mode sélection désactivé');
    }
    
    updateCanvas();
}

function toggleMultiSelectMode() {
    game.selectMode = false;
    game.sellMode = false;
    document.getElementById('selectMode').classList.remove('active');
    document.getElementById('sellMode').classList.remove('active');
    document.getElementById('sellInfo').style.display = 'none';
    
    game.multiSelectMode = !game.multiSelectMode;
    
    const multiSelectBtn = document.getElementById('multiSelectMode');
    
    if (game.multiSelectMode) {
        multiSelectBtn.classList.add('active');
        showMessage('🔲 Sélection multiple - Cliquez pour sélectionner plusieurs composants');
    } else {
        multiSelectBtn.classList.remove('active');
        game.selectedComponents = [];
        showMessage('Sélection multiple désactivée');
    }
    
    updateCanvas();
}

function toggleSellMode() {
    game.selectMode = false;
    game.multiSelectMode = false;
    document.getElementById('selectMode').classList.remove('active');
    document.getElementById('multiSelectMode').classList.remove('active');
    
    game.sellMode = !game.sellMode;
    game.selectedForSale = [];
    game.selectedComponents = [];
    
    const sellBtn = document.getElementById('sellMode');
    const sellInfo = document.getElementById('sellInfo');
    
    if (game.sellMode) {
        sellBtn.classList.add('active');
        sellInfo.style.display = 'block';
        document.body.classList.add('sell-mode-active');
        showMessage('💰 Mode vente activé - Cliquez pour sélectionner/désélectionner');
    } else {
        sellBtn.classList.remove('active');
        sellInfo.style.display = 'none';
        document.body.classList.remove('sell-mode-active');
        showMessage('Mode vente désactivé');
    }
    
    updateCanvas();
}

function confirmSell() {
    if (game.selectedForSale.length === 0) {
        showMessage('⚠️ Aucun composant sélectionné!');
        return;
    }
    
    let totalRefund = 0;
    
    game.selectedForSale.forEach(id => {
        const comp = game.components.find(c => c.id === id);
        if (comp) {
            totalRefund += Math.floor(comp.cost * 0.5);
        }
    });
    
    game.components = game.components.filter(c => !game.selectedForSale.includes(c.id));
    game.connections = game.connections.filter(c => 
        !game.selectedForSale.includes(c.from) && !game.selectedForSale.includes(c.to)
    );
    
    game.credits += totalRefund;
    
    showMessage(`✅ ${game.selectedForSale.length} composant(s) vendu(s) pour ${totalRefund}₵`);
    
    game.selectedForSale = [];
    game.sellMode = false;
    document.getElementById('sellMode').classList.remove('active');
    document.getElementById('sellInfo').style.display = 'none';
    document.body.classList.remove('sell-mode-active');
    
    updateCanvas();
    updateNetwork();
    updateUI();
}

function cancelSell() {
    game.selectedForSale = [];
    game.sellMode = false;
    document.getElementById('sellMode').classList.remove('active');
    document.getElementById('sellInfo').style.display = 'none';
    document.body.classList.remove('sell-mode-active');
    showMessage('Vente annulée');
    updateCanvas();
}

function updateSellCount() {
    document.getElementById('sellCount').textContent = game.selectedForSale.length;
}

function createShop() {
    const shopElement = document.getElementById('shop');
    Object.entries(componentTypes).forEach(([key, comp]) => {
        const item = document.createElement('div');
        item.className = 'shop-item';
        
        const isUnlocked = game.unlockedComponents.includes(key);
        if (!isUnlocked) {
            item.classList.add('locked');
        }
        
        const category = getComponentCategory(key);
        const categoryIcon = {
            power: '⚡',
            processing: '🖥️',
            storage: '💾',
            utility: '⚙️',
            gpu: '🎮',
            crypto: '₿'
        }[category] || '📦';
        
        const shopIcon = createIcon(key, 24);
        const unlockText = !isUnlocked ? `<div class="unlock-level">🔒 Niveau ${comp.unlockLevel}</div>` : '';
        
        item.innerHTML = `
            <div class="shop-item-header">
                <span class="shop-item-name"></span>
                <span class="shop-item-cost">${comp.cost} ₵</span>
            </div>
            <div class="shop-item-desc">
                <span class="category-badge port-${category}">${categoryIcon}</span>
                <span class="desc-text">${comp.desc || 'Composant réseau'}</span>
            </div>
            ${unlockText}
        `;
        
        const nameSpan = item.querySelector('.shop-item-name');
        nameSpan.appendChild(shopIcon);
        nameSpan.appendChild(document.createTextNode(comp.name));
        
        item.addEventListener('click', () => selectComponent(key, item));
        shopElement.appendChild(item);
    });
}

function showComponentMenu(comp, element) {
    const existingMenu = document.querySelector('.component-context-menu');
    if (existingMenu) {
        existingMenu.remove();
    }
    
    const compType = componentTypes[comp.type];
    const currentLevel = comp.level || 1;
    const nextUpgrade = compType.upgrades?.find(u => u.level === currentLevel + 1);
    
    const menu = document.createElement('div');
    menu.className = 'component-context-menu';
    
    const menuIcon = createIcon(comp.type === 'serverOld' ? 'server' : comp.type, 28);
    
    let menuContent = `
        <div class="context-menu-header">
            <span class="menu-icon-placeholder"></span>
            ${comp.name} <span class="level-indicator">Lv${currentLevel}</span>
        </div>
        <div class="context-menu-stats">
            ${comp.desc || compType.desc}
        </div>
    `;
    
    if (nextUpgrade) {
        const cost1x = nextUpgrade.cost;
        const cost10x = nextUpgrade.cost * 10;
        const canAfford1x = game.credits >= cost1x;
        const canAfford10x = game.credits >= cost10x;
        
        menuContent += `
            <div class="context-menu-divider"></div>
            <div class="context-menu-upgrade">
                <div class="upgrade-preview">
                    <strong>Niveau ${nextUpgrade.level}</strong>
                    <p>${nextUpgrade.desc}</p>
                </div>
                <div class="upgrade-options">
                    <button class="upgrade-option-btn ${!canAfford1x ? 'disabled' : ''}" data-amount="1" ${!canAfford1x ? 'disabled' : ''}>
                        <span class="upgrade-label">x1</span>
                        <span class="upgrade-cost">${cost1x}₵</span>
                    </button>
                    <button class="upgrade-option-btn ${!canAfford10x ? 'disabled' : ''}" data-amount="10" ${!canAfford10x ? 'disabled' : ''}>
                        <span class="upgrade-label">x10</span>
                        <span class="upgrade-cost">${cost10x}₵</span>
                    </button>
                </div>
            </div>
        `;
    } else {
        menuContent += `
            <div class="context-menu-divider"></div>
            <div class="context-menu-maxed">✨ Niveau maximum atteint</div>
        `;
    }
    
    menuContent += `
        <div class="context-menu-divider"></div>
        <button class="context-menu-delete">🗑️ Supprimer (${Math.floor(comp.cost * 0.5)}₵)</button>
    `;
    
    menu.innerHTML = menuContent;
    
    const rect = element.getBoundingClientRect();
    const containerRect = document.getElementById('canvasContainer').getBoundingClientRect();
    
    menu.style.left = (rect.left - containerRect.left) + 'px';
    menu.style.top = (rect.top - containerRect.top - 10) + 'px';
    menu.style.transform = 'translateY(-100%)';
    
    document.getElementById('canvasContainer').appendChild(menu);
    
    const iconPlaceholder = menu.querySelector('.menu-icon-placeholder');
    iconPlaceholder.replaceWith(menuIcon);
    if (nextUpgrade) {
        menu.querySelectorAll('.upgrade-option-btn:not(.disabled)').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const amount = parseInt(btn.dataset.amount);
                upgradeComponentBulk(comp, nextUpgrade, amount);
                menu.remove();
            });
        });
    }
    
    menu.querySelector('.context-menu-delete').addEventListener('click', (e) => {
        e.stopPropagation();
        removeComponent(comp.id);
        menu.remove();
    });
    
    // Close menu when clicking outside
    setTimeout(() => {
        document.addEventListener('click', function closeMenu(e) {
            if (!menu.contains(e.target)) {
                menu.remove();
                document.removeEventListener('click', closeMenu);
            }
        });
    }, 10);
}

function showUpgradeMenu(comp) {
    const compType = componentTypes[comp.type];
    if (!compType.upgrades) {
        showMessage('⚠️ Ce composant ne peut pas être amélioré');
        return;
    }
    
    const currentLevel = comp.level || 1;
    const nextUpgrade = compType.upgrades.find(u => u.level === currentLevel + 1);
    
    if (!nextUpgrade) {
        showMessage('✨ Ce composant est déjà au niveau maximum!');
        return;
    }
    
    // Create upgrade modal
    const modal = document.createElement('div');
    modal.className = 'upgrade-modal';
    
    let bulkAmount = 1;
    
    const updateModalContent = () => {
        const totalCost = nextUpgrade.cost * bulkAmount;
        const canAfford = game.credits >= totalCost;
        
        modal.innerHTML = `
            <div class="upgrade-content">
                <h3>🔼 Améliorer ${comp.name}</h3>
                <div class="upgrade-info">
                    <div class="current-stats">
                        <strong>Niveau actuel: ${currentLevel}</strong>
                        <p>${comp.desc || compType.desc}</p>
                    </div>
                    <div class="upgrade-arrow">➜</div>
                    <div class="next-stats">
                        <strong>Niveau ${nextUpgrade.level}</strong>
                        <p>${nextUpgrade.desc}</p>
                    </div>
                </div>
                <div class="upgrade-cost">
                    <strong>Coût: ${totalCost} ₵</strong>
                    ${!canAfford ? '<div style="color: #f44336; font-size: 0.9em;">Crédits insuffisants</div>' : ''}
                </div>
                <div class="bulk-buy-buttons">
                    <button class="bulk-btn ${bulkAmount === 1 ? 'active' : ''}" data-amount="1">x1</button>
                    <button class="bulk-btn ${bulkAmount === 5 ? 'active' : ''}" data-amount="5">x5</button>
                    <button class="bulk-btn ${bulkAmount === 10 ? 'active' : ''}" data-amount="10">x10</button>
                </div>
                <div class="upgrade-buttons">
                    <button class="upgrade-confirm" id="confirmUpgrade" ${!canAfford ? 'disabled' : ''}>
                        Améliorer ${bulkAmount > 1 ? `(${bulkAmount})` : ''}
                    </button>
                    <button class="upgrade-cancel" id="cancelUpgrade">Annuler</button>
                </div>
            </div>
        `;
        
        // Re-attach event listeners
        document.querySelectorAll('.bulk-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                bulkAmount = parseInt(btn.dataset.amount);
                updateModalContent();
            });
        });
        
        const confirmBtn = document.getElementById('confirmUpgrade');
        if (canAfford) {
            confirmBtn.addEventListener('click', () => {
                upgradeComponentBulk(comp, nextUpgrade, bulkAmount);
                document.body.removeChild(modal);
            });
        }
        
        document.getElementById('cancelUpgrade').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
    };
    
    document.body.appendChild(modal);
    updateModalContent();
}

function upgradeComponentBulk(comp, upgrade, amount) {
    const totalCost = upgrade.cost * amount;
    
    if (game.credits < totalCost) {
        showMessage('❌ Crédits insuffisants!');
        return;
    }
    
    game.credits -= totalCost;
    comp.level = upgrade.level;
    
    // Apply upgrade stats
    Object.keys(upgrade).forEach(key => {
        if (key !== 'level' && key !== 'cost' && key !== 'desc') {
            comp[key] = upgrade[key];
        }
    });
    comp.desc = upgrade.desc;
    
    showMessage(`✨ ${comp.name} amélioré au niveau ${upgrade.level}! ${amount > 1 ? `(x${amount})` : ''}`);
    updateCanvas();
    updateNetwork();
    updateUI();
}

function upgradeComponent(comp, upgrade) {
    if (game.credits < upgrade.cost) {
        showMessage('❌ Crédits insuffisants!');
        return;
    }
    
    game.credits -= upgrade.cost;
    comp.level = upgrade.level;
    
    // Apply upgrade stats
    Object.keys(upgrade).forEach(key => {
        if (key !== 'level' && key !== 'cost' && key !== 'desc') {
            comp[key] = upgrade[key];
        }
    });
    comp.desc = upgrade.desc;
    
    showMessage(`✨ ${comp.name} amélioré au niveau ${upgrade.level}!`);
    updateCanvas();
    updateNetwork();
    updateUI();
}

function createMissions() {
    game.missions = [
        { id: 1, desc: 'Construire ton premier réseau', target: 3, type: 'components', reward: 100, xp: 50, completed: false, claimed: false },
        { id: 2, desc: 'Atteindre 10₵/sec', target: 10, type: 'credits', reward: 150, xp: 75, completed: false, claimed: false },
        { id: 3, desc: 'Améliorer un composant', target: 1, type: 'upgrades', reward: 200, xp: 100, completed: false, claimed: false },
        { id: 4, desc: 'Atteindre niveau 5', target: 5, type: 'level', reward: 500, xp: 200, completed: false, claimed: false },
        { id: 5, desc: 'Avoir 10 composants', target: 10, type: 'components', reward: 800, xp: 300, completed: false, claimed: false },
        { id: 6, desc: 'Atteindre 100₵/sec', target: 100, type: 'credits', reward: 1000, xp: 500, completed: false, claimed: false },
        { id: 7, desc: 'Atteindre niveau 10', target: 10, type: 'level', reward: 2000, xp: 1000, completed: false, claimed: false },
        { id: 8, desc: 'Atteindre 500₵/sec', target: 500, type: 'credits', reward: 5000, xp: 2000, completed: false, claimed: false }
    ];
    updateMissions();
}

function selectComponent(key, element) {
    const comp = componentTypes[key];
    if (comp.tier > game.tier) {
        showMessage('🔒 Composant verrouillé! Débloquez Mk' + comp.tier);
        return;
    }
    
    // Toggle selection - if already selected, deselect it
    if (game.selectedComponent === key) {
        element.classList.remove('selected');
        game.selectedComponent = null;
        showMessage('❌ Sélection annulée');
        return;
    }
    
    // Select new component
    document.querySelectorAll('.shop-item').forEach(item => item.classList.remove('selected'));
    element.classList.add('selected');
    game.selectedComponent = key;
    showMessage(`✓ ${comp.name} sélectionné - Cliquez sur la grille pour placer`);
}

function placeComponent(x, y) {
    if (!game.selectedComponent) {
        showMessage('Sélectionnez un composant dans la boutique.');
        return;
    }
    
    // Check if position is occupied
    const occupied = game.components.find(c => 
        Math.abs(c.x - x) < 40 && Math.abs(c.y - y) < 40
    );
    
    if (occupied) {
        showMessage('Cette position est déjà occupée!');
        return;
    }
    
    const comp = componentTypes[game.selectedComponent];
    
    // Apply cost reduction skill
    const costMultiplier = 1 - (game.skills.costReduction * 0.05);
    const finalCost = Math.floor(comp.cost * costMultiplier);
    
    if (game.credits < finalCost) {
        showMessage('❌ Crédits insuffisants!');
        return;
    }
    
    // Place component
    game.credits -= finalCost;
    const newComponent = {
        id: Date.now(),
        type: game.selectedComponent,
        x: x,
        y: y,
        ...comp,
        level: 1,
        active: false
    };
    
    game.components.push(newComponent);
    
    updateCanvas();
    updateNetwork();
    updateUI();
    showMessage(`✅ ${comp.name} placé!`);
}

function updateCanvas() {
    const canvas = document.getElementById('canvas');
    canvas.innerHTML = '';
    
    // Update selection actions visibility
    const selectionActions = document.getElementById('selectionActions');
    if (game.selectedComponents.length > 0 && (game.selectMode || game.multiSelectMode)) {
        selectionActions.style.display = 'flex';
        document.getElementById('selectionCount').textContent = `${game.selectedComponents.length} sélectionné(s)`;
    } else {
        selectionActions.style.display = 'none';
    }
    
    canvas.style.transform = `translate(${game.camera.x}px, ${game.camera.y}px) scale(${game.camera.zoom})`;
    canvas.style.transformOrigin = '0 0';
    
    // Draw connections first (behind components)
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.style.position = 'absolute';
    svg.style.top = '0';
    svg.style.left = '0';
    svg.style.width = '10000px';
    svg.style.height = '10000px';
    svg.style.pointerEvents = 'none';
    svg.style.overflow = 'visible';
    
    // Draw existing connections
    game.connections.forEach(conn => {
        const from = game.components.find(c => c.id === conn.from);
        const to = game.components.find(c => c.id === conn.to);
        
        if (from && to) {
            // Determine flow direction (from power source or data producer)
            const fromIsPower = from.energy > 0;
            const toIsPower = to.energy > 0;
            const fromIsProducer = from.dataRate > 0 || from.revenue > 0;
            
            let flowFrom = from;
            let flowTo = to;
            
            // Reverse direction if needed (power/data flows from source)
            if (toIsPower || (!fromIsPower && !fromIsProducer && to.dataRate > 0)) {
                flowFrom = to;
                flowTo = from;
            }
            
            // Base line (background)
            const baseLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            baseLine.setAttribute('x1', from.x + 30);
            baseLine.setAttribute('y1', from.y + 30);
            baseLine.setAttribute('x2', to.x + 30);
            baseLine.setAttribute('y2', to.y + 30);
            baseLine.setAttribute('stroke', conn.active ? 'rgba(76, 175, 80, 0.3)' : 'rgba(255, 255, 255, 0.2)');
            baseLine.setAttribute('stroke-width', '6');
            baseLine.setAttribute('stroke-linecap', 'round');
            svg.appendChild(baseLine);
            
            // Main line
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', from.x + 30);
            line.setAttribute('y1', from.y + 30);
            line.setAttribute('x2', to.x + 30);
            line.setAttribute('y2', to.y + 30);
            line.setAttribute('stroke', conn.active ? '#4CAF50' : 'rgba(255, 255, 255, 0.4)');
            line.setAttribute('stroke-width', '3');
            line.setAttribute('stroke-linecap', 'round');
            svg.appendChild(line);
            
            // Animated flow particles (only when active)
            if (conn.active) {
                // Create multiple particles for better effect
                for (let i = 0; i < 3; i++) {
                    const particle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                    particle.setAttribute('r', '4');
                    particle.setAttribute('fill', '#FFD700');
                    particle.setAttribute('opacity', '0.8');
                    
                    // Animate particle along the line
                    const animateX = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
                    animateX.setAttribute('attributeName', 'cx');
                    animateX.setAttribute('from', flowFrom.x + 30);
                    animateX.setAttribute('to', flowTo.x + 30);
                    animateX.setAttribute('dur', '2s');
                    animateX.setAttribute('begin', `${i * 0.66}s`);
                    animateX.setAttribute('repeatCount', 'indefinite');
                    
                    const animateY = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
                    animateY.setAttribute('attributeName', 'cy');
                    animateY.setAttribute('from', flowFrom.y + 30);
                    animateY.setAttribute('to', flowTo.y + 30);
                    animateY.setAttribute('dur', '2s');
                    animateY.setAttribute('begin', `${i * 0.66}s`);
                    animateY.setAttribute('repeatCount', 'indefinite');
                    
                    particle.appendChild(animateX);
                    particle.appendChild(animateY);
                    svg.appendChild(particle);
                }
                
                // Add arrow at the end to show direction
                const dx = flowTo.x - flowFrom.x;
                const dy = flowTo.y - flowFrom.y;
                const angle = Math.atan2(dy, dx);
                const arrowSize = 10;
                
                const arrowX = flowTo.x + 30;
                const arrowY = flowTo.y + 30;
                
                const arrow = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
                const point1X = arrowX;
                const point1Y = arrowY;
                const point2X = arrowX - arrowSize * Math.cos(angle - Math.PI / 6);
                const point2Y = arrowY - arrowSize * Math.sin(angle - Math.PI / 6);
                const point3X = arrowX - arrowSize * Math.cos(angle + Math.PI / 6);
                const point3Y = arrowY - arrowSize * Math.sin(angle + Math.PI / 6);
                
                arrow.setAttribute('points', `${point1X},${point1Y} ${point2X},${point2Y} ${point3X},${point3Y}`);
                arrow.setAttribute('fill', '#4CAF50');
                arrow.setAttribute('opacity', '0.8');
                svg.appendChild(arrow);
            }
        }
    });
    
    // Draw connection preview line
    if (game.connectingFrom && game.connectionPreview) {
        const isCompatible = game.connectionPreview.targetComp ? 
            canConnect(game.connectingFrom, game.connectionPreview.targetComp) : true;
        const previewColor = game.connectionPreview.targetComp ? 
            (isCompatible ? '#4CAF50' : '#f44336') : '#FFD700';
        
        // Background glow
        const glowLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        glowLine.setAttribute('x1', game.connectingFrom.x + 30);
        glowLine.setAttribute('y1', game.connectingFrom.y + 30);
        glowLine.setAttribute('x2', game.connectionPreview.x);
        glowLine.setAttribute('y2', game.connectionPreview.y);
        glowLine.setAttribute('stroke', previewColor);
        glowLine.setAttribute('stroke-width', '10');
        glowLine.setAttribute('stroke-linecap', 'round');
        glowLine.setAttribute('opacity', '0.4');
        svg.appendChild(glowLine);
        
        // Main line
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', game.connectingFrom.x + 30);
        line.setAttribute('y1', game.connectingFrom.y + 30);
        line.setAttribute('x2', game.connectionPreview.x);
        line.setAttribute('y2', game.connectionPreview.y);
        line.setAttribute('stroke', previewColor);
        line.setAttribute('stroke-width', '4');
        line.setAttribute('stroke-dasharray', game.connectionPreview.targetComp ? '0' : '10,5');
        line.setAttribute('stroke-linecap', 'round');
        line.setAttribute('opacity', '0.9');
        
        if (!game.connectionPreview.targetComp) {
            // Animate dash only when not hovering a target
            const animate = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
            animate.setAttribute('attributeName', 'stroke-dashoffset');
            animate.setAttribute('from', '0');
            animate.setAttribute('to', '15');
            animate.setAttribute('dur', '0.5s');
            animate.setAttribute('repeatCount', 'indefinite');
            line.appendChild(animate);
        }
        
        svg.appendChild(line);
        
        // Add target indicator circle when hovering
        if (game.connectionPreview.targetComp) {
            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('cx', game.connectionPreview.x);
            circle.setAttribute('cy', game.connectionPreview.y);
            circle.setAttribute('r', '35');
            circle.setAttribute('fill', 'none');
            circle.setAttribute('stroke', previewColor);
            circle.setAttribute('stroke-width', '3');
            circle.setAttribute('opacity', '0.6');
            
            const pulse = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
            pulse.setAttribute('attributeName', 'r');
            pulse.setAttribute('from', '30');
            pulse.setAttribute('to', '40');
            pulse.setAttribute('dur', '0.8s');
            pulse.setAttribute('repeatCount', 'indefinite');
            circle.appendChild(pulse);
            
            svg.appendChild(circle);
        }
    }
    
    canvas.appendChild(svg);
    
    // Draw components
    game.components.forEach(comp => {
        const element = document.createElement('div');
        element.className = 'component';
        element.style.left = comp.x + 'px';
        element.style.top = comp.y + 'px';
        element.dataset.id = comp.id;
        
        // Add SVG icon
        const iconType = comp.type === 'serverOld' ? 'server' : comp.type;
        const icon = createIcon(iconType, 40);
        element.appendChild(icon);
        
        if (comp.active) element.classList.add('active');
        if (comp.error) element.classList.add('error');
        if (game.draggedComponent === comp) element.classList.add('dragging');
        if (game.selectedForSale.includes(comp.id)) element.classList.add('selected-for-sale');
        if (game.selectedComponents.includes(comp.id)) element.classList.add('selected');
        
        // Add label
        const label = document.createElement('div');
        label.className = 'component-label';
        label.textContent = comp.name;
        element.appendChild(label);
        
        // Add connection ports
        const portTop = createPort(comp, 'top');
        const portBottom = createPort(comp, 'bottom');
        const portLeft = createPort(comp, 'left');
        const portRight = createPort(comp, 'right');
        
        element.appendChild(portTop);
        element.appendChild(portBottom);
        element.appendChild(portLeft);
        element.appendChild(portRight);
        
        // Add upgrade indicator
        if (comp.level && comp.level > 1) {
            const levelBadge = document.createElement('div');
            levelBadge.className = 'level-badge';
            levelBadge.textContent = `Lv${comp.level}`;
            element.appendChild(levelBadge);
        }
        
        // Click handler
        element.addEventListener('mousedown', (e) => {
            if (e.button === 0 && !e.target.classList.contains('connection-port')) {
                e.stopPropagation();
                
                if (game.sellMode) {
                    // Toggle selection for sale
                    const index = game.selectedForSale.indexOf(comp.id);
                    if (index > -1) {
                        game.selectedForSale.splice(index, 1);
                        showMessage(`❌ ${comp.name} désélectionné`);
                    } else {
                        game.selectedForSale.push(comp.id);
                        showMessage(`✓ ${comp.name} sélectionné pour vente`);
                    }
                    updateSellCount();
                    updateCanvas();
                } else if (game.selectMode) {
                    // Single selection mode
                    game.selectedComponents = [comp.id];
                    showMessage(`✓ Sélectionné: ${comp.name}`);
                    updateCanvas();
                } else if (game.multiSelectMode) {
                    // Multi selection mode
                    const index = game.selectedComponents.indexOf(comp.id);
                    if (index > -1) {
                        game.selectedComponents.splice(index, 1);
                        showMessage(`❌ ${comp.name} désélectionné (${game.selectedComponents.length} restant(s))`);
                    } else {
                        game.selectedComponents.push(comp.id);
                        showMessage(`✓ ${comp.name} sélectionné (${game.selectedComponents.length} total)`);
                    }
                    updateCanvas();
                } else if (!game.connectingFrom) {
                    // Start drag after a small delay to allow click detection
                    game.dragStartTime = Date.now();
                    game.potentialDrag = comp;
                }
            }
        });
        
        element.addEventListener('mousemove', (e) => {
            if (game.potentialDrag === comp && Date.now() - game.dragStartTime > 150) {
                game.draggedComponent = comp;
                game.potentialDrag = null;
            }
        });
        
        // Click to show context menu
        element.addEventListener('click', (e) => {
            if (!game.sellMode && !game.draggedComponent && !game.connectingFrom) {
                e.stopPropagation();
                showComponentMenu(comp, element);
            }
        });
        
        // Right-click to remove
        element.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            if (!game.sellMode) {
                removeComponent(comp.id);
            }
        });
        
        canvas.appendChild(element);
    });
}

function createPort(comp, position) {
    const port = document.createElement('div');
    port.className = 'connection-port';
    port.dataset.position = position;
    port.dataset.compId = comp.id;
    
    // Add visual indicator for component category
    const category = getComponentCategory(comp.type);
    port.classList.add(`port-${category}`);
    
    const positions = {
        top: { top: '-5px', left: '50%', transform: 'translateX(-50%)' },
        bottom: { bottom: '-5px', left: '50%', transform: 'translateX(-50%)' },
        left: { left: '-5px', top: '50%', transform: 'translateY(-50%)' },
        right: { right: '-5px', top: '50%', transform: 'translateY(-50%)' }
    };
    
    Object.assign(port.style, positions[position]);
    
    // Click to start connection
    port.addEventListener('click', (e) => {
        e.stopPropagation();
        if (!game.connectingFrom) {
            startConnection(comp);
        } else if (game.connectingFrom.id !== comp.id) {
            endConnection(comp);
        }
    });
    
    // Hover effects for compatibility
    port.addEventListener('mouseenter', (e) => {
        if (game.connectingFrom && game.connectingFrom.id !== comp.id) {
            if (canConnect(game.connectingFrom, comp)) {
                port.classList.add('compatible');
            } else {
                port.classList.add('incompatible');
            }
        }
    });
    
    port.addEventListener('mouseleave', (e) => {
        port.classList.remove('compatible', 'incompatible');
    });
    
    return port;
}

function startConnection(comp) {
    game.connectingFrom = comp;
    game.connectionPreview = { x: comp.x + 30, y: comp.y + 30 };
    showMessage(`🔗 Connexion depuis ${comp.name}. Glissez vers un autre composant.`);
    updateCanvas();
}

function endConnection(comp) {
    if (game.connectingFrom && game.connectingFrom.id !== comp.id) {
        // Check compatibility
        if (!canConnect(game.connectingFrom, comp)) {
            showMessage(getConnectionErrorMessage(game.connectingFrom, comp));
            game.connectingFrom = null;
            game.connectionPreview = null;
            updateCanvas();
            return;
        }
        
        // Check if connection already exists
        const exists = game.connections.some(c => 
            (c.from === game.connectingFrom.id && c.to === comp.id) ||
            (c.from === comp.id && c.to === game.connectingFrom.id)
        );
        
        if (!exists) {
            game.connections.push({
                id: Date.now(),
                from: game.connectingFrom.id,
                to: comp.id,
                active: false
            });
            showMessage(`✅ Connexion créée: ${game.connectingFrom.name} ↔ ${comp.name}`);
            updateNetwork();
        } else {
            showMessage('⚠️ Connexion déjà existante!');
        }
    }
    game.connectingFrom = null;
    game.connectionPreview = null;
    updateCanvas();
}

function removeComponent(id) {
    const index = game.components.findIndex(c => c.id === id);
    if (index !== -1) {
        const comp = game.components[index];
        game.credits += Math.floor(comp.cost * 0.5); // Refund 50%
        game.components.splice(index, 1);
        
        // Remove connections
        game.connections = game.connections.filter(c => c.from !== id && c.to !== id);
        
        updateCanvas();
        updateNetwork();
        updateUI();
        showMessage(`♻️ Composant retiré. +${Math.floor(comp.cost * 0.5)} crédits`);
    }
}

function updateZoomLevel() {
    document.getElementById('zoomLevel').textContent = Math.round(game.camera.zoom * 100) + '%';
}

function updateNetwork() {
    // Calculate energy with energy boost
    const energyMultiplier = 1 + (game.skills.energyBoost * 0.1);
    let totalEnergy = 0;
    let usedEnergy = 0;
    
    game.components.forEach(comp => {
        if (comp.energy) totalEnergy += Math.floor(comp.energy * energyMultiplier);
        if (comp.energyCost) usedEnergy += comp.energyCost;
    });
    
    game.energy = { current: usedEnergy, max: totalEnergy };
    
    // Find power sources
    const powerSources = game.components.filter(c => c.energy);
    
    // Mark components connected to power
    const poweredComponents = new Set();
    powerSources.forEach(ps => {
        poweredComponents.add(ps.id);
        findConnectedComponents(ps.id, poweredComponents);
    });
    
    // Update component states based on connections
    game.components.forEach(comp => {
        const isPowered = poweredComponents.has(comp.id);
        
        if (comp.dataRate || comp.revenue) {
            comp.active = isPowered && usedEnergy <= totalEnergy;
            comp.error = !isPowered || usedEnergy > totalEnergy;
        } else if (comp.energy) {
            comp.active = true;
        } else {
            comp.active = isPowered;
        }
    });
    
    // Update connection states
    game.connections.forEach(conn => {
        const from = game.components.find(c => c.id === conn.from);
        const to = game.components.find(c => c.id === conn.to);
        conn.active = from?.active && to?.active;
    });
    
    // Calculate data rate with boost from connected processors
    let dataRate = 0;
    let boost = 1;
    
    game.components.forEach(comp => {
        if (comp.boost && comp.active) {
            // Check if processor is connected to any server
            const connectedToServer = game.connections.some(conn => {
                const other = game.components.find(c => 
                    c.id === (conn.from === comp.id ? conn.to : conn.from)
                );
                return other && other.dataRate;
            });
            if (connectedToServer) boost += comp.boost;
        }
    });
    
    game.components.forEach(comp => {
        if (comp.dataRate && comp.active) {
            dataRate += comp.dataRate * boost;
        }
    });
    
    game.dataRate = Math.floor(dataRate);
    
    updateCanvas();
}

function findConnectedComponents(componentId, connectedSet) {
    game.connections.forEach(conn => {
        if (conn.from === componentId && !connectedSet.has(conn.to)) {
            connectedSet.add(conn.to);
            findConnectedComponents(conn.to, connectedSet);
        } else if (conn.to === componentId && !connectedSet.has(conn.from)) {
            connectedSet.add(conn.from);
            findConnectedComponents(conn.from, connectedSet);
        }
    });
}

function processData() {
    if (game.energy.current <= game.energy.max) {
        // Process data with speed boost
        const speedMultiplier = 1 + (game.skills.speedBoost * 0.2);
        if (game.dataRate > 0) {
            game.dataProcessed += (game.dataRate * speedMultiplier) / 10;
        }
        
        // Generate credits from active components with revenue boost
        const revenueMultiplier = 1 + (game.skills.revenueBoost * 0.15);
        let creditsPerTick = 0;
        game.components.forEach(comp => {
            if (comp.revenue && comp.active) {
                creditsPerTick += (comp.revenue * revenueMultiplier) / 10;
            }
        });
        
        game.credits += creditsPerTick;
        game.creditsPerSecond = creditsPerTick * 10;
        
        // Gain experience based on credits per second with XP boost
        const xpMultiplier = 1 + (game.skills.xpBoost * 0.25);
        if (game.creditsPerSecond > 0) {
            gainExperience(game.creditsPerSecond * 0.01 * xpMultiplier);
        }
    } else {
        game.creditsPerSecond = 0;
    }
}

function checkMissions() {
    game.missions.forEach(mission => {
        if (mission.completed) return;
        
        let progress = false;
        if (mission.type === 'rate') {
            progress = game.dataRate >= mission.target;
        } else if (mission.type === 'credits') {
            progress = game.creditsPerSecond >= mission.target;
        } else if (mission.type === 'components') {
            progress = game.components.length >= mission.target;
        } else if (mission.type === 'upgrades') {
            const upgradedCount = game.components.filter(c => c.level > 1).length;
            progress = upgradedCount >= mission.target;
        } else if (mission.type === 'upgraded') {
            const level2Plus = game.components.filter(c => c.level >= 2).length;
            progress = level2Plus >= mission.target;
        } else if (mission.type === 'level') {
            progress = game.level >= mission.target;
        } else {
            progress = game.dataProcessed >= mission.target;
        }
        
        if (progress && !mission.completed) {
            mission.completed = true;
            showMessage(`🎉 Mission complétée! Cliquez pour récupérer la récompense`);
        }
    });
    
    updateMissions();
}

function checkLevelUnlocks() {
    const unlocks = levelUnlocks[game.level];
    if (unlocks) {
        unlocks.forEach(compType => {
            if (!game.unlockedComponents.includes(compType)) {
                game.unlockedComponents.push(compType);
                const comp = componentTypes[compType];
                showMessage(`🔓 Nouveau composant débloqué: ${comp.name}!`);
            }
        });
        updateShop();
    }
}

function updateShop() {
    const shopItems = document.querySelectorAll('.shop-item');
    Object.entries(componentTypes).forEach(([key, comp], index) => {
        const isUnlocked = game.unlockedComponents.includes(key);
        if (shopItems[index]) {
            if (isUnlocked) {
                shopItems[index].classList.remove('locked');
            } else {
                shopItems[index].classList.add('locked');
            }
        }
    });
}

function updateMissions() {
    let unclaimedCount = 0;
    
    game.missions.forEach(mission => {
        if (mission.completed && !mission.claimed) {
            unclaimedCount++;
        }
    });
    
    // Update badge
    if (missionBadge) {
        if (unclaimedCount > 0) {
            missionBadge.textContent = unclaimedCount;
            missionBadge.style.display = 'inline-block';
        } else {
            missionBadge.style.display = 'none';
        }
    }
    
    const missionMenuBadge = document.getElementById('missionMenuBadge');
    if (missionMenuBadge) {
        if (unclaimedCount > 0) {
            missionMenuBadge.textContent = unclaimedCount;
            missionMenuBadge.style.display = 'inline-block';
        } else {
            missionMenuBadge.style.display = 'none';
        }
    }
}

function claimMission(missionId) {
    const mission = game.missions.find(m => m.id === missionId);
    if (!mission || !mission.completed || mission.claimed) return;
    
    mission.claimed = true;
    game.credits += mission.reward;
    gainExperience(mission.xp);
    
    showMessage(`🎉 Récompense récupérée! +${mission.reward}₵ +${mission.xp}XP`);
    updateMissions();
    updateUI();
}

function updateUI() {
    document.getElementById('credits').textContent = Math.floor(game.credits);
    document.getElementById('creditsPerSec').textContent = `${game.creditsPerSecond.toFixed(1)} ₵/s`;
    document.getElementById('level').textContent = game.level;
    document.getElementById('energy').textContent = `${game.energy.current}/${game.energy.max}`;
    document.getElementById('skillPoints').textContent = game.skillPoints;
    
    // Update experience bar
    const expPercent = (game.experience / game.experienceToNext) * 100;
    document.getElementById('experienceBar').style.width = expPercent + '%';
    document.getElementById('experienceText').textContent = `${Math.floor(game.experience)} / ${game.experienceToNext} XP`;
}

function gainExperience(amount) {
    game.experience += amount;
    
    while (game.experience >= game.experienceToNext) {
        game.experience -= game.experienceToNext;
        game.level++;
        game.experienceToNext = Math.floor(game.experienceToNext * 1.5);
        
        // Check for unlocks
        checkLevelUnlocks();
        
        showMessage(`🎉 Niveau ${game.level} atteint! Nouveaux composants débloqués!`);
    }
    
    updateUI();
}

function showMessage(msg) {
    document.getElementById('message').textContent = msg;
}

function startGameLoop() {
    setInterval(() => {
        processData();
        updateUI();
        updateCollectibles();
    }, 100);
    
    setInterval(() => {
        checkMissions();
        spawnCollectible();
    }, 1000);
}

// Collectibles System
function spawnCollectible() {
    // Random chance to spawn (5% per second)
    if (Math.random() > 0.05) return;
    
    // Max 5 collectibles at once
    if (game.collectibles.length >= 5) return;
    
    const types = ['skill', 'xp', 'credits'];
    const type = types[Math.floor(Math.random() * types.length)];
    
    const collectible = {
        id: Date.now(),
        type: type,
        x: Math.random() * 800 - 400,
        y: Math.random() * 600 - 300,
        createdAt: Date.now()
    };
    
    game.collectibles.push(collectible);
    renderCollectible(collectible);
}

function renderCollectible(collectible) {
    const canvas = document.getElementById('canvas');
    const element = document.createElement('div');
    element.className = 'collectible';
    element.dataset.id = collectible.id;
    element.style.left = collectible.x + 'px';
    element.style.top = collectible.y + 'px';
    
    const icons = {
        skill: '⭐',
        xp: '✨',
        credits: '💎'
    };
    
    element.innerHTML = `
        <div class="collectible-icon">${icons[collectible.type]}</div>
        <div class="collectible-glow"></div>
    `;
    
    element.addEventListener('click', (e) => {
        e.stopPropagation();
        collectItem(collectible.id);
    });
    
    canvas.appendChild(element);
}

function collectItem(id) {
    const collectible = game.collectibles.find(c => c.id === id);
    if (!collectible) return;
    
    const element = document.querySelector(`.collectible[data-id="${id}"]`);
    if (element) {
        element.classList.add('collected');
        setTimeout(() => element.remove(), 300);
    }
    
    // Give rewards
    switch (collectible.type) {
        case 'skill':
            game.skillPoints++;
            showMessage('⭐ +1 Point de compétence!');
            break;
        case 'xp':
            const xpAmount = Math.floor(game.experienceToNext * 0.1);
            gainExperience(xpAmount);
            showMessage(`✨ +${xpAmount} XP!`);
            break;
        case 'credits':
            const creditAmount = Math.floor(game.credits * 0.05 + 100);
            game.credits += creditAmount;
            showMessage(`💎 +${creditAmount} Crédits!`);
            break;
    }
    
    game.collectibles = game.collectibles.filter(c => c.id !== id);
    updateUI();
}

function updateCollectibles() {
    // Collectibles now stay until collected
    // Just update their visual state if needed
    game.collectibles.forEach(c => {
        const element = document.querySelector(`.collectible[data-id="${c.id}"]`);
        if (element) {
            // Add pulsing effect for older collectibles to draw attention
            const age = Date.now() - c.createdAt;
            if (age > 30000) { // After 30 seconds, pulse faster
                element.style.animationDuration = '1s';
            }
        }
    });
}

// Skills Menu
function showSkillsMenu() {
    const modal = document.createElement('div');
    modal.className = 'skills-modal';
    
    const skillsData = [
        { key: 'energyBoost', name: 'Boost d\'Énergie', icon: '⚡', desc: '+10% énergie', max: 10 },
        { key: 'revenueBoost', name: 'Boost de Revenus', icon: '💰', desc: '+15% revenus', max: 10 },
        { key: 'speedBoost', name: 'Boost de Vitesse', icon: '🚀', desc: '+20% vitesse', max: 10 },
        { key: 'costReduction', name: 'Réduction de Coût', icon: '💸', desc: '-5% coûts', max: 10 },
        { key: 'xpBoost', name: 'Boost d\'XP', icon: '✨', desc: '+25% XP', max: 10 }
    ];
    
    let skillsHTML = skillsData.map(skill => {
        const currentLevel = game.skills[skill.key];
        const isMaxed = currentLevel >= skill.max;
        const canUpgrade = game.skillPoints > 0 && !isMaxed;
        
        return `
            <div class="skill-item ${isMaxed ? 'maxed' : ''}">
                <div class="skill-header">
                    <span class="skill-icon">${skill.icon}</span>
                    <span class="skill-name">${skill.name}</span>
                    <span class="skill-level">${currentLevel}/${skill.max}</span>
                </div>
                <div class="skill-desc">${skill.desc}</div>
                <div class="skill-bar">
                    <div class="skill-bar-fill" style="width: ${(currentLevel / skill.max) * 100}%"></div>
                </div>
                <button class="skill-upgrade-btn ${canUpgrade ? '' : 'disabled'}" 
                        data-skill="${skill.key}" 
                        ${!canUpgrade ? 'disabled' : ''}>
                    ${isMaxed ? 'MAX' : 'Améliorer (1 ⭐)'}
                </button>
            </div>
        `;
    }).join('');
    
    modal.innerHTML = `
        <div class="skills-content">
            <div class="skills-header">
                <h2>⭐ Compétences</h2>
                <p>Points disponibles: <strong>${game.skillPoints}</strong></p>
            </div>
            <div class="skills-list">
                ${skillsHTML}
            </div>
            <button class="skills-close-btn" id="closeSkills">Fermer</button>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add event listeners
    modal.querySelectorAll('.skill-upgrade-btn:not(.disabled)').forEach(btn => {
        btn.addEventListener('click', () => {
            const skillKey = btn.dataset.skill;
            upgradeSkill(skillKey);
            modal.remove();
            showSkillsMenu();
        });
    });
    
    document.getElementById('closeSkills').addEventListener('click', () => {
        modal.remove();
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });
}

function upgradeSkill(skillKey) {
    if (game.skillPoints <= 0) return;
    if (game.skills[skillKey] >= 10) return;
    
    game.skills[skillKey]++;
    game.skillPoints--;
    
    showMessage(`✨ Compétence améliorée!`);
    updateUI();
    
    updateNetwork();
}

function showSettingsMenu() {
    const modal = document.createElement('div');
    modal.className = 'skills-modal';
    
    modal.innerHTML = `
        <div class="skills-content">
            <div class="skills-header">
                <h2>⚙️ Paramètres</h2>
            </div>
            <div class="settings-list">
                <div class="setting-item">
                    <span class="setting-label">🔊 Sons</span>
                    <label class="toggle-switch">
                        <input type="checkbox" id="soundToggle" checked>
                        <span class="toggle-slider"></span>
                    </label>
                </div>
                <div class="setting-item">
                    <span class="setting-label">🎵 Musique</span>
                    <label class="toggle-switch">
                        <input type="checkbox" id="musicToggle" checked>
                        <span class="toggle-slider"></span>
                    </label>
                </div>
                <div class="setting-item">
                    <span class="setting-label">✨ Particules</span>
                    <label class="toggle-switch">
                        <input type="checkbox" id="particlesToggle" checked>
                        <span class="toggle-slider"></span>
                    </label>
                </div>
                <div class="setting-divider"></div>
                <button class="setting-btn danger" id="resetProgress">
                    🗑️ Réinitialiser la progression
                </button>
            </div>
            <button class="skills-close-btn" id="closeSettings">Fermer</button>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    document.getElementById('closeSettings').addEventListener('click', () => {
        modal.remove();
    });
    
    document.getElementById('resetProgress').addEventListener('click', () => {
        if (confirm('⚠️ Êtes-vous sûr de vouloir réinitialiser toute votre progression? Cette action est irréversible!')) {
            localStorage.removeItem(`uploadslabs_save_${Auth.currentUser}`);
            location.reload();
        }
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });
}

function showMissionsModal() {
    const modal = document.createElement('div');
    modal.className = 'skills-modal';
    
    const unclaimedCount = game.missions.filter(m => m.completed && !m.claimed).length;
    
    const missionsHTML = game.missions.map(mission => {
        const statusClass = mission.claimed ? 'claimed' : (mission.completed ? 'completed' : '');
        const statusText = mission.claimed ? '✓ Réclamée' : (mission.completed ? '🎉 Terminée!' : `${mission.progress}/${mission.target}`);
        
        return `
            <div class="mission ${statusClass}">
                <div class="mission-content">
                    <span class="mission-icon">${mission.icon}</span>
                    <div class="mission-desc">${mission.description}</div>
                </div>
                <div class="mission-reward">
                    <small>${statusText}</small>
                    ${mission.completed && !mission.claimed ? 
                        `<button class="claim-btn" onclick="claimMissionFromModal(${mission.id})">Réclamer ${mission.reward}₵</button>` : 
                        `<small>Récompense: ${mission.reward}₵</small>`
                    }
                </div>
            </div>
        `;
    }).join('');
    
    modal.innerHTML = `
        <div class="skills-content">
            <div class="skills-header">
                <h2>🎯 Missions</h2>
                ${unclaimedCount > 0 ? `<p style="color: #FFC107;">🎉 ${unclaimedCount} mission(s) à réclamer!</p>` : ''}
            </div>
            <div class="missions-list">
                ${missionsHTML}
            </div>
            <button class="skills-close-btn" id="closeMissions">Fermer</button>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    document.getElementById('closeMissions').addEventListener('click', () => {
        modal.remove();
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });
}

function claimMissionFromModal(missionId) {
    claimMission(missionId);
    document.querySelector('.skills-modal').remove();
    showMissionsModal();
}

function showHelpModal() {
    const modal = document.createElement('div');
    modal.className = 'skills-modal';
    
    modal.innerHTML = `
        <div class="skills-content">
            <div class="skills-header">
                <h2>ℹ️ Guide</h2>
            </div>
            <div class="help-content">
                <h3>🎮 Contrôles</h3>
                <ul>
                    <li><strong>Clic gauche</strong> - Placer composant</li>
                    <li><strong>Glisser composant</strong> - Déplacer</li>
                    <li><strong>Clic sur port</strong> - Créer connexion</li>
                    <li><strong>Clic droit</strong> - Supprimer</li>
                    <li><strong>Molette</strong> - Zoom</li>
                    <li><strong>Glisser fond</strong> - Déplacer vue</li>
                </ul>
                
                <h3>⚡ Composants - Alimentation</h3>
                <ul>
                    <li><strong>Alimentation</strong> - Fournit de l'énergie aux autres composants</li>
                    <li><strong>Réacteur Fusion</strong> - Source d'énergie massive pour réseaux avancés</li>
                </ul>
                
                <h3>🖥️ Composants - Traitement</h3>
                <ul>
                    <li><strong>Serveur</strong> - Génère des données et des revenus</li>
                    <li><strong>Générateur</strong> - Production de données améliorée</li>
                    <li><strong>Turbine</strong> - Traitement haute performance</li>
                    <li><strong>Générateur Antimatière</strong> - Production ultime</li>
                </ul>
                
                <h3>🎮 Composants - GPU</h3>
                <ul>
                    <li><strong>GPU</strong> - Calcul graphique, génère revenus</li>
                    <li><strong>Rig GPU</strong> - Ferme de 6 GPU pour production massive</li>
                    <li><strong>Super GPU</strong> - GPU haute performance</li>
                </ul>
                
                <h3>₿ Composants - Crypto</h3>
                <ul>
                    <li><strong>Mineur Bitcoin</strong> - Mine de la crypto, génère revenus</li>
                    <li><strong>Ferme Crypto</strong> - Minage industriel</li>
                    <li><strong>Mineur ASIC</strong> - Minage spécialisé haute efficacité</li>
                    <li><strong>Mineur Quantique</strong> - Technologie de minage ultime</li>
                </ul>
                
                <h3>⚙️ Composants - Utilitaires</h3>
                <ul>
                    <li><strong>Stockage</strong> - Augmente la capacité de données</li>
                    <li><strong>Module Traitement</strong> - Boost la vitesse des composants</li>
                    <li><strong>Refroidissement</strong> - Réduit la surcharge système</li>
                    <li><strong>Module IA</strong> - Automatise et optimise le réseau</li>
                    <li><strong>Processeur Quantique</strong> - Boost massif de vitesse</li>
                </ul>
                
                <h3>🔗 Connexions</h3>
                <ul>
                    <li>Les <strong>alimentations</strong> se connectent à tout composant nécessitant de l'énergie</li>
                    <li>Les <strong>serveurs/GPU/crypto</strong> se connectent entre eux et aux utilitaires</li>
                    <li>Le <strong>stockage</strong> se connecte aux serveurs et utilitaires</li>
                    <li>Les <strong>utilitaires</strong> boostent les composants connectés</li>
                </ul>
                
                <h3>💡 Astuces</h3>
                <ul>
                    <li><strong>Connexion:</strong> Clic sur un port, glisser vers un composant</li>
                    <li><strong>Menu composant:</strong> Clic sur un composant</li>
                    <li><strong>Amélioration:</strong> x1 ou x10 dans le menu</li>
                    <li>Les connexions sont gratuites!</li>
                    <li>Les particules dorées montrent le flux de données</li>
                    <li>Ligne verte = compatible, rouge = incompatible</li>
                </ul>
            </div>
            <button class="skills-close-btn" id="closeHelp">Fermer</button>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    document.getElementById('closeHelp').addEventListener('click', () => {
        modal.remove();
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });
}

function upgradeSelectedComponents() {
    if (game.selectedComponents.length === 0) return;
    
    let upgraded = 0;
    let totalCost = 0;
    
    game.selectedComponents.forEach(id => {
        const comp = game.components.find(c => c.id === id);
        if (!comp) return;
        
        const compType = componentTypes[comp.type];
        const currentLevel = comp.level || 1;
        const nextUpgrade = compType.upgrades?.find(u => u.level === currentLevel + 1);
        
        if (nextUpgrade && game.credits >= nextUpgrade.cost) {
            totalCost += nextUpgrade.cost;
            upgraded++;
        }
    });
    
    if (upgraded === 0) {
        showMessage('⚠️ Aucun composant ne peut être amélioré');
        return;
    }
    
    if (game.credits < totalCost) {
        showMessage('❌ Crédits insuffisants pour améliorer tous les composants');
        return;
    }
    
    // Perform upgrades
    game.selectedComponents.forEach(id => {
        const comp = game.components.find(c => c.id === id);
        if (!comp) return;
        
        const compType = componentTypes[comp.type];
        const currentLevel = comp.level || 1;
        const nextUpgrade = compType.upgrades?.find(u => u.level === currentLevel + 1);
        
        if (nextUpgrade && game.credits >= nextUpgrade.cost) {
            game.credits -= nextUpgrade.cost;
            comp.level = nextUpgrade.level;
            
            Object.keys(nextUpgrade).forEach(key => {
                if (key !== 'level' && key !== 'cost' && key !== 'desc') {
                    comp[key] = nextUpgrade[key];
                }
            });
            comp.desc = nextUpgrade.desc;
        }
    });
    
    showMessage(`✨ ${upgraded} composant(s) amélioré(s)!`);
    updateCanvas();
    updateNetwork();
    updateUI();
}

function deleteSelectedComponents() {
    if (game.selectedComponents.length === 0) return;
    
    if (!confirm(`Supprimer ${game.selectedComponents.length} composant(s)?`)) return;
    
    let totalRefund = 0;
    
    game.selectedComponents.forEach(id => {
        const comp = game.components.find(c => c.id === id);
        if (comp) {
            totalRefund += Math.floor(comp.cost * 0.5);
        }
    });
    
    game.components = game.components.filter(c => !game.selectedComponents.includes(c.id));
    game.connections = game.connections.filter(c => 
        !game.selectedComponents.includes(c.from) && !game.selectedComponents.includes(c.to)
    );
    
    game.credits += totalRefund;
    
    showMessage(`🗑️ ${game.selectedComponents.length} composant(s) supprimé(s) (+${totalRefund}₵)`);
    
    game.selectedComponents = [];
    updateCanvas();
    updateNetwork();
    updateUI();
}

function clearSelection() {
    game.selectedComponents = [];
    showMessage('Sélection effacée');
    updateCanvas();
}

// Authentication System
const Auth = {
    currentUser: null,
    
    hashPassword(password) {
        // Simple hash (in production, use proper encryption)
        let hash = 0;
        for (let i = 0; i < password.length; i++) {
            const char = password.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash.toString(36);
    },
    
    createTestAccount() {
        // Create a test account if it doesn't exist
        try {
            const users = JSON.parse(localStorage.getItem('uploadlabs_users') || '{}');
            if (!users['test']) {
                users['test'] = {
                    password: this.hashPassword('test'),
                    createdAt: Date.now()
                };
                localStorage.setItem('uploadlabs_users', JSON.stringify(users));
                console.log('✅ Compte test créé: username="test", password="test"');
            }
        } catch (e) {
            console.error('Erreur création compte test:', e);
        }
    },
    
    register(username, password) {
        if (!username || username.length < 3) {
            return { success: false, error: 'Le nom doit contenir au moins 3 caractères' };
        }
        
        if (!password || password.length < 4) {
            return { success: false, error: 'Le mot de passe doit contenir au moins 4 caractères' };
        }
        
        try {
            const users = JSON.parse(localStorage.getItem('uploadlabs_users') || '{}');
            
            if (users[username]) {
                return { success: false, error: 'Ce nom d\'utilisateur existe déjà' };
            }
            
            users[username] = {
                password: this.hashPassword(password),
                createdAt: Date.now()
            };
            
            localStorage.setItem('uploadlabs_users', JSON.stringify(users));
            return { success: true };
        } catch (e) {
            console.error('Registration error:', e);
            return { success: false, error: 'Erreur d\'inscription. Veuillez réessayer.' };
        }
    },
    
    login(username, password) {
        if (!username || !password) {
            return { success: false, error: 'Veuillez remplir tous les champs' };
        }
        
        try {
            const users = JSON.parse(localStorage.getItem('uploadlabs_users') || '{}');
            
            if (!users[username]) {
                return { success: false, error: 'Nom d\'utilisateur ou mot de passe incorrect' };
            }
            
            if (users[username].password !== this.hashPassword(password)) {
                return { success: false, error: 'Nom d\'utilisateur ou mot de passe incorrect' };
            }
            
            this.currentUser = username;
            localStorage.setItem('uploadlabs_currentUser', username);
            return { success: true };
        } catch (e) {
            console.error('Login error:', e);
            return { success: false, error: 'Erreur de connexion. Veuillez réessayer.' };
        }
    },
    
    logout() {
        this.saveGame();
        this.currentUser = null;
        localStorage.removeItem('uploadlabs_currentUser');
    },
    
    checkSession() {
        const savedUser = localStorage.getItem('uploadlabs_currentUser');
        if (savedUser) {
            const users = JSON.parse(localStorage.getItem('uploadlabs_users') || '{}');
            if (users[savedUser]) {
                this.currentUser = savedUser;
                return true;
            }
        }
        return false;
    },
    
    saveGame() {
        if (!this.currentUser) return;
        
        const saveData = {
            credits: game.credits,
            level: game.level,
            experience: game.experience,
            experienceToNext: game.experienceToNext,
            components: game.components,
            connections: game.connections,
            missions: game.missions,
            unlockedComponents: game.unlockedComponents,
            dataProcessed: game.dataProcessed,
            skillPoints: game.skillPoints,
            skills: game.skills,
            savedAt: Date.now()
        };
        
        localStorage.setItem(`uploadlabs_save_${this.currentUser}`, JSON.stringify(saveData));
    },
    
    loadGame() {
        if (!this.currentUser) return false;
        
        const saveData = localStorage.getItem(`uploadlabs_save_${this.currentUser}`);
        if (!saveData) return false;
        
        try {
            const data = JSON.parse(saveData);
            game.credits = data.credits || 150;
            game.level = data.level || 1;
            game.experience = data.experience || 0;
            game.experienceToNext = data.experienceToNext || 100;
            game.components = data.components || [];
            game.connections = data.connections || [];
            game.missions = data.missions || [];
            // Migrate old missions to add claimed field
            game.missions.forEach(mission => {
                if (mission.claimed === undefined) {
                    mission.claimed = mission.completed || false;
                }
            });
            game.unlockedComponents = data.unlockedComponents || ['power', 'server', 'storage'];
            game.dataProcessed = data.dataProcessed || 0;
            game.skillPoints = data.skillPoints || 0;
            game.skills = data.skills || {
                energyBoost: 0,
                revenueBoost: 0,
                speedBoost: 0,
                costReduction: 0,
                xpBoost: 0
            };
            return true;
        } catch (e) {
            console.error('Error loading save:', e);
            return false;
        }
    }
};

// Auto-save every 30 seconds
setInterval(() => {
    if (Auth.currentUser) {
        Auth.saveGame();
    }
}, 30000);

// Save on page unload
window.addEventListener('beforeunload', () => {
    if (Auth.currentUser) {
        Auth.saveGame();
    }
});

// Loading sequence
let loadingProgress = 0;
const loadingSteps = [
    { progress: 20, text: 'Chargement des composants...', delay: 200 },
    { progress: 40, text: 'Initialisation du réseau...', delay: 300 },
    { progress: 60, text: 'Configuration des systèmes...', delay: 250 },
    { progress: 80, text: 'Préparation de l\'interface...', delay: 200 },
    { progress: 100, text: 'Prêt!', delay: 300 }
];

function updateLoadingScreen(step) {
    const loadingBar = document.getElementById('loadingBar');
    const loadingText = document.getElementById('loadingText');
    
    if (loadingBar && loadingText) {
        loadingBar.style.width = step.progress + '%';
        loadingText.textContent = step.text;
    }
}

function startLoading() {
    let currentStep = 0;
    
    function nextStep() {
        if (currentStep < loadingSteps.length) {
            updateLoadingScreen(loadingSteps[currentStep]);
            currentStep++;
            setTimeout(nextStep, loadingSteps[currentStep - 1].delay);
        } else {
            // Loading complete, hide screen and start game
            setTimeout(() => {
                const loadingScreen = document.getElementById('loadingScreen');
                loadingScreen.classList.add('hidden');
                init();
            }, 500);
        }
    }
    
    nextStep();
}

// Auth UI handlers
function setupAuthUI() {
    const authScreen = document.getElementById('authScreen');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    
    // Show register form
    document.getElementById('showRegister').addEventListener('click', (e) => {
        e.preventDefault();
        loginForm.style.display = 'none';
        registerForm.style.display = 'block';
        document.getElementById('registerError').textContent = '';
    });
    
    // Show login form
    document.getElementById('showLogin').addEventListener('click', (e) => {
        e.preventDefault();
        registerForm.style.display = 'none';
        loginForm.style.display = 'block';
        document.getElementById('loginError').textContent = '';
    });
    
    // Login
    document.getElementById('loginBtn').addEventListener('click', () => {
        const username = document.getElementById('loginUsername').value.trim();
        const password = document.getElementById('loginPassword').value;
        const errorEl = document.getElementById('loginError');
        
        // Clear previous error
        errorEl.textContent = '';
        
        if (!username || !password) {
            errorEl.textContent = 'Veuillez remplir tous les champs';
            return;
        }
        
        const result = Auth.login(username, password);
        if (result.success) {
            authScreen.classList.add('hidden');
            setTimeout(() => {
                document.getElementById('loadingScreen').style.display = 'flex';
                startLoading();
            }, 500);
        } else {
            errorEl.textContent = result.error;
        }
    });
    
    // Register
    document.getElementById('registerBtn').addEventListener('click', () => {
        const username = document.getElementById('registerUsername').value.trim();
        const password = document.getElementById('registerPassword').value;
        const passwordConfirm = document.getElementById('registerPasswordConfirm').value;
        const errorEl = document.getElementById('registerError');
        
        // Clear previous error
        errorEl.textContent = '';
        
        if (!username || !password || !passwordConfirm) {
            errorEl.textContent = 'Veuillez remplir tous les champs';
            return;
        }
        
        if (password !== passwordConfirm) {
            errorEl.textContent = 'Les mots de passe ne correspondent pas';
            return;
        }
        
        const result = Auth.register(username, password);
        if (result.success) {
            // Auto-login after registration
            const loginResult = Auth.login(username, password);
            if (loginResult.success) {
                authScreen.classList.add('hidden');
                setTimeout(() => {
                    document.getElementById('loadingScreen').style.display = 'flex';
                    startLoading();
                }, 500);
            } else {
                errorEl.textContent = 'Compte créé mais erreur de connexion. Veuillez vous connecter manuellement.';
            }
        } else {
            errorEl.textContent = result.error;
        }
    });
    
    document.getElementById('skillsBtn').addEventListener('click', () => {
        showSkillsMenu();
    });
    
    const menuToggle = document.getElementById('menuToggle');
    const dropdownContent = document.getElementById('dropdownContent');
    
    menuToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        menuToggle.classList.toggle('active');
        dropdownContent.classList.toggle('show');
    });
    
    document.addEventListener('click', (e) => {
        if (!menuToggle.contains(e.target) && !dropdownContent.contains(e.target)) {
            menuToggle.classList.remove('active');
            dropdownContent.classList.remove('show');
        }
    });
    
    document.getElementById('missionsMenuBtn').addEventListener('click', () => {
        showMissionsModal();
        dropdownContent.classList.remove('show');
        menuToggle.classList.remove('active');
    });
    
    document.getElementById('helpMenuBtn').addEventListener('click', () => {
        showHelpModal();
        dropdownContent.classList.remove('show');
        menuToggle.classList.remove('active');
    });
    
    document.getElementById('settingsMenuBtn').addEventListener('click', () => {
        showSettingsMenu();
        dropdownContent.classList.remove('show');
        menuToggle.classList.remove('active');
    });
    
    document.getElementById('logoutBtn').addEventListener('click', () => {
        if (confirm('Voulez-vous vraiment vous déconnecter? Votre progression sera sauvegardée.')) {
            Auth.logout();
            location.reload();
        }
    });
    
    // Enter key support
    document.getElementById('loginPassword').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') document.getElementById('loginBtn').click();
    });
    
    document.getElementById('registerPasswordConfirm').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') document.getElementById('registerBtn').click();
    });
}

// Start loading when page is ready


// Start loading when page is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        // Create test account on load
        Auth.createTestAccount();
        setupAuthUI();
        // Check if user is already logged in
        if (Auth.checkSession()) {
            document.getElementById('authScreen').classList.add('hidden');
            document.getElementById('loadingScreen').style.display = 'flex';
            startLoading();
        }
    });
} else {
    // Create test account on load
    Auth.createTestAccount();
    setupAuthUI();
    if (Auth.checkSession()) {
        document.getElementById('authScreen').classList.add('hidden');
        document.getElementById('loadingScreen').style.display = 'flex';
        startLoading();
    }
}
