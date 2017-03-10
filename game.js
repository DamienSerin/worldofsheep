var $ = require("jquery");
var socket = require('socket.io-client')();

var canvasbg = document.getElementById('canvasbg');
var canvasfg = document.getElementById('canvasfg');
var ctxbg = canvasbg.getContext('2d');
var ctxfg = canvasfg.getContext('2d');

/* Canvas for pre-rendering */
var tmp_canvas = document.createElement('canvas');
var tmp_ctx = tmp_canvas.getContext('2d');
tmp_canvas.width = 1000;
tmp_canvas.height = 600;

var environment = {
	players: {},
	objects: []
};

var map = [];

var myPlayerId = -1;

socket.on('init', function(init){
	myPlayerId = init.playerId;
	environment = init.environment;
	//map = init.map;
	environment.walls.forEach(drawWall);
});

socket.on('updateEnvironment', function(newEnvironment){
	environment = newEnvironment;
	renderLoop();
});

$(document).on('keydown', function(event){
	switch(event.keyCode){
		case 37:
			socket.emit('input', {key: 'LEFT_PRESSED'});
			break;
		case 38:
			socket.emit('input', {key: 'UP_PRESSED'});
			break;
		case 39:
			socket.emit('input', {key: 'RIGHT_PRESSED'});
			break;
		case 40:
			socket.emit('input', {key: 'DOWN_PRESSED'});
			break;
		default:
			break;
	}
});

$(document).on('keyup', function(event){
	switch(event.keyCode){
		case 37:
			socket.emit('input', {key: 'LEFT_RELEASED'});
			break;
		case 38:
			socket.emit('input', {key: 'UP_RELEASED'});
			break;
		case 39:
			socket.emit('input', {key: 'RIGHT_RELEASED'});
			break;
		case 40:
			socket.emit('input', {key: 'DOWN_RELEASED'});
			break;
		default:
			break;
	}
});

function drawPlayer(playerId) {
	var player = environment.players[playerId];
	
	/* pre rendering */
	tmp_ctx.beginPath();
	tmp_ctx.rect(player.position.x, player.position.y, player.hitbox.width, player.hitbox.height);
	tmp_ctx.fillStyle = "green";
	tmp_ctx.fill();
}

function drawElement(x, y, width, height, color){
	ctxbg.beginPath();
	ctxbg.rect(x, y, width, height);
	ctxbg.fillStyle = color;
	ctxbg.fill();
	
	/* Pour afficher une image à la place de la couleur pas belle */ 
	
	/*
	var img = new Image();
	img.onload = function () {
	    ctxbg.drawImage(img, x, y);
	}
	img.src = color;
	*/
}
/*
function drawMap(map){
	var x = 0;
	var y = 0;
	for(var i = 0; i < map.length; i++) {
	    var line = map[i];
	    for(var j = 0; j < line.length; j++) {
	        switch(line[j]){
	        	case 'W':
	        		j <= 0 ? x = 0 : x +=100;
	        		drawElement(x, y, 100, 60, 'grey');
		    		break;
		    	default:
		    		j <= 0 ? x = 0 : x +=100;
		    		//drawElement(x, y, 100, 60, 'BGTile.png');
	        }
	    }
	    x = 0;
	    y += 60;
	}
}
*/
function drawObject(object){

}

function drawWall(wall){
	drawElement(wall.position.x, wall.position.y, wall.hitbox.height, wall.hitbox.width, "grey");
}

function renderLoop(){
	tmp_ctx.clearRect(0, 0, tmp_canvas.width, tmp_canvas.height);
	ctxfg.clearRect(0, 0, canvasfg.width, canvasfg.height);

	Object.keys(environment.players).forEach(drawPlayer);
	ctxfg.drawImage(tmp_canvas, 0, 0);	
	window.requestAnimationFrame(renderLoop);
}