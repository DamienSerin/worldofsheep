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

var userInputs = {};

function newConnection(socket) {
	var playerId = nextPlayerId++;
	environment.players[playerId] = {
		position: {x: 50, y:50}, 
		direction: {up: false, down: false, left: false, right: false},
		speed: 1,
		score: 0
	};

	socket.emit('init', {playerId: playerId, environment: environment, map: map});

	socket.on('input', function(userInput){

	});
}

function updatePlayer(player) {
	//player.x += player.direction.x * player.speed;
	//player.y += player.direction.y * player.speed;
}

function updateEnvironment() {
	//environment.players.forEach(updatePlayer);
	var players = environment.players;
	for(var player in players){
		if(players.hasOwnProperty(player)){
			updatePlayer(player);
		}
	}
	//resolveColisions();
}

function processInput(input){
	var player = environment.players[input.clientId];
	switch(input.cmd) {
		case 'UP_PRESSED':
			player.direction.y -=1;
			break;
		case 'UP_RELEASED':
			player.direction.y +=1;
			break;
	}
}

function gameLoop() {
	for(var input in userInputs){
		if(userInputs.hasOwnProperty(input)){
			processInput(input);
		}
	}
	//userInputs.forEach(processInput);
	updateEnvironment();
	io.emit('updateEnvironment', environment);
}
setInterval(gameLoop, 1000/30);

io.on('connection', newConnection);

server.listen(4000, function () {
	console.log('Example app listening on port 4000!');
});