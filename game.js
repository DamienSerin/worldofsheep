var $ = require("jquery");
var socket = require('socket.io-client')();

var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');

var environment = {
	players: {},
	objects: []
};

var map = [];

var myPlayerId = -1;

socket.on('init', function(init){
	myPlayerId = init.playerId;
	environment = init.environment;
	map = init.map;
	drawMap(map);
	
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
	ctx.beginPath();
	ctx.rect(player.position.x, player.position.y, 20, 20);
	ctx.fillStyle = "green";
	ctx.fill();
}

function drawElement(x, y, width, height, color){
	//ctx.drawImage(img,10,10);
	//changer variable "color" par path de l'image à afficher
	//ctx.beginPath();
	var img = new Image();
	img.onload = function () {
	    ctx.drawImage(img, x, y);
	}
	img.src = color;
	//ctx.rect(x, y, width, height);
	//ctx.fillStyle = color;
	//ctx.fill();
}

function drawMap(map){
	var x = 0;
	var y = 0;
	for(var i = 0; i < map.length; i++) {
	    var line = map[i];
	    for(var j = 0; j < line.length; j++) {
	        switch(line[j]){
	        	case 'W':
	        		j <= 0 ? x = 0 : x +=100;
	        		drawElement(x, y, 100, 60, 'Tile.png');
		    		break;
		    	default:
		    		j <= 0 ? x = 0 : x +=100;
		    		drawElement(x, y, 100, 60, 'BGTile.png');
	        }
	    }
	    x = 0;
	    y += 60;
	}
}

function drawObject(object){

}

function renderLoop(){
	drawMap(map);
	Object.keys(environment.players).forEach(drawPlayer);
	//environment.objects.forEach(drawObject);
	window.requestAnimationFrame(renderLoop);
}