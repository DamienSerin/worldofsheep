import _ from 'underscore';
import express from 'express';
import http from 'http';
import socketIO from 'socket.io';

const app = express();
const server = http.createServer(app);
const io = socketIO.listen(server);

import {Game} from './game.js';

app.use(express.static('public'));

const game = new Game();
//console.log(game.map.walls);

var nextPlayerId = 1;

io.sockets.on('connection', socket => {
    //console.log("salut");
    //console.log(io.sockets);
    let playerId = nextPlayerId;
    nextPlayerId++;
    game.placePlayer(playerId);
    game.sockets.push(socket);
    socket.emit('playerInit', {id: playerId, players: JSON.stringify(game.players), map: JSON.stringify(game.map)});
    console.log(game.players[0]);
    console.log(game.map)
});


server.listen(4000, function(){
    console.log('Server listening on port 4000!');
});
