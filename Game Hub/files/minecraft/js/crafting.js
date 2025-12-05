const RECIPES = [
    {
        result: { type: 'PLANKS', count: 4 },
        pattern: [
            ['WOOD', null, null],
            [null, null, null],
            [null, null, null]
        ]
    },
    {
        result: { type: 'PLANKS', count: 4 },
        pattern: [
            [null, 'WOOD', null],
            [null, null, null],
            [null, null, null]
        ]
    },
    {
        result: { type: 'PLANKS', count: 4 },
        pattern: [
            [null, null, 'WOOD'],
            [null, null, null],
            [null, null, null]
        ]
    },
    {
        result: { type: 'GLASS', count: 1 },
        pattern: [
            ['SAND', null, null],
            [null, null, null],
            [null, null, null]
        ]
    }
];

class CraftingTable {
    constructor() {
        this.grid = new Array(9).fill(null).map(() => ({ type: null, count: 0 }));
    }

    setSlot(index, item) {
        this.grid[index] = item;
    }

    getResult() {
        const pattern = [
            [this.grid[0].type, this.grid[1].type, this.grid[2].type],
            [this.grid[3].type, this.grid[4].type, this.grid[5].type],
            [this.grid[6].type, this.grid[7].type, this.grid[8].type]
        ];

        for (const recipe of RECIPES) {
            if (this.matchesPattern(pattern, recipe.pattern)) {
                return recipe.result;
            }
        }

        return null;
    }

    matchesPattern(grid, pattern) {
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (grid[i][j] !== pattern[i][j]) {
                    return false;
                }
            }
        }
        return true;
    }

    craft(inventory) {
        const result = this.getResult();
        if (!result) return false;

        for (let i = 0; i < 9; i++) {
            if (this.grid[i].type) {
                this.grid[i].count--;
                if (this.grid[i].count === 0) {
                    this.grid[i] = { type: null, count: 0 };
                }
            }
        }

        inventory.addItem(result.type, result.count);
        return true;
    }

    clear() {
        this.grid = new Array(9).fill(null).map(() => ({ type: null, count: 0 }));
    }
}
