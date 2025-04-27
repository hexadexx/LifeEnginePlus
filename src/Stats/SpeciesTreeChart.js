const FossilRecord = require("./FossilRecord");

class SpeciesTreeChart {
    constructor() {
        this.setupD3Dependencies();
        this.bindEvents();
    }

    setupD3Dependencies() {
        if (!window.d3) {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/d3/7.8.5/d3.min.js';
            document.head.appendChild(script);
        }
    }

    bindEvents() {
        $(document).on('click', '#show-tree-btn', () => this.showTreeOverlay());
        $(document).on('click', '#close-tree-btn', () => this.hideTreeOverlay());
        $(document).on('click', '#refresh-tree-btn', () => this.renderTree());
        
        setInterval(() => {
            if ($('.tree-overlay').css('display') === 'flex') {
                this.renderTree();
            }
        }, 5000);
    }

    showTreeOverlay() {
        $('.tree-overlay').css('display', 'flex');
        setTimeout(() => {
            this.renderTree();
        }, 50);
    }

    hideTreeOverlay() {
        $('.tree-overlay').css('display', 'none');
    }

    renderTree() {
        const treeData = this.buildSpeciesTree();
        this.createD3Tree(treeData);
    }

    buildSpeciesTree() {
        const rootNode = {
            name: "Origin of Life",
            children: []
        };

        try {
            const allSpecies = {};
            
            for (const name in FossilRecord.extant_species) {
                const species = FossilRecord.extant_species[name];
                allSpecies[name] = { 
                    ...species, 
                    isExtinct: false 
                };
            }
            
            for (const name in FossilRecord.extinct_species) {
                const species = FossilRecord.extinct_species[name];
                allSpecies[name] = { 
                    ...species, 
                    isExtinct: true 
                };
            }
            
            const speciesMap = {};
            for (const name in allSpecies) {
                const species = allSpecies[name];
                const speciesNode = {
                    name: name,
                    originalSpecies: species,
                    isExtinct: species.isExtinct,
                    population: species.population || 0,
                    cellCounts: species.cell_counts || {},
                    children: []
                };
                
                speciesMap[name] = speciesNode;
            }
            
            for (const name in allSpecies) {
                const species = allSpecies[name];
                const speciesNode = speciesMap[name];
                
                if (species.ancestor && species.ancestor.name && speciesMap[species.ancestor.name]) {
                    const parentNode = speciesMap[species.ancestor.name];
                    parentNode.children.push(speciesNode);
                } else {
                    rootNode.children.push(speciesNode);
                }
            }
            
            if (Object.keys(allSpecies).length > 0) {
                return rootNode;
            }
        } catch (e) {
            console.error("Error building species tree:", e);
        }
        
        return {
            name: "No Species Data",
            children: []
        };
    }

    createD3Tree(treeData) {
        if (!window.d3) {
            $('#tree-visualization').html('<div style="text-align:center;padding:20px;">Loading D3.js library...</div>');
            setTimeout(() => this.createD3Tree(treeData), 500);
            return;
        }
        
        const container = d3.select('#tree-visualization');
        container.selectAll("*").remove();
        
        const width = container.node().getBoundingClientRect().width;
        const height = container.node().getBoundingClientRect().height;
        
        const svg = container.append('svg')
            .attr("width", width)
            .attr("height", height);
        
        const g = svg.append("g")
            .attr("transform", `translate(${width / 2}, 20)`);
        
        const treeLayout = d3.tree()
            .size([width - 100, height - 80])
            .separation((a, b) => (a.parent == b.parent ? 1.5 : 3));
        
        const root = d3.hierarchy(treeData);
        
        treeLayout(root);
        
        g.selectAll(".link")
            .data(root.links())
            .enter().append("path")
            .attr("class", "link")
            .attr("d", d3.linkVertical()
                .x(d => d.x)
                .y(d => d.y))
            .attr("stroke", d => d.target.data.isExtinct ? "#ff000055" : "#55555599");
        
        const node = g.selectAll(".node")
            .data(root.descendants())
            .enter().append("g")
            .attr("class", "node")
            .attr("transform", d => `translate(${d.x},${d.y})`)
            .on("click", (event, d) => this.showSpeciesDetails(d.data));
        
        const nodeSize = 12;
        node.append("rect")
            .attr("x", -nodeSize / 2)
            .attr("y", -nodeSize / 2)
            .attr("width", nodeSize)
            .attr("height", nodeSize)
            .attr("fill", d => this.getNodeColor(d.data))
            .attr("stroke", d => d.data.isExtinct ? "#ff0000" : "#000")
            .attr("stroke-width", 1.5);
        
        node.append("text")
            .attr("dy", "0.31em")
            .attr("x", d => d.children ? -15 : 15)
            .attr("text-anchor", d => d.children ? "end" : "start")
            .text(d => d.data.name)
            .clone(true).lower()
            .attr("stroke", "white")
            .attr("stroke-width", 3);
        
        const zoom = d3.zoom()
            .scaleExtent([0.1, 3])
            .on("zoom", (event) => {
                g.attr("transform", event.transform);
            });
        
        svg.call(zoom);
        
        const initialTransform = d3.zoomIdentity
            .translate(width / 2, 20)
            .scale(0.8);
        
        svg.call(zoom.transform, initialTransform);
    }

    getNodeColor(nodeData) {
        if (!nodeData.cellCounts) return "#cccccc";
        
        if (nodeData.isExtinct) return "#f0f0f0";
        
        const cellTypes = Object.keys(nodeData.cellCounts);
        
        if (cellTypes.includes("carnivoreMouth")) return color_scheme.carnivoreMouth;
        if (cellTypes.includes("herbivoreMouth")) return color_scheme.herbivoreMouth;
        if (cellTypes.includes("producer")) return color_scheme.producer;
        if (cellTypes.includes("killer")) return color_scheme.killer;
        if (cellTypes.includes("eye")) return color_scheme.eye;
        
        return "#aaaaaa";
    }

    showSpeciesDetails(speciesData) {
        if (!speciesData || !speciesData.originalSpecies) {
            $('#species-details .details-content').html("<h3>No details available</h3>");
            return;
        }
        
        const species = speciesData.originalSpecies;
        const isExtinct = speciesData.isExtinct;
        const cellCounts = speciesData.cellCounts;
        
        let cellHTML = "";
        if (cellCounts && Object.keys(cellCounts).length > 0) {
            cellHTML = `<div class="species-visual">`;
            
            for (const [cellType, count] of Object.entries(cellCounts)) {
                const cellColor = color_scheme[cellType] || "#cccccc";
                for (let i = 0; i < Math.min(count, 9); i++) {
                    cellHTML += `<div class="cell" style="background-color: ${cellColor}"></div>`;
                }
            }
            
            cellHTML += `</div>`;
        }
        
        const detailsHTML = `
            <div class="species-card ${isExtinct ? 'extinct-species' : ''}">
                ${cellHTML}
                <div class="species-info">
                    <h3>${speciesData.name}</h3>
                    <p><strong>Status:</strong> ${isExtinct ? "Extinct" : "Living"}</p>
                    <p><strong>Population:</strong> ${speciesData.population || 0}</p>
                    <p><strong>Cell count:</strong> ${Object.values(cellCounts || {}).reduce((sum, count) => sum + count, 0)}</p>
                </div>
            </div>
        `;
        
        $('#species-details .details-content').html(detailsHTML);
    }
}

module.exports = SpeciesTreeChart;