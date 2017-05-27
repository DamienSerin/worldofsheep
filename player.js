class Player {
    constructor(playerId) {
        this.id = playerId;
        this.socketId = "";
        this.pseudo = "Bob" + playerId;
        this.state = "alive";
        this.score = 0;
        this.lifepoints = 10;
        this.speed = 0.5;
        this.x = 0;
        this.y = 0;
        this.dirX = 0;
        this.dirY = 0;
        this.width = 20;
        this.height = 20;
        //this.bonus = new Bonus();
        //this.malus = new Malus();
    }
    
    setPseudo(pseudo){
      this.pseudo = pseudo;
    }
    
    setSocketId(socketId){
        this.socketId = socketId;
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
