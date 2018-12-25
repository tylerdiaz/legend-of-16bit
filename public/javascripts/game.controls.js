var player_actions = {
	move_right: 0,
	move_left: 0,
	attack: 0,
	jump: 0,
	keys: 0,
	sprint_left: 0,
	sprint_right: 0,
	sprint_left_interval: false,
	sprint_right_interval: false,
	active: 0
};


game.controls = {
	bind: function(){
		$(window).unbind('keydown');
		$(window).unbind('keyup');
		$(window).bind('keydown', this.keydown);
		$(window).bind('keyup', this.keyup);
	},
	keyup: function(e){
	    if(e.keyCode == 87 || e.keyCode == 38 || e.keyCode == 32){
	    	if(player_actions.jump) player_actions.keys--;
	    }
	    if(e.keyCode == 83 || e.keyCode == 40){
	    	if(player_actions.attack) player_actions.keys--;
	    }
	    if(e.keyCode == 65 || e.keyCode == 37){
	    	if(player_actions.move_left) player_actions.keys--;
	    	player_actions.move_left = 0;
	    	game.sounds['walk'].stop();
	    	game.sounds['run'].stop();
	    	if(player_actions.sprint_left == 2) player_actions.sprint_left = 0;
	    }
	    if(e.keyCode == 68 || e.keyCode == 39){
	    	if(player_actions.move_right) player_actions.keys--;
	    	player_actions.move_right = 0;
	    	game.sounds['walk'].stop();
	    	game.sounds['run'].stop();
	    	if(player_actions.sprint_right == 2) player_actions.sprint_right = 0;
	    }
	},
	keydown: function(e){
		switch(e.keyCode){
			case 49:
				game.config.physics = !game.config.physics;
			break;
			case 50:
				game.config.cam = !game.config.cam;
				game.foreground_canvas.clearRect(0, 0, game.sprite_data._w, game.sprite_data._h)
			break;
			case 87:
			case 38:
			case 32:
				player_actions.keys++;
				if(~~player_actions.jump == 0 && game.local_data[game.player_id].block != 'air'){
					player_actions.jump = 12;
					game.sounds['walk'].mute();
					game.sounds['run'].mute();
				}
			break;
			case 83:
			case 40:
				if( ! player_actions.move_down) player_actions.keys++;
				if(Math.max(player_actions.attack, 0) == 0){
					player_actions.attack = 10;
				}
			break;
			case 65:
			case 37:
				if( ! player_actions.move_left){
					player_actions.keys++;

					clearTimeout(player_actions.sprint_left_interval);
					if(player_actions.sprint_left == 1){
						player_actions.sprint_left = 2;
						game.sounds['walk'].pause();
						game.sounds['run'].unmute().loop().play();
					} else {
						game.sounds['walk'].unmute().loop().play();
						game.sounds['run'].stop();
						player_actions.sprint_left = 1;
						player_actions.sprint_left_interval = setTimeout(function(){
							player_actions.sprint_left = 0;
						}, 200);
					}
				}

				player_actions.move_left = 1;
			break;
			case 68:
			case 39:
				if( ! player_actions.move_right){
					player_actions.keys++;

					clearTimeout(player_actions.sprint_right_interval);
					if(player_actions.sprint_right == 1){
						player_actions.sprint_right = 2;
						game.sounds['walk'].pause();
						game.sounds['run'].unmute().loop().play();
					} else {
						game.sounds['walk'].unmute().loop().play();
						game.sounds['run'].stop();
						player_actions.sprint_right = 1;
						player_actions.sprint_right_interval = setTimeout(function(){
							player_actions.sprint_right = 0;
						}, 200);
					}
				}

				player_actions.move_right = 1;
			break;
		}
	}
}

game.controls.bind();