const Environment = require('./Environment');
const Renderer = require('../Rendering/Renderer');
const GridMap = require('../Grid/GridMap');
const Organism = require('../Organism/Organism');
const CellStates = require('../Organism/Cell/CellStates');
const EnvironmentController = require('../Controllers/EnvironmentController');
const Hyperparams = require('../Hyperparameters.js');
const FossilRecord = require('../Stats/FossilRecord');
const WorldConfig = require('../WorldConfig');
const SerializeHelper = require('../Utils/SerializeHelper');
const Species = require('../Stats/Species');
const Neighbors = require('../Grid/Neighbors');

class WorldEnvironment extends Environment{
    constructor(cell_size) {
        super();
        this.rotUpdateFrame = 0;
        this.renderer = new Renderer('env-canvas', 'env', cell_size);
        this.controller = new EnvironmentController(this, this.renderer.canvas);
        this.num_rows = Math.ceil(this.renderer.height / cell_size);
        this.num_cols = Math.ceil(this.renderer.width / cell_size);
        this.grid_map = new GridMap(this.num_cols, this.num_rows, cell_size);
        this.organisms = [];
        this.walls = [];
        this.total_mutability = 0;
        this.largest_cell_count = 0;
        this.reset_count = 0;
        this.total_ticks = 0;
        this.data_update_rate = 100;
        this.pendingDepthUpdate = false;
        this.depthUpdateTimeout = null;
        FossilRecord.setEnv(this);
        this.updateDepths();
    }

    update() {
        var to_remove = [];
        for (var i in this.organisms) {
            var org = this.organisms[i];
            if (!org.living || !org.update()) {
                to_remove.push(i);
            }
        }
        this.removeOrganisms(to_remove);
        
        this.rotUpdateFrame++;
        if (this.rotUpdateFrame % 10 !== 0) {
            if (Hyperparams.foodDropProb > 0) {
                this.generateFood();
            }
            this.total_ticks++;
            if (this.total_ticks % this.data_update_rate == 0) {
                FossilRecord.updateData();
            }
            return;
        }
        
        if (this.rotUpdateFrame >= 10000) {
            this.rotUpdateFrame = 0;
        }

        if (!this.cellsToProcess) {
            this.cellsToProcess = [];
            this.allCells = [];
            for (var col of this.grid_map.grid) {
                for (var cell of col) {
                    if (cell.state === CellStates.meat || cell.state === CellStates.rot) {
                        this.allCells.push(cell);
                    }
                }
            }
            this.chunkSize = 3500;
            this.currentChunk = 0;
            this.totalChunks = Math.ceil(this.allCells.length / this.chunkSize);
        }
        
        const startIdx = this.currentChunk * this.chunkSize;
        const endIdx = Math.min(startIdx + this.chunkSize, this.allCells.length);
        
        for (let i = startIdx; i < endIdx; i++) {
            const cell = this.allCells[i];
            
            if (cell.state === CellStates.meat) {
                if (cell.rotTime === undefined) {
                    cell.rotTime = 0;
                } else {
                    cell.rotTime += 10; 
                }
                
                if (cell.rotTime >= 5000) {
                    this.cellsToProcess.push({
                        col: cell.col,
                        row: cell.row,
                        action: 1
                    });
                } else {
                    this.renderer.addToRender(cell);
                }
            }
            else if (cell.state === CellStates.rot) {
                if (cell.rotAge === undefined) {
                    cell.rotAge = 0;
                } else {
                    cell.rotAge += 10; 
                }
                
                if (cell.rotAge >= 250) {
                    if (Math.random() < 0.02) {
                        const neighbors = Hyperparams.growableNeighbors;
                        const neighbor = neighbors[Math.floor(Math.random() * neighbors.length)];
                        const neighborCol = cell.col + neighbor[0];
                        const neighborRow = cell.row + neighbor[1];
                        
                        const neighborCell = this.grid_map.cellAt(neighborCol, neighborRow);
                        if (neighborCell && neighborCell.state === CellStates.empty) {
                            this.cellsToProcess.push({
                                col: neighborCol,
                                row: neighborRow,
                                action: 2
                            });
                        } else if (Math.random() < 0.065) {
                            this.cellsToProcess.push({
                                col: cell.col,
                                row: cell.row,
                                action: 2
                            });
                        }
                    }
                }
                
                if (cell.rotAge >= 6000) {
                    this.cellsToProcess.push({
                        col: cell.col,
                        row: cell.row,
                        action: 3
                    });
                } else {
                    this.renderer.addToRender(cell);
                }
            }
        }
        
        for (const cellInfo of this.cellsToProcess) {
            switch (cellInfo.action) {
                case 1:
                    const rotCell = this.grid_map.cellAt(cellInfo.col, cellInfo.row);
                    if (rotCell && rotCell.state === CellStates.meat) {
                        this.changeCell(cellInfo.col, cellInfo.row, CellStates.rot, null);
                        const newRotCell = this.grid_map.cellAt(cellInfo.col, cellInfo.row);
                        if (newRotCell) {
                            newRotCell.rotAge = 0;
                        }
                    }
                    break;
                case 2:
                    this.changeCell(cellInfo.col, cellInfo.row, CellStates.plant, null);
                    break;
                case 3:
                    if (Math.random() < 0.5) {
                        this.changeCell(cellInfo.col, cellInfo.row, CellStates.plant, null);
                    } else {
                        this.changeCell(cellInfo.col, cellInfo.row, CellStates.empty, null);
                    }
                    
                    break;
            }
        }
        this.cellsToProcess = [];
        
        this.currentChunk++;
        if (this.currentChunk >= this.totalChunks) {
            this.cellsToProcess = null;
        }
        
        if (Hyperparams.foodDropProb > 0) {
            this.generateFood();
        }
        this.total_ticks++;
        if (this.total_ticks % this.data_update_rate == 0) {
            FossilRecord.updateData();
        }
    }

