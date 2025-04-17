const CellStates = require("../CellStates");
const BodyCell = require("./BodyCell");

class RotationMoverCell extends BodyCell {
    constructor(org, loc_col, loc_row) {
        super(CellStates.rotationMover, org, loc_col, loc_row);
        this.org.anatomy.is_rotation_mover = true;
        this.org.can_rotate = true;
    }
}

module.exports = RotationMoverCell;