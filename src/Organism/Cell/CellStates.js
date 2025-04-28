const Hyperparams = require('../../Hyperparameters.js');

class CellState {
    constructor(name) {
        this.name = name;
        this.color = 'black';
    }

    render(ctx, cell, size) {
        ctx.fillStyle = this.color;
        ctx.fillRect(cell.x, cell.y, size, size);
        
        if (Hyperparams.showPheromones && (cell.redPheromone > 0 || cell.greenPheromone > 0 || cell.bluePheromone > 0)) {
            const r = Math.min(255, Math.floor(cell.redPheromone > 0 ? 255 : 0));
            const g = Math.min(255, Math.floor(cell.greenPheromone > 0 ? 255 : 0));
            const b = Math.min(255, Math.floor(cell.bluePheromone > 0 ? 255 : 0));
            
            const maxFrames = 30;
            const remainingFrames = Math.max(cell.redPheromone, cell.greenPheromone, cell.bluePheromone);
            const fadeRatio = remainingFrames / maxFrames;
            
            const opacity = fadeRatio * 0.275;
            
            ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`;
            ctx.fillRect(cell.x, cell.y, size, size);
        }
    }
    
    darkenColor(hex, amount) {
        hex = hex.replace(/^#/, '');
        let r = parseInt(hex.substring(0, 2), 16);
        let g = parseInt(hex.substring(2, 4), 16);
        let b = parseInt(hex.substring(4, 6), 16);
        
        if (amount < 0) {
            r = Math.min(255, Math.floor(r * (1 - amount)));
            g = Math.min(255, Math.floor(g * (1 - amount)));
            b = Math.min(255, Math.floor(b * (1 - amount)));
        } else {
            r = Math.max(0, Math.floor(r * (1 - amount)));
            g = Math.max(0, Math.floor(g * (1 - amount)));
            b = Math.max(0, Math.floor(b * (1 - amount)));
        }
        
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
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
        const depth = Math.min(cell.depth || 1, 3);
        let color;
        let noiseAmount;
        switch (depth) {
            case 1: 
                color = this.color; 
                noiseAmount = 0.2;
                break;
            case 2: 
                color = this.darkenColor(this.color, -0.15); 
                noiseAmount = 0.15;
                break;
            case 3: 
                color = this.darkenColor(this.color, -0.3); 
                noiseAmount = 0.1;
                break;
            default: 
                color = this.color;
                noiseAmount = 0.2;
        }
        const randomSeed = (cell.col * 1000 + cell.row) % 10000;
        Math.seedrandom(randomSeed);
        const darkenAmount = (Math.random() - 0.5) * noiseAmount;
        const adjustedColor = this.darkenColor(color, darkenAmount);
        ctx.fillStyle = adjustedColor;
        ctx.fillRect(cell.x, cell.y, size, size);
        
        if (Hyperparams.showPheromones && (cell.redPheromone > 0 || cell.greenPheromone > 0 || cell.bluePheromone > 0)) {
            const r = Math.min(255, Math.floor(cell.redPheromone > 0 ? 255 : 0));
            const g = Math.min(255, Math.floor(cell.greenPheromone > 0 ? 255 : 0));
            const b = Math.min(255, Math.floor(cell.bluePheromone > 0 ? 255 : 0));
            
            const maxFrames = 30;
            const remainingFrames = Math.max(cell.redPheromone, cell.greenPheromone, cell.bluePheromone);
            const fadeRatio = remainingFrames / maxFrames;
            
            const opacity = fadeRatio * 0.275;
            
            ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`;
            ctx.fillRect(cell.x, cell.y, size, size);
        }
    }
}

class Plant extends CellState {
    constructor() {
        super('plant');
    }
    
