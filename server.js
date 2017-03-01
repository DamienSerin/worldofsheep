var express = require('express');
app = express();

var server = require('http').Server(app);
var io = require('socket.io')(server);

var pageContent = "Hello";

app.use(express.static('public'));

io.on('connection', function (socket) {
	socket.emit('hello', { msg: 'World !'});
	console.log('client connecté');
});

io.on('updateContent', function (socket) {
	socket.emit('updateContent', { content: pageContent});
});

server.listen(4000, function () {
	console.log('Example app listening on port 4000!');
});