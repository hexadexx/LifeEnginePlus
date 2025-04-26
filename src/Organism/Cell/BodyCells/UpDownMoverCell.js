const CellStates = require("../CellStates");
const BodyCell = require("./BodyCell");
const Directions = require("../../Directions");

class UpDownMoverCell extends BodyCell {
    constructor(org, loc_col, loc_row) {
        super(CellStates.upDownMover, org, loc_col, loc_row);
        this.org.anatomy.is_ud_mover = true;
    }
    
    performFunction() {
        if (this.org.anatomy.is_mover || (this.org.anatomy.is_ud_mover && this.org.anatomy.is_lr_mover)) return;
        
        if (this.org.direction !== Directions.up && this.org.direction !== Directions.down) {
            this.org.direction = Math.random() < 0.5 ? Directions.up : Directions.down;
        }
    }
}

module.exports = UpDownMoverCell;