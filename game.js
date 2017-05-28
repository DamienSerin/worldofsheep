import _ from 'underscore';
import {Player} from './player.js';
import {Map} from './map.js';
import {Bullet} from './bullet.js';
import {Bonus} from './bonus.js';
const config = require('./config.json');
import * as engine from './engine.js';

class Game {
    constructor(){
        this.players = [ ];
        this.bullets = [ ];
        this.highscores = [ ];
        this.map = new Map();
        this.map.generateMap(config.map1);
        this.bonus = [ ];
        this.idBonus = 0;
    }

    getPlayer(playerId){
        return _.findWhere(this.players, {id: playerId});
    }
    
    getBonus(playerId, type){
        return _.filter(this.bonus, {idOwner: playerId, type:type});
    }
    
    
    howManyBonus(playerId){
        let nbr = 0;
        
        for(let b of this.bonus){
            if (b.idOwner == playerId) nbr++;    
        }
        return nbr;
    }

    addPlayer(playerId){
        if(this.getPlayer(playerId)){
            return;
        }
        const player = new Player(playerId);
        this.players.push(player);
        return player;
    }

    addBullet(arg){
         let bullet = new Bullet(arg.idOwner, arg.x, arg.y, arg.dirX, arg.dirY);
        
        if (this.howManyBonus(arg.idOwner) > 0){
            let b = this.getBonus(arg.idOwner, "bulletBonus")[0];
    //        console.log(b);
            if(!engine.isTimeout(b.timeBeginPlayer, b.duration) && b.type == "bulletBonus"){
                    bullet.setBonusAction(b.effectDammage, b.effectSpeedBullet, b.effectScore);
           }
        }
        this.bullets.push(bullet);
    }

    removeBullet(bullet){
          this.bullets = _.without(this.bullets, bullet);
    }

    removePlayer(player){
        this.players = _.without(this.players, player);
    }
    
    removeBonus(bonus){
        if (!bonus) return;
        if (bonus.idOwner > 0 && this.howManyBonus(this.getPlayer(bonus.ownerId)) == 1){
            this.getPlayer(bonus.idOwner).setBonus(false);
        }
        this.bonus = _.without(this.bonus, bonus);
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
        if (!player) return;
        if (this.highscores.length <= 0){
            this.highscores.push({pseudo: player.pseudo, player: player.id, score: player.score});
        }
        for(let score of this.highscores){
            if(player.score > score.score){
                let tmp = this.highscores.indexOf(score);
                this.highscores.splice(tmp, 0, {pseudo: player.pseudo, player: player.id, score: player.score});
                if(this.highscores.length > 20){
                    this.highscores.pop();
                }
                return;
            }
        }
    }

    onDeath(player){
        if (!player) return;
        this.checkForHighScores(player);
        player.state = "dead";
    }
    
    bonusCollision(player){
        /*check les  collisions avec bonus*/
        for(let b of this.bonus){
            if(engine.collide(player, b)){
                if(this.howManyBonus(player.id) > 1 && (this.getBonus(player.id, b.type > 0))){
                    this.removeBonus(_.findWhere(this.bonus, {id:player.id, type:b.type}));
                }
                b.setOwner(player.id);
                player.setBonus(true);
                b.setTimeBeginPlayer();
            }
        }
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
        
        this.bonusCollision(player);
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
    
    generateBonus(){
        let bonus = _.findWhere(config.bonus, {bonusId: Math.floor((Math.random() * config.bonus.length))});

        let tmpObj = {x: 0, y: 0, width: 15, height: 15}; 
        let canSpawn = false;
        while(!canSpawn){
            canSpawn = true;
            tmpObj.x = Math.floor(Math.random() * 1000);
            tmpObj.y = Math.floor(Math.random() * 600);
            for(let wall of this.map.walls){
                if (engine.collide(tmpObj, wall)){
                    canSpawn = false;
                }
            }
        }
        
        //console.log("add new bonus");
        let newBonus = new Bonus(this.idBonus++, Math.floor(Date.now() / 1000), bonus.type, bonus.name, bonus.effectLife, bonus.effectDammage, bonus.effectSpeedOwner, bonus.effectSpeedBullet, bonus.effectScore);
        newBonus.setCoordonnes(tmpObj.x, tmpObj.y);
        this.bonus.push(newBonus);
    }
    
    refreshBonusList(){
        for (let b of this.bonus){
            //pas de proprietaire
            if(b.idOwner == 0 && engine.isTimeout(b.timeBeginMap, b.duration)){
                this.removeBonus(b);
            }
            if(b.idOwner > 0 && engine.isTimeout(b.timeBeginPlayer, b.duration)){
                this.removeBonus(b);
            }
        }
    }
    
}

export {Game};
