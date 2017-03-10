var express = require('express');
app = express();

var server = require('http').Server(app);
var io = require('socket.io')(server);
app.use(express.static('public'));
var nextPlayerId = 1;

var environment = {
	players: {},
	objects: [],
	walls: []
};

var map = [
['W','W','W','W','W','W','W','W','W','W'],
['W','','','','','','','','','W'],
['W','','','W','','W','','','','W'],
['W','','','','W','','','','','W'],
['W','','','','','','','','','W'],
['W','W','W','W','W','W','W','W','W','W']
];

var userInputs = [];

function newConnection(socket) {
	var playerId = nextPlayerId++;
	environment.players[playerId] = {
		playerId: playerId,
		position: {x: 200, y:200}, 
		direction: {x: 0, y: 0},
		hitbox: {width: 20, height: 20},
		speed: 2,
		score: 0
	};

	createMap(map);
	socket.emit('init', {playerId: playerId, environment: environment});

	socket.on('input', function(userInput){
		userInputs.push({playerId: playerId, userInput: userInput.key});
		userInputs.forEach(processInput);
		updateEnvironment();
		io.emit('updateEnvironment', environment);
	});
}

function updatePlayer(player) {
		//console.log("hello updatePlayer--------");
		//console.log(player);
		var walls = environment.walls;

		/*for(var wall in environment.walls){
			console.log("wall : " + wall);

			if(collide(wall, player)){
				return;
			}
		}*/
		var index, len;
		for (index = 0, len = walls.length; index < len; ++index) {
			var tmp = walls[index];
			console.log(tmp);
			console.log("---");
		    if(collide(tmp, player)){
		    	return;
		    }
		}

		for(var playr in environment.players){
			if(collide(playr, player) && playr.playerId != player.playerId){
				return;
			}
		}

		player.position.x += player.direction.x * player.speed;
		player.position.y += player.direction.y * player.speed;

		//console.log("---------- ");
}

function updateEnvironment() {
	var players = environment.players;
	for(var key in environment.players){
		var player = environment.players[key];
		updatePlayer(player);
	}
	//resolveColisions();
}

function collide(obj1, player){
	//console.log(player);

	//console.log("obj : " + obj1);
	//console.log("pos : " + obj1.position.x);
	return obj1.position.x + obj1.hitbox.width > player.position.x && player.position.x + player.hitbox.width > obj1.position.x && obj1.position.y + obj1.hitbox.height > player.position.y && player.position.y + player.hitbox.height > obj1.position.y;
}

function processInput(input, index){
	var player = environment.players[input.playerId];
	//console.log("x : " + player.direction.x);
	//console.log("y : " + player.direction.y);

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
	//console.log(player);
	//console.log("----");
	//console.log(environment.players);
}

function createMap(map){
	var x = 0;
	var y = 0;
	for(var i = 0; i < map.length; i++) {
	    var line = map[i];
	    for(var j = 0; j < line.length; j++) {
	        switch(line[j]){
	        	case 'W':
	        		j <= 0 ? x = 0 : x +=100;
	        		environment.walls.push({position: {x: x, y: y}, hitbox:{width:60, height:100}});
		    		break;
		    	default:
		    		j <= 0 ? x = 0 : x +=100;
	        }
	    }
	    x = 0;
	    y += 60;
	}
}

/*function gameLoop() {
	userInputs.forEach(processInput);
	//console.log(environment.players);
	updateEnvironment();
	io.emit('updateEnvironment', environment);
}*/
//setInterval(gameLoop, 1000/1000);

io.on('connection', newConnection);

server.listen(4000, function () {
	console.log('Example app listening on port 4000!');
});