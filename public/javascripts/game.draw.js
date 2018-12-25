game.draw = function(){
	var ctx = game.virtual_runnable;
	var lines = game.config.physics;
	var edge_compensation = 5;

	ctx.clearRect(0, 0, game.visible_width+(edge_compensation << 1), game.visible_height);

	var keys = Object.keys(game.player_buffer);

	while( i = keys.pop() ) {
		var player = game.player_buffer[i];

		if(typeof game.sprite_obj[player.img] !== 'object') continue;

		var reverse_y = (game.height-player.y)

		// game.local_data[game.player_id].xcam

		var x_draw_limit = (player.x+game.sprite_data._w > game.local_data[game.player_id].xcam && player.x < game.local_data[game.player_id].xcam+game.visible_width);
		var y_draw_limit = (reverse_y+game.sprite_data._h > game.local_data[game.player_id].ycam && reverse_y-game.sprite_data._h < game.local_data[game.player_id].ycam+game.visible_height);
		if ( ! x_draw_limit || ! y_draw_limit && i !== game.player_id) continue;

		var x_location = ~~(player.x-game.sprite_data._w+0.5)-~~(game.local_data[game.player_id].xcam+0.5);
		var y_location = ~~(game.height-player.y-game.sprite_data._h+0.5)-~~(game.local_data[game.player_id].ycam+0.5);

		if (typeof game.sprite_obj[player.img] !== 'undefined') {
			ctx.drawImage(game.sprite_obj[player.img], game.sprite_data.w*Math.floor(player.sx % 8), (Math.floor(player.sy % 4)+(player.d == 'l' ? 4 : 0))*game.sprite_data.h, game.sprite_data.w, game.sprite_data.h, x_location, y_location, game.sprite_data.w, game.sprite_data.h);
		} else {
			// try to load the image?
		}

		var item_keys = Object.keys(game.items), key, item_size = 20;
		while( key = item_keys.pop() ) {
			if(typeof game.items[key].float == 'undefined') game.items[key].float = 0;
			var x_draw_limit = (game.items[key].x+item_size > game.local_data[game.player_id].xcam && game.items[key].x-item_size < game.local_data[game.player_id].xcam+game.visible_width);
			var y_draw_limit = (game.items[key].y+item_size > game.local_data[game.player_id].ycam && game.items[key].y-item_size < game.local_data[game.player_id].ycam+game.visible_height);

			game.items[key].float += 0.075;
			game.items[key].y = (game.items[key].y)+(Math.sin(game.items[key].float) / 3);

			if ( ! x_draw_limit || ! y_draw_limit) continue;

			ctx.drawImage(game.block_images[game.items[key].title], game.items[key].x-game.local_data[game.player_id].xcam, game.items[key].y-game.local_data[game.player_id].ycam);
		}

		var monster_keys = Object.keys(game.monster_buffer), monster;
		game.local_data[game.player_id].visible_monsters = 0;
		while( monster = monster_keys.pop() ) {
			var monster_data = game.monster_buffer[monster];
			var x_draw_limit = (monster_data['x']+monster_data['w'] > game.local_data[game.player_id].xcam && monster_data['x']-monster_data['w'] < game.local_data[game.player_id].xcam+game.visible_width);
			var y_draw_limit = (monster_data['y']+monster_data['h'] > game.local_data[game.player_id].ycam && monster_data['y']-monster_data['h'] < game.local_data[game.player_id].ycam+game.visible_height);
			if ( ! x_draw_limit || ! y_draw_limit) continue;

			game.local_data[game.player_id].visible_monsters++;

			var sourceX = monster_data['w']*Math.floor(monster_data['sx'] % 8),
				sourceY = (Math.floor(monster_data['sy'] % 4)+(monster_data['d'] == 'l' ? 4 : 0))*monster_data['h'],
				sourceWidth = monster_data['w'],
				sourceHeight = monster_data['h'],
				destY = monster_data['y']-(sourceHeight)-game.local_data[game.player_id].ycam,
				destX = monster_data['x']-(sourceWidth)-game.local_data[game.player_id].xcam;

			ctx.drawImage(game.monster_images[monster_data.name], sourceX, sourceY, sourceWidth, sourceHeight, destX, destY, sourceWidth, sourceHeight);

			// TODO: maybe draw some kind of small life bar above the monster's head?
		}
	}

	// particles
	// for (var i = game.particles.length - 1; i >= 0; i--) {
	// 	ctx.globalAlpha = game.particles[i][2];
	// 	ctx.fillStyle = "hsl("+game.particles[i][4]+", 100%, 50%)";
	// 	ctx.fillRect(Math.round(game.particles[i][0]), Math.round(game.height-game.particles[i][1]), game.particles[i][3], game.particles[i][3]);
	// };

	ctx.globalAlpha = 1;

	var sub_x_limit = ~~(Math.min(Math.max(game.local_data[game.player_id].xcam, 1), (game.width-game.visible_width))+0.5);
	var ftx = game.final_canvas;
	ftx.clearRect(0, 0, game.visible_width, game.visible_height);

	// Render all virtual canvases into the final canvas
	ftx.drawImage(game.virtual_background_canvas, sub_x_limit, game.local_data[game.player_id].ycam, game.visible_width, game.visible_height, 0, 0, game.visible_width, game.visible_height);
	ftx.drawImage(game.virtual_runnable_canvas, 0, 0, game.visible_width, game.visible_height, 0, 0, game.visible_width, game.visible_height);
	ftx.drawImage(game.virtual_shadow_canvas, sub_x_limit, game.local_data[game.player_id].ycam, game.visible_width, game.visible_height, 0, 0, game.visible_width, game.visible_height);

	if (game.local_data[game.player_id].attack_flash) {
		ftx.fillStyle = "rgba(255, 0, 0, "+(game.local_data[game.player_id].attack_flash/60)+")";
		ftx.fillRect(0, 0, game.visible_width, game.visible_height);

		if(~~game.local_data[game.player_id].attack_flash-1 == 0){
			game.local_data[game.player_id].attack_flash = 0;
		} else {
			game.local_data[game.player_id].attack_flash--;
		}
	}

}