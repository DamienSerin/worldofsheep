import _ from 'underscore';
const $ = require("jquery");
const socket = require('socket.io-client')();
import {Game} from './game.js';
import {Map} from './map.js';
import {Bullet} from './bullet.js';
import * as renderer from './renderer.js';
import * as engine from './engine.js';

/* pour tester: https://worldofsheep-sandra-laduranti.c9users.io:8080*/

/* Canvas pour afficher le background de la map qui n'a besoin d'être dessiné qu'une seule fois */
const canvasbg = document.getElementById('canvasbg');
/* Canvas pour afficher le foreground (éléments dynamiques) */
const canvasfg = document.getElementById('canvasfg');
/* Canvas pour toute la partie HUD*/
const canvasHUD = document.getElementById('HUD');

const ctxbg = canvasbg.getContext('2d');
const ctxfg = canvasfg.getContext('2d');
const ctxhud = canvasHUD.getContext('2d');
ctxhud.font = "20px Arial";
/* Canvas for pre-rendering */
/*const tmp_canvas = document.createElement('canvas');
const tmp_ctx = tmp_canvas.getContext('2d');
tmp_canvas.width = 1000;
tmp_canvas.height = 600;
*/

let lifeimg = document.getElementById('lifepoints');
let avatar = document.getElementById('avatar1down');
let bulletimg1 = document.getElementById('bullet1');

let avatars = [];

let dead = false;
let myPlayerId = -1;
let oldplayers = null;
let players = null;
let bullets = null;
let map = new Map();
let highscores = null;
let pseudo;

function initImg(){
    let dir = ["up", "down", "left", "right"];
    
    for (var iter = 1; iter < 6; iter++) {
        for (let d of dir){
            avatars.push(document.getElementById('avatar'+iter+d));
        }
    }
    
    //avatars.push(document.getElementById('avatar1down'));
   // console.log(avatars[0].id);
}
socket.on('playerInit', function(args){
    initImg();
    myPlayerId = args.id;
    convertNewWorld(args);
    /*gestion de la map a l'initialisation*/
    let tmp = JSON.parse(args.map);
    map.walls = tmp.walls;
    map.spawns = tmp.spawns;
    
   /* A TESTER AUTRE PART QUE SUR VM CACA 
   pseudo = prompt("Veuillez saisir votre pseudo pour jouer:","Bob");
   if(pseudo!=null && pseudo!="Bob"){
      console.log("nom different");
      socket.emit('setPseudo', {pseudo : pseudo});
    }*/

    for(let wall of map.walls){
        map.drawWall(ctxbg, wall);
    }
    renderWorld(map, players);
});

socket.on('updateWorld', function(nWorld){
    convertNewWorld(nWorld);
    highscores = JSON.parse(nWorld.highscores);
    if (!death()){
      renderWorld();
    }
});

socket.on('death', function(){
    death();
})


function death(){
  let player = _.findWhere(players, {id: myPlayerId});

  if (player.state == "dead"){
    console.log("DEAD");
    $(document).off("keydown");
    $(document).off("keyup");
    $(document).off("mousedown");
    dead = true;
    map.drawDeadScreen(ctxfg, canvasfg);
    updateHUD();
    return true;
  }
  return false;
}

function isHUDDirty(){
    let dirty = false;
    
    /* first iteration*/
    if (!oldplayers) return true;
    
    if (players) {
        if (players.length != oldplayers.length) return true;
        
        for(let player of players){
            let oldplayer = _.findWhere(oldplayers, {id: player.id});
            if (!oldplayer) return true;
            if (player.score != oldplayer.score) return true;
            if (player.pseudo != oldplayer.pseudo) return true;
            if (player.lifepoints != oldplayers.lifepoints) return true;
        }
        
    }

    
    return dirty;
}