    render(ctx, cell, size) {
        const depth = Math.min(cell.depth || 1, 3);
        let color;
        let noiseAmount;
        switch (depth) {
            case 1: 
                color = this.color; 
                noiseAmount = 0.2;
                break;
            case 2: 
                color = this.darkenColor(this.color, -0.15); 
                noiseAmount = 0.15;
                break;
            case 3: 
                color = this.darkenColor(this.color, -0.3); 
                noiseAmount = 0.1;
                break;
            default: 
                color = this.color;
                noiseAmount = 0.2;
        }
        const randomSeed = (cell.col * 1000 + cell.row) % 10000;
        Math.seedrandom(randomSeed);
        const darkenAmount = (Math.random() - 0.5) * noiseAmount;
        const adjustedColor = this.darkenColor(color, darkenAmount);
        ctx.fillStyle = adjustedColor;
        ctx.fillRect(cell.x, cell.y, size, size);
        
        if (Hyperparams.showPheromones && (cell.redPheromone > 0 || cell.greenPheromone > 0 || cell.bluePheromone > 0)) {
            const r = Math.min(255, Math.floor(cell.redPheromone > 0 ? 255 : 0));
            const g = Math.min(255, Math.floor(cell.greenPheromone > 0 ? 255 : 0));
            const b = Math.min(255, Math.floor(cell.bluePheromone > 0 ? 255 : 0));
            
            const maxFrames = 30;
            const remainingFrames = Math.max(cell.redPheromone, cell.greenPheromone, cell.bluePheromone);
            const fadeRatio = remainingFrames / maxFrames;
            
            const opacity = fadeRatio * 0.275;
            
            ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`;
            ctx.fillRect(cell.x, cell.y, size, size);
        }
    }
}

class Meat extends CellState {
    constructor() {
        super('meat');
    }
    
    render(ctx, cell, size) {
        const rotTime = cell.rotTime || 0;
        const maxRotTime = 5000;
        
        let colorFactor = Math.min(rotTime / maxRotTime, 1);
        
        const r = Math.max(0, Math.floor(209 - (colorFactor * 85)));
        const g = Math.max(0, Math.floor(85 - (colorFactor * 25)));
        const b = Math.max(0, Math.floor(99 - (colorFactor * 35)));
        
        const baseColor = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
        
        const depth = Math.min(cell.depth || 1, 3);
        let noiseAmount;
        switch (depth) {
            case 1: noiseAmount = 0.2; break;
            case 2: noiseAmount = 0.15; break;
            case 3: noiseAmount = 0.1; break;
            default: noiseAmount = 0.2;
        }
        
        const randomSeed = (cell.col * 1000 + cell.row) % 10000;
        Math.seedrandom(randomSeed);
        const darkenAmount = (Math.random() - 0.5) * noiseAmount;
        const adjustedColor = this.darkenColor(baseColor, darkenAmount);
        
        ctx.fillStyle = adjustedColor;
        ctx.fillRect(cell.x, cell.y, size, size);
        
        if (Hyperparams.showPheromones && (cell.redPheromone > 0 || cell.greenPheromone > 0 || cell.bluePheromone > 0)) {
            const r = Math.min(255, Math.floor(cell.redPheromone > 0 ? 255 : 0));
            const g = Math.min(255, Math.floor(cell.greenPheromone > 0 ? 255 : 0));
            const b = Math.min(255, Math.floor(cell.bluePheromone > 0 ? 255 : 0));
            
            const maxFrames = 30;
            const remainingFrames = Math.max(cell.redPheromone, cell.greenPheromone, cell.bluePheromone);
            const fadeRatio = remainingFrames / maxFrames;
            
            const opacity = fadeRatio * 0.275;
            
            ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`;
            ctx.fillRect(cell.x, cell.y, size, size);
        }
    }
}

class Rot extends CellState {
    constructor() {
        super('rot');
    }
    
