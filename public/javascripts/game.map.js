var map = {
	// This function is provided in the server, it's obsolete here
	load_map: function(callback){
		game.map = [];
		for(var x = 0; x < ~~(game.height/game.grid_size); x++) {
			game.map[x] = new Int16Array(~~(game.width/game.grid_size));
		}

		var map_image, img_data = [], map_canvas = document.createElement('canvas');
		map_image = new Image();
		map_image.src = '/maps/map4.gif';
		map_image.onload = function(){
			ctx = map_canvas.getContext("2d");
			ctx.drawImage(map_image, 0, 0);
			img_data = ctx.getImageData(0, 0, map_canvas.width, map_canvas.height);
			map_canvas.width = img_data.width;
			map_canvas.height = img_data.height;
			img_array = img_data.data;

			for(var x = 0; x < img_data.width; x++) {
				var hot_array = new Int16Array(img_data.height);
				for(var y = 0; y < img_data.height; y++) {
					var red = img_array[((img_data.width * y) + x) * 4];
					var green = img_array[((img_data.width * y) + x) * 4 + 1];
					var blue = img_array[((img_data.width * y) + x) * 4 + 2];
					var alpha = img_array[((img_data.width * y) + x) * 4 + 3];

					red *= 1.5;
					green *= 2;
					blue *= 2.5;
					alpha *= 0.5;

					hot_array[y] = (~~(alpha+red+green+blue));
				}
				game.map[x] = new Int16Array(hot_array);
			}

			callback();
		};
	},
	get_block_data: function(x, y){
		return blocks[game.map[x][y]];
	},
	cast_shadow: function(ctx, x, y, size, r){
		ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';

		var shade_color = '';
		for(var i = 0; i < size; i++){
			shade_color = (0.4-((i/size)/2.5))+(r/7)+(Math.random() % 0.1);
			ctx.fillStyle = 'rgba(0, 0, 0, '+shade_color+')';
			ctx.fillRect(game.grid_size*(x), game.grid_size*(y+i), game.grid_size, game.grid_size);
			if(r) game.cast_shadow((x), (y+i), 1, 0);
		}
		for(var i = 0; i < size; i++){
			shade_color = (0.4-((i/size)/2.5))+(r/7)+(Math.random() % 0.1);
			ctx.fillStyle = 'rgba(0, 0, 0, '+shade_color+')';
			ctx.fillRect(game.grid_size*(x), game.grid_size*(y-i), game.grid_size, game.grid_size);
			if(r) game.cast_shadow((x), (y-i), 1, 0);
		}
		for(var i = 0; i < size; i++){
			shade_color = (0.4-((i/size)/2.5))+(r/7)+(Math.random() % 0.1);
			ctx.fillStyle = 'rgba(0, 0, 0, '+shade_color+')';
			ctx.fillRect(game.grid_size*(x+i), game.grid_size*(y), game.grid_size, game.grid_size);
			if(r) game.cast_shadow((x+1), (y), 1, 0);
		}
		for(var i = 0; i < size; i++){
			shade_color = (0.4-((i/size)/2.5))+(r/7)+(Math.random() % 0.1);
			ctx.fillStyle = 'rgba(0, 0, 0, '+shade_color+')';
			ctx.fillRect(game.grid_size*(x-i), game.grid_size*(y), game.grid_size, game.grid_size);
			if(r) game.cast_shadow((x-1), (y), 1, 0);
		}
	},
	draw_background: function(){
		var rows = ~~(game.height/game.grid_size);
		var cols = ~~(game.width/game.grid_size);
		var ctx = game.virtual_background;
		game.torches = [];
		var colors_loaded = {};

		game.virtual_shadow.globalAlpha = 1;
		game.virtual_shadow.globalCompositeOperation = "source-over";
		game.virtual_shadow.fillStyle = 'rgba(0, 0, 0, 1)';
		game.virtual_shadow.fillRect(0, 0, game.width, game.height);

		for(var x = 0; x < cols; x++) {
			for(var y = 0; y < rows; y++) {
				// console.log(x, y);
				if (game.map[x][y] > 0) {
					colors_loaded[game.map[x][y]] = 1;
					switch(game.map[x][y]){
						case 127:
							ctx.fillStyle = '#111';
							ctx.fillRect(game.grid_size*x, game.grid_size*y, game.grid_size, game.grid_size);
							game.cast_shadow(ctx, x, y, 2, 0);
						break;
						case 766:
						case 804:
							game.torches.push([game.grid_size*x, game.grid_size*y, rand(1, 2), rand(3, 9)]);
						break;
						case 1275:
						case 1271:
						case 1324:
							var y_start = (game.height-(y*game.grid_size));
							game.default_data['x'] = x*game.grid_size;
							game.default_data['y'] = y_start;
							console.log(y_start, game.default_data['y'], game.default_data);
						break;
						case 688:
						case 789:
							// ladder time. o _o
							var ladder_block = game.map[x][y];
							if(game.map[x-1][y] == ladder_block && game.map[x+1][y] == ladder_block && game.map[x][y+1] == ladder_block){
								ctx.drawImage(game.block_images[blocks[ladder_block]['title']], game.grid_size*(x-1), game.grid_size*y+1);
							}
						break;
						case 510:
							// Server parses this to have a monster.
							game.map[x][y] = 0;
						break;
						case 1020:
						case 1012:
							game.total_carrots++;
							game.items[x+':'+y] = {
								title: blocks[game.map[x][y]]['title'],
								x: game.grid_size*(x),
								y: game.grid_size*(y-2),
								gx: x,
								gy: y,
								float: 0
							}
						break;
					}
				}
			}
		}

		console.log(Object.keys(colors_loaded));
	},
	load_block_images: function(callback){
		var sprites_loaded = 0;
		var sprites_to_load = 0;
		var keys = Object.keys(blocks), len = keys.length, i = 0;

		while (i < len) {
			if(typeof blocks[keys[i]]['img'] == 'undefined'){
				i++;
				continue;
			}

			sprites_to_load++;

			game.block_images[blocks[keys[i]]['title']] = new Image();
			game.block_images[blocks[keys[i]]['title']].src = blocks[keys[i]]['img'];
			game.block_images[blocks[keys[i]]['title']].onload = function(){
				if(sprites_loaded+1 == sprites_to_load){
					callback();
				} else {
					sprites_loaded++;
				}
			};
			i++;
		}
	},
	draw_torches: function(cam_check){
		var ctx = game.virtual_background;
		var s_ctx = game.virtual_shadow;
		var player = game.player_buffer[game.player_id];

		s_ctx.globalCompositeOperation = "destination-out";

		var max_glow_radius = 30;

		var cam_checked = [];
		for (var i = game.torches.length - 1; i >= 0; i--) {
			if (cam_check) {
				var x_draw_limit = (game.torches[i][0]+(max_glow_radius*2) > game.local_data[game.player_id].xcam && game.torches[i][0] < game.local_data[game.player_id].xcam+game.visible_width);
				var y_draw_limit = (game.torches[i][1]+(max_glow_radius*2) > game.local_data[game.player_id].ycam && game.torches[i][1] < game.local_data[game.player_id].ycam+game.visible_height);
				if ( ! x_draw_limit || ! y_draw_limit){
					cam_checked[i] = true;
					continue;
				} else {
					cam_checked[i] = false;
				}
			}
		};

		for (var i = game.torches.length - 1; i >= 0; i--) {
			var glow_radius = max_glow_radius;

			if ( ! cam_check) {
				var bonus_fade = 2.3;
				var light_radius = max_glow_radius*bonus_fade;
				var color_light = (rand(1, 2) == 1);
				s_ctx.globalAlpha = 1;
				while(light_radius){
					s_ctx.beginPath();
					s_ctx.globalAlpha = (1-(light_radius/(max_glow_radius*bonus_fade)))/5;
					s_ctx.arc(game.torches[i][0], game.torches[i][1], (light_radius*bonus_fade), 0, (2 * Math.PI), false);
					s_ctx.fill();
					s_ctx.closePath();

					light_radius -= 3;
				}
			}

			if (cam_check && cam_checked[i]) continue;

			var yellow_shade = time_shade = ~~(Math.cos(game.timestamp % (game.torches[i][3]*1000) / (game.torches[i][3]*1000) * Math.PI * 2)*20);

			ctx.fillStyle = "#19110d"
			ctx.fillRect(game.torches[i][0]-2, game.torches[i][1], 4, 26);

			while(glow_radius){
				if (game.torches[i][2] == 1) {
					ctx.fillStyle = 'rgba(255, '+(220+yellow_shade-(glow_radius*6))+', 0, '+(1-(glow_radius/max_glow_radius))/2+')';
				} else if(game.torches[i][2] == 2) {
					ctx.fillStyle = 'rgba(255, '+(160+yellow_shade-(glow_radius*6))+', 0, '+(1-(glow_radius/max_glow_radius))/2+')';
				}

				ctx.beginPath();
				ctx.arc(game.torches[i][0], game.torches[i][1], glow_radius, 0 , 2 * Math.PI, false);
				ctx.fill();
				ctx.closePath();
				glow_radius -= 3;
			}
		};
	}

}

jQuery.extend(true, game, map);