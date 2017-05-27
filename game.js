import _ from 'underscore';
import {Player} from './player.js';
import {Map} from './map.js';
import {Bullet} from './bullet.js';
const config = require('./config.json');
import * as engine from './engine.js';

class Game {
    constructor(){
        this.players = [ ];
        this.sockets = [ ];
        this.bullets = [ ];
        this.highscores = [ ];
        this.map = new Map();
        this.map.generateMap(config.map1);
    }

    getPlayer(playerId){
        return _.findWhere(this.players, {id: playerId});
    }
    
    getSocket(playerId){
        return _.findWhere(this.sockets, {id: this.getPlayer(playerId).socketId});
    }

    addPlayer(playerId){
        if(this.getPlayer(playerId)){
            return;
        }
        const player = new Player(playerId);
        this.players.push(player);
        return player;
    }
    
    addSocket(socket, playerId){
        this.sockets.push(socket);
        this.getPlayer(playerId).setSocketId(socket.id);
    }

    addBullet(arg){
        let bullet = new Bullet(arg.idOwner, arg.x, arg.y, arg.dirX, arg.dirY);
        this.bullets.push(bullet);
    }

    removeBullet(bullet){
          this.bullets = _.without(this.bullets, bullet);
    }

    removePlayer(player){
        this.sockets = _.without(this.sockets, this.getSocket(player.id));
        this.players = _.without(this.players, player);
    }

    removeDead(){
      for(let player of this.players){
        if (player.isDead()){
          this.removePlayer(player);
        }
      }
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

    checkForHighScores(player){
        for(let score of this.highscores){
            if(player.score > score.score){
                let tmp = this.highscores.indexOf(score);
                this.highscores.splice(tmp, 0, {player: player.id, score: player.score});
                if(this.highscores.length > 20){
                    this.highscores.pop();
                }
            }
        }
    }

    onDeath(player){
        this.checkForHighScores(player);
        player.state = "dead";
        this.getSocket(player.id).emit("death",{});
      //  this.removePlayer(player);
    }

    updatePlayer(player){
        let oldx = player.x;
        let oldy = player.y;

        /* update de la position du joueur */
        player.x += player.dirX * player.speed;
        player.y += player.dirY * player.speed;

        /* check les collisions avec les murs */
        for(let wall of this.map.walls){
            if(engine.collide(wall, player)){
                /* si colision retour à l'ancienne position */
                player.x = oldx;
                player.y = oldy;
                return;
            }
        }
        /* check les collisions entre joueurs */
        for(let playr of this.players){
            if(engine.collide(playr, player) && playr.id != player.id){
                /* si colision retour à l'ancienne position */
                player.x = oldx;
                player.y = oldy;
                return;
            }
        }
    }

    updateBullet(bullet){
        for(let wall of this.map.walls){
            if(engine.collide(wall, bullet)){
                this.removeBullet(bullet);
                return;
            }
        }
        for(let player of this.players){
            if(bullet.didTouch(player)){
                player.getTouched(bullet);
                (this.getPlayer(bullet.idOwner)).ennemyTouched(bullet);
                this.removeBullet(bullet);
                if(player.isDead()){
                    this.onDeath(player);
                }
                return;
            }
        }
        bullet.x += bullet.dirX * bullet.speed;
        bullet.y += bullet.dirY * bullet.speed;
    }

    updateWorld(){
        for(let player of this.players){
            this.updatePlayer(player);
        }

        for(let bullet of this.bullets){
            this.updateBullet(bullet);
        }
    }
}

export {Game};
