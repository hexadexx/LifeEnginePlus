const CellStates = require("../CellStates");
const BodyCell = require("./BodyCell");

class RotationMoverCell extends BodyCell {
    constructor(org, loc_col, loc_row) {
        super(CellStates.rotationMover, org, loc_col, loc_row);
        
        // this doesn't set is_mover because it only rotates
        // organisms need any type of mover to actually move
        
        // but it should rotate
        this.org.can_rotate = true;
    }
    
    performFunction() {
        // we still need to check for a rotator though
        for(let cell of this.org.anatomy.cells) {
            if(cell.state === CellStates.mover) {
                return;
            }
        }
    }
}

module.exports = RotationMoverCell;