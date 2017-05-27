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

var nextPlayerId = 1;


/* ACTUELLEMENT NE SUPPORTE PAS PLUS DE 3 CONNECTES SIMULTANES*/ 
io.sockets.on('connection', socket => {

    let playerId = nextPlayerId;
    nextPlayerId++;
    game.placePlayer(playerId);
    //game.sockets.push(socket);
    game.addSocket(socket, playerId);
    socket.emit('playerInit', {id: playerId, players: JSON.stringify(game.players), map: JSON.stringify(game.map), bullets: JSON.stringify(game.bullets)});
    //console.log(socket.id);
    //console.log(game.getSocket(playerId));

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

/* A ajouter => Pour optimiser, voir pour envoyer un message de refresh des highscores seulement quand un nouvel highscore est enregistré*/

function gameLoop(){
    game.updateWorld();
    io.emit('updateWorld', {players: JSON.stringify(game.players), bullets: JSON.stringify(game.bullets)});
    game.removeDead();
    //console.log(game.sockets.id);
}
setInterval(gameLoop, 0.03);

server.listen(8080 , function(){
    console.log('Server listening on port 4000!');
});
