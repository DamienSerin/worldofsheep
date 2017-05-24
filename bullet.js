import * as engine from './engine.js';

class Bullet {
	constructor(idOwner, x, y, dirX, dirY){
	    this.idOwner = idOwner;
	    this.dammage = 1;
	    this.speed = 0.8;
	    this.scoreIncrease = 1;
	    this.x = x;
	    this.y = y;
	    this.width = 10;
	    this.height = 10;
	    this.dirX = dirX;
	    this.dirY = dirY;
	}

	didTouch(player){
		return engine.collide(player, this) && player.id != this.idOwner;
	}
}

export {Bullet};