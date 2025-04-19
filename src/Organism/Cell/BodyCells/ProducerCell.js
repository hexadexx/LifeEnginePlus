const CellStates = require("../CellStates");
const BodyCell = require("./BodyCell");
const Hyperparams = require("../../../Hyperparameters");

class ProducerCell extends BodyCell{
    constructor(org, loc_col, loc_row){
        super(CellStates.producer, org, loc_col, loc_row);
        this.org.anatomy.is_producer = true;
    }

    performFunction() {
        if ((this.org.anatomy.is_mover || this.org.anatomy.is_ud_mover || this.org.anatomy.is_lr_mover) && !Hyperparams.moversCanProduce)
            return;
        var env = this.org.env;
        var prob = Hyperparams.foodProdProb;
        var real_c = this.getRealCol();
        var real_r = this.getRealRow();
        if (Math.random() * 100 <= prob) {
            var loc = Hyperparams.growableNeighbors[Math.floor(Math.random() * Hyperparams.growableNeighbors.length)]
            var loc_c = loc[0];
            var loc_r = loc[1];
            var cell = env.grid_map.cellAt(real_c+loc_c, real_r+loc_r);
            
            if (cell && cell.cell_owner && cell.cell_owner.state === CellStates.storage) {
                if (cell.cell_owner.storedFood === null) {
                    cell.cell_owner.storedFood = "plant";
                    env.renderer.addToRender(cell);
                    return;
                }
            }
            else if (cell && cell.state == CellStates.empty) {
                env.changeCell(cell.col, cell.row, CellStates.plant, null);
                return;
            }
        }
    }
}

module.exports = ProducerCell;