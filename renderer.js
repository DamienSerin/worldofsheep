
  function drawElement(canv, x, y, width, height, color){
        var img = new Image();
        img.onload = function () {
            canv.drawImage(img, x, y);
        }
        img.src = color;
    }
    
    function drawImg(canv, x, y ,width, height, img){
      canv.drawImage(img, x, y);
    }
    
    function drawText(ctx, x,y,text, color){
      color = color ? color : "black";
      //font = font ? font: "12px Arial";
      ctx.fillStyle = color;
      //ctx.textAlign = "center";
      //ctx.font = font;
      ctx.fillText(text, x, y);
        
    }
    

export {
  drawElement,
  drawImg,
  drawText
};