function collide(obj1, player){
	return obj1.x + obj1.width > player.x && player.x + player.width > obj1.x && obj1.y + obj1.height > player.y && player.y + player.height > obj1.y;
}

export {
    collide
};
