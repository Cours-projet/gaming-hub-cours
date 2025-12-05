const BLOCKS = {
    AIR: {
        id: 0,
        name: 'Air',
        icon: '',
        solid: false,
        transparent: true,
        color: [0, 0, 0, 0]
    },
    GRASS: {
        id: 1,
        name: 'Herbe',
        icon: '🟩',
        solid: true,
        transparent: false,
        color: [0.4, 0.8, 0.2],
        drops: 'DIRT'
    },
    DIRT: {
        id: 2,
        name: 'Terre',
        icon: '🟫',
        solid: true,
        transparent: false,
        color: [0.55, 0.27, 0.07]
    },
    STONE: {
        id: 3,
        name: 'Pierre',
        icon: '⬜',
        solid: true,
        transparent: false,
        color: [0.5, 0.5, 0.5],
        drops: 'COBBLESTONE'
    },
    COBBLESTONE: {
        id: 4,
        name: 'Roche',
        icon: '⬛',
        solid: true,
        transparent: false,
        color: [0.4, 0.4, 0.4]
    },
    WOOD: {
        id: 5,
        name: 'Bois',
        icon: '🟫',
        solid: true,
        transparent: false,
        color: [0.55, 0.35, 0.15]
    },
    PLANKS: {
        id: 6,
        name: 'Planches',
        icon: '🟫',
        solid: true,
        transparent: false,
        color: [0.7, 0.5, 0.3]
    },
    LEAVES: {
        id: 7,
        name: 'Feuilles',
        icon: '🟢',
        solid: true,
        transparent: true,
        color: [0.13, 0.55, 0.13]
    },
    GLASS: {
        id: 8,
        name: 'Verre',
        icon: '⬜',
        solid: true,
        transparent: true,
        color: [0.8, 0.9, 1.0, 0.3]
    },
    SAND: {
        id: 9,
        name: 'Sable',
        icon: '🟨',
        solid: true,
        transparent: false,
        color: [0.96, 0.64, 0.38]
    },
    WATER: {
        id: 10,
        name: 'Eau',
        icon: '💧',
        solid: false,
        transparent: true,
        color: [0.12, 0.56, 1.0, 0.6]
    },
    COAL_ORE: {
        id: 11,
        name: 'Minerai de Charbon',
        icon: '⚫',
        solid: true,
        transparent: false,
        color: [0.3, 0.3, 0.3],
        drops: 'COAL'
    },
    IRON_ORE: {
        id: 12,
        name: 'Minerai de Fer',
        icon: '⚪',
        solid: true,
        transparent: false,
        color: [0.75, 0.75, 0.75]
    },
    GOLD_ORE: {
        id: 13,
        name: 'Minerai d\'Or',
        icon: '🟡',
        solid: true,
        transparent: false,
        color: [1.0, 0.84, 0.0]
    },
    DIAMOND_ORE: {
        id: 14,
        name: 'Minerai de Diamant',
        icon: '💎',
        solid: true,
        transparent: false,
        color: [0.0, 0.81, 0.82],
        drops: 'DIAMOND'
    },
    COAL: {
        id: 15,
        name: 'Charbon',
        icon: '⚫',
        solid: true,
        transparent: false,
        color: [0.1, 0.1, 0.1]
    },
    DIAMOND: {
        id: 16,
        name: 'Diamant',
        icon: '💎',
        solid: true,
        transparent: false,
        color: [0.0, 0.81, 0.82]
    },
    BEDROCK: {
        id: 17,
        name: 'Bedrock',
        icon: '⬛',
        solid: true,
        transparent: false,
        color: [0.2, 0.2, 0.2],
        unbreakable: true
    }
};

function getBlockByName(name) {
    return BLOCKS[name];
}

function getBlockById(id) {
    return Object.values(BLOCKS).find(block => block.id === id);
}
