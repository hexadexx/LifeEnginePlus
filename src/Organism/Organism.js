const CellStates = require("./Cell/CellStates");
const Neighbors = require("../Grid/Neighbors");
const Hyperparams = require("../Hyperparameters");
const Directions = require("./Directions");
const Anatomy = require("./Anatomy");
const Brain = require("./Perception/Brain");
const FossilRecord = require("../Stats/FossilRecord");
const SerializeHelper = require("../Utils/SerializeHelper");

class Organism {
    constructor(col, row, env, parent=null) {
        this.c = col;
        this.r = row;
        this.env = env;
        this.lifetime = 0;
        this.food_collected = 0;
        this.living = true;
        this.anatomy = new Anatomy(this)
        this.direction = Directions.down;
        this.rotation = Directions.up;
        this.can_rotate = Hyperparams.rotationEnabled;
        this.move_count = 0;
        this.move_range = 4;
        this.ignore_brain_for = 0;
        this.mutability = 5;
        this.damage = 0;
        this.brain = new Brain(this);
        if (parent != null) {
            this.inherit(parent);
        }
    }

    inherit(parent) {
        this.move_range = parent.move_range;
        this.mutability = parent.mutability;
        this.species = parent.species;
        for (var c of parent.anatomy.cells){
            this.anatomy.addInheritCell(c);
        }
        if((parent.anatomy.is_mover || parent.anatomy.is_ud_mover || parent.anatomy.is_lr_mover) && parent.anatomy.has_eyes) {
            this.brain.copy(parent.brain);
        }
    }

    foodNeeded() {
        let baseFood = this.anatomy.cells.length;
        
        if (this.anatomy.is_mover || this.anatomy.is_ud_mover || this.anatomy.is_lr_mover) {
            baseFood += Hyperparams.extraMoverFoodCost;
        }
        
        let loadedStorageCount = 0;
        for (let cell of this.anatomy.cells) {
            if (cell.state === CellStates.storage && cell.storedFood !== null) {
                loadedStorageCount++;
            }
        }
        
        let storageCost = Math.floor(loadedStorageCount / 2);
        
        return baseFood + storageCost;
    }

    lifespan() {
        return this.anatomy.cells.length * Hyperparams.lifespanMultiplier;
    }

    maxHealth() {
        return this.anatomy.cells.length;
    }

    reproduce() {
        var org = new Organism(0, 0, this.env, this);
        if(Hyperparams.rotationEnabled){
            org.rotation = Directions.getRandomDirection();
        }
        var prob = this.mutability;
        if (Hyperparams.useGlobalMutability){
            prob = Hyperparams.globalMutability;
        }
        else {
            if (Math.random() <= 0.5)
                org.mutability++;
            else{ 
                org.mutability--;
                if (org.mutability < 1)
                    org.mutability = 1;
            }
        } 
        var mutated = false;
        if (Math.random() * 100 <= prob) {
            if ((org.anatomy.is_mover || org.anatomy.is_ud_mover || org.anatomy.is_lr_mover) && Math.random() * 100 <= 10) { 
                if (org.anatomy.has_eyes) {
                    org.brain.mutate();
                }
                org.move_range += Math.floor(Math.random() * 4) - 2;
                if (org.move_range <= 0){
                    org.move_range = 1;
                };
                
            }
            else {
                mutated = org.mutate();
            }
        }

        var direction = Directions.getRandomScalar();
        var direction_c = direction[0];
        var direction_r = direction[1];
        var offset = (Math.floor(Math.random() * 3));
        var basemovement = this.anatomy.birth_distance;
        var new_c = this.c + (direction_c*basemovement) + (direction_c*offset);
        var new_r = this.r + (direction_r*basemovement) + (direction_r*offset);

        if (org.isClear(new_c, new_r, org.rotation, true) && 
            org.isStraightPath(new_c, new_r, this.c, this.r, this) && 
            this.env.canAddOrganism())
        {
            org.c = new_c;
            org.r = new_r;
            this.env.addOrganism(org);
            org.updateGrid();
            if (mutated) {
                FossilRecord.addSpecies(org, this.species);
            }
            else {
                org.species.addPop();
            }
            this.food_collected = Math.max(this.food_collected - this.foodNeeded(), 0);
            return true;
        }
        return false;
    }