    render() {
        if (WorldConfig.headless) {
            this.renderer.cells_to_render.clear();
            return;
        }
        this.renderer.renderCells();
        this.renderer.renderHighlights();
    }

    renderFull() {
        this.renderer.renderFullGrid(this.grid_map.grid);
    }

    removeOrganisms(org_indeces) {
        let start_pop = this.organisms.length;
        for (var i of org_indeces.reverse()){
            this.total_mutability -= this.organisms[i].mutability;
            this.organisms.splice(i, 1);
        }
        if (this.organisms.length === 0 && start_pop > 0) {
            if (WorldConfig.auto_pause)
                $('.pause-button')[0].click();
            else if(WorldConfig.auto_reset) {
                this.reset_count++;
                this.reset(false);
            }
        }
    }

    OriginOfLife() {
        var center = this.grid_map.getCenter();
        var org = new Organism(center[0], center[1], this);
        org.anatomy.addDefaultCell(CellStates.herbivoreMouth, 0, 0);
        org.anatomy.addDefaultCell(CellStates.producer, 1, 1);
        org.anatomy.addDefaultCell(CellStates.producer, -1, -1);
        this.addOrganism(org);
        FossilRecord.addSpecies(org, null);
    }

    addOrganism(organism) {
        organism.updateGrid();
        this.total_mutability += organism.mutability;
        this.organisms.push(organism);
        if (organism.anatomy.cells.length > this.largest_cell_count) 
            this.largest_cell_count = organism.anatomy.cells.length;
    }

    canAddOrganism() {
        return this.organisms.length < Hyperparams.maxOrganisms || Hyperparams.maxOrganisms < 0;
    }

    averageMutability() {
        if (this.organisms.length < 1)
            return 0;
        if (Hyperparams.useGlobalMutability) {
            return Hyperparams.globalMutability;
        }
        return this.total_mutability / this.organisms.length;
    }

    changeCell(c, r, state, owner) {
        const targetStates = [CellStates.wall, CellStates.food, CellStates.plant, CellStates.meat];
        const prevCell = this.grid_map.cellAt(c, r);
        const prevState = prevCell ? prevCell.state : null;
        const cell = this.grid_map.cellAt(c, r);
        if (cell) {
            cell.rotTime = 0;
        }
        
        super.changeCell(c, r, state, owner);
        this.renderer.addToRender(this.grid_map.cellAt(c, r));
        
        if (state == CellStates.wall)
            this.walls.push(this.grid_map.cellAt(c, r));
        
        if ((targetStates.includes(state) || (prevState && targetStates.includes(prevState))) && !this.pendingDepthUpdate) {
            this.pendingDepthUpdate = true;
            
            if (this.depthUpdateTimeout) {
                clearTimeout(this.depthUpdateTimeout);
            }
            
            const totalCells = this.grid_map.cols * this.grid_map.rows;
            const relativeSizeMultiplier = totalCells / 20000; 
            const cooldown = Math.max(5, Math.min(50, Math.floor(10 * relativeSizeMultiplier)));
            
            this.depthUpdateTimeout = setTimeout(() => {
                this.updateDepths();
                this.pendingDepthUpdate = false;
            }, cooldown);
        }
    }
    

