class Bonus{
    constructor(id, timeBeginMap, type, name, effectLife, effectDammage, effectSpeedOwner, effectSpeedBullet, effectScore){
        this.id = id;
        this.idOwner = 0;
        this.x = 50;
        this.y = 50;
     	this.width = 15;
	    this.height = 15;
        this.duration = 7; /*in secondes*/
        this.type = type;
        this.name = name;
        this.timeBeginMap = timeBeginMap;
        this.timeBeginPlayer = null;
        this.effectLife = effectLife;
        this.effectDammage = effectDammage;
        this.effectSpeedOwner = effectSpeedOwner;
        this.effectSpeedBullet = effectSpeedBullet;
        this.effectScore = effectScore;
    }
    
    setOwner(id){
        this.idOwner = id;
    }
    
    setTimeBeginPlayer(){
        this.timeBeginPlayer = Math.floor(Date.now() / 1000);
    }
    
    setBeginMap(time){
        this.timeBeginMap = time;
    }
    
    setCoordonnes(x, y){
        this.x = x;
        this.y = y;
    }
    
    setBeginPlayer(time){
        this.timeBeginPlayer = time;
    }
    
    setImg(img){
        this.img = img;
    }
    
    setEffectLife(life){
        this.effectLife = life;
    }
    
    setEffectDammage(dammage){
        this.effectDammage = dammage;
    }
    
    setEffectSpeedOwner(speed){
        this.effectSpeedOwner = speed;
    }
    
    setEffectSpeedBuller(speed){
        this.effectSpeedBullet = speed;
    }
    
    setDuration(duration){
        this.duration = duration;
    }
    
    setEffectScore(score){
        this.effectScore = score;
    }
    
}

export {Bonus};