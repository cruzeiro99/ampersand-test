const readline = require("node:readline/promises");
const {stdin:input, stdout:output} = require("node:process");

const rl = readline.createInterface({ input, output });

class TemplateHandler {
	template = ["g"];
	rendered = [];
	constructor(template, width, height) {
		this.template = template;
		this.width = width;
		this.height = height;
	}
	draw() {

	}
	addTile(tile) {
		let [ x, y ] = tile.getVector();
		if (!this.rendered[y])
			this.rendered[y] = Array(this.width);
		this.rendered[y][x] = tile;
	}
	isStatic(char) {
		return [" ", "#"].includes(char);
	}
	render() {
		this.template.map((line, y) => {
			line.map((char,x) => {
				let tile;
				if (this.isStatic(char))
					tile = new Tile(x, y, char);
				else
					tile = new PhysicalTile(x, y, char);
				this.addTile(tile);
			})
		})
		return this.rendered;
	}
}
class Vector {
	x = 0;
	y = 0;
	constructor(x, y) {
		this.x = x;
		this.y = y;
	}
	getVector() {
		return [this.x, this.y];
	}
}
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
class PhysicalTile extends Tile {
	isPhysical = true;
	collides(tile) {
		if (!tile) 
			return true;
		return tile.collidable;
	}
	setPrev(x, y) {
		this.prev = [x, y];
	}
	getPrev() {
		return this.prev;
	}
	searchLeft = (tile, buffer) => {
		let [x, y] = tile.getVector();
		for (let i = x+1; i < buffer[y].length; i++) { //to the right
			let curr = buffer[y][i];
			if (!curr.isPhysical && curr.char === "#")
				break;
			if (curr.isEmpty()) {
				x = curr.x;
				this.setPos(x, y);
				return;
			}
		}
	}
	searchRight = (tile, buffer) => {
		let [x, y] = tile.getVector();
		for (let i = x-1; i > -1; i--) { // to the left
			let curr = buffer[y][i];
			if (!curr.isPhysical && curr.char === "#")
				break;
			if (curr.isEmpty()) {
				x = curr.x;
				this.setPos(x, y);
				return;
			}
		}
	}
	searchEmptySpace(tile, buffer) {
		let rand = Math.random();
		if (rand >= .5) {
			this.searchRight(tile, buffer);
			this.searchLeft(tile, buffer);
		} else {  
			this.searchLeft(tile, buffer);
			this.searchRight(tile, buffer);
		}
	}
	hasMoved() {
		let [ a, b ] = this.getPrev()
		let [ x, y ] = this.getVector()
		return ( (b !== y) || (a !== x) )
	}
	draw(surroundings, buffer) {
		//prevent map issue 
		if (this.rendered === true || this.drawn === true)
			return;
		this.drawn = true
		// let gap;
		let [ x, y ] = [this.x, this.y];
		this.setPrev(x, y);
		// let [ a, b ] = surroundings.vector;
		// gap = new Tile(a, b, ' ');
		let { b:bottom, l:left, r:right, bl:bLeft, br:bRight } = surroundings;
		if ( this.collides( bottom ) ) {
			if (bottom.isPhysical) {
				return this.searchEmptySpace(bottom, buffer); 
			} else { 
				if ( !this.collides(bLeft) && !this.collides(left) ) {
					if (bLeft.isEmpty()) {
						x = bLeft.x;
						y = bLeft.y;
					}
				} else if ( !this.collides(bRight) && !this.collides(right) ) {
					if (bRight.isEmpty()) {
						x = bRight.x;
						y = bRight.y;
					}
				}
			}
			this.isFalling = false;
		} else {
			y++;
			this.isFalling = true;
		}
		this.setPos(x, y);
		// this.rendered = true;
	}
}
class Renderer {
	FPS = 30;
	buffer = [];
	_output = [];
	constructor(template, background='-') {
		this.buffer = template;
		this.width  = template.width;
		this.height = template.height;
		this._output = template;
		// this.emptyOutput();
		// let line = Array(width, () => background);
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
		this.interval = setInterval(() => {
			this.buffer.map((line, y) => {
				line.map((tile, x) => {
					tile.draw( this.surroundings([x, y]), this.buffer);
					this.placeTile(tile);
				})
			})
			// this.buffer.map((line, ky) => {
			// 	line.map((tile, x) => {
			// 	})
			// })
			this.output();
		}, 1000 / this.FPS);
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
	// emptyOutput() {
	// 	this._output = this._output.map(line => {
	// 		return line.map(tile => {
	// 			// if (tile.isPhysical) 
	// 			// 	return new Tile(tile.x, tile.y, '#');
	// 			return tile;
	// 		})
	// 	})
	// }
	output() {
		let str = this._output.map((line, k) => {
			return line.map(tile => tile.render()).join("");
		}).join("\n")
		console.clear();
		console.log(str);
		console.log("Ctrl+C")
	}
	addAt(vector) {

	}
}

// let template = [
// 	['#','#','#','#','#','#','#','#','#','#','#','#','#','#', '#', '#', '#', '#', '#', '#', '#'],
// 	['#','a','a','a','a','a','a','a','a','a','a','a','a','a', 'a', 'a', 'a', 'a', 'a', '#', '#'],
// 	['#','a','a','a','a','a','a','a','a','a','a','a','a','a', 'a', 'a', 'a', 'a', '#', ' ', '#'],
// 	['#','#','a','a','a','a','a','a','a','a','a','a','a','a', 'a', 'a', 'a', '#', ' ', ' ', '#'],
// 	['#',' ','#','a','a','a','a','a','a','a','a','a','a','a', 'a', 'a', '#', ' ', ' ', ' ', '#'],
// 	['#',' ',' ','#','a','a','a','a','a','a','a','a','a','a', 'a', '#', ' ', ' ', ' ', ' ', '#'],
// 	['#',' ',' ',' ','#','a','a','a','a','a','a','a','a','a', '#', ' ', ' ', ' ', ' ', ' ', '#'],
// 	['#',' ',' ',' ',' ','#','a','a','a','a','a','a','a','#', ' ', ' ', ' ', ' ', ' ', ' ', '#'],
// 	['#',' ',' ',' ',' ',' ','#','a','a','a','a','a','#',' ', ' ', ' ', ' ', ' ', ' ', ' ', '#'],
// 	['#',' ',' ',' ',' ',' ',' ','#','a','a','a','#',' ',' ', ' ', ' ', ' ', ' ', ' ', ' ', '#'],
// 	['#',' ',' ',' ',' ',' ',' ',' ','#','a','#',' ',' ',' ', ' ', ' ', ' ', ' ', ' ', ' ', '#'],
// 	['#',' ',' ',' ',' ',' ',' ',' ','#',' ','#',' ',' ',' ', ' ', ' ', ' ', ' ', ' ', ' ', '#'],
// 	['#',' ',' ',' ',' ',' ',' ','#',' ',' ',' ','#',' ',' ', ' ', ' ', ' ', ' ', ' ', ' ', '#'],
// 	['#',' ',' ',' ',' ',' ','#',' ',' ',' ',' ',' ','#',' ', ' ', ' ', ' ', ' ', ' ', ' ', '#'],
// 	['#',' ',' ',' ',' ','#',' ',' ',' ',' ',' ',' ',' ','#', ' ', ' ', ' ', ' ', ' ', ' ', '#'],
// 	['#',' ',' ',' ','#',' ',' ',' ',' ',' ',' ',' ',' ',' ', '#', ' ', ' ', ' ', ' ', ' ', '#'],
// 	['#',' ',' ','#',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ', ' ', '#', ' ', ' ', ' ', ' ', '#'],
// 	['#',' ','#',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ', ' ', ' ', '#', ' ', ' ', ' ', '#'],
// 	['#','#',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ', ' ', ' ', ' ', '#', ' ', ' ', '#'],
// 	['#',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ', ' ', ' ', ' ', ' ', '#', ' ', '#'],
// 	['#','#','#','#','#','#','#','#','#','#','#','#','#','#', '#', '#', '#', '#', '#', '#', '#'],
// ]
const { createAmpersand } = require("./helpers")
async function main() {
	let answer = await rl.question('Number>')
	let n = parseInt(answer);
	if (typeof n !==	 'number') {
		return main();
	}
	let template = createAmpersand(n)
	let width = answer;
	let height = answer;
	global.bounds = [width, height];
	let handler = new TemplateHandler(template, width, height);
	let tiles = handler.render();
	let renderer = new Renderer(tiles);
	renderer.loop();
}
main();