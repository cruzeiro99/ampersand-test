const readline = require("node:readline");
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
}
class Tile extends Vector {
	rendered = false;
	char = ' ';
	constructor(x, y, char=' ') {
		super(x,y);
		this.char = char;
	}
	getChar() {
		return this.char;
	}
	draw(surroundings, reposition) {
		// return this.char;
	}
	render() {
		return this.char;
	}
	getVector() {
		return [this.x, this.y];
	}
	finishedRenderization() {
		this.rendered = false;
	}
}
class PhysicalTile extends Tile {
	collides(tile) {
		if (!tile) 
			return true;
		return ['#', "a"].includes(tile.char);
	}
	draw(surroundings, reposition) {
		//prevent map issue 
		if (this.rendered === true)
			return;
		let gap;
		let [a, b] = surroundings.vector;
		gap = new Tile(a, b, ' ');
		if (!this.collides(surroundings.b)) {
			this.y += 1;
			reposition(this, gap);
		} else {
			if (!this.collides(surroundings.l)) {
				this.x -= 1;
				reposition(this, gap);
			} else if (!this.collides(surroundings.r)) {
				this.x += 1;
				reposition(this, gap);
			}
		}
		this.rendered = true;
	}
}
class Renderer {
	FPS = 5;
	buffer = [];
	constructor(template, background='-') {
		this.buffer = template;
		this.width  = template.width;
		this.height = template.height;
		// let line = Array(width, () => background);
	}
	surroundings(vector) {
		let [ x, y ] = vector;
		// let tl = this.buffer[y-1] ? this.buffer[y-1][x-1] : null;
		let t  = this.buffer[y-1] ? this.buffer[y-1][x] : null;
		// let tr = this.buffer[y-1] ? this.buffer[y-1][x+1] : null;
		let r  = this.buffer[y]   ? this.buffer[y][x+1] : null;
		// let br = this.buffer[y+1] ? this.buffer[y+1][x+1] : null;
		let b  = this.buffer[y+1] ? this.buffer[y+1][x] : null;
		// let bl = this.buffer[y+1] ? this.buffer[y+1][x-1] : null;
		let l  = this.buffer[y]   ? this.buffer[y][x-1] : null;
		// return { tl,t,tr,r,br,b,bl,l,vector };
		return { t,r,b,l,vector };
	}
	outOfBounds(x,y) {
		if (y > this.height || y < 0 || !this.buffer[y]) 
			return true;
		if (x > this.width || x < 0 || !this.buffer[y][x]) 
			return true;
	}
	reposition = (tile, gap) => {
		let [ x, y ] = tile.getVector();
		let [ a, b ] = gap.getVector();
		if (this.outOfBounds(x, y))
			return console.log("OUT OF BOUNDS");
		this.buffer[b].splice(a, 1, gap);
		this.buffer[y].splice(x, 1, tile);
	}
	loop() {
		setInterval(() => {
			this.buffer.map((line, y) => {
				line.map((tile, x) => {
					tile.draw( this.surroundings([x, y]), this.reposition);
				})
			})
			this.output();
		}, 1000 / this.FPS);
	}
	output() {
		process.stdout.cursorTo(0);
		console.clear();
		let str = this.buffer.map((line, k) => {
			return line.map(tile => {
				tile.finishedRenderization();
				return tile.render()
			}).join("");
		}).join("\n")
		rl.write(str);
	}
	addAt(vector) {

	}
}

let template = [
	['#','#','#','#','#','#','#','#','#','#','#','#','#','#', '#', '#', '#', '#', '#', '#', '#'],
	['#',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ', ' ', ' ', ' ', ' ', ' ', ' ', '#'],
	['#',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ', ' ', ' ', ' ', ' ', ' ', ' ', '#'],
	['#',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ', ' ', ' ', ' ', ' ', ' ', ' ', '#'],
	['#',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ', ' ', ' ', ' ', ' ', ' ', ' ', '#'],
	['#',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ', ' ', ' ', ' ', ' ', ' ', ' ', '#'],
	['#',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ', ' ', ' ', ' ', ' ', ' ', ' ', '#'],
	['#',' ',' ',' ',' ',' ','a','a','a','a','a','a','a',' ', ' ', ' ', ' ', ' ', ' ', ' ', '#'],
	['#',' ',' ',' ',' ',' ','#','a','a','a','a','a','#',' ', ' ', ' ', ' ', ' ', ' ', ' ', '#'],
	['#',' ',' ',' ',' ',' ',' ','#','a','a','a','#',' ',' ', ' ', ' ', ' ', ' ', ' ', ' ', '#'],
	['#',' ',' ',' ',' ',' ',' ',' ','#','a','#',' ',' ',' ', ' ', ' ', ' ', ' ', ' ', ' ', '#'],
	['#',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ', ' ', ' ', ' ', ' ', ' ', ' ', '#'],
	['#',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ', ' ', ' ', ' ', ' ', ' ', ' ', '#'],
	['#',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ', ' ', ' ', ' ', ' ', ' ', ' ', '#'],
	['#',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ', ' ', ' ', ' ', ' ', ' ', ' ', '#'],
	['#',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ', ' ', ' ', ' ', ' ', ' ', ' ', '#'],
	['#',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ', ' ', ' ', ' ', ' ', ' ', ' ', '#'],
	['#',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ', ' ', ' ', ' ', ' ', ' ', ' ', '#'],
	['#',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ', ' ', ' ', ' ', ' ', ' ', ' ', '#'],
	['#',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ', ' ', ' ', ' ', ' ', ' ', ' ', '#'],
	['#','#','#','#','#','#','#','#','#','#','#','#','#','#', '#', '#', '#', '#', '#', '#', '#'],
]
let width = 20;
let height = 20;
let handler = new TemplateHandler(template, width, height);
let tiles = handler.render();
let renderer = new Renderer(tiles);
renderer.loop();