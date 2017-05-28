function collide(obj1, player){
	return obj1.x + obj1.width > player.x && player.x + player.width > obj1.x && obj1.y + obj1.height > player.y && player.y + player.height > obj1.y;
}

function processInput(player, key){
	if (!player) return;
	switch(key) {
		case 'UP_PRESSED':
			player.direction = "up";
			player.dirY = -1;
			break;
		case 'UP_RELEASED':
			player.dirY = 0;
			break;
		case 'DOWN_PRESSED':
			player.direction="down";
			player.dirY = 1;
			break;
		case 'DOWN_RELEASED':
			player.dirY = 0;
			break;
		case 'LEFT_PRESSED':
			player.direction = "left";
			player.dirX = -1;
			break;
		case 'LEFT_RELEASED':
			player.dirX = 0;
			break;
		case 'RIGHT_PRESSED':
			player.direction = "right";
			player.dirX = 1;
			break;
		case 'RIGHT_RELEASED':
			player.dirX = 0;
			break;
		default:
			break;
	}
	
}

function isTimeout(time, duration){
	return (Math.floor(Date.now() / 1000) - time) > duration;
}


export {
    collide,
    isTimeout,
    processInput
};
