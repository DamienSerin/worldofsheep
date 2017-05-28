import * as engine from './engine.js';

class Bullet {
	constructor(idOwner, x, y, dirX, dirY){
	    this.idOwner = idOwner;
	    this.dammage = 1;
	    this.speed = 18;
	    this.scoreIncrease = 1;
	    this.x = x;
	    this.y = y;
	    this.width = 15;
	    this.height = 15;
	    this.dirX = dirX;
	    this.dirY = dirY;
	    this.img = "bullet";
	}

	didTouch(player){
		return engine.collide(player, this) && player.id != this.idOwner;
	}

	setScoreIncrease(score){
		this.scoreIncrease = score;
	}

	setBonusAction(dammage, speed, score){
		this.dammage += dammage;
		this.speed += speed;
		this.scoreIncrease += score;
	}

	setDammage(dammage){
		this.dammage = dammage;
	}

	setSpeed(speed){
		this.speed = speed;
	}
}

export {Bullet};
