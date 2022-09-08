const {Tile} = require("./Tile")

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
		let [ x, y ] = [this.x, this.y];
		this.setPrev(x, y);
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

module.exports = { PhysicalTile }