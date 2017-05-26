import _ from 'underscore';
import express from 'express';
import http from 'http';
import socketIO from 'socket.io';
import * as engine from './engine.js';


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
    socket.emit('playerInit', {id: playerId, players: JSON.stringify(game.players), map: JSON.stringify(game.map), bullets: JSON.stringify(game.bullets)});

    socket.on('input', function(userInput){
        engine.processInput(game.getPlayer(userInput.id), userInput.key);
        let debug = game.getPlayer(userInput.id);
    });

    socket.on('setPseudo', function(pseudo){
        game.getPlayer(playerId).setPseudo(pseudo.pseudo);

    });

    socket.on('shoot', function(shoot){
        game.addBullet(shoot.bullet);
    });

    socket.on('disconnect', function(){
        socket.disconnect();
        game.removePlayer(game.getPlayer(playerId));
    })

});


function gameLoop(){
    game.updateWorld();
    io.emit('updateWorld', {players: JSON.stringify(game.players), map: JSON.stringify(game.map), bullets: JSON.stringify(game.bullets)});
    game.removeDead();
}
setInterval(gameLoop, 30/1000);

server.listen(4000, function(){
    console.log('Server listening on port 4000!');
});
