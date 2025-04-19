const CellStates = require("../CellStates");
const BodyCell = require("./BodyCell");
const Directions = require("../../Directions");

class LeftRightMoverCell extends BodyCell {
    constructor(org, loc_col, loc_row) {
        super(CellStates.leftRightMover, org, loc_col, loc_row);
        this.org.anatomy.is_lr_mover = true;
    }
    
    performFunction() {
        if (this.org.anatomy.is_mover || (this.org.anatomy.is_ud_mover && this.org.anatomy.is_lr_mover)) return;
        
        if (this.org.direction !== Directions.left && this.org.direction !== Directions.right) {
            this.org.direction = Math.random() < 0.5 ? Directions.left : Directions.right;
        }
    }
}

module.exports = LeftRightMoverCell;
