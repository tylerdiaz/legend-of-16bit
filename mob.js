var Canvas = require('canvas'),
canvas = Canvas.createCanvas(200,200),
ctx = canvas.getContext('2d'),
Image = Canvas.Image,
fs = require('fs');

console.log(global.players);
var mobs = {
	width: 2500,
	height: 1500,
	grid_size: 10,
	monsters: {},
	sprite_data: { w: 113, h: 90, _w: 35, _h: 83 },
	map: [],
	local_data: {
		speed: 3,
		attack_speed: 0.5,
		regen_health: 0,
	},
	monster: {
		sprite_data: { w: 65, h: 80, _w: 50, _h: 83 },
		parse_physics: function(monster, callback){
			callback(monster);
		},
		parse_brain: function(monster, callback){

			if (monster['ml'] <= 0 && monster['mr'] <= 0) {
				if(rand(1, 4) == 4 && monster['ml'] <= 0){
					monster['mr'] = rand(5, 50);
				} else if(rand(1, 4) == 2 && monster['mr'] <= 0){
					monster['ml'] = rand(5, 50);
				}
			};

			callback(monster);
		},
	},
	parse_physics: function(bot, callback){
		var solid_blocks = this.solid_blocks = [127];
		var bonus_speed = 0;
		var cached_y = bot.y;

		var moving_left = bot.ml;
		var moving_right = bot.mr;

		if(moving_left){
			var direction = 'l';
			bot.ml--;
			bot['sy'] = 0;

			if(bot.sl == 2 && bot['re'] > 3){
				bonus_speed = 4;
				bot.re -= 4;
			}

			var blocking = 1;
			var direction_predict = (direction == 'l' ? -1 : 1);

			if (typeof mobs.map[bot.fgx+direction_predict] !== 'undefined' && typeof mobs.map[bot.fgx+direction_predict][bot.tgy] !== 'undefined' && mobs.solid_blocks.indexOf(mobs.map[bot.fgx+direction_predict][bot.tgy])+1) {
				blocking = 2;
			} else {
				if (typeof mobs.map[bot.fgx] !== 'undefined' && typeof mobs.map[bot.fgx][bot.fgy-1] !== 'undefined') {
					if (typeof mobs.map[bot.fgx] !== 'undefined' && typeof mobs.map[bot.fgx][bot.tgy-1] !== 'undefined') {
						blocking = (solid_blocks.indexOf(mobs.map[bot.fgx][bot.fgy-1])+1 || solid_blocks.indexOf(mobs.map[bot.fgx][bot.tgy-1])+1 > 0);
					} else {
						blocking = 0;
					}
				} else {
					blocking = 0;
				}
			}

			if( ! blocking){
				bot.x -= bonus_speed+mobs.local_data.speed;
			} else {
				if(blocking != 2) bot.y += mobs.grid_size;
			}

			bot.sx += 0.25;
			bot.d = 'l';
		} else if(moving_right){
			var direction = 'r';
			bot.mr--;
			bot['sy'] = 0;

			if(bot.sr == 2 && bot.re > 3){
				bonus_speed = 4;
				bot.re -= 4;
			}
			var blocking = 1;
			var direction_predict = (direction == 'l' ? -1 : 1);

			if (typeof mobs.map[bot.fgx+direction_predict] !== 'undefined' && typeof mobs.map[bot.fgx+direction_predict][bot.tgy] !== 'undefined' && mobs.solid_blocks.indexOf(mobs.map[bot.fgx+direction_predict][bot.tgy])+1) {
				blocking = 2;
			} else {
				if (typeof mobs.map[bot.fgx] !== 'undefined' && typeof mobs.map[bot.fgx][bot.fgy-1] !== 'undefined') {
					if (typeof mobs.map[bot.fgx] !== 'undefined' && typeof mobs.map[bot.fgx][bot.tgy-1] !== 'undefined') {
						blocking = (solid_blocks.indexOf(mobs.map[bot.fgx][bot.fgy-1])+1 || solid_blocks.indexOf(mobs.map[bot.fgx][bot.tgy-1])+1 > 0);
					} else {
						blocking = 0;
					}
				} else {
					blocking = 0;
				}
			}

			if( ! blocking){
				bot.x += bonus_speed+mobs.local_data.speed;
			} else {
				if(blocking != 2) bot.y += mobs.grid_size;
			}

			bot.sx += 0.25;
			bot.d = 'r';
		}

		// Jumping
		if(bot.jp > 0){
			if(~~(bot.jp-1) == 0){
				bot.jp = 0;
			} else {
				var blocking = true;
				if (typeof mobs.map[bot.fgx] !== 'undefined' && typeof mobs.map[bot.fgx][bot.tgy-1] !== 'undefined') {
					blocking = (solid_blocks.indexOf(mobs.map[bot.fgx][bot.tgy-1])+1);
				} else {
					blocking = true;
				}

				if( ! blocking){
					bot.y += bot.jp*(bot.jp/23);
					bot.re -= 1;
					bot.jp -= 0.45;
				} else {
					bot.y += 1.75;
					bot.jp = 0;
				}

			}
		}

		// Gravity stuff
		if (bot.fs > 0) {
			bot.y -= (1.75+bot.fs);
		} else {
			bot.y -= 1.75;
		}

		// Auto recover if energy is full
		if(bot.re+1 == 300 && bot.hp != 20){
			bot.rh += 0.05;
			if(~~(bot.rh) == 5){
				bot.rh = 0;
				bot.hp++;
			}
		} else {
			if(bot.re+1 == 300 && bot.hp == 20){
			} else {
				bot.re++;
			}
		}

		// Post process
		bot.re %= 300;
		bot.hp = (20 < bot.hp ? 20 : bot.hp);
		bot.gx = ~~(bot.x/mobs.sprite_data._w);
		bot.gy = ~~(bot.y/mobs.sprite_data._h);

		if(bot.d == 'l'){
			bot.fgx = ~~(0.5+((bot.x)/mobs.grid_size)+1);
			bot.tgx = ~~(0.5+((bot.x)/mobs.grid_size));
		} else {
			bot.fgx = ~~(0.5+((bot.x+mobs.sprite_data._w)/mobs.grid_size)-1);
			bot.tgx = ~~((bot.x+mobs.sprite_data._w)/mobs.grid_size);
		}

		bot.fgy = ~~((mobs.height-bot.y)/mobs.grid_size);
		bot.tgy = ~~((mobs.height-bot.y-(mobs.sprite_data._h-(mobs.sprite_data._h >> 1)))/mobs.grid_size);

		bot.x = (0 > bot.x ? 0 : (mobs.width-mobs.sprite_data._w < bot.x ? mobs.width-mobs.sprite_data._w : bot.x));
		bot.y = (0 > bot.y ? 0 : bot.y);

		// Prevent from trying this on block one, and when you start jumping
		if (bot.fgy < ~~(mobs.height/mobs.grid_size) && ~~(bot.jp) < 7) {
			var bottom_counter = -1;
			if (bot.d == 'l') bottom_counter = 1;

			var solid_block = 0;
			var matching_blocks = 0;
			var blocking_overhead = 0;
			if (typeof mobs.map[bot.fgx] !== 'undefined' && mobs.map[bot.fgx][bot.fgy] !== 'undefined') {
				solid_block = solid_blocks.indexOf(mobs.map[bot.fgx][bot.fgy])+1;
				matching_blocks = (mobs.map[bot.fgx][bot.fgy] == mobs.map[bot.fgx+bottom_counter][bot.fgy]);
			};

			if (typeof mobs.map[bot.fgx] !== 'undefined' && typeof mobs.map[bot.fgx][bot.tgy-1] !== 'undefined') {
				blocking_overhead = solid_blocks.indexOf(mobs.map[bot.fgx][bot.tgy-1])+1;
			};

			if(solid_block && matching_blocks && ! blocking_overhead){
				bot.y = ~~mobs.height-Math.round(bot.fgy*mobs.grid_size);
				if (bot.fs > 0) {
					if(~~bot.fs > 4) bot.hp -= ~~(bot.fs/3);
					bot.fs = 0;
				}
			} else {
				if(typeof mobs.map[bot.fgx+bottom_counter] !== 'undefined' && solid_blocks.indexOf(mobs.map[bot.fgx+bottom_counter][bot.fgy])+1 && ! blocking_overhead){
					bot.y = mobs.height-Math.round(bot.fgy*mobs.grid_size);
					if (bot.fs > 0) {
						if(~~bot.fs > 4) bot.hp -= ~~(bot.fs/3);
						bot.fs = 0;
					}
				} else if(solid_block && ! blocking_overhead) {
					bot.y = mobs.height-Math.round(bot.fgy*mobs.grid_size);
					if (bot.fs > 0) {
						if(~~bot.fs > 4) bot.hp -= ~~(bot.fs/3);
						bot.fs = 0;
					}
				}
			}
		}

		if(cached_y != bot.y){
			if(~~(bot.jp) == 0) bot.fs += 0.4;
		} else {
			bot.fs = 0;
		}

		callback(bot);
	},
	parse_brain: function(bot, callback){
		if(rand(1, 10) == 4){
			bot['jp'] = 10;
		}

		// stop sprint!
		if (rand(1, 3) == 3) {
			bot['sl'] = 0;
			bot['sr'] = 0;
		};

		if (bot['ml'] <= 0 && bot['mr'] <= 0) {
			if(rand(1, 4) == 4 && bot['ml'] <= 0){
				bot['mr'] = rand(5, 50);
			} else if(rand(1, 4) == 2 && bot['mr'] <= 0){
				bot['ml'] = rand(5, 50);
			}
		};

		if (rand(1, 2) == 2 && bot['jp'] <= 0) {
			if (bot['sl'] == 0 && rand(1, 5) == 5) {
				bot['sl'] = 2;
			} else if (bot['sr'] == 0 && rand(1, 5) == 5) {
				bot['sr'] = 2;
			}
		};

	},
	load_map: function(callback){
		mobs.map = [];
		for(var x = 0; x < ~~(mobs.height/mobs.grid_size); x++) {
			mobs.map[x] = new Int16Array(~~(mobs.width/mobs.grid_size));
		}

		var map_image, img_data = [];
		fs.readFile('public/maps/map1.png', function(err, map_image){
			if (err) throw err;
			img = new Image;
			img.src = map_image;

			map_canvas = Canvas.createCanvas(~~(mobs.width/mobs.grid_size),~~(mobs.height/mobs.grid_size));
			ctx = map_canvas.getContext("2d");
			ctx.drawImage(img, 0, 0);
			img_data = ctx.getImageData(0, 0, map_canvas.width, map_canvas.height);
			map_canvas.width = ~~(mobs.width/mobs.grid_size);
			map_canvas.height = ~~(mobs.height/mobs.grid_size);
			img_array = img_data.data;

			for(var x = 0; x < ~~(mobs.width/mobs.grid_size); x++) {
				var hot_array = new Int16Array(~~(mobs.height/mobs.grid_size));
				for(var y = 0; y < ~~(mobs.height/mobs.grid_size); y++) {
					var red = img_array[((~~(mobs.width/mobs.grid_size) * y) + x) * 4];
					var green = img_array[((~~(mobs.width/mobs.grid_size) * y) + x) * 4 + 1];
					var blue = img_array[((~~(mobs.width/mobs.grid_size) * y) + x) * 4 + 2];
					var alpha = img_array[((~~(mobs.width/mobs.grid_size) * y) + x) * 4 + 3];

					red *= 1.5;
					green *= 2;
					blue *= 2.5;
					alpha *= 0.5;

					hot_array[y] = (~~(alpha+red+green+blue));
				}
				mobs.map[x] = new Int16Array(hot_array);
			}

			callback(mobs.map);
		});
	},
	load_elements: function(){
		var rows = ~~(mobs.height/mobs.grid_size);
		var cols = ~~(mobs.width/mobs.grid_size);
		var colors_loaded = {};

		for(var x = 0; x < cols; x++) {
			for(var y = 0; y < rows; y++) {
				if (mobs.map[x][y] > 0) {
					colors_loaded[mobs.map[x][y]] = 1;
					switch(mobs.map[x][y]){
						case 510:
							mobs.monsters[x+':'+y] = {
								name: 'rat',
								x: (x*mobs.grid_size),
								y: (y*mobs.grid_size),
								gx: 0,
								gy: 0,
								fgx: x,
								fgy: y,
								sx: 0,
								sy: 0,
								d: 'r',
								w: 65,
								h: 80,
								hp: 10,
								mhp: 10, // max hp
								lvl: 1,
								mr: 0, // moving right
								ml: 0, // movign left
								fs: 0, // falling speed
								a: 2, // attack
								as: 0.5, // attack speed
								re: 0, // regenerate
								jp: 0, // jumping
								s: 3, // speed
							};
							console.log('summon monsters at', x, y);
							// Server parses this to have a monster.
						break;
					}
				}
			}
		}

		console.log(Object.keys(colors_loaded));
	},

}

module.exports = mobs;

function rand (min, max) {
	return ~~(Math.random() * (max - min + 1)) + min;
}