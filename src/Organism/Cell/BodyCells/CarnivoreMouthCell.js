const CellStates = require("../CellStates");
const BodyCell = require("./BodyCell");
const Hyperparams = require("../../../Hyperparameters");

class CarnivoreMouthCell extends BodyCell {
    constructor(org, loc_col, loc_row) {
        super(CellStates.carnivoreMouth, org, loc_col, loc_row);
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
            }
        }
        
        if (!foundFood) {
            this.checkStorageCells();
        }
    }

    eatNeighbor(n_cell, env) {
        if (n_cell == null) return false;
        
        if (n_cell.state == CellStates.meat || n_cell.state == CellStates.food) {
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
                const foodType = cell.cell_owner.retrieveFood("meat");
                if (foodType === "meat" || foodType === "food") {
                    this.org.food_collected++;
                    env.renderer.addToRender(cell); 
                    return;
                }
            }
        }
    }
}

module.exports = CarnivoreMouthCell;