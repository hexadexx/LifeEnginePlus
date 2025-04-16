class CellState{
    constructor(name) {
        this.name = name;
        this.color = 'black';
    }

    render(ctx, cell, size) {
        ctx.fillStyle = this.color;
        ctx.fillRect(cell.x, cell.y, size, size);
    }
}

class Empty extends CellState {
    constructor() {
        super('empty');
    }
}
class Food extends CellState {
    constructor() {
        super('food');
    }
    render(ctx, cell, size) {
        ctx.fillStyle = this.color;
        ctx.fillRect(cell.x, cell.y, size, size);
        
        if(size == 1) return;
        
        const innerSize = size / 2;
        const offset = (size - innerSize) / 2;
        ctx.fillStyle = "#1D4970"; 
        ctx.fillRect(cell.x + offset, cell.y + offset, innerSize, innerSize);
    }
}

class Plant extends CellState {
    constructor() {
        super('plant');
    }
    render(ctx, cell, size) {
        ctx.fillStyle = this.color;
        ctx.fillRect(cell.x, cell.y, size, size);
        
        if(size == 1) return;
        
        const innerSize = size / 2;
        const offset = (size - innerSize) / 2;
        ctx.fillStyle = "#50AA50"; 
        ctx.fillRect(cell.x + offset, cell.y + offset, innerSize, innerSize);
    }
}

class Meat extends CellState {
    constructor() {
        super('meat');
    }
    render(ctx, cell, size) {
        ctx.fillStyle = this.color;
        ctx.fillRect(cell.x, cell.y, size, size);
        
        if(size == 1) return;
        
        const innerSize = size / 2;
        const offset = (size - innerSize) / 2;
        ctx.fillStyle = "#C95050"; 
        ctx.fillRect(cell.x + offset, cell.y + offset, innerSize, innerSize);
    }
}
class Wall extends CellState {
    constructor() {
        super('wall');
    }
}
class CarnivoreMount extends CellState {
    constructor() {
        super('carnivoreMouth');
    }
    render(ctx, cell, size) {
        ctx.fillStyle = this.color;
        ctx.fillRect(cell.x, cell.y, size, size);
        if(size == 1) return;
        
        ctx.fillStyle = "#8B0000"; 
        const slitWidth = 3;
        
        ctx.fillRect(cell.x + (size / 2) - (slitWidth / 2), cell.y, slitWidth, slitWidth);
        
        ctx.fillRect(cell.x + (size / 2) - (slitWidth / 2), cell.y + size - slitWidth, slitWidth, slitWidth);
        
        ctx.fillRect(cell.x, cell.y + (size / 2) - (slitWidth / 2), slitWidth, slitWidth);
        
        ctx.fillRect(cell.x + size - slitWidth, cell.y + (size / 2) - (slitWidth / 2), slitWidth, slitWidth);
    }
}
class HerbivoreMouth extends CellState {
    constructor() {
        super('herbivoreMouth');
    }
    render(ctx, cell, size) {
        ctx.fillStyle = this.color;
        ctx.fillRect(cell.x, cell.y, size, size);
        if(size == 1) return;
        
        ctx.fillStyle = "#006400"; 
        const slitWidth = 3;
        
        ctx.fillRect(cell.x + (size / 2) - (slitWidth / 2), cell.y, slitWidth, slitWidth);
        
        ctx.fillRect(cell.x + (size / 2) - (slitWidth / 2), cell.y + size - slitWidth, slitWidth, slitWidth);
        
        ctx.fillRect(cell.x, cell.y + (size / 2) - (slitWidth / 2), slitWidth, slitWidth);
        
        ctx.fillRect(cell.x + size - slitWidth, cell.y + (size / 2) - (slitWidth / 2), slitWidth, slitWidth);
    }
}
class Producer extends CellState {
    constructor() {
        super('producer');
    }
}
class Mover extends CellState {
    constructor() {
        super('mover');
    }
}
class Killer extends CellState {
    constructor() {
        super('killer');
    }
}
class Armor extends CellState {
    constructor() {
        super('armor');
    }
}
class Storage extends CellState {
    constructor() {
        super('storage');
    }
    render(ctx, cell, size) {
        ctx.fillStyle = this.color;
        ctx.fillRect(cell.x, cell.y, size, size);
        
        if(size == 1 || !cell.cell_owner || !cell.cell_owner.storedFood) return;
        
        let innerColor;
        switch(cell.cell_owner.storedFood) {
            case "food":
                innerColor = "#2F7AB7"; 
                break;
            case "meat":
                innerColor = "#FF7F7F"; 
                break;
            case "plant":
                innerColor = "#90EE90"; 
                break;
            default:
                return;
        }
        
        const innerSize = size / 2;
        const offset = (size - innerSize) / 2;
        ctx.fillStyle = innerColor;
        ctx.fillRect(cell.x + offset, cell.y + offset, innerSize, innerSize);
    }
}
class Eye extends CellState {
    constructor() {
        super('eye');
        this.slit_color = 'black';
    }
    render(ctx, cell, size) {
        ctx.fillStyle = this.color;
        ctx.fillRect(cell.x, cell.y, size, size);
        if(size == 1)
            return;
        var half = size/2;
        var x = -(size)/8
        var y = -half;
        var h = size/2 + size/4;
        var w = size/4;
        ctx.save();
        ctx.translate(cell.x+half, cell.y+half);
        ctx.rotate((cell.cell_owner.getAbsoluteDirection() * 90) * Math.PI / 180);
        ctx.fillStyle = this.slit_color;
        ctx.fillRect(x, y, w, h);
        ctx.restore();
    }
}
class LeftRightMover extends CellState {
    constructor() {
        super('leftRightMover');
    }
    render(ctx, cell, size) {
        ctx.fillStyle = this.color;
        ctx.fillRect(cell.x, cell.y, size, size);
        if(size == 1) return;
        
        ctx.fillStyle = "#305A80"; 
        const slitWidth = 3;
        
        ctx.fillRect(cell.x, cell.y + (size / 2) - (slitWidth / 2), slitWidth, slitWidth);
        
        ctx.fillRect(cell.x + size - slitWidth, cell.y + (size / 2) - (slitWidth / 2), slitWidth, slitWidth);
    }
}
class UpDownMover extends CellState {
    constructor() {
        super('upDownMover');
    }
    render(ctx, cell, size) {
        ctx.fillStyle = this.color;
        ctx.fillRect(cell.x, cell.y, size, size);
        if(size == 1) return;
        
        ctx.fillStyle = "#305A80"; 
        const slitWidth = 3;
        
        ctx.fillRect(cell.x + (size / 2) - (slitWidth / 2), cell.y, slitWidth, slitWidth);
        
        ctx.fillRect(cell.x + (size / 2) - (slitWidth / 2), cell.y + size - slitWidth, slitWidth, slitWidth);
    }
}
class RotationMover extends CellState {
    constructor() {
        super('rotationMover');
    }
    render(ctx, cell, size) {
        ctx.fillStyle = this.color;
        ctx.fillRect(cell.x, cell.y, size, size);
        if(size == 1) return;
        
        ctx.fillStyle = "#305A80"; 
        const slitWidth = 3;
        
        ctx.fillRect(cell.x, cell.y, slitWidth, slitWidth);
        
        ctx.fillRect(cell.x + size - slitWidth, cell.y, slitWidth, slitWidth);
        
        ctx.fillRect(cell.x, cell.y + size - slitWidth, slitWidth, slitWidth);
        
        ctx.fillRect(cell.x + size - slitWidth, cell.y + size - slitWidth, slitWidth, slitWidth);
    }
}


