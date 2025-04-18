const CellStates = require("../CellStates");
const BodyCell = require("./BodyCell");
const Hyperparams = require("../../../Hyperparameters");

class StorageCell extends BodyCell {
    constructor(org, loc_col, loc_row) {
        super(CellStates.storage, org, loc_col, loc_row);
        this.storedFood = null;
    }

    performFunction() {
        if (this.storedFood !== null) {
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
                env.changeCell(cell.col, cell.row, CellStates.empty, null);
                env.renderer.addToRender(this.getRealCell());
                return;
            } 
            else if (cell.state === CellStates.meat) {
                this.storedFood = "meat";
                env.changeCell(cell.col, cell.row, CellStates.empty, null);
                env.renderer.addToRender(this.getRealCell());
                return;
            }
            else if (cell.state === CellStates.plant) {
                this.storedFood = "plant";
                env.changeCell(cell.col, cell.row, CellStates.empty, null);
                env.renderer.addToRender(this.getRealCell());
                return;
            }
        }
    }

    retrieveFood(foodType) {
        if (this.storedFood === null) return false;
        
        if (foodType !== "any" && foodType !== "food" && this.storedFood !== foodType) {
            return false;
        }
        
        const retrieved = this.storedFood;
        this.storedFood = null;
        return retrieved;
    }

    initInherit(parent) {
        super.initInherit(parent);
        this.storedFood = parent.storedFood;
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
                    case "meat": foodState = CellStates.meat; break;
                    case "plant": foodState = CellStates.plant; break;
                    default: return false;
                }
                
                env.changeCell(cell.col, cell.row, foodState, null);
                this.storedFood = null;
                return true;
            }
        }
        
        return false;
    }
}

module.exports = StorageCell;