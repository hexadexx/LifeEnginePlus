const CellStates = require("../CellStates");
const BodyCell = require("./BodyCell");
const Hyperparams = require("../../../Hyperparameters");

class StorageCell extends BodyCell {
    constructor(org, loc_col, loc_row) {
        super(CellStates.storage, org, loc_col, loc_row);
        this.storedFood = null;
        this.lastEjectRotTime = 0;
        this.storageTime = 0;
    }

    performFunction() {
        if (this.storedFood !== null) {
            this.storageTime++;
            return;
        }

        var env = this.org.env;
        var real_c = this.getRealCol();
        var real_r = this.getRealRow();

        for (var loc of Hyperparams.edibleNeighbors) {
            var cell = env.grid_map.cellAt(real_c + loc[0], real_r + loc[1]);
            if (cell == null) continue;
            
            if (cell.state === CellStates.food) {
                this.storedFood = "food";
                this.storageTime = 0;
                env.changeCell(cell.col, cell.row, CellStates.empty, null);
                env.renderer.addToRender(this.getRealCell());
                return;
            } 
            else if (cell.state === CellStates.meat) {
                this.storedFood = "meat";
                this.storageTime = 0;
                this.lastEjectRotTime = cell.rotTime || 0;
                env.changeCell(cell.col, cell.row, CellStates.empty, null);
                env.renderer.addToRender(this.getRealCell());
                return;
            }
            else if (cell.state === CellStates.plant) {
                this.storedFood = "plant";
                this.storageTime = 0;
                env.changeCell(cell.col, cell.row, CellStates.empty, null);
                env.renderer.addToRender(this.getRealCell());
                return;
            }
        }
    }

    retrieveFood(foodType) {
        if (this.storedFood === null || this.storageTime < 5) return false;
        
        if (foodType === "any" || this.storedFood === foodType) {
            const retrieved = this.storedFood;
            this.storedFood = null;
            this.storageTime = 0;
            return retrieved;
        }
        
        return false;
    }

    initInherit(parent) {
        super.initInherit(parent);
        this.storedFood = parent.storedFood;
        this.lastEjectRotTime = parent.lastEjectRotTime || 0;
        this.storageTime = parent.storageTime || 0;
    }
    
    releaseStoredFood() {
        if (this.storedFood === null) return false;
        
        var env = this.org.env;
        var real_c = this.getRealCol();
        var real_r = this.getRealRow();
        
        for (var loc of Hyperparams.edibleNeighbors) {
            var cell = env.grid_map.cellAt(real_c + loc[0], real_r + loc[1]);
            if (cell && cell.state === CellStates.empty) {
                let foodState;
                switch(this.storedFood) {
                    case "food": foodState = CellStates.food; break;
                    case "meat": 
                        foodState = CellStates.meat;
                        cell.rotTime = this.lastEjectRotTime;
                        break;
                    case "plant": foodState = CellStates.plant; break;
                    default: return false;
                }
                
                env.changeCell(cell.col, cell.row, foodState, null);
                this.storedFood = null;
                this.storageTime = 0;
                return true;
            }
        }
        
        return false;
    }
}

module.exports = StorageCell;