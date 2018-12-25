var tick = {
	tick: function(player, player_actions, sprite_data){
		// var player_local_data = player_local_data;
		var player_local_data = this.local_data[this.player_id];

		var bonus_speed = 0,
			ignore_cam = false,
			cached_y = player.y,
			cached_hp = player.hp,
			moving_left = (player_actions.move_left || player_local_data.queue.x < 0),
			moving_right = (player_actions.move_right || player_local_data.queue.x > 0);

		// Time to account for block measuring
		var direction_predict = (player.d == 'l' ? -1 : 1);
		var feet_block_location = player.fgx-direction_predict;

		if (feet_block_location > 0 && feet_block_location <= ~~(this.width/this.grid_size)) {
			player_local_data.feet_block = blocks[this.map[feet_block_location][player.fgy-1]]['title'];
			player_local_data.block = blocks[this.map[feet_block_location][player.fgy]]['title'];
		}

		// Moving from side to side
		if(moving_left){
			if((0 > player_actions.attack ? 0 : player_actions.attack)) this.cancel_attack();

			if(player_actions['sprint_left'] == 2 && player.re > 3){
				bonus_speed = 4;
				player.re -= 4;
			}

			var res = this.move_x('l', player, player_local_data, bonus_speed);
			player = res[0];
			ignore_cam = res[1];
		} else if(moving_right){
			if((0 > player_actions.attack ? 0 : player_actions.attack)) this.cancel_attack();

			if(player_actions['sprint_right'] == 2 && player.re > 3){
				bonus_speed = 4;
				player.re -= 4;
			}

			var res = this.move_x('r', player, player_local_data, bonus_speed);
			player = res[0];
			ignore_cam = res[1];
		}

		// did you pick up an item?
		if(player_local_data.feet_block == 'item'){
			this.gathered_carrots++;
			$('#carrot_count').text(this.gathered_carrots+'/'+this.total_carrots);
			this.sounds['pickup'].setVolume(100).play();
			this.map[feet_block_location][(player.fgy-1)] = 0;
			delete this.items[feet_block_location+':'+(player.fgy-1)];
			this.socket.emit('acquired_item', [feet_block_location, (player.fgy-1)]);
		}

		if ( ! ignore_cam && (moving_right || moving_left)) {
			var visible_x = (player.x-player_local_data.xcam);
			if((visible_x/this.visible_width) < 0.5 && player_local_data.xcam > 0){
				player_local_data.xcam -= this.calculate_speed(bonus_speed+player_local_data.speed);
			} else if((visible_x/this.visible_width) > 0.5 && player_local_data.xcam < (this.width-this.visible_width)){
				player_local_data.xcam += this.calculate_speed(bonus_speed+player_local_data.speed);
			}
		};

		// energy needed for attack (one 6th of your energy)
		var energy_limit = 50;
		if(player.re < energy_limit){
			if((0 > player_actions.attack ? 0 : player_actions.attack)) this.cancel_attack();
		}

		// Attacking
		if((0 > player_actions.attack ? 0 : player_actions.attack)){
			if (player_local_data.feet_block == 'ladder' && player_local_data.block == 'ladder') {
				this.cancel_attack();
				player.y -= this.grid_size >> 1;
			} else {
				if(player_actions.attack == 10){
					if(player.d == 'l'){
						player.sx = 8;
					} else {
						player.sx = 0;
					}
				} else if (player_actions.attack == 6){
					player.re -= energy_limit;
					if(player.d == 'l'){
						this.socket.emit('attack', player.gx-1, player.gy, player.d);
						this.socket.emit('attack', player.gx, player.gy, player.d);
					} else {
						this.socket.emit('attack', player.gx+1, player.gy, player.d);
						this.socket.emit('attack', player.gx, player.gy, player.d);
					}
				}

				player.sy = 1;

				if(player.d == 'l'){
					player.sx -= (player_local_data.attack_speed-0.1);
				} else {
					player.sx += (player_local_data.attack_speed-0.1);
				}

				player_actions.attack -= player_local_data.attack_speed;
				if((0 > player_actions.attack ? 0 : player_actions.attack) == 0){
					this.cancel_attack();
				}
			}
		}

		// Jumping
		if(player_actions.jump > 0){
			if (player_local_data.feet_block == 'ladder') {
				player_actions.jump = 0;
				player.y += this.grid_size/1.25;
			} else {
				if(~~(player_actions.jump-1) == 0){
					setTimeout(function(){
						this.sounds['walk'].unmute();
						this.sounds['run'].unmute();
					}, 100)
					player_actions.jump = 0;
				} else {
					var blocking = blocks[this.map[player.fgx][player.tgy-1]].solid;

					if( ! blocking){
						player.y += player_actions.jump*(player_actions.jump/23);
						player.re -= 1;
						player_actions.jump -= 0.45;
					} else {
						player.y += 1.75;
						player_actions.jump = 0;
					}
				}
			}
		}

		// Auto recover if energy is full
		if(player.re+1 == 300 && player.hp != 20){
			player_local_data.regen_health += this.calculate_speed(0.05);
			if(~~(player_local_data.regen_health) == 5){
				player_local_data.regen_health = 0;
				player.hp++;
				this.socket.emit('healed', 1);
			}
		} else {
			if(player.re+1 == 300 && player.hp == 20){
			} else {
				player.re += 1;
			}
		}

		// Auto adjust
		if ( ! player_actions.keys) {
			if(this.still_timeout == false) {
				this.still_timeout = setTimeout(function(){
					this.player_buffer[this.player_id]['sy'] = 0;
					if (this.player_buffer[this.player_id]['d'] == 'l') {
						this.player_buffer[this.player_id]['sx'] = 7;
					} else {
						this.player_buffer[this.player_id]['sx'] = 0;
					}
				}, 200);
			}
		} else {
			clearTimeout(this.still_timeout);
			this.still_timeout = false;
		}

		player = this.post_process(player, sprite_data);
		player = this.physics.gravity(this.player_id, player);

		// yCam logic
		if(cached_y != player.y){
			if(~~(player_actions.jump+0.5) == 0 && player_local_data.feet_block != 'ladder') player_local_data.falling_speed += this.calculate_speed(0.4);
			player_local_data.falling_speed = Math.min(this.grid_size-(this.grid_size >> 2), player_local_data.falling_speed);
			var visible_y = this.visible_height-((this.height-player.y)-player_local_data.ycam);

			if((player.y-cached_y) < 0){
				if ((visible_y/this.visible_height) < 0.5) {
					player_local_data.ycam -= (player.y-cached_y);
				} else {
					player_local_data.ycam += (player.y-cached_y);
				}
				player_local_data.ycam = Math.min(Math.max(player_local_data.ycam, 0), (this.height-this.visible_height))
			} else if((player.y-cached_y) > 0) {
				if ((visible_y/this.visible_height) < 0.5) {
					player_local_data.ycam += (player.y-cached_y);
				} else {
					player_local_data.ycam -= (player.y-cached_y);
				}
				player_local_data.ycam = Math.min(Math.max(player_local_data.ycam, 0), (this.height-this.visible_height))
			}
		} else {
			player_local_data.falling_speed = 0;
		}

		if(cached_hp > player.hp){
			player_local_data.attack_flash = 20;
			if (cached_hp <= 0) dead = true;
		}

		this.player_bars[this.player_id].left = (player.x-player_local_data.xcam)+'px';
		this.player_hp_bars[this.player_id].width = ~~(100*(player.hp/20))+'%';
		this.player_re_bars[this.player_id].width = ~~(100*(player.re/300))+'%';

		// this.particle_tick();
		var player_obj_keys = Object.keys(this.player_buffer), player_key_data;

		while( player_key_data = player_obj_keys.pop() ) {
			// this.player_buffer[player_key_data]

			for(var i = 0; i < 2; i++){
				var new_paricle = new Float32Array(9);

				new_paricle[0] = this.player_buffer[player_key_data].x+(sprite_data.w >> 3); // particle x
				new_paricle[1] = this.player_buffer[player_key_data].y+(sprite_data.h >> 2); // particle y
				new_paricle[2] = 1; // opacity
				new_paricle[3] = 3; // size
				new_paricle[4] = rand(120, 240); // color
				new_paricle[5] = rand(-1, 1); // direction x
				new_paricle[6] = rand(-1, 1); // direction y
				new_paricle[7] = 0; // gravity
				new_paricle[8] = rand(10, 100); // lifespan

				this.particles.push(new_paricle);
			}
		}

		return player;
	},
	move_x: function(direction, player, player_local_data, bonus_speed){
		player.sy = 0;

		var ignore_cam = false;
		var blocking = 1;
		var direction_predict = (direction == 'l' ? -1 : 1);

		if (blocks[this.map[player.fgx+direction_predict][player.tgy]].solid) {
			blocking = 2;
		} else {
			var feet_block = blocks[this.map[player.fgx][player.fgy-1]].solid;
			var head_block = blocks[this.map[player.fgx][player.tgy-1]].solid;
			if (feet_block && ! head_block) {
				var up_feet_block = blocks[this.map[player.fgx][player.fgy-2]].solid;
				var up_head_block = blocks[this.map[player.fgx][player.tgy-2]].solid;
				if ( ! up_feet_block && ! up_head_block && player_local_data.block != 'air') {
					blocking = 0;
					player.y += this.grid_size;
				}
			} else {
				blocking = (feet_block || head_block);
			}
		}

		if( ! blocking){
			if (direction == 'l') {
				player.x -= (this.calculate_speed(player_local_data.queue.x+bonus_speed+player_local_data.speed));
			} else {
				player.x += (this.calculate_speed(player_local_data.queue.x+bonus_speed+player_local_data.speed));
			}
		} else {
			ignore_cam = true;
		}

		player.sx += this.calculate_speed(0.25);
		player.d = direction;
		player_local_data.queue.x = 0;

		return [player, ignore_cam];
	},
	post_process: function(player, sprite_data){
		player.re %= 300;
		player.hp = (20 < player.hp ? 20 : player.hp);
		player.gx = ~~(player.x/sprite_data._w);
		player.gy = ~~(player.y/sprite_data._h);

		if(player.d == 'l'){
			player.fgx = ~~(((player.x-5)/this.grid_size)+1);
			player.tgx = ~~(0.5+((player.x)/this.grid_size));
		} else {
			player.fgx = ~~((player.x+sprite_data._w)/this.grid_size);
			player.tgx = ~~((player.x+sprite_data._w)/this.grid_size);
		}

		player.fgy = ~~((this.height-player.y)/this.grid_size);
		player.tgy = ~~((this.height-player.y-(sprite_data._h-(sprite_data._h >> 1)))/this.grid_size);

		player.x = (0 > player.x ? 0 : (this.width-sprite_data._w < player.x ? this.width-sprite_data._w : player.x));
		player.y = (0 > player.y ? 0 : player.y);

		return player;
	},
	particle_tick: function(){
		// console.log(this.particles.length);
		for (var i = this.particles.length - 1; i >= 0; i--) {
			this.particles[i][3] -= this.particles[i][8]/800;
			this.particles[i][2] -= this.particles[i][8]/800;
			this.particles[i][0] += this.particles[i][5];
			this.particles[i][1] += this.particles[i][6];

			if ( ! Math.max(this.particles[i][3], 0) ||  ! Math.max(this.particles[i][2], 0) ) {
				this.particles.splice(i, 1);
			}
		};
	}
}

jQuery.extend(true, game, tick);