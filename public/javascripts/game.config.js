var game_config = {
	socket: false,
	width: 2500,
	height: 1500,
	visible_width: 500,
	visible_height: 312,
	frame_i: 0,
	frame_log_time: 0,
	delta_value: 0,
	running_fps: 60,
	fps: 0,
	socket: false,
	sprite_data: { w: 113, h: 90, _w: 35, _h: 83 },
	player_id: 0,
	gravity_value: 0.3,
	default_data: {
		type: 'player',
		id: 0,
		img: 's'+rand(1, 26),
		x: 0,
		y: 0,
		d: 'r',
		sx: 0, // sprite x
		sy: 0, // sprite y
		gx: 0, // grid x
		gy: 0, // grid y
		fgx: 0, // feet grid x
		fgy: 0, // feet grid y
		tgx: 0, // top grid x
		tgy: 0, // top grid y
		yv: 0, // Y velocity
		hp: 20,
		a: 2, // attack
		re: 0 // regenerate
	},
	default_local_data: {
		speed: 3,
		attack_speed: 0.5,
		regen_health: 0,
		xcam: 0,
		ycam: 0,
		falling_speed: 0,
		attack_flash: 0,
		queue: {
			x: 0,
			y: 0
		},
		block: 'air',
		visible_monsters: 0
	},
	grid_size: 10,
	mobile: false,
	local_data: {},
	particles: [],
	config: {
		physics: false,
		cam: false
	},
}

jQuery.extend(true, game, game_config);