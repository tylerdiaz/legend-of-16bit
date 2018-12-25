var flow = {
	calculate_speed: function(speed){
		var new_speed = (speed * game.delta) * (game.running_fps / 1000);
		return ( ! isNaN(new_speed) ? new_speed : speed);
	}
}

jQuery.extend(true, game, flow);