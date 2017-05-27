import _ from 'underscore';
const $ = require("jquery");
const socket = require('socket.io-client')();
import {Game} from './game.js';
import {Map} from './map.js';
import {Bullet} from './bullet.js';
import * as renderer from './renderer.js';

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
/* Canvas for pre-rendering */
/*const tmp_canvas = document.createElement('canvas');
const tmp_ctx = tmp_canvas.getContext('2d');
tmp_canvas.width = 1000;
tmp_canvas.height = 600;
*/

let dead = false;
let myPlayerId = -1;
let oldplayers = null;
let players = null;
let bullets = null;
let map = new Map();
let pseudo;

socket.on('playerInit', function(args){
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
    if (!death()){
      renderWorld();
    }
});

socket.on('death', function(){
    death();
})


function updateListPlayer(){
  _.sortBy(players,'score');

  let listPlayer = "";
  for(let player of players){
      if (player.id != myPlayerId){
        listPlayer += "<li>"+player.pseudo+" : "+player.score+" points</li>";
      }
      else{
        listPlayer += "<li>Moi : "+player.score+" points</li>";
      }
  }

  $("#ingamelist").html(listPlayer);
}

function death(){
  let player = _.findWhere(players, {id: myPlayerId});

  if (player.state == "dead"){
    console.log("DEAD");
    $(document).off("keydown");
    $(document).off("keyup");
    $(document).off("mousedown");
    dead = true;
    socket.close();
    map.drawDeadScreen(ctxfg, canvasfg);
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
        }
        
    }

    
    return dirty;
}

function updateHUD(){
    let dirty = false;
    
    dirty = isHUDDirty();
    
    if (dirty){
        ctxhud.clearRect(0,0,canvasHUD.width, canvasHUD.height);
        
        for(let index in players){
            let player = players[index];
            let text = player.pseudo + " : " + player.score +" points";
            renderer.drawText(ctxhud,0,index*12+12,text);
        }
        
    }
}


function renderWorld(){
    ctxfg.clearRect(0, 0, canvasfg.width, canvasfg.height);
    for(let player of players){
        map.drawPlayer(ctxfg, player);
    }

    for(let bullet of bullets){
        map.drawBullet(ctxfg, bullet);
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
