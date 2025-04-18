const CellStates = require("../CellStates");
const BodyCell = require("./BodyCell");
const Hyperparams = require("../../../Hyperparameters");

class OmnivoreMouthCell extends BodyCell {
    constructor(org, loc_col, loc_row) {
        super(CellStates.omnivoreMouth, org, loc_col, loc_row);
        this.lastEatenCell = null;
    }

    performFunction() {
        var env = this.org.env;
        var real_c = this.getRealCol();
        var real_r = this.getRealRow();
        let foundFood = false;
        
        for (var loc of Hyperparams.edibleNeighbors) {
            var cell = env.grid_map.cellAt(real_c + loc[0], real_r + loc[1]);
            if (this.eatNeighbor(cell, env)) {
                foundFood = true;
                this.lastEatenCell = cell;
            }
        }
        
        if (!foundFood) {
            this.checkStorageCells();
        }
    }

    eatNeighbor(n_cell, env) {
        if (n_cell == null) return false;
        
        if ((n_cell.state === CellStates.plant || n_cell.state === CellStates.meat || n_cell.state === CellStates.food) && 
            n_cell !== this.lastEatenCell) {
            env.changeCell(n_cell.col, n_cell.row, CellStates.empty, null);
            this.org.food_collected++;
            return true;
        }
        return false;
    }
    
    checkStorageCells() {
        var env = this.org.env;
        var real_c = this.getRealCol();
        var real_r = this.getRealRow();
        
        for (var loc of Hyperparams.edibleNeighbors) {
            var cell = env.grid_map.cellAt(real_c + loc[0], real_r + loc[1]);
            if (cell && cell.cell_owner && cell.cell_owner.state === CellStates.storage) {
                const foodType = cell.cell_owner.retrieveFood("any");
                if (foodType === "plant" || foodType === "meat" || foodType === "food") {
                    this.org.food_collected++;
                    env.renderer.addToRender(cell); 
                    return;
                }
            }
        }
    }
}

module.exports = OmnivoreMouthCell;
