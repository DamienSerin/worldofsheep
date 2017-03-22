var express = require('express');
app = express();

var server = require('http').Server(app);
var io = require('socket.io')(server);
app.use(express.static('public'));
var nextPlayerId = 1;

var spawns = [];

var environment = {
	players: {},
	objects: [],
	shots: [],
	walls: [],
	hightscores: []
};

var map = [
['W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W'],
['W','','','','','','','','','W','W','','','','','','','','','W'],
['W','','','W','','W','','','','W','W','','','','','','S','','','W'],
['W','','','','W','','','S','','W','W','','S','','','','','','','W'],
['W','S','','','','','','','','W','W','','','','','','','','','W'],
['W','','','','S','','','','','','','','','','','','','','','W'],
['W','','','W','','W','','','','','','','','','','','','','','W'],
['W','','','','W','','','','','W','W','','','','','','','S','','W'],
['W','','','','','','','','S','W','W','','S','','','','','','','W'],
['W','','S','','W','','','','','W','W','','','','','','','','','W'],
['W','','','','','','','','','W','W','','','','','','','','','W'],
['W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W','W']
];

var userInputs = [];

function newConnection(socket) {
	var playerId = nextPlayerId++;
	environment.players[playerId] = {
		name: playerId,
		playerId: playerId,
		score: 0,
		lifepoints: 10,
		position: {x: 0, y: 0}, 
		direction: {x: 0, y: 0},
		hitbox: {width: 20, height: 20},
		speed: 0.5,
		score: 0
	};

	mysock = socket;
	/* créer les éléments statiques de la map */ 
	createMap(map);
	spawn(environment.players[playerId]);
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
		socket.disconnect();
		delete environment.players[playerId];
	});

}

function spawn(player){
	var tmp = spawns[Math.floor(Math.random() * spawns.length)];
	var canSpawn = false;
	while(canSpawn == false){
		canSpawn = true;
		for(var playr in environment.players){
			if(collide(environment.players[playr], tmp)){
				tmp = spawns[Math.floor(Math.random() * spawns.length)];
				canSpawn = false;
				break;
			}
		}	
	}	
	player.position.x = tmp.position.x;
	player.position.y = tmp.position.y;
	console.log("yo");
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

function isDead(player){
	"use strict";
	if(player.lifepoints <= 0){
		for(let score of environment.hightscores){
			if(player.score > score.score){
				var tmp = environment.hightscores.indexOf(score);
				environment.hightscores.splice(tmp, 0, {player: player.playerId, score: player.score});

				if(environment.hightscores.length > 20){
					environment.hightscores.pop();
				}
			}
		}
		//envoyer un message dead
		//io.emit('dead', {});
		delete environment.players[player.playerId];
		return true;
	}
	return false;
}

function updateShot(shot){
	"use strict";
	var walls = environment.walls;
	var tmp = environment.shots.indexOf(shot);
	for(let wall of walls){
		if(collide(wall, shot)){
			environment.shots.splice(tmp,1);
	    	return;
	    }
	}
	for(var playr in environment.players){
		if(collide(environment.players[playr], shot)&& environment.players[playr].playerId != shot.playerId){

			environment.players[playr].lifepoints -= shot.damage;
			
			//environment.players[playr].score -= 1;
			environment.players[shot.playerId].score += shot.scoreIncrease;
			environment.shots.splice(tmp,1);
			console.log("je suis touché : " + environment.players[playr].playerId + " " + environment.players[playr].lifepoints);
			console.log("j'ai touché qqun : " + shot.playerId + " " + environment.players[shot.playerId].score);

			isDead(environment.players[playr]);
			return;
		}
	}

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
		    	case 'S':
		    		j <= 0 ? x = 0 : x +=50;
		    		spawns.push({position: {x: x, y: y}, hitbox:{width:50, height:50}});
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
setInterval(gameLoop, 60/1000);


io.on('connection', newConnection);

server.listen(4000, function () {
	console.log('Example app listening on port 4000!');
});