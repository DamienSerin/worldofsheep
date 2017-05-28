import _ from 'underscore';
import express from 'express';
import http from 'http';
import socketIO from 'socket.io';
import * as engine from './engine.js';


const app = express();
const server = http.createServer(app);
const io = new socketIO(server, {pingInterval: 5000, pingTimeout: 11000});

import {Game} from './game.js';

app.use(express.static('public'));

const game = new Game();

var nextPlayerId = 1;


io.sockets.on('connection', socket => {

    let playerId = nextPlayerId;
    nextPlayerId++;
    game.placePlayer(playerId);
    socket.emit('playerInit', {id: playerId, players: JSON.stringify(game.players), map: JSON.stringify(game.map), bullets: JSON.stringify(game.bullets), bonus: JSON.stringify(game.bonus)});


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
        game.checkForHighScores(game.getPlayer(playerId));
        game.removePlayer(game.getPlayer(playerId));
    })

});

function bonusLoop(){
    game.generateBonus();
}
setInterval(bonusLoop, 10000); //10secondes

function gameLoop(){
    game.updateWorld();
    io.emit('updateWorld', {players: JSON.stringify(game.players), bullets: JSON.stringify(game.bullets), highscores: JSON.stringify(game.highscores), bonus: JSON.stringify(game.bonus)});
    game.removeDead();
    game.refreshBonusList();
}
setInterval(gameLoop, 0.09);


server.listen(8080 , function(){
    console.log('Server listening on port 4000!');
});
