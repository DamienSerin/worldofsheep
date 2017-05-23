import _ from 'underscore';
import {Player} from './player.js';
import {Map} from './map.js';
const config = require('./config.json');
import * as engine from './engine.js';

class Game {
    constructor(){
        this.players = [ ];
        this.sockets = [ ];

        this.map = new Map();
        this.map.generateMap(config.map1);
    }

    getPlayer(playerId){
        return _.findWhere(this.players, {id: playerId});
    }

    addPlayer(playerId){
        if(this.getPlayer(playerId)){
            return;
        }
        const player = new Player(playerId);
        this.players.push(player);
        return player;
    }

    placePlayer(playerId) {
        const player = this.addPlayer(playerId);
        let tmp = this.map.spawns[Math.floor(Math.random() * this.map.spawns.length)];
        let canSpawn = false;
        while(!canSpawn){
            canSpawn = true;
            for(let playr of this.players){
                if(engine.collide(playr,tmp)){
                    tmp = this.map.spawns[Math.floor(Math.random() * this.map.spawns.length)];
                    canSpawn = false;
                    break;
                }
            }
        }
        player.x = tmp.x;
        player.y = tmp.y;
    }
}

export {Game};