    render(ctx, cell, size) {
        const randomSeed = (cell.col * 1000 + cell.row) % 10000;
        Math.seedrandom(randomSeed);
        const darkenAmount = (Math.random() - 0.5) * 0.2;
        
        let baseColor = this.color;
        const adjustedColor = this.darkenColor(baseColor, darkenAmount);
        
        ctx.fillStyle = adjustedColor;
        ctx.fillRect(cell.x, cell.y, size, size);
        
        if (Hyperparams.showPheromones && (cell.redPheromone > 0 || cell.greenPheromone > 0 || cell.bluePheromone > 0)) {
            const r = Math.min(255, Math.floor(cell.redPheromone > 0 ? 255 : 0));
            const g = Math.min(255, Math.floor(cell.greenPheromone > 0 ? 255 : 0));
            const b = Math.min(255, Math.floor(cell.bluePheromone > 0 ? 255 : 0));
            
            const maxFrames = 30;
            const remainingFrames = Math.max(cell.redPheromone, cell.greenPheromone, cell.bluePheromone);
            const fadeRatio = remainingFrames / maxFrames;
            
            const opacity = fadeRatio * 0.275;
            
            ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`;
            ctx.fillRect(cell.x, cell.y, size, size);
        }
    }
}

class Wall extends CellState {
    constructor() {
        super('wall');
    }
    
    render(ctx, cell, size) {
        const randomSeed = (cell.col * 1000 + cell.row) % 10000;
        Math.seedrandom(randomSeed);
        const darkenAmount = (Math.random() - 0.5) * 0.2;
        
        let baseColor = this.color;
        const adjustedColor = this.darkenColor(baseColor, darkenAmount);
        
        ctx.fillStyle = adjustedColor;
        ctx.fillRect(cell.x, cell.y, size, size);
        
        if (Hyperparams.showPheromones && (cell.redPheromone > 0 || cell.greenPheromone > 0 || cell.bluePheromone > 0)) {
            const r = Math.min(255, Math.floor(cell.redPheromone > 0 ? 255 : 0));
            const g = Math.min(255, Math.floor(cell.greenPheromone > 0 ? 255 : 0));
            const b = Math.min(255, Math.floor(cell.bluePheromone > 0 ? 255 : 0));
            
            const maxFrames = 30;
            const remainingFrames = Math.max(cell.redPheromone, cell.greenPheromone, cell.bluePheromone);
            const fadeRatio = remainingFrames / maxFrames;
            
            const opacity = fadeRatio * 0.275;
            
            ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`;
            ctx.fillRect(cell.x, cell.y, size, size);
        }
    }
}