    clearWalls() {
        for(var wall of this.walls){
            let wcell = this.grid_map.cellAt(wall.col, wall.row);
            if (wcell && wcell.state == CellStates.wall)
                this.changeCell(wall.col, wall.row, CellStates.empty, null);
        }
    }

    clearOrganisms() {
        for (var org of this.organisms)
            org.die();
        this.organisms = [];
    }
    
    clearDeadOrganisms() {
        let to_remove = [];
        for (let i in this.organisms) {
            let org = this.organisms[i];
            if (!org.living)
                to_remove.push(i);
        }
        this.removeOrganisms(to_remove);
    }

    generateFood() {
        var num_food = Math.max(Math.floor(this.grid_map.cols*this.grid_map.rows*Hyperparams.foodDropProb/50000), 1)
        var prob = Hyperparams.foodDropProb;
        for (var i=0; i<num_food; i++) {
            if (Math.random() <= prob){
                var c=Math.floor(Math.random() * this.grid_map.cols);
                var r=Math.floor(Math.random() * this.grid_map.rows);

                if (this.grid_map.cellAt(c, r).state == CellStates.empty){
                    this.changeCell(c, r, CellStates.food, null);
                }
            }
        }
    }

    reset(confirm_reset=true, reset_life=true) {
        if (confirm_reset && !confirm('The current environment will be lost. Proceed?'))
            return false;

        this.organisms = [];
        this.grid_map.fillGrid(CellStates.empty, !WorldConfig.clear_walls_on_reset);
        this.renderer.renderFullGrid(this.grid_map.grid);
        this.total_mutability = 0;
        this.total_ticks = 0;
        FossilRecord.clear_record();
        if (reset_life)
            this.OriginOfLife();
        this.updateDepths();
        return true;
    }

    resizeGridColRow(cell_size, cols, rows) {
        this.renderer.cell_size = cell_size;
        this.renderer.fillShape(rows*cell_size, cols*cell_size);
        this.grid_map.resize(cols, rows, cell_size);
    }

    resizeFillWindow(cell_size) {
        this.renderer.cell_size = cell_size;
        this.renderer.fillWindow('env');
        this.num_cols = Math.ceil(this.renderer.width / cell_size);
        this.num_rows = Math.ceil(this.renderer.height / cell_size);
        this.grid_map.resize(this.num_cols, this.num_rows, cell_size);
    }

    serialize() {
        this.clearDeadOrganisms();
        let env = SerializeHelper.copyNonObjects(this);
        env.grid = this.grid_map.serialize();
        env.organisms = [];
        for (let org of this.organisms){
            env.organisms.push(org.serialize());
        }
        env.fossil_record = FossilRecord.serialize();
        env.controls = Hyperparams;
        return env;
    }

    loadRaw(env) { // species name->stats map, evolution controls, 
        this.organisms = [];
        FossilRecord.clear_record();
        let cell_size = env.grid.cell_size ? env.grid.cell_size : this.grid_map.cell_size;
        this.resizeGridColRow(cell_size, env.grid.cols, env.grid.rows)
        this.grid_map.loadRaw(env.grid);
        for (let wall of env.grid.walls) {
            this.walls.push(this.grid_map.cellAt(wall.c, wall.r));
        }

        // create species map
        let species = {};
        for (let name in env.fossil_record.species) {
            let s = new Species(null, null, 0);
            SerializeHelper.overwriteNonObjects(env.fossil_record.species[name], s)
            species[name] = s; // the species needs an anatomy obj still
        }

        for (let orgRaw of env.organisms) {
            let org = new Organism(orgRaw.col, orgRaw.row, this);
            org.loadRaw(orgRaw);
            this.addOrganism(org);
            let s = species[orgRaw.species_name];
            if (!s){ // ideally, every organisms species should exists, but there is a bug that misses some species sometimes
                s = new Species(org.anatomy, null, env.total_ticks);
                species[orgRaw.species_name] = s;
            }
            if (!s.anatomy) {
                //if the species doesn't have anatomy we need to initialize it
                s.anatomy = org.anatomy;
                s.calcAnatomyDetails();
            }
            s.name = orgRaw.species_name;
            org.species = s;
        }
        for (let name in species)
            FossilRecord.addSpeciesObj(species[name]);
        FossilRecord.loadRaw(env.fossil_record);
        SerializeHelper.overwriteNonObjects(env, this);
        if ($('#override-controls').is(':checked'))
            Hyperparams.loadJsonObj(env.controls)
        this.renderer.renderFullGrid(this.grid_map.grid);
    }

    updateDepths() {
        // too laggy, maybe fix soon
    }
    
}

module.exports = WorldEnvironment;

