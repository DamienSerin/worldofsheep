class Map{
    constructor(){
        this.walls = [ ];
        this.spawns = [ ];
    }

    /* Transformation du tableau map en objets avec coordonnées */
    /* Permet de générer plus facilement de nouvelles maps */
    generateMap(map){
        let x = 0;
        let y = 0;
        for(let i = 0; i < map.length; i++) {
            let line = map[i];
            for(let j = 0; j < line.length; j++) {
                switch(line[j]){
                    case 'W':
                    j <= 0 ? x = 0 : x +=50;
                    this.walls.push({x: x, y: y, width:50, height:50});
                    break;
                    case 'S':
                    j <= 0 ? x = 0 : x +=50;
                    this.spawns.push({x: x, y: y, width:50, height:50});
                    break;
                    default:
                    j <= 0 ? x = 0 : x +=50;
                }
            }
            x = 0;
            y += 50;
        }
    }

    drawElement(canv, x, y, width, height, color){
        /*
        ctxbg.beginPath();
        ctxbg.rect(x, y, width, height);
        ctxbg.fillStyle = color;
        ctxbg.fill();
        ctxbg.closePath();
        */

        var img = new Image();
        img.onload = function () {
            canv.drawImage(img, x, y);
        }
        img.src = color;
    }

    drawBullet(canv, bullet){
        canv.beginPath();
        canv.rect(bullet.x, bullet.y, bullet.width, bullet.height);
        canv.fillStyle = "white";
        canv.fill();
        canv.closePath();
    }

    drawPlayer(canv, player) {
        //var player = environment.players[playerId];

        /* pre rendering */
        canv.beginPath();
        canv.rect(player.x, player.y, player.width, player.height);
        canv.fillStyle = "green";
        canv.fill();
        canv.closePath();
    }
    drawWall(canv, wall){
        this.drawElement(canv, wall.x, wall.y, wall.height, wall.width, "Tile.png");
    }
}

export {Map};