function updateHUD(){
    let dirty = false;
    
    dirty = isHUDDirty();
    
    if (dirty){
        let y = 5;
        players = _.sortBy(players,'score');
        ctxhud.clearRect(0,0,canvasHUD.width, canvasHUD.height);
        
       
        //x,y
        renderer.drawImg(ctxhud,0,5,20,20,lifeimg);
        renderer.drawText(ctxhud, 24,20, _.findWhere(players, {id: myPlayerId}).lifepoints);

        y = y + 40;
        renderer.drawText(ctxhud,0,y, "Liste des joueurs: ")
        for(let player of players){
            let text = player.pseudo + " : " + player.score +" points";
            y += 25;
            renderer.drawText(ctxhud,0,y,text);
        }
        y += 45;
        renderer.drawText(ctxhud,0,y, "Highscores:")
        if(!highscores) return;
        for(let highscore of highscores ){
            let text = highscore.pseudo + " : " + highscore.score + " points";
            y+=25;
            renderer.drawText(ctxhud,0,y,text);
        }
        
    }
}

function getAvatarDirection(player){
    return player.avatar + player.direction;
}

function renderWorld(){
    ctxfg.clearRect(0, 0, canvasfg.width, canvasfg.height);
    for(let player of players){
        if (player.id != myPlayerId){
           // _.findWhere(players, {id: myPlayerId});
            map.drawPlayer(ctxfg, player, player.pseudo, _.findWhere(avatars, {id: getAvatarDirection(player)}));
        }
        else{
            map.drawPlayer(ctxfg, player, "Moi", _.findWhere(avatars, {id: getAvatarDirection(player)}));
        }
    }

    for(let bullet of bullets){
        map.drawBullet(ctxfg, bullet, bulletimg1);
    }
    
    updateHUD();
}

function convertNewWorld(nWorld){
    oldplayers = players;
    players = JSON.parse(nWorld.players);
    //let tmp = JSON.parse(nWorld.map);
    bullets = JSON.parse(nWorld.bullets);
}

$(document).on('keydown', function(event){
    switch(event.keyCode){
        case 37:
            socket.emit('input', {id: myPlayerId, key: 'LEFT_PRESSED'});
            break;
        case 38:
            socket.emit('input', {id: myPlayerId, key: 'UP_PRESSED'});
            break;
        case 39:
            socket.emit('input', {id: myPlayerId, key: 'RIGHT_PRESSED'});
            break;
        case 40:
            socket.emit('input', {id: myPlayerId, key: 'DOWN_PRESSED'});
            break;
        default:
            break;
    }
});

$(document).on('keyup', function(event){
    switch(event.keyCode){
        case 37:
            socket.emit('input', {id: myPlayerId, key: 'LEFT_RELEASED'});
            break;
        case 38:
            socket.emit('input', {id: myPlayerId, key: 'UP_RELEASED'});
            break;
        case 39:
            socket.emit('input', {id: myPlayerId, key: 'RIGHT_RELEASED'});
            break;
        case 40:
            socket.emit('input', {id: myPlayerId, key: 'DOWN_RELEASED'});
            break;
        default:
            break;
    }
});

$(document).on('mousedown', function(event){
    switch(event.which){
        case 1:

            let player = _.findWhere(players, {id: myPlayerId});

            let shoot_x;
            let shoot_y;

            let rect = canvasfg.getBoundingClientRect();
            shoot_x = event.clientX - rect.left;
            shoot_y = event.clientY - rect.top;

            let norm = Math.sqrt(Math.pow(shoot_y-player.y,2) + Math.pow(shoot_x-player.x,2));
            let dirx = (shoot_x-player.x)/norm;
            let diry = (shoot_y-player.y)/norm;
            let bullet = new Bullet(player.id, player.x, player.y, dirx, diry);
            socket.emit('shoot', {bullet: bullet});
            break;

        default:
            break;
    }
});

/*let pseudo = prompt("Veuillez saisir votre pseudo pour jouer","Bob");
if(pseudo!=null){
console.log("pseudo: "+ pseudo)
*/
