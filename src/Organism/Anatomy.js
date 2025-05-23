const CellStates = require("./Cell/CellStates");
const BodyCellFactory = require("./Cell/BodyCells/BodyCellFactory");
const SerializeHelper = require("../Utils/SerializeHelper");

class Anatomy {
    constructor(owner) {
        this.owner = owner;
        this.birth_distance = 4;
        this.clear();
    }

    clear() {
        this.cells = [];
        this.is_producer = false;
        this.is_mover = false;
        this.is_ud_mover = false;
        this.is_lr_mover = false;
        this.is_rotation_mover = false;
        this.has_eyes = false;
    }

    canAddCellAt(c, r) {
        for (var cell of this.cells) {
            if (cell.loc_col == c && cell.loc_row == r){
                return false;
            }
        }
        return true;
    }

    addDefaultCell(state, c, r) {
        var new_cell = BodyCellFactory.createDefault(this.owner, state, c, r);
        if (new_cell) {
            this.cells.push(new_cell);
            this.checkTypeChange();
            return new_cell;
        }
        return null;
    }

    addRandomizedCell(state, c, r) {
        if (state==CellStates.eye && !this.has_eyes) {
            this.owner.brain.randomizeDecisions();
        }
        var new_cell = BodyCellFactory.createRandom(this.owner, state, c, r);
        if (new_cell) {
            this.cells.push(new_cell);
            this.checkTypeChange();
            return new_cell;
        }
        return null;
    }

    addInheritCell(parent_cell) {
        var new_cell = BodyCellFactory.createInherited(this.owner, parent_cell);
        if (new_cell) {
            this.cells.push(new_cell);
            this.checkTypeChange();
            return new_cell;
        }
        return null;
    }

    replaceCell(state, c, r, randomize=true) {
        this.removeCell(c, r, true);
        if (randomize) {
            return this.addRandomizedCell(state, c, r);
        }
        else {
            return this.addDefaultCell(state, c, r);
        }
    }

    removeCell(c, r, allow_center_removal=false) {
        if (c == 0 && r == 0 && !allow_center_removal)
            return false;
        for (var i=0; i<this.cells.length; i++) {
            var cell = this.cells[i];
            if (cell.loc_col == c && cell.loc_row == r){
                this.cells.splice(i, 1);
                break;
            }
        }
        this.checkTypeChange();
        return true;
    }

    getLocalCell(c, r) {
        for (var cell of this.cells) {
            if (cell.loc_col == c && cell.loc_row == r){
                return cell;
            }
        }
        return null;
    }

    checkTypeChange() {
        this.is_mover = false;
        this.is_ud_mover = false;
        this.is_lr_mover = false;
        this.is_rotation_mover = false;
        this.is_producer = false;
        this.has_eyes = false;

        for (var cell of this.cells) {
            switch(cell.state.name) {
                case 'producer':
                    this.is_producer = true;
                    break;
                case 'mover':
                    this.is_mover = true;
                    break;
                case 'leftRightMover':
                    this.is_lr_mover = true;
                    break;
                case 'upDownMover':
                    this.is_ud_mover = true;
                    break;
                case 'rotationMover':
                    this.is_rotation_mover = true;
                    break;
                case 'eye':
                    this.has_eyes = true;
                    break;
            }
        }
    }

    loadRaw(anatomy) {
        this.clear();
        
        const mouthCells = [];
        for (let cell of anatomy.cells) {
            if (cell.state.name !== 'mouth') {
                this.addInheritCell(cell);
            } else {
                mouthCells.push(cell);
            }
        }

        for (let mouthCell of mouthCells) {
            const hasProducerNearby = this.cells.some(existingCell => {
                return existingCell.state.name === 'producer' && 
                       (Math.abs(existingCell.loc_col - mouthCell.loc_col) <= 1) && 
                       (Math.abs(existingCell.loc_row - mouthCell.loc_row) <= 1);
            });

            const newMouthState = hasProducerNearby ? CellStates.herbivoreMouth : CellStates.carnivoreMouth;
            
            const newMouthCell = BodyCellFactory.createInherited(this.owner, {
                ...mouthCell,
                state: { name: newMouthState.name }
            });

            this.cells.push(newMouthCell);
        }
        
        this.checkTypeChange();
    }

    getRandomCell() {
        return this.cells[Math.floor(Math.random() * this.cells.length)];
    }

    getNeighborsOfCell(col, row) {
        var neighbors = [];
        for (var x = -1; x <= 1; x++) {
            for (var y = -1; y <= 1; y++) {

                var neighbor = this.getLocalCell(col + x, row + y);
                if (neighbor)
                    neighbors.push(neighbor)
            }
        }

        return neighbors;
    }

    isEqual(anatomy) {
        if (this.cells.length !== anatomy.cells.length) return false;
        for (let i in this.cells) {
            let my_cell = this.cells[i];
            let their_cell = anatomy.cells[i];
            if (my_cell.loc_col !== their_cell.loc_col ||
                my_cell.loc_row !== their_cell.loc_row ||
                my_cell.state !== their_cell.state)
                return false;
        }
        return true;
    }

    serialize() {
        let anatomy = SerializeHelper.copyNonObjects(this);
        anatomy.cells = [];
        for (let cell of this.cells) {
            let newcell = SerializeHelper.copyNonObjects(cell);
            newcell.state = {name: cell.state.name};
            anatomy.cells.push(newcell)
        }
        return anatomy;
    }
}

module.exports = Anatomy;