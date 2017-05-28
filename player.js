class Player {
    constructor(playerId) {
        this.id = playerId;
        this.pseudo = "Bob" + playerId;
        this.state = "alive";
        this.score = 0;
        this.lifepoints = 10;
        this.speed = 0.5;
        this.x = 0;
        this.y = 0;
        this.dirX = 0;
        this.dirY = 0;
        this.direction = "down";
        this.width = 24;
        this.height = 30;
        this.avatar = "avatar" + Math.floor((Math.random() * 5) + 1);
        //this.bonus = new Bonus();
        //this.malus = new Malus();
    }
    
    setPseudo(pseudo){
      this.pseudo = pseudo;
    }
    

    getTouched(bullet){
        this.lifepoints -= bullet.dammage;
    }

    ennemyTouched(bullet){
        this.score += bullet.scoreIncrease;
    }

    isDead(){
        return this.lifepoints <= 0;
    }


}
export {Player};
