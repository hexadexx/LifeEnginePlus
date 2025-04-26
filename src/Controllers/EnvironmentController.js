const CanvasController = require("./CanvasController");
const Organism = require('../Organism/Organism');
const Modes = require("./ControlModes");
const CellStates = require("../Organism/Cell/CellStates");
const Neighbors = require("../Grid/Neighbors");
const FossilRecord = require("../Stats/FossilRecord");
const WorldConfig = require("../WorldConfig");
const Perlin = require("../Utils/Perlin");

class EnvironmentController extends CanvasController{
    constructor(env, canvas) {
        super(env, canvas);
        this.mode = Modes.FoodDrop;
        this.org_to_clone = null;
        this.defineZoomControls();
        this.scale = 1;
    }

    defineZoomControls() {
          var scale = 1;
          var zoom_speed = 0.7;
          const el = document.querySelector('#env-canvas');
          el.onwheel = function zoom(event) {
            event.preventDefault();

            var sign = Math.sign(event.deltaY);
          
            scale *= Math.pow(zoom_speed, sign);
          
            const MAX = 32;
            const MIN = Math.pow(2, -3);
            scale = Math.min(MAX, Math.max(MIN, scale));

            var cur_top = parseInt($('#env-canvas').css('top'));
            var cur_left = parseInt($('#env-canvas').css('left'));

            var diff_x = (this.canvas.width/2  - this.mouse_x) * (scale - this.scale);
            var diff_y = (this.canvas.height/2 - this.mouse_y) * (scale - this.scale);

            $('#env-canvas').css('top', (cur_top+diff_y)+'px');
            $('#env-canvas').css('left', (cur_left+diff_x)+'px');
          
            // Apply scale transform
            el.style.transform = `scale(${scale})`;
            this.scale = scale;

          }.bind(this);
    }

    resetView() {
        $('#env-canvas').css('transform', 'scale(1)');
        $('#env-canvas').css('top', '0px');
        $('#env-canvas').css('left', '0px');
        this.scale = 1;
    }

    /*
    Iterate over grid from 0,0 to env.num_cols,env.num_rows and create random walls using perlin noise to create a more organic shape.
    */
    randomizeWalls(thickness=1) {
        this.env.clearWalls();
        
        const noise_threshold = -0.017;
        const resolution = 20;
        Perlin.seed();
        
        const totalCells = this.env.num_rows * this.env.num_cols;
        const chunkSize = 4250;
        
        const processChunk = (startIdx, endIdx) => {
            for (let idx = startIdx; idx < endIdx && idx < totalCells; idx++) {
                const r = Math.floor(idx / this.env.num_cols);
                const c = idx % this.env.num_cols;
                
                let xval = c/this.env.num_cols*resolution;
                let yval = r/this.env.num_rows*resolution;
                
                let noise = Perlin.get(xval, yval);
                
                if (noise > noise_threshold && noise < noise_threshold + thickness/resolution) {
                    let cell = this.env.grid_map.cellAt(c, r);
                    if (cell != null) {
                        if(cell.owner != null) cell.owner.die();
                        this.env.changeCell(c, r, CellStates.wall, null);
                    }
                }
            }
        };
        
        const processAllChunks = (currentChunk = 0) => {
            const startIdx = currentChunk * chunkSize;
            const endIdx = startIdx + chunkSize;
            
            processChunk(startIdx, endIdx);
            
            if (endIdx < totalCells) {
                setTimeout(() => {
                    processAllChunks(currentChunk + 1);
                }, 10); 
            }
        };
        
        processAllChunks();
    }

    updateMouseLocation(offsetX, offsetY){
        super.updateMouseLocation(offsetX, offsetY);
    }

    mouseMove() {
        this.performModeAction();
    }

    mouseDown() {
        this.start_x = this.mouse_x;
        this.start_y = this.mouse_y;
        this.performModeAction();
    }

    mouseUp() {

    }

    performModeAction() {
        if (WorldConfig.headless && this.mode != Modes.Drag)
            return;
        var mode = this.mode;
        var right_click = this.right_click;
        var left_click = this.left_click;
        if (mode != Modes.None && (right_click || left_click)) {
            var cell = this.cur_cell;
            if (cell == null){
                return;
            }
            switch(mode) {
                case Modes.FoodDrop:
                    if (left_click){
                        this.dropCellType(cell.col, cell.row, CellStates.food, false, CellStates.wall);
                    }
                    else if (right_click){
                        this.dropCellType(cell.col, cell.row, CellStates.empty, false, CellStates.wall);
                    }
                    break;
                case Modes.MeatDrop:
                    if (left_click){
                        this.dropCellType(cell.col, cell.row, CellStates.meat, false, CellStates.wall);
                    }
                    else if (right_click){
                        this.dropCellType(cell.col, cell.row, CellStates.empty, false, CellStates.wall);
                    }
                    break;
                case Modes.PlantDrop:
                    if (left_click){
                        this.dropCellType(cell.col, cell.row, CellStates.plant, false, CellStates.wall);
                    }
                    else if (right_click){
                        this.dropCellType(cell.col, cell.row, CellStates.empty, false, CellStates.wall);
                    }
                    break;
                case Modes.WallDrop:
                    if (left_click){
                        this.dropCellType(cell.col, cell.row, CellStates.wall, true);
                    }
                    else if (right_click){
                        this.dropCellType(cell.col, cell.row, CellStates.empty, false, CellStates.food);
                    }
                    break;
                case Modes.ClickKill:
                    this.killNearOrganisms();
                    break;

                case Modes.Select:
                    if (this.cur_org == null) {
                        this.cur_org = this.findNearOrganism();
                    }
                    if (this.cur_org != null){
                        this.control_panel.setEditorOrganism(this.cur_org);
                    }
                    break;

                case Modes.Clone:
                    if (this.org_to_clone != null){
                        this.dropOrganism(this.org_to_clone, this.mouse_c, this.mouse_r);
                    }
                    break;
                case Modes.Drag:
                    this.dragScreen();
                    break;
                case Modes.Eyedropper:
                    if (left_click) {
                        if (cell.owner) {
                            $('#maximize').click();

                            $('#editor.tabnav-item').click();
                            
                            $('#edit').click();

                            const cellType = cell.state.name;
                            $('.cell-category-btn').removeClass('active');
                            
                            const category = this.getCategoryForCellType(cellType);
                            $(`.cell-category-btn[data-category="${category}"]`).click();
                            
                            $(`#${cellType}.cell-type`).click();
                        } else if (cell.state === CellStates.empty) {
                            return;
                        } else {
                            switch(cell.state) {
                                case CellStates.food:
                                    $('#food-drop').click();
                                    break;
                                case CellStates.meat:
                                    $('#meat-drop').click();
                                    break;
                                case CellStates.plant:
                                    $('#plant-drop').click();
                                    break;
                                case CellStates.wall:
                                    $('#wall-drop').click();
                                    break;
                            }
                        }
                    }
                    break;
            }
        }
        
        if (this.middle_click) {
            this.dragScreen();
        }
    }


    getCategoryForCellType(cellType) {
        const cellElement = $(`#${cellType}.cell-type`);
        
        const categoryContainer = cellElement.closest('.cell-category');
        
        if (categoryContainer.length) {
            return categoryContainer.data('category');
        }
        
        return 'resources';
    }

    dragScreen() {
        var cur_top = parseInt($('#env-canvas').css('top'));
        var cur_left = parseInt($('#env-canvas').css('left'));
        var new_top = cur_top + ((this.mouse_y - this.start_y)*this.scale);
        var new_left = cur_left + ((this.mouse_x - this.start_x)*this.scale);
        $('#env-canvas').css('top', new_top+'px');
        $('#env-canvas').css('left', new_left+'px');
    }

    dropOrganism(organism, col, row) {

        // close the organism and drop it in the world
        var new_org = new Organism(col, row, this.env, organism);

        if (new_org.isClear(col, row)) {
            let new_species = !FossilRecord.speciesIsExtant(new_org.species.name);
            if (new_org.species.extinct) {
                FossilRecord.resurrect(new_org.species);
            }
            else if (new_species) {
                FossilRecord.addSpeciesObj(new_org.species);
                new_org.species.start_tick = this.env.total_ticks;
                new_org.species.population = 0;
            }

            this.env.addOrganism(new_org);
            new_org.species.addPop();
            return true;
        }
        return false;
    }

    dropCellType(col, row, state, killBlocking=false, ignoreState=null) {
        for (var loc of Neighbors.inRange(WorldConfig.brush_size)){
            var c=col + loc[0];
            var r=row + loc[1];
            var cell = this.env.grid_map.cellAt(c, r);
            if (cell == null)
                continue;
            if (killBlocking && cell.owner != null){
                cell.owner.die();
            }
            else if (cell.owner != null) {
                continue;
            }
            if (ignoreState != null && cell.state == ignoreState)
                continue;
            this.env.changeCell(c, r, state, null);
        }
    }

    findNearOrganism() {
        let closest = null;
        let closest_dist = 100;
        for (let loc of Neighbors.inRange(WorldConfig.brush_size)){
            let c = this.cur_cell.col + loc[0];
            let r = this.cur_cell.row + loc[1];
            let cell = this.env.grid_map.cellAt(c, r);
            let dist = Math.abs(loc[0]) + Math.abs(loc[1]);
            if (cell != null && cell.owner != null) { 
                if (closest === null || dist < closest_dist) {
                    closest = cell.owner;
                    closest_dist = dist;
                }
            }
        }
        return closest;
    }

    killNearOrganisms() {
        for (var loc of Neighbors.inRange(WorldConfig.brush_size)){
            var c = this.cur_cell.col + loc[0];
            var r = this.cur_cell.row + loc[1];
            var cell = this.env.grid_map.cellAt(c, r);
            if (cell != null && cell.owner != null)
                cell.owner.die();
        }
    }


}

module.exports = EnvironmentController;
