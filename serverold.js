var express = require('express');
app = express();

var server = require('http').Server(app);
var io = require('socket.io')(server);

var playerList;
var nextPlayerId = 1;
var mapBlocks = [[10,10], [20,20], [30,30]];

var players = {};

app.use(express.static('public'));

io.on('connection', function (socket) {
	var playerId = nextPlayerId++;
	var blocks = mapBlocks;
	players[playerId] = {position : {
		x:50,
		y:50,
	}};
	socket.emit('start', { playerId: playerId, blocks:blocks, players:players});
	console.log('client connecté');


});

io.on('updateContent', function (socket) {
	socket.emit('updateContent', { content: pageContent});
});

server.listen(4000, function () {
	console.log('Example app listening on port 4000!');
});