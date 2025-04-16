const CellStates = require("../CellStates");
const BodyCell = require("./BodyCell");
const Directions = require("../../Directions");

class UpDownMoverCell extends BodyCell {
    constructor(org, loc_col, loc_row) {
        super(CellStates.upDownMover, org, loc_col, loc_row);
        this.org.anatomy.is_mover = true;
    }
    
    performFunction() {
        // make sure the organism doesnt have a mover already
        for(let cell of this.org.anatomy.cells) {
            if(cell.state === CellStates.mover) {
                return;
            }
        }
        
        // force either up or down
        if(this.org.direction !== Directions.up && this.org.direction !== Directions.down) {
            this.org.direction = Math.random() < 0.5 ? Directions.up : Directions.down;
        }
    }
}

module.exports = UpDownMoverCell;