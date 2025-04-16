const CellStates = require("../CellStates");
const BodyCell = require("./BodyCell");
const Directions = require("../../Directions");

class LeftRightMoverCell extends BodyCell {
    constructor(org, loc_col, loc_row) {
        super(CellStates.leftRightMover, org, loc_col, loc_row);
        this.org.anatomy.is_mover = true;
    }
    
    performFunction() {
        // make sure the organism doesnt have a mover already
        for(let cell of this.org.anatomy.cells) {
            if(cell.state === CellStates.mover) {
                return;
            }
        }
        
        // force either left or right - very rudimentary fix
        if(this.org.direction !== Directions.left && this.org.direction !== Directions.right) {
            this.org.direction = Math.random() < 0.5 ? Directions.left : Directions.right;
        }
    }
}

module.exports = LeftRightMoverCell;