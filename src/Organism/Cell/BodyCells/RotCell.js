const CellStates = require("../CellStates");
const BodyCell = require("./BodyCell");
const Hyperparams = require("../../../Hyperparameters");

class RotCell extends BodyCell {
    constructor(org, loc_col, loc_row) {
        super(CellStates.rot, org, loc_col, loc_row);
        this.moldTimer = 0;
    }

    performFunction() {
        if (this.moldTimer > 0) {
            this.moldTimer--;
            return;
        }

        const env = this.org.env;
        const real_c = this.getRealCol();
        const real_r = this.getRealRow();
        const prob = Hyperparams.foodProdProb;

        if (Math.random() * 100 <= prob) {
            const neighbors = [
                [0, 1], [0, -1], [1, 0], [-1, 0],
                [1, 1], [1, -1], [-1, 1], [-1, -1]
            ];

            for (let [dx, dy] of neighbors) {
                const cell = env.grid_map.cellAt(real_c + dx, real_r + dy);
                if (cell && cell.state === CellStates.empty) {
                    env.changeCell(cell.col, cell.row, CellStates.plant, null);
                    break;
                }
            }
        }
    }

    initInherit(parent) {
        super.initInherit(parent);
        this.moldTimer = parent.moldTimer || 0;
    }
}

module.exports = RotCell;