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
        var real_c = this.getRealCol();
        var real_r = this.getRealRow();
        
        if (Math.random() * 100 <= Hyperparams.foodProdProb) {
            for (var loc of Hyperparams.growableNeighbors) {
                var cell = env.grid_map.cellAt(real_c + loc[0], real_r + loc[1]);
                if (cell && cell.cell_owner && cell.cell_owner.state === CellStates.storage) {
                    if (cell.cell_owner.storedFood === null) {
                        cell.cell_owner.storedFood = "plant";
                        env.renderer.addToRender(cell);
                        return;
                    }
                }
            }
            
            var emptyCells = [];
            for (var loc of Hyperparams.growableNeighbors) {
                var cell = env.grid_map.cellAt(real_c + loc[0], real_r + loc[1]);
                if (cell && cell.state == CellStates.empty) {
                    emptyCells.push(cell);
                }
            }
            
            if (emptyCells.length > 0) {
                var randomEmptyCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
                env.changeCell(randomEmptyCell.col, randomEmptyCell.row, CellStates.plant, null);
            }
        }
    }
}

module.exports = ProducerCell;