    mutate() {
        let added = false;
        let changed = false;
        let removed = false;
        if (this.calcRandomChance(Hyperparams.addProb)) {
            let branch = this.anatomy.getRandomCell();
            let state = CellStates.getRandomLivingType();
            let growth_direction = Neighbors.all[Math.floor(Math.random() * Neighbors.all.length)]
            let c = branch.loc_col+growth_direction[0];
            let r = branch.loc_row+growth_direction[1];
            if (this.anatomy.canAddCellAt(c, r)){
                added = true;
                this.anatomy.addRandomizedCell(state, c, r);
            }
        }
        if (this.calcRandomChance(Hyperparams.changeProb)){
            let cell = this.anatomy.getRandomCell();
            let state = CellStates.getRandomLivingType();
            this.anatomy.replaceCell(state, cell.loc_col, cell.loc_row);
            changed = true;
        }
        if (this.calcRandomChance(Hyperparams.removeProb)){
            if(this.anatomy.cells.length > 1) {
                let cell = this.anatomy.getRandomCell();
                removed = this.anatomy.removeCell(cell.loc_col, cell.loc_row);
            }
        }
        return added || changed || removed;
    }

    calcRandomChance(prob) {
        return (Math.random() * 100) < prob;
    }

    attemptMove() {
        var direction = Directions.scalars[this.direction];
        var direction_c = direction[0];
        var direction_r = direction[1];
        var new_c = this.c + direction_c;
        var new_r = this.r + direction_r;
        if (this.isClear(new_c, new_r)) {
            for (var cell of this.anatomy.cells) {
                var real_c = this.c + cell.rotatedCol(this.rotation);
                var real_r = this.r + cell.rotatedRow(this.rotation);
                this.env.changeCell(real_c, real_r, CellStates.empty, null);
            }
            this.c = new_c;
            this.r = new_r;
            this.updateGrid();
            return true;
        }
        return false;
    }

    attemptRotate() {
        if(!this.can_rotate){
            this.direction = Directions.getRandomDirection();
            this.move_count = 0;
            return true;
        }
        var new_rotation = Directions.getRandomDirection();
        if(this.isClear(this.c, this.r, new_rotation)){
            for (var cell of this.anatomy.cells) {
                var real_c = this.c + cell.rotatedCol(this.rotation);
                var real_r = this.r + cell.rotatedRow(this.rotation);
                this.env.changeCell(real_c, real_r, CellStates.empty, null);
            }
            this.rotation = new_rotation;
            this.direction = Directions.getRandomDirection();
            this.updateGrid();
            this.move_count = 0;
            return true;
        }
        return false;
    }

    changeDirection(dir) {
        this.direction = dir;
        this.move_count = 0;
    }

    isStraightPath(c1, r1, c2, r2, parent){
        if (c1 == c2) {
            if (r1 > r2){
                var temp = r2;
                r2 = r1;
                r1 = temp;
            }
            for (var i=r1; i!=r2; i++) {
                var cell = this.env.grid_map.cellAt(c1, i)
                if (!this.isPassableCell(cell, parent)){
                    return false;
                }
            }
            return true;
        }
        else {
            if (c1 > c2){
                var temp = c2;
                c2 = c1;
                c1 = temp;
            }
            for (var i=c1; i!=c2; i++) {
                var cell = this.env.grid_map.cellAt(i, r1);
                if (!this.isPassableCell(cell, parent)){
                    return false;
                }
            }
            return true;
        }
    }

    isPassableCell(cell, parent){
        return cell != null && (cell.state == CellStates.empty || cell.owner == this || cell.owner == parent || cell.state == CellStates.food);
    }

    isClear(col, row, rotation=this.rotation) {
        for(var loccell of this.anatomy.cells) {
            var cell = this.getRealCell(loccell, col, row, rotation);
            if (cell==null) {
                return false;
            }
            if (cell.owner==this || cell.state==CellStates.empty || (!Hyperparams.foodBlocksReproduction && cell.state==CellStates.food)){
                continue;
            }
            return false;
        }
        return true;
    }

    harm() {
        this.damage++;
        if (this.damage >= this.maxHealth() || Hyperparams.instaKill) {
            this.die();
        }
    }

    die() {
        for (var cell of this.anatomy.cells) {
            if (cell.state === CellStates.storage) {
                cell.releaseStoredFood();
            }
        }
        
        const lifespan = this.lifespan();
        
        for (var cell of this.anatomy.cells) {
            var real_c = this.c + cell.rotatedCol(this.rotation);
            var real_r = this.r + cell.rotatedRow(this.rotation);
            
            this.env.changeCell(real_c, real_r, CellStates.meat, null);
        }
        
        this.species.decreasePop();
        this.living = false;
    }

    updateGrid() {
        for (var cell of this.anatomy.cells) {
            var real_c = this.c + cell.rotatedCol(this.rotation);
            var real_r = this.r + cell.rotatedRow(this.rotation);
            this.env.changeCell(real_c, real_r, cell.state, cell);
        }
    }

