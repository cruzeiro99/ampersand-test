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
module.exports = {Vector}