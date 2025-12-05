const CONFIG = {
    CHUNK_SIZE: 16,
    RENDER_DISTANCE: 2,
    BLOCK_SIZE: 1,
    WORLD_HEIGHT: 32,
    GRAVITY: 0.08,
    JUMP_FORCE: 0.5,
    MOVE_SPEED: 0.15,
    SPRINT_SPEED: 0.25,
    MOUSE_SENSITIVITY: 0.002,
    INVERT_MOUSE: false,
    REACH_DISTANCE: 6,
    TICK_RATE: 20,
    DAY_LENGTH: 24000,
    FOV: 70,
    NEAR: 0.1,
    FAR: 1000,
    MAX_BLOCKS_RENDER: 500
};

function loadSettings() {
    const saved = localStorage.getItem('minecraftSettings');
    if (saved) {
        const settings = JSON.parse(saved);
        Object.assign(CONFIG, settings);
        console.log('✓ Paramètres chargés');
    }
}

function saveSettings() {
    const settings = {
        RENDER_DISTANCE: CONFIG.RENDER_DISTANCE,
        MOUSE_SENSITIVITY: CONFIG.MOUSE_SENSITIVITY,
        INVERT_MOUSE: CONFIG.INVERT_MOUSE,
        FOV: CONFIG.FOV
    };
    localStorage.setItem('minecraftSettings', JSON.stringify(settings));
    console.log('✓ Paramètres sauvegardés');
}

loadSettings();

const KEYS = {
    FORWARD: ['w', 'z'],
    BACKWARD: ['s'],
    LEFT: ['a', 'q'],
    RIGHT: ['d'],
    JUMP: [' '],
    SPRINT: ['shift'],
    SNEAK: ['control'],
    INVENTORY: ['e'],
    DROP: ['q'],
    CHAT: ['t'],
    PAUSE: ['escape']
};