    update() {
        this.lifetime++;
        if (this.lifetime > this.lifespan()) {
            this.die();
            return this.living;
        }
        
        if (this.food_collected >= this.foodNeeded()) {
            this.reproduce();
        }
        
        const producers = [];
        const mouths = [];
        const otherCells = [];
        
        for (var cell of this.anatomy.cells) {
            if (cell.state === CellStates.producer) {
                producers.push(cell);
            } else if (cell.state === CellStates.herbivoreMouth || 
                       cell.state === CellStates.carnivoreMouth || 
                       cell.state === CellStates.omnivoreMouth) {
                mouths.push(cell);
            } else {
                otherCells.push(cell);
            }
        }
        
        for (var cell of producers) {
            cell.performFunction();
            if (!this.living) return this.living;
        }
        
        for (var cell of mouths) {
            cell.performFunction();
            if (!this.living) return this.living;
        }
        
        for (var cell of otherCells) {
            cell.performFunction();
            if (!this.living) return this.living;
        }
        
        this.move_count++;
        
        if (this.anatomy.is_mover || this.anatomy.is_ud_mover || this.anatomy.is_lr_mover) {
            var changed_dir = false;
            
            if (this.ignore_brain_for == 0) {
                changed_dir = this.brain.decide();
            } else {
                this.ignore_brain_for--;
            }
            
            var moved = false;
            
            if (this.anatomy.is_mover || (this.anatomy.is_ud_mover && this.anatomy.is_lr_mover)) {
                moved = this.attemptMove();
            } else if (this.anatomy.is_ud_mover) {
                if (this.direction === Directions.up || this.direction === Directions.down) {
                    moved = this.attemptMove();
                } else {
                    this.changeDirection(Math.random() < 0.5 ? Directions.up : Directions.down);
                    moved = this.attemptMove();
                }
            } else if (this.anatomy.is_lr_mover) {
                if (this.direction === Directions.left || this.direction === Directions.right) {
                    moved = this.attemptMove();
                } else {
                    this.changeDirection(Math.random() < 0.5 ? Directions.left : Directions.right);
                    moved = this.attemptMove();
                }
            }
            
            if ((this.move_count > this.move_range && !changed_dir) || !moved) {
                let newDirection;
                
                if (this.anatomy.is_ud_mover && !this.anatomy.is_lr_mover) {
                    newDirection = this.direction === Directions.up ? Directions.down : Directions.up;
                } else if (this.anatomy.is_lr_mover && !this.anatomy.is_ud_mover) {
                    newDirection = this.direction === Directions.left ? Directions.right : Directions.left;
                } else {
                    newDirection = Directions.getRandomDirection();
                }
                
                this.changeDirection(newDirection);
                
                if (changed_dir)
                    this.ignore_brain_for = this.move_range + 1;
            }
        }

        if (this.anatomy.is_rotation_mover || this.anatomy.is_mover) {
            this.attemptRotate();
        }
        
        return this.living;
    }

    getRealCell(local_cell, c=this.c, r=this.r, rotation=this.rotation){
        var real_c = c + local_cell.rotatedCol(rotation);
        var real_r = r + local_cell.rotatedRow(rotation);
        return this.env.grid_map.cellAt(real_c, real_r);
    }

    isNatural() {
        let found_center = false;
        if (this.anatomy.cells.length === 0) {
            return false;
        }
        for (let i=0; i<this.anatomy.cells.length; i++) {
            let cell = this.anatomy.cells[i];
            for (let j=i+1; j<this.anatomy.cells.length; j++) {
                let toCompare = this.anatomy.cells[j];
                if (cell.loc_col === toCompare.loc_col && cell.loc_row === toCompare.loc_row) {
                    return false;
                }
            }
            if (cell.loc_col === 0 && cell.loc_row === 0) {
                found_center = true;
            }
        }
        return found_center;
    }

    serialize() {
        let org = SerializeHelper.copyNonObjects(this);
        org.anatomy = this.anatomy.serialize();
        if ((this.anatomy.is_mover || this.anatomy.is_ud_mover || this.anatomy.is_lr_mover) && this.anatomy.has_eyes)
            org.brain = this.brain.serialize();
        org.species_name = this.species.name;
        return org;
    }

    loadRaw(org) {
        SerializeHelper.overwriteNonObjects(org, this);
        this.anatomy.loadRaw(org.anatomy)
        if (org.brain)
            this.brain.copy(org.brain)
    }

}

module.exports = Organism;