var express = require('express');
app = express();

var server = require('http').Server(app);
var io = require('socket.io')(server);
app.use(express.static('public'));
var nextPlayerId = 1;

var environment = {
	players: {},
	objects: [],
	shots: [],
	walls: []
};

var map = [
['W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W'],
['W','','','','','','','','','W','W','','','','','','','','','W'],
['W','','','W','','W','','','','W','W','','','','','','','','','W'],
['W','','','','W','','','','','W','W','','','','','','','','','W'],
['W','','','','','','','','','W','W','','','','','','','','','W'],
['W','','','','','','','','','','','','','','','','','','','W'],
['W','','','W','','W','','','','','','','','','','','','','','W'],
['W','','','','W','','','','','W','W','','','','','','','','','W'],
['W','','','','','','','','','W','W','','','','','','','','','W'],
['W','','','','W','','','','','W','W','','','','','','','','','W'],
['W','','','','','','','','','W','W','','','','','','','','','W'],
['W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W']
];

var userInputs = [];

function newConnection(socket) {
	var playerId = nextPlayerId++;
	environment.players[playerId] = {
		playerId: playerId,
		position: {x: 200, y:200}, 
		direction: {x: 0, y: 0},
		hitbox: {width: 20, height: 20},
		speed: 0.5,
		score: 0
	};

	/* créer les éléments statiques de la map */ 
	createMap(map);

	/* initialisation du jeu */
	socket.emit('init', {playerId: playerId, environment: environment});

	/* à la réception d'une commande */
	socket.on('input', function(userInput){
		userInputs.push({playerId: playerId, userInput: userInput.key});
	});

	socket.on('shoot', function(shoot){
		environment.shots.push(shoot);
	});

	/* supprime le joueur de l'environment lors de sa déco */
	socket.on('disconnect', function(){
		delete environment.players[playerId];
	});

}

/* met à jour un joueur */
function updatePlayer(player) {
		"use strict";

		var walls = environment.walls;
		var players = environment.players;
		
		var oldx = player.position.x;
		var oldy = player.position.y;

		/* update de la position du joueur */
		player.position.x += player.direction.x * player.speed;
		player.position.y += player.direction.y * player.speed;

		/* check les collisions avec les murs */
		for(let wall of walls){
			if(collide(wall, player)){
				/* si colision retour à l'ancienne position */
				player.position.x = oldx;
				player.position.y = oldy;
		    	return;
		    }
		}

		/* check les collisions entre joueurs */
		for(var playr in environment.players){
			if(collide(environment.players[playr], player) && environment.players[playr].playerId != player.playerId){
				/* si colision retour à l'ancienne position */
				player.position.x = oldx;
				player.position.y = oldy;
				return;
			}
		}
}

function updateShot(shot){
	shot.position.x += shot.direct.dirx * 0.8;
	shot.position.y += shot.direct.diry * 0.8;	
}

/* met à jour l'environment */
function updateEnvironment() {
	var players = environment.players;
	for(var key in environment.players){
		var player = environment.players[key];
		updatePlayer(player);
	}
	environment.shots.forEach(updateShot);
	//resolveColisions();
}

/* check si l'objet en argument est en collision avec le joueur */
function collide(obj1, player){
	return obj1.position.x + obj1.hitbox.width > player.position.x && player.position.x + player.hitbox.width > obj1.position.x && obj1.position.y + obj1.hitbox.height > player.position.y && player.position.y + player.hitbox.height > obj1.position.y;
}

function processInput(input, index){
	var player = environment.players[input.playerId];

	switch(input.userInput) {
		case 'UP_PRESSED':
			player.direction.y = -1;
			break;
		case 'UP_RELEASED':
			player.direction.y = 0;
			break;
		case 'DOWN_PRESSED':
			player.direction.y = 1;
			break;
		case 'DOWN_RELEASED':
			player.direction.y = 0;
			break;
		case 'LEFT_PRESSED':
			player.direction.x = -1;
			break;
		case 'LEFT_RELEASED':
			player.direction.x = 0;
			break;
		case 'RIGHT_PRESSED':
			player.direction.x = 1;
			break;
		case 'RIGHT_RELEASED':
			player.direction.x = 0;
			break;
		default:
			break;
	}
	userInputs.splice(index, 1);
}

/* Transformation du tableau map en objets avec coordonnées */
/* Permet de générer plus facilement de nouvelles maps */
function createMap(map){
	var x = 0;
	var y = 0;
	for(var i = 0; i < map.length; i++) {
	    var line = map[i];
	    for(var j = 0; j < line.length; j++) {
	        switch(line[j]){
	        	case 'W':
	        		j <= 0 ? x = 0 : x +=50;
	        		environment.walls.push({position: {x: x, y: y}, hitbox:{width:50, height:50}});
		    		break;
		    	default:
		    		j <= 0 ? x = 0 : x +=50;
	        }
	    }
	    x = 0;
	    y += 50;
	}
}


/* CPU ne supporte pas */


function gameLoop() {
	userInputs.forEach(processInput);
	//console.log(environment.players);
	updateEnvironment();
	io.emit('updateEnvironment', environment);
}
setInterval(gameLoop, 1);


io.on('connection', newConnection);

server.listen(4000, function () {
	console.log('Example app listening on port 4000!');
});