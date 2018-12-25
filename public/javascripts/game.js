var draw_loop;
// http://notes.jetienne.com/2011/05/18/cancelRequestAnimFrame-for-paul-irish-requestAnimFrame.html
window.cancelRequestAnimFrame = (function() {
	return window.cancelAnimationFrame          ||
		window.webkitCancelRequestAnimationFrame    ||
		window.mozCancelRequestAnimationFrame       ||
		window.oCancelRequestAnimationFrame     ||
		window.msCancelRequestAnimationFrame        ||
		clearTimeout
})();

// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
window.requestAnimFrame = function(){
	return (
		window.requestAnimationFrame       ||
		window.webkitRequestAnimationFrame ||
		window.mozRequestAnimationFrame    ||
		window.oRequestAnimationFrame      ||
		window.msRequestAnimationFrame     ||
		function(callback){
			window.setTimeout(callback, (1000/40));
		}
	);
}();

var game = {
	total_carrots: 0, // tmp stuff!
	gathered_carrots: 0, // tmp stuff!
	setup: function(socket, new_player_id){
		cancelRequestAnimFrame(draw_loop);
		game.frame_log_time = Date.now();
		game.frame_i = 0;
		game.socket = socket;
		game.player_id = new_player_id;
		game.local_data[game['player_id']] = game.default_local_data;
		game.load.sounds();

		for(var i = 1; i < 26; i++) game.sprites.push('s'+i);

		game.controls.bind();
		game.load.canvas_positioning();

		// lots of loading, I could make this loading into one big file
		game.load.monsters(function(){
			game.load_sprites(function(){
				game.load_block_images(function(){
					socket.emit('load_map', function(map){
						game.map = map;
						setTimeout(function(){
							$('#carrot_count').text(game.gathered_carrots+'/'+game.total_carrots);
						}, 500);
						socket.emit('register_player');
						$('#loading_game').fadeOut(250);
						game.draw_background();
						game.sounds['cave'].loop().play();
						game.draw_torches(false);
						game.run();
					})
				});
			});
		});

	},
	run: function(){
		game.timestamp = Date.now();
		game.delta = game.timestamp-game.last_time;
		// console.log(game.delta_value);

		if((game.timestamp - game.frame_log_time) >= 1000){
			if (game.frame_i >= 58) {
				$('#fps').css({color: 'green'}).text('(Perfect) ~'+game.frame_i+' FPS');
			} else if(game.frame_i >= 45) {
				$('#fps').css({color: 'YellowGreen'}).text('(Playable) ~'+game.frame_i+' FPS');
			} else if(game.frame_i >= 35) {
				$('#fps').css({color: 'orange'}).text('(Barely playable) ~'+game.frame_i+' FPS');
			} else {
				$('#fps').css({color: 'red'}).text('(Lagging) ~'+game.frame_i+' FPS');
			}
			game.frame_log_time = game.timestamp;
			game.frame_i = 1;
		} else {
			game.frame_i++;
		}

		draw_loop = requestAnimFrame(game.run);
		game.player_buffer[game.player_id] = game.tick(game.player_buffer[game.player_id], player_actions, game.sprite_data);
		game.draw();
		game.last_time = game.timestamp;

		game.socket.emit('player_data', { id: game.player_id, data: game.player_buffer[game.player_id] });
	},
	cancel_attack: function(){
		player_actions.attack = 0;
		game.player_buffer[game.player_id]['sy'] = 0;
		game.player_buffer[game.player_id]['sx'] = 0;
	},
	load_sprites: function(callback){
		var sprites_loaded = 0;
		for (var i = game.sprites.length - 1; i >= 0; i--) {
			game.sprite_obj[game.sprites[i]] = new Image();
			game.sprite_obj[game.sprites[i]].src = '/images/'+game.sprites[i]+'.png';
			game.sprite_obj[game.sprites[i]].onload = function(){
				if(sprites_loaded+1 == game.sprites.length){
					callback();
				} else {
					sprites_loaded++;
				}
			};
		};
	},
};