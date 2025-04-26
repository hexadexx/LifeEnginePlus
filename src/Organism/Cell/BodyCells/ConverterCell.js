const CellStates = require("../CellStates");
const BodyCell = require("./BodyCell");
const Hyperparams = require("../../../Hyperparameters");
const Neighbors = require("../../../Grid/Neighbors");

class ConverterCell extends BodyCell {
    constructor(org, loc_col, loc_row) {
        super(CellStates.converter, org, loc_col, loc_row);
    }
    performFunction() {
        var env = this.org.env;
        var real_c = this.getRealCol();
        var real_r = this.getRealRow();
        
        for (var loc of Neighbors.all) {
            var cell = env.grid_map.cellAt(real_c + loc[0], real_r + loc[1]);
            if (!cell) continue;
            
            if (cell.cell_owner && cell.cell_owner.state === CellStates.storage) {
                this.processStorage(cell.cell_owner, cell.col, cell.row, env);
            } 
            else if ((cell.state === CellStates.plant || cell.state === CellStates.meat || cell.state === CellStates.rot) && !cell.cell_owner) {
                this.processFood(cell, env);
            }
        }
    }
    
    processStorage(storageCell, col, row, env) {
        if (!storageCell.storedFood) return;
        
        let hasHerbivoreMouth = false;
        let hasCarnivoreMouth = false;
        
        for (var loc of Neighbors.all) {
            var adjCell = env.grid_map.cellAt(col + loc[0], row + loc[1]);
            if (!adjCell || !adjCell.cell_owner) continue;
            
            if (adjCell.cell_owner.state === CellStates.herbivoreMouth) {
                hasHerbivoreMouth = true;
            } else if (adjCell.cell_owner.state === CellStates.carnivoreMouth) {
                hasCarnivoreMouth = true;
            }
        }
        
        if (hasHerbivoreMouth && !hasCarnivoreMouth && storageCell.storedFood === "meat") {
            storageCell.storedFood = "plant";
            env.renderer.addToRender(storageCell.getRealCell());
        } else if (hasCarnivoreMouth && !hasHerbivoreMouth && storageCell.storedFood === "plant") {
            storageCell.storedFood = "meat";
            env.renderer.addToRender(storageCell.getRealCell());
        }
    }
    
    processFood(foodCell, env) {
        let hasHerbivoreMouth = false;
        let hasCarnivoreMouth = false;
        
        for (var loc of Neighbors.all) {
            var adjCell = env.grid_map.cellAt(foodCell.col + loc[0], foodCell.row + loc[1]);
            if (!adjCell || !adjCell.cell_owner) continue;
            
            if (adjCell.cell_owner.state === CellStates.herbivoreMouth) {
                hasHerbivoreMouth = true;
            } else if (adjCell.cell_owner.state === CellStates.carnivoreMouth) {
                hasCarnivoreMouth = true;
            }
        }

        if (hasHerbivoreMouth && !hasCarnivoreMouth && foodCell.state === CellStates.meat) {
            env.changeCell(foodCell.col, foodCell.row, CellStates.plant, null);
        } else if (hasCarnivoreMouth && !hasHerbivoreMouth && foodCell.state === CellStates.plant) {
            env.changeCell(foodCell.col, foodCell.row, CellStates.meat, null);
        }

        if (hasHerbivoreMouth && !hasCarnivoreMouth && foodCell.state === CellStates.rot) {
            env.changeCell(foodCell.col, foodCell.row, CellStates.plant, null);
        } else if (hasCarnivoreMouth && !hasHerbivoreMouth && foodCell.state === CellStates.rot) {
            env.changeCell(foodCell.col, foodCell.row, CellStates.meat, null);
        }
    }
}

module.exports = ConverterCell;