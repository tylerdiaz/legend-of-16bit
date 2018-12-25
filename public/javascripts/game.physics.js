var physics = {
	// TODO: if the
	gravity: function(id, data){
		data = this.block_check(id, data);
		return data;
	},
	gravity_pull: function(id, data){
		// Gravity stuff
		var fall_speed = game.calculate_speed(1.5);
		if (game.local_data[id].feet_block != 'ladder') {
			if (game.local_data[id].falling_speed > 0) {
				fall_speed = game.calculate_speed(1.5+game.local_data[id].falling_speed);
			} else {
				fall_speed = game.calculate_speed(1.5);
			}
		}

		fall_speed = Math.min(game.grid_size-1, fall_speed); // terminal velocity

		data.y -= fall_speed;

		return data;
	},
	block_landing: function(id, data){
		if (game.local_data[id].falling_speed > 0) {
			if(~~game.local_data[id].falling_speed > 6){
				data.hp -= ~~(game.local_data[id].falling_speed/3);
				game.sounds['fall'].play();
			}
			game.local_data[id].falling_speed = 0;
		}

		return data;
	},
	block_check: function(id, data){
		// Prevent from trying this on block one
		if (data.fgy >= ~~(game.height/game.grid_size)) return data;

		var bottom_counter = -1;
		if (data.d == 'l') bottom_counter = 1;
		var direction_predict = (data.d == 'l' ? -1 : 1);
		var feet_block_location = data.fgx-direction_predict;

		var solid_block = game.get_block_data(feet_block_location, data.fgy).solid;
		var matching_blocks = (game.map[data.fgx][data.fgy] == game.map[data.fgx+bottom_counter][data.fgy]);
		var blocking_overhead = game.get_block_data(data.fgx, data.tgy-1).solid;

		if(solid_block && matching_blocks && ! blocking_overhead){
			data.y = ~~game.height-Math.round(data.fgy*game.grid_size);
			data = this.block_landing(id, data);
		} else {
			if(game.get_block_data(data.fgx+bottom_counter, data.fgy).solid && ! blocking_overhead){
				data.y = game.height-Math.round(data.fgy*game.grid_size);
				data = this.block_landing(id, data);
			} else if(solid_block && ! blocking_overhead) {
				data.y = game.height-Math.round(data.fgy*game.grid_size);
				data = this.block_landing(id, data);
			} else if(solid_block) {
				data.y = game.height-Math.round(data.fgy*game.grid_size);
				data = this.block_landing(id, data);
			} else {
				data = this.gravity_pull(id, data);
			}
		}

		return data;
	}
}

jQuery.extend(true, game, {physics: physics});