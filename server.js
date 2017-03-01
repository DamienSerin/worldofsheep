var express = require('express');
app = express();

var server = require('http').Server(app);
var io = require('socket.io')(server);
app.use(express.static('public'));
var nextPlayerId = 1;

var environment = {
	players: {},
	objects: []
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
		position: {x: 50, y:50}, 
		direction: {x: 0, y: 0},
		speed: 2,
		score: 0
	};

	socket.emit('init', {playerId: playerId, environment: environment, map: map});

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
		player.position.x += player.direction.x * player.speed;
		player.position.y += player.direction.y * player.speed;
		//console.log("---------- ");
}

function updateEnvironment() {
	//environment.players.forEach(updatePlayer);
	var players = environment.players;

	//Object.keys(environment.players).forEach(updatePlayer);
	for(var key in environment.players){
		var player = environment.players[key];
		updatePlayer(player);
	}
	//resolveColisions();
}

function processInput(input, index){
	var player = environment.players[input.playerId];
	console.log("x : " + player.direction.x);
	console.log("y : " + player.direction.y);

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