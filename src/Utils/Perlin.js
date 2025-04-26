const Perlin = {
    gradients: {},
    memory: {},
    seed: function(s) {
        this.gradients = {};
        this.memory = {};
        
        const seed = s !== undefined ? s : Date.now();
        Math.seedrandom(seed);
    },

    rand_vect: function() {
        const theta = Math.random() * 2 * Math.PI;
        return {x: Math.cos(theta), y: Math.sin(theta)};
    },

    dot_prod_grid: function(x, y, vx, vy) {
        const wrappedVx = vx % 256;
        const wrappedVy = vy % 256;
        
        let g_vect;
        const key = `${wrappedVx},${wrappedVy}`;
        
        if (this.gradients[key]) {
            g_vect = this.gradients[key];
        } else {
            g_vect = this.rand_vect();
            this.gradients[key] = g_vect;
        }
        
        const d_vect = {x: x - vx, y: y - vy};
        return d_vect.x * g_vect.x + d_vect.y * g_vect.y;
    },

    smootherstep: function(x) {
        return 6 * Math.pow(x, 5) - 15 * Math.pow(x, 4) + 10 * Math.pow(x, 3);
    },

    interp: function(x, a, b) {
        return a + this.smootherstep(x) * (b - a);
    },

    get: function(x, y) {
        const key = `${x},${y}`;
        if (this.memory[key] !== undefined) {
            return this.memory[key];
        }
        
        const xf = Math.floor(x);
        const yf = Math.floor(y);
        
        const tl = this.dot_prod_grid(x, y, xf,   yf);
        const tr = this.dot_prod_grid(x, y, xf+1, yf);
        const bl = this.dot_prod_grid(x, y, xf,   yf+1);
        const br = this.dot_prod_grid(x, y, xf+1, yf+1);
        
        const xt = this.interp(x - xf, tl, tr);
        const xb = this.interp(x - xf, bl, br);
        const v = this.interp(y - yf, xt, xb);
        
        const normalized = Math.max(-1, Math.min(1, v));
        
        this.memory[key] = normalized;
        return normalized;
    }
};

Perlin.seed();

module.exports = Perlin;