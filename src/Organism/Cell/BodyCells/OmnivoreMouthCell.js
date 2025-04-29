const CellStates = require("../CellStates");
const BodyCell = require("./BodyCell");
const Hyperparams = require("../../../Hyperparameters");

class OmnivoreMouthCell extends BodyCell {
    constructor(org, loc_col, loc_row) {
        super(CellStates.omnivoreMouth, org, loc_col, loc_row);
    }

    performFunction() {
        var env = this.org.env;
        var real_c = this.getRealCol();
        var real_r = this.getRealRow();
        
        for (var loc of Hyperparams.edibleNeighbors) {
            var cell = env.grid_map.cellAt(real_c + loc[0], real_r + loc[1]);
            if (cell && (cell.state === CellStates.plant || cell.state === CellStates.meat || cell.state === CellStates.food)) {
                env.changeCell(cell.col, cell.row, CellStates.empty, null);
                this.org.food_collected++;
                return;
            }
        }
        
        for (var loc of Hyperparams.edibleNeighbors) {
            var cell = env.grid_map.cellAt(real_c + loc[0], real_r + loc[1]);
            if (!cell) continue;
            
            if (cell.cell_owner && cell.cell_owner.state === CellStates.storage) {
                const foodType = cell.cell_owner.retrieveFood("any");
                if (foodType) {
                    this.org.food_collected++;
                    env.renderer.addToRender(cell);
                    return;
                }
            }
        }
    }
}

module.exports = OmnivoreMouthCell;