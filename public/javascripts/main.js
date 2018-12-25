require(["jquery", "tools", "buzz", "game"], function($) {

var game_assets = [
	"blocks.var", // !
	"game.config",
	"game.buffers",
	"game.canvases",
	"game.sounds",
	"game.monsters",
	"game.socket",
	"game.controls",
	"game.map",
	"game.draw",
	"game.flow", // !
	"game.physics", // !
	"game.tick", // !
	"mobile"
];

$(document).ready(function(){
	var socket = io.connect()

	define('socket', function(){
		return socket;
	});

	socket.on('disconnect', function(){
		document.location.reload(true);
	});

	socket.on('connect', function () {
		socket.on('identifier', function (id) {
			require(game_assets, function() {
				game.setup(socket, id);
			});
		});
	});

});


});
