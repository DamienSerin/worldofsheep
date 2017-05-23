const $ = require("jquery");
const socket = require('socket.io-client')();
import {Game} from './game.js';
import {Map} from './map.js';

/* Canvas pour afficher le background de la map qui n'a besoin d'être déssiné qu'une seule fois */
const canvasbg = document.getElementById('canvasbg');
/* Canvas pour afficher le foreground (éléments dynamiques) */
const canvasfg = document.getElementById('canvasfg');

const ctxbg = canvasbg.getContext('2d');
const ctxfg = canvasfg.getContext('2d');

/* Canvas for pre-rendering */
/*const tmp_canvas = document.createElement('canvas');
const tmp_ctx = tmp_canvas.getContext('2d');
tmp_canvas.width = 1000;
tmp_canvas.height = 600;
*/

let myPlayerId = -1;
let players = null;

let map = new Map();

socket.on('playerInit', function(args){
    myPlayerId = args.id;
    players = JSON.parse(args.players);
    let tmp = JSON.parse(args.map);
    map.walls = tmp.walls;
    map.spawns = tmp.spawns;
    console.log(myPlayerId);
    console.log(players);
    console.log(map);
    for(let wall of map.walls){
        map.drawWall(ctxbg, wall);
    }
});
