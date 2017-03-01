var $ = require("jquery");
var socket = require('socket.io-client')();

socket.on('hello', function(data) {
	$(document.body).append('Server: Hello '+data.msg);
});

socket.on('updateContent', function(data) {
	$('#main').html(data.content);
});