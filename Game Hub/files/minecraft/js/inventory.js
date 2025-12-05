class Inventory {
    constructor() {
        this.slots = new Array(36).fill(null).map(() => ({ type: null, count: 0 }));
        this.hotbar = this.slots.slice(0, 9);
        
        this.slots[0] = { type: 'DIRT', count: 64 };
        this.slots[1] = { type: 'WOOD', count: 32 };
        this.slots[2] = { type: 'STONE', count: 16 };
    }

    addItem(itemType, count = 1) {
        for (let i = 0; i < this.slots.length; i++) {
            if (this.slots[i].type === itemType && this.slots[i].count < 64) {
                const space = 64 - this.slots[i].count;
                const toAdd = Math.min(space, count);
                this.slots[i].count += toAdd;
                count -= toAdd;
                if (count === 0) return true;
            }
        }
        
        for (let i = 0; i < this.slots.length; i++) {
            if (this.slots[i].type === null) {
                const toAdd = Math.min(64, count);
                this.slots[i] = { type: itemType, count: toAdd };
                count -= toAdd;
                if (count === 0) return true;
            }
        }
        
        return count === 0;
    }

    removeItem(itemType, count = 1) {
        let remaining = count;
        
        for (let i = 0; i < this.slots.length; i++) {
            if (this.slots[i].type === itemType) {
                const toRemove = Math.min(this.slots[i].count, remaining);
                this.slots[i].count -= toRemove;
                remaining -= toRemove;
                
                if (this.slots[i].count === 0) {
                    this.slots[i] = { type: null, count: 0 };
                }
                
                if (remaining === 0) return true;
            }
        }
        
        return remaining === 0;
    }

    hasItem(itemType, count = 1) {
        let total = 0;
        for (let i = 0; i < this.slots.length; i++) {
            if (this.slots[i].type === itemType) {
                total += this.slots[i].count;
            }
        }
        return total >= count;
    }

    getSelectedItem(slotIndex) {
        return this.slots[slotIndex];
    }

    swapSlots(index1, index2) {
        const temp = this.slots[index1];
        this.slots[index1] = this.slots[index2];
        this.slots[index2] = temp;
    }
}