class CarnivoreMouth extends CellState {
    constructor() {
        super('carnivoreMouth');
    }
    render(ctx, cell, size) {
        ctx.fillStyle = this.color;
        ctx.fillRect(cell.x, cell.y, size, size);
        if(size <= 1) return;
        
        // Editor
        if (size >= 10) {
            ctx.fillStyle = "#8B0000"; 
            const dotSize = Math.max(3, Math.floor(size * 0.25));
            const halfSize = size / 2;
            
            ctx.fillRect(cell.x + halfSize - (dotSize/2), cell.y, dotSize, dotSize);
            ctx.fillRect(cell.x + halfSize - (dotSize/2), cell.y + size - dotSize, dotSize, dotSize);
            ctx.fillRect(cell.x, cell.y + halfSize - (dotSize/2), dotSize, dotSize);
            ctx.fillRect(cell.x + size - dotSize, cell.y + halfSize - (dotSize/2), dotSize, dotSize);
        }
        // Simulation
        else {
            ctx.fillStyle = "#8B0000"; 
            const slitWidth = Math.max(1, Math.floor(size * 0.1));
            const halfSize = size / 2;
            const slitOffset = Math.max(0, halfSize - (slitWidth / 2));
            
            ctx.fillRect(cell.x + slitOffset, cell.y, slitWidth, slitWidth);
            ctx.fillRect(cell.x + slitOffset, cell.y + size - slitWidth, slitWidth, slitWidth);
            ctx.fillRect(cell.x, cell.y + slitOffset, slitWidth, slitWidth);
            ctx.fillRect(cell.x + size - slitWidth, cell.y + slitOffset, slitWidth, slitWidth);
        }
        
        if (Hyperparams.showPheromones && (cell.redPheromone > 0 || cell.greenPheromone > 0 || cell.bluePheromone > 0)) {
            const r = Math.min(255, Math.floor(cell.redPheromone > 0 ? 255 : 0));
            const g = Math.min(255, Math.floor(cell.greenPheromone > 0 ? 255 : 0));
            const b = Math.min(255, Math.floor(cell.bluePheromone > 0 ? 255 : 0));
            
            const maxFrames = 30;
            const remainingFrames = Math.max(cell.redPheromone, cell.greenPheromone, cell.bluePheromone);
            const fadeRatio = remainingFrames / maxFrames;
            
            const opacity = fadeRatio * 0.275;
            
            ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`;
            ctx.fillRect(cell.x, cell.y, size, size);
        }
    }
}

class HerbivoreMouth extends CellState {
    constructor() {
        super('herbivoreMouth');
    }
    render(ctx, cell, size) {
        ctx.fillStyle = this.color;
        ctx.fillRect(cell.x, cell.y, size, size);
        if(size <= 1) return;
        
        // Editor
        if (size >= 10) {
            ctx.fillStyle = "#006400"; 
            const dotSize = Math.max(3, Math.floor(size * 0.25));
            const halfSize = size / 2;
            
            // Top side center
            ctx.fillRect(cell.x + halfSize - (dotSize/2), cell.y, dotSize, dotSize);
            ctx.fillRect(cell.x + halfSize - (dotSize/2), cell.y + size - dotSize, dotSize, dotSize);
            ctx.fillRect(cell.x, cell.y + halfSize - (dotSize/2), dotSize, dotSize);
            ctx.fillRect(cell.x + size - dotSize, cell.y + halfSize - (dotSize/2), dotSize, dotSize);
        }
        // Simulation
        else {
            ctx.fillStyle = "#006400"; 
            const slitWidth = Math.max(1, Math.floor(size * 0.1));
            const halfSize = size / 2;
            const slitOffset = Math.max(0, halfSize - (slitWidth / 2));
            
            ctx.fillRect(cell.x + slitOffset, cell.y, slitWidth, slitWidth);
            ctx.fillRect(cell.x + slitOffset, cell.y + size - slitWidth, slitWidth, slitWidth);
            ctx.fillRect(cell.x, cell.y + slitOffset, slitWidth, slitWidth);
            ctx.fillRect(cell.x + size - slitWidth, cell.y + slitOffset, slitWidth, slitWidth);
        }
        
        if (Hyperparams.showPheromones && (cell.redPheromone > 0 || cell.greenPheromone > 0 || cell.bluePheromone > 0)) {
            const r = Math.min(255, Math.floor(cell.redPheromone > 0 ? 255 : 0));
            const g = Math.min(255, Math.floor(cell.greenPheromone > 0 ? 255 : 0));
            const b = Math.min(255, Math.floor(cell.bluePheromone > 0 ? 255 : 0));
            
            const maxFrames = 30;
            const remainingFrames = Math.max(cell.redPheromone, cell.greenPheromone, cell.bluePheromone);
            const fadeRatio = remainingFrames / maxFrames;
            
            const opacity = fadeRatio * 0.275;
            
            ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`;
            ctx.fillRect(cell.x, cell.y, size, size);
        }
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
        
        if(size <= 1 || !cell.cell_owner || !cell.cell_owner.storedFood) return;
        
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
        
        if (Hyperparams.showPheromones && (cell.redPheromone > 0 || cell.greenPheromone > 0 || cell.bluePheromone > 0)) {
            const r = Math.min(255, Math.floor(cell.redPheromone > 0 ? 255 : 0));
            const g = Math.min(255, Math.floor(cell.greenPheromone > 0 ? 255 : 0));
            const b = Math.min(255, Math.floor(cell.bluePheromone > 0 ? 255 : 0));
            
            const maxFrames = 30;
            const remainingFrames = Math.max(cell.redPheromone, cell.greenPheromone, cell.bluePheromone);
            const fadeRatio = remainingFrames / maxFrames;
            
            const opacity = fadeRatio * 0.275;
            
            ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`;
            ctx.fillRect(cell.x, cell.y, size, size);
        }
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
        if(size <= 1) return;
        
        const halfSize = size / 2;
        
        // Editor
        if (size >= 10) {
            const slitWidth = Math.max(3, Math.floor(size * 0.25));
            const slitHeight = Math.max(3, Math.floor(size * 0.75));
            const xOffset = -(Math.floor(size) / 8);
            const yOffset = -halfSize;
            
            ctx.save();
            ctx.translate(cell.x + halfSize, cell.y + halfSize);
            if (cell.cell_owner && typeof cell.cell_owner.getAbsoluteDirection === 'function') {
                ctx.rotate((cell.cell_owner.getAbsoluteDirection() * 90) * Math.PI / 180);
            }
            ctx.fillStyle = this.slit_color;
            ctx.fillRect(xOffset, yOffset, slitWidth, slitHeight);
            ctx.restore();
        }
        // Simulation
        else {
            const slitWidth = Math.max(1, Math.floor(size * 0.25));
            const slitHeight = Math.max(1, Math.floor(size * 0.75));
            const xOffset = -(Math.floor(size) / 8);
            const yOffset = -halfSize;
            
            ctx.save();
            ctx.translate(cell.x + halfSize, cell.y + halfSize);
            if (cell.cell_owner && typeof cell.cell_owner.getAbsoluteDirection === 'function') {
                ctx.rotate((cell.cell_owner.getAbsoluteDirection() * 90) * Math.PI / 180);
            }
            ctx.fillStyle = this.slit_color;
            ctx.fillRect(xOffset, yOffset, slitWidth, slitHeight);
            ctx.restore();
        }
        
        if (Hyperparams.showPheromones && (cell.redPheromone > 0 || cell.greenPheromone > 0 || cell.bluePheromone > 0)) {
            const r = Math.min(255, Math.floor(cell.redPheromone > 0 ? 255 : 0));
            const g = Math.min(255, Math.floor(cell.greenPheromone > 0 ? 255 : 0));
            const b = Math.min(255, Math.floor(cell.bluePheromone > 0 ? 255 : 0));
            
            const maxFrames = 30;
            const remainingFrames = Math.max(cell.redPheromone, cell.greenPheromone, cell.bluePheromone);
            const fadeRatio = remainingFrames / maxFrames;
            
            const opacity = fadeRatio * 0.275;
            
            ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`;
            ctx.fillRect(cell.x, cell.y, size, size);
        }
    }
}
class LeftRightMover extends CellState {
    constructor() {
        super('leftRightMover');
    }
    render(ctx, cell, size) {
        ctx.fillStyle = this.color;
        ctx.fillRect(cell.x, cell.y, size, size);
        if(size <= 1) return;
        
        // Editor
        if (size >= 10) {
            ctx.fillStyle = "#305A80"; 
            const dotSize = Math.max(3, Math.floor(size * 0.25));
            
            ctx.fillRect(cell.x, cell.y + (size/2) - (dotSize/2), dotSize, dotSize);
            ctx.fillRect(cell.x + size - dotSize, cell.y + (size/2) - (dotSize/2), dotSize, dotSize);
        }
        // Simulation
        else {
            ctx.fillStyle = "#305A80"; 
            const slitWidth = Math.max(1, Math.floor(size * 0.1));
            const halfSize = size / 2;
            const slitOffset = Math.max(0, halfSize - (slitWidth / 2));
            
            ctx.fillRect(cell.x, cell.y + slitOffset, slitWidth, slitWidth);
            ctx.fillRect(cell.x + size - slitWidth, cell.y + slitOffset, slitWidth, slitWidth);
        }
        
        if (Hyperparams.showPheromones && (cell.redPheromone > 0 || cell.greenPheromone > 0 || cell.bluePheromone > 0)) {
            const r = Math.min(255, Math.floor(cell.redPheromone > 0 ? 255 : 0));
            const g = Math.min(255, Math.floor(cell.greenPheromone > 0 ? 255 : 0));
            const b = Math.min(255, Math.floor(cell.bluePheromone > 0 ? 255 : 0));
            
            const maxFrames = 30;
            const remainingFrames = Math.max(cell.redPheromone, cell.greenPheromone, cell.bluePheromone);
            const fadeRatio = remainingFrames / maxFrames;
            
            const opacity = fadeRatio * 0.275;
            
            ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`;
            ctx.fillRect(cell.x, cell.y, size, size);
        }
    }
}
class UpDownMover extends CellState {
    constructor() {
        super('upDownMover');
    }
    render(ctx, cell, size) {
        ctx.fillStyle = this.color;
        ctx.fillRect(cell.x, cell.y, size, size);
        if(size <= 1) return;
        
        // Editor
        if (size >= 10) {
            ctx.fillStyle = "#4080B0"; 
            const dotSize = Math.max(3, Math.floor(size * 0.25));
            
            ctx.fillRect(cell.x + (size/2) - (dotSize/2), cell.y, dotSize, dotSize);
            ctx.fillRect(cell.x + (size/2) - (dotSize/2), cell.y + size - dotSize, dotSize, dotSize);
        }
        // Simulation
        else {
            ctx.fillStyle = "#4080B0"; 
            const slitWidth = Math.max(1, Math.floor(size * 0.1));
            const halfSize = size / 2;
            const slitOffset = Math.max(0, halfSize - (slitWidth / 2));
            
            ctx.fillRect(cell.x + slitOffset, cell.y, slitWidth, slitWidth);
            ctx.fillRect(cell.x + slitOffset, cell.y + size - slitWidth, slitWidth, slitWidth);
        }
        
        if (Hyperparams.showPheromones && (cell.redPheromone > 0 || cell.greenPheromone > 0 || cell.bluePheromone > 0)) {
            const r = Math.min(255, Math.floor(cell.redPheromone > 0 ? 255 : 0));
            const g = Math.min(255, Math.floor(cell.greenPheromone > 0 ? 255 : 0));
            const b = Math.min(255, Math.floor(cell.bluePheromone > 0 ? 255 : 0));
            
            const maxFrames = 30;
            const remainingFrames = Math.max(cell.redPheromone, cell.greenPheromone, cell.bluePheromone);
            const fadeRatio = remainingFrames / maxFrames;
            
            const opacity = fadeRatio * 0.275;
            
            ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`;
            ctx.fillRect(cell.x, cell.y, size, size);
        }
    }
}
class RotationMover extends CellState {
    constructor() {
        super('rotationMover');
    }
    render(ctx, cell, size) {
        ctx.fillStyle = this.color;
        ctx.fillRect(cell.x, cell.y, size, size);
        if(size <= 1) return;
        
        // Editor
        if (size >= 10) {
            ctx.fillStyle = "#305A80"; 
            const dotSize = Math.max(3, Math.floor(size * 0.25));
            
            ctx.fillRect(cell.x, cell.y, dotSize, dotSize);
            ctx.fillRect(cell.x + size - dotSize, cell.y, dotSize, dotSize);
            ctx.fillRect(cell.x, cell.y + size - dotSize, dotSize, dotSize);
            ctx.fillRect(cell.x + size - dotSize, cell.y + size - dotSize, dotSize, dotSize);
        }
        // Simulation
        else {
            ctx.fillStyle = "#305A80"; 
            const slitWidth = Math.max(1, Math.floor(size * 0.1));
            
            ctx.fillRect(cell.x, cell.y, slitWidth, slitWidth);
            ctx.fillRect(cell.x + size - slitWidth, cell.y, slitWidth, slitWidth);
            ctx.fillRect(cell.x, cell.y + size - slitWidth, slitWidth, slitWidth);
            ctx.fillRect(cell.x + size - slitWidth, cell.y + size - slitWidth, slitWidth, slitWidth);
        }
        
        if (Hyperparams.showPheromones && (cell.redPheromone > 0 || cell.greenPheromone > 0 || cell.bluePheromone > 0)) {
            const r = Math.min(255, Math.floor(cell.redPheromone > 0 ? 255 : 0));
            const g = Math.min(255, Math.floor(cell.greenPheromone > 0 ? 255 : 0));
            const b = Math.min(255, Math.floor(cell.bluePheromone > 0 ? 255 : 0));
            
            const maxFrames = 30;
            const remainingFrames = Math.max(cell.redPheromone, cell.greenPheromone, cell.bluePheromone);
            const fadeRatio = remainingFrames / maxFrames;
            
            const opacity = fadeRatio * 0.275;
            
            ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`;
            ctx.fillRect(cell.x, cell.y, size, size);
        }
    }
}

class Converter extends CellState {
    constructor() {
        super('converter');
    }
}

const CellStates = {
    empty: new Empty(),
    food: new Food(),
    plant: new Plant(),
    meat: new Meat(),
    wall: new Wall(),
    carnivoreMouth: new CarnivoreMouth(),
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
    converter: new Converter(),
    rot: new Rot(),
    defineLists() {
        this.all = [
            this.empty, this.food, this.plant, this.meat, this.wall, 
            this.carnivoreMouth, this.herbivoreMouth, this.producer, 
            this.mover, this.leftRightMover, this.upDownMover, this.rotationMover,
            this.killer, this.armor, this.storage, this.eye, this.converter, this.rot
        ]
        this.living = [
            this.carnivoreMouth, this.herbivoreMouth, this.producer, 
            this.mover, this.leftRightMover, this.upDownMover, this.rotationMover,
            this.killer, this.armor, this.storage, this.eye, this.converter
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