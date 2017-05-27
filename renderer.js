
  function drawElement(canv, x, y, width, height, color){
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
    
    
    
    function drawText(ctx, x,y,text, color){
      color = color ? color : "black";
      ctx.fillStyle = color;
      //ctx.textAlign = "center";
      ctx.fillText(text, x, y);
        
    }

export {
  drawElement,
  drawText
};