const CellStates = {
    empty: new Empty(),
    food: new Food(),
    plant: new Plant(),
    meat: new Meat(),
    wall: new Wall(),
    carnivoreMouth: new CarnivoreMount(),
    herbivoreMouth: new HerbivoreMouth(),
    producer: new Producer(),
    mover: new Mover(),
    leftRightMover: new LeftRightMover(),
    upDownMover: new UpDownMover(),
    rotationMover: new RotationMover(),
    killer: new Killer(),
    armor: new Armor(),
    storage: new Storage(),
    eye: new Eye(),
    defineLists() {
        this.all = [
            this.empty, this.food, this.plant, this.meat, this.wall, 
            this.carnivoreMouth, this.herbivoreMouth, this.producer, 
            this.mover, this.leftRightMover, this.upDownMover, this.rotationMover,
            this.killer, this.armor, this.storage, this.eye
        ]
        this.living = [
            this.carnivoreMouth, this.herbivoreMouth, this.producer, 
            this.mover, this.leftRightMover, this.upDownMover, this.rotationMover,
            this.killer, this.armor, this.storage, this.eye
        ];
    },
    getRandomName: function() {
        return this.all[Math.floor(Math.random() * this.all.length)].name;
    },
    getRandomLivingType: function() {
        return this.living[Math.floor(Math.random() * this.living.length)];
    },
}

CellStates.defineLists();

module.exports = CellStates;