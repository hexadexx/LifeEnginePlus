const CellStates = require("../Organism/Cell/CellStates");
const Directions = require("../Organism/Directions");
const Hyperparams = require("../Hyperparameters");

class Renderer {
    constructor(canvas_id, container_id, cell_size) {
        this.cell_size = cell_size;
        this.canvas = document.getElementById(canvas_id);
        this.ctx = this.canvas.getContext("2d");
        this.fillWindow(container_id)
		this.height = this.canvas.height;
        this.width = this.canvas.width;
        this.cells_to_render = new Set();
        this.cells_to_highlight = new Set();
        this.highlighted_cells = new Set();
        this.cells_with_pheromones = new Set();
        this.cells_with_rot = new Set();
    }

    fillWindow(container_id) {
        this.fillShape($('#'+container_id).height(), $('#'+container_id).width());
    }

    fillShape(height, width) {
        this.canvas.width = width;
        this.canvas.height = height;
        this.height = this.canvas.height;
        this.width = this.canvas.width;
    }

    clear() {
        this.ctx.fillStyle = 'white';
        this.ctx.fillRect(0, 0, this.height, this.width);
    }

    renderFullGrid(grid) {
        for (var col of grid) {
            for (var cell of col){
                this.renderCell(cell);
            }
        }
    }

    renderCells() {
        for (var cell of this.cells_to_render) {
            this.renderCell(cell);
        }
        this.cells_to_render.clear();
    }

    renderCell(cell) {
        cell.state.render(this.ctx, cell, this.cell_size);
        
        if (Hyperparams.showPheromones && 
            (cell.redPheromone > 0 || cell.greenPheromone > 0 || cell.bluePheromone > 0)) {
            this.renderPheromone(cell);
            this.cells_with_pheromones.add(cell);
        }
        
        if (cell.state === CellStates.meat && cell.rotTime > 0) {
            this.renderRotLayer(cell);
            this.cells_with_rot.add(cell);
        }
    }
    
    renderPheromone(cell) {
        const r = cell.redPheromone > 0 ? 255 : 0;
        const g = cell.greenPheromone > 0 ? 255 : 0;
        const b = cell.bluePheromone > 0 ? 255 : 0;
        
        const intensity = Math.max(cell.redPheromone, cell.greenPheromone, cell.bluePheromone);
        const opacity = intensity / 30 * 0.25;
        
        this.ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`;
        this.ctx.fillRect(cell.x, cell.y, this.cell_size, this.cell_size);
    }
    
    renderRotLayer(cell) {
        const maxRotTime = 5000;
        const rotProgress = Math.min(cell.rotTime / maxRotTime, 1);
        
        const r = 84; 
        const g = 60;
        const b = 64;
        
        const opacity = rotProgress * 0.6;
        
        this.ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`;
        this.ctx.fillRect(cell.x, cell.y, this.cell_size, this.cell_size);
    }

    renderOrganism(org) {
        for(var org_cell of org.anatomy.cells) {
            var cell = org.getRealCell(org_cell);
            this.renderCell(cell);
        }
    }

    addToRender(cell) {
        if (this.highlighted_cells.has(cell)){
            this.cells_to_highlight.add(cell);
        }
        this.cells_to_render.add(cell);
        
        if (Hyperparams.showPheromones && 
            (cell.redPheromone > 0 || cell.greenPheromone > 0 || cell.bluePheromone > 0)) {
            this.cells_with_pheromones.add(cell);
        }
        
        if (cell.state === CellStates.meat && cell.rotTime > 0) {
            this.cells_with_rot.add(cell);
        }
    }

    renderHighlights() {
        for (var cell of this.cells_to_highlight) {
            this.renderCellHighlight(cell);
            this.highlighted_cells.add(cell);
        }
        this.cells_to_highlight.clear();
    }

    highlightOrganism(org) {
        for(var org_cell of org.anatomy.cells) {
            var cell = org.getRealCell(org_cell);
            this.cells_to_highlight.add(cell);
        }
    }

    highlightCell(cell) {
        this.cells_to_highlight.add(cell);
    }

    renderCellHighlight(cell, color="yellow") {
        this.renderCell(cell);
        this.ctx.fillStyle = color;
        this.ctx.globalAlpha = 0.5;
        this.ctx.fillRect(cell.x, cell.y, this.cell_size, this.cell_size);
        this.ctx.globalAlpha = 1;
        this.highlighted_cells.add(cell);
    }

    clearAllHighlights(clear_to_highlight=false) {
        for (var cell of this.highlighted_cells) {
            this.renderCell(cell);
        }
        this.highlighted_cells.clear();
        if (clear_to_highlight) {
            this.cells_to_highlight.clear();
        }
    }
}

module.exports = Renderer;