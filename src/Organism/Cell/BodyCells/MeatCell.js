const CellStates = require("../CellStates");
const BodyCell = require("./BodyCell");

class MeatCell extends BodyCell {
    constructor(org, loc_col, loc_row) {
        super(CellStates.meat, org, loc_col, loc_row);
        this.rotTimer = 0;
        this.initialRotTimer = 0;
    }

    performFunction() {
        if (this.rotTimer > 0) {
            this.rotTimer--;
            
            if (this.rotTimer <= 0) {
                const env = this.org.env;
                const real_c = this.getRealCol();
                const real_r = this.getRealRow();
                
                env.changeCell(real_c, real_r, CellStates.rot, null);
                const rotCell = env.grid_map.cellAt(real_c, real_r);
                rotCell.moldTimer = Math.floor(this.initialRotTimer / 2);
            }
        }
    }

    initInherit(parent) {
        super.initInherit(parent);
        this.rotTimer = parent.rotTimer || 0;
    }
}

module.exports = MeatCell;