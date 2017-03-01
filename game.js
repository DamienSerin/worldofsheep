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

function renderLoop() {
	window.requestAnimationFrame(renderLoop);
}
socket.on('init', function(init){
	myPlayerId = init.playerId;
	environment = init.environment;
	map = init.map;
	drawMap(map);
	console.log(init);
});

socket.on('updateEnvironment', function(newEnvironment){
	environment = newEnvironment;
});

$(document).on('keydown', function(event){
	if(event.keyCode == 38)
		socket.emit('input', {key: 'UP_PRESSED'});
});

function drawPlayer(playerId) {
	var player = environment.players[playerId];
}

function drawElement(x, y, width, height, color){
	ctx.beginPath();
	ctx.rect(x, y, width, height);
	ctx.fillStyle = color;
	ctx.fill();
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
	        		drawElement(x, y, 100, 60, 'red');
	        		console.log("i: " + i + " j: " + j);
	        		console.log("x: " + x + " y: " + y);
		    		break;
		    	default:
		    		j <= 0 ? x = 0 : x +=100;
		    		drawElement(x, y, 100, 60, 'grey');
	        }
	    }
	    x = 0;
	    y += 60;
	}
}

function drawObject(object){

}

function renderLoop(){
	Object.keys(environment.players).forEach(drawPlayer);
	environment.objects.forEach(drawObject);
	window.requestAnimationFrame(renderLoop);
}