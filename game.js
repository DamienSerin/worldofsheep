var $ = require("jquery");
var socket = require('socket.io-client')();

/* Canvas pour afficher le background de la map qui n'a besoin d'être déssiné qu'une seule fois */
var canvasbg = document.getElementById('canvasbg');
/* Canvas pour afficher le foreground (éléments dynamiques) */
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

/* initialisation de l'environment à la connection */
socket.on('init', function(init){
	myPlayerId = init.playerId;
	environment = init.environment;
	environment.walls.forEach(drawWall);
	drawPlayer(myPlayerId);
	renderLoop();
});


socket.on('updateEnvironment', function(newEnvironment){
	environment = newEnvironment;

});

socket.on('dead', function(){
	console.log("DEAD");
	ctxfg.clearRect(0, 0, canvasfg.width, canvasfg.height);
	//ctxfg.font = "50px OptimusPrinceps.ttf";
	ctxfg.fillStyle = "red";
	ctxfg.textAlign = "center";
	ctxfg.fillText("YOU DIED", canvas.width/2, canvas.height/2); 
	console.log("END DEAD");
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

$(document).on('mousedown', function(event){
	switch(event.which){
		case 1:
			var player = environment.players[myPlayerId];
			var shoot_x = event.clientX;
			var shoot_y = event.clientY;

			var norm = Math.sqrt(Math.pow(shoot_y-player.position.y,2) + Math.pow(shoot_x-player.position.x,2));
			var dirx = (shoot_x-player.position.x)/norm;
			var diry = (shoot_y-player.position.y)/norm;

			socket.emit('shoot', {playerId: myPlayerId, damage: 1, scoreIncrease: 1, speed: 1, hitbox: {width: 20, height: 20}, position:{x: player.position.x, y: player.position.y}, direct:{dirx: dirx, diry: diry}});
			
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
	tmp_ctx.closePath();
}

function drawElement(x, y, width, height, color){
	/*
	ctxbg.beginPath();
	ctxbg.rect(x, y, width, height);
	ctxbg.fillStyle = color;
	ctxbg.fill();
	ctxbg.closePath();
	*/
	
	var img = new Image();
	img.onload = function () {
	    ctxbg.drawImage(img, x, y);
	}
	img.src = color;
	
}

function drawObject(object){

}

function drawShot(shot){
	ctxfg.beginPath();
	ctxfg.rect(shot.position.x, shot.position.y, 10, 10);
	ctxfg.fillStyle = "white";
	ctxfg.fill();
	ctxfg.closePath();
}

function drawWall(wall){
	drawElement(wall.position.x, wall.position.y, wall.hitbox.height, wall.hitbox.width, "Tile.png");
}

function renderLoop(){
	tmp_ctx.clearRect(0, 0, tmp_canvas.width, tmp_canvas.height);
	ctxfg.clearRect(0, 0, canvasfg.width, canvasfg.height);
	Object.keys(environment.players).forEach(drawPlayer);
	environment.shots.forEach(drawShot);
	ctxfg.drawImage(tmp_canvas, 0, 0);	
	requestAnimationFrame(renderLoop);
}