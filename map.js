import * as renderer from './renderer.js';

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

  
    

    drawBullet(canv, bullet, img){
        renderer.drawImg(canv, bullet.x,bullet.y,bullet.width, bullet.height, img);
    }

    drawPlayer(canv, player, pseudo, img) {
        /* pre rendering */
        if (player.state == "dead") return;
        renderer.drawText(canv, player.x, player.y-10, pseudo, "white");
        renderer.drawImg(canv, player.x,player.y,player.width, player.height, img);
    }



    drawDeadScreen(canv, canvfg){
       canv.beginPath();
        canv.rect(0, 0, canvfg.width, canvfg.height);
        canv.fillStyle = "black";
        canv.fill();
        canv.closePath();
      canv.fillStyle = "red";
      canv.font="50px OptimusPrinceps";
      canv.textAlign = "center";
      canv.fillText("YOU DIED", (canvfg.width)/2, (canvfg.height)/2);
    }

    drawWall(canv, wall){
        renderer.drawElement(canv, wall.x, wall.y, wall.height, wall.width, "./img/Tile.png");
    }
}

export {Map};
