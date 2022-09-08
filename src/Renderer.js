const {Tile} = require("./Tile")

class Renderer {
	FPS = 30;
	buffer = [];
	_output = [];
	looping = false;
	constructor(template, background='-') {
		this.buffer  = template;
		this.width   = template.length+1;
		this.height  = template.length+1;
		this._output = template;
	}
	surroundings(vector) {
		let [ x, y ] = vector;
		// let tl = this.buffer[y-1] ? this.buffer[y-1][x-1] : null;
		let t  = this.buffer[y-1] ? this.buffer[y-1][x] : null;
		// let tr = this.buffer[y-1] ? this.buffer[y-1][x+1] : null;
		let r  = this.buffer[y]   ? this.buffer[y][x+1] : null;
		let br = this.buffer[y+1] ? this.buffer[y+1][x+1] : null;
		let b  = this.buffer[y+1] ? this.buffer[y+1][x] : null;
		let bl = this.buffer[y+1] ? this.buffer[y+1][x-1] : null;
		let l  = this.buffer[y]   ? this.buffer[y][x-1] : null;
		// return { tl,t,tr,r,br,b,bl,l,vector };
		return { t,r,b,l,br,bl,vector };
	}
	outOfBounds(x, y) {
		if (y > this.height || y < 0 || !this.buffer[y]) 
			return true;
		if (x > this.width || x < 0 || !this.buffer[y][x]) 
			return true;
	}
	reposition = (tile, gap) => {
		let [ x, y ] = tile.getVector();
		let [ a, b ] = tile.getPrev();
		if (this.outOfBounds(x, y))
			return;
		this._output[b][a] = new Tile(a,b,' ');
		this._output[y][x] = tile;
	}
	loop() {
		this.looping = true;
		global._rendererInterval = setInterval(() => {
			this.buffer.map((line, y) => {
				line.map((tile, x) => {
					tile.draw( this.surroundings([x, y]), this.buffer);
					this.placeTile(tile);
				})
			})
			this.output();
		}, 1000 / this.FPS);
	}
	stopLoop() {
		clearInterval(global._rendererInterval);
		console.clear();
		this.looping = false;
	}
	placeTile(tile) {
		if (!tile.isPhysical) return;
		if (tile.hasMoved()) {
			let [ x, y ] = tile.getVector();
			let [ a, b ] = tile.getPrev();
			// if (!this._output[y]) throw this._output;
			this.buffer[b].splice(a, 1, new Tile(a, b, ' '));
			this.buffer[y].splice(x, 1, tile);
		}
	}
	output() {
		let str = this._output.map((line, k) => {
			return line.map(tile => tile.render()).join("");
		}).join("\n")
		console.clear();
		console.log(str);
		console.log(`n = ${this.width}`);
		console.log("Pressione 'r' para reiniciar");
	}
	addAt(vector) {

	}
}
module.exports = { Renderer }