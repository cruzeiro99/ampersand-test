const {Vector} = require("./Vector")

class Tile extends Vector {
	rendered   = false;
	char       = ' ';
	bounds     = [];
	maxX       = 20;
	maxY       = 20;
	isPhysical = false;
	collidable = true;
	drawn      = false;
	constructor(x, y, char=' ', bounds) {
		super(x, y);
		this.char = char;
		if (!bounds) 
			bounds = global.bounds;
		this.maxX = bounds[0];
		this.maxY = bounds[1];
		if (char === " ") 
			this.collidable = false;
	}
	isEmpty() {
		return this.collidable === false || this.char === ' ';
	}
	getChar() {
		return this.char;
	}
	draw(surroundings, reposition) {
		// return this.char;
	}
	render() {
		this.finishedRenderization();
		return this.char;
	}
	setPos(x, y) {
		if (this.outOfBounds(x,y))
			return false;
		this.x = x;
		this.y = y;
		return true;
	}
	outOfBounds(x, y) {
		if (x >= this.maxX || x < 0) 
			return true;
		if (y >= this.maxY || y < 0) 
			return true;
		return false;
	}
	finishedRenderization() {
		this.drawn = false;
		this.rendered = false;
	}
}

module.exports = { Tile }