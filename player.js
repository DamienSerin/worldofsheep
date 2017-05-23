class Player {

    constructor(playerId) {
        this.id = playerId;
        this.score = 0;
        this.lifepoints = 10;
        this.speed = 0.5;
        this.x = 0;
        this.y = 0;
        this.dirX = 0;
        this.dirY = 0;
        this.width = 20;
        this.height = 20;
    }
}
export {Player};
