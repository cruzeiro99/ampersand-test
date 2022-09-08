const {Tile } = require("./Tile")
const { PhysicalTile } = require("./PhysicalTile")

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
					tile = new PhysicalTile(x, y, '#');
				this.addTile(tile);
			})
		})
		return this.rendered;
	}
}
module.exports = { TemplateHandler }