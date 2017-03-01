var $ = require("jquery");
var socket = require('socket.io-client')();

var myPlayerId = -1;
var canvas = document.getElementById('canvas');
window.addEventListener("keydown",doKeyDown,true);
var players;

socket.on('start', function(data) {
	myPlayerId = data.playerId;
	players = data.players;
	console.log("id: " + myPlayerId);
	renderCanvas(data);
});

socket.on('updateContent', function(data) {
	$('#main').html(data.content);
});

function doKeyDown(e){
	console.log("touche: " + e.keyCode);
}

function renderCanvas(data){
	if(canvas.getContext){
		var ctx = canvas.getContext('2d');
		ctx.beginPath();
		ctx.rect(0, 0, 1000, 600);
		ctx.fillStyle = "grey";
		ctx.fill();

		var index, len;
		var blocks = data.blocks;

		for (index = 0, len = blocks.length; index < len; ++index) {
		    console.log(blocks[index]);
		    ctx.beginPath();
		    ctx.rect(blocks[index][0], blocks[index][1], 10, 10);
		    ctx.fillStyle = "blue";
		    ctx.fill();
		}

		var me = players[myPlayerId];
		console.log(me.position);
		ctx.beginPath();
		ctx.rect(me.position.x, me.position.y, 50, 50);
		ctx.fillStyle = "green";
		ctx.fill();


	}

}

$(document).ready(function(){
    $("input").keydown(function(event){ 
        $("div").html("Key: " + event.which);
    });
});