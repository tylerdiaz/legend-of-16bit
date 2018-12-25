/* Module dependencies. */
var express     = require('express'),
    http        = require('http'),
    fs        = require('fs'),
    mobs        = require('./mob.js'),
    app         = express(),
    http_server = http.createServer(app),
    util        = require('util'),
    io          = require('socket.io').listen(http_server);

// --------

app.configure(function(){
	app.set('views', __dirname + '/views');
	app.set('view engine', 'ejs');
	app.engine('ejs', require('ejs-locals'));
	app.use(express.favicon(__dirname + '/public/images/favicon.ico?2'));
	app.use(express.logger('dev'));
	app.use(express.cookieParser("Xsadf4y6ju6sdfgss4"));
	app.use(express.static(__dirname + '/public'));
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(express.session({ secret: 'Xsadf4y6ju6sdfgss4' }));
	app.use(app.router);
});

app.configure('development', function(){
	app.use(express.errorHandler());
});

app.get('/', function(req, res){
    res.render('index', { title: 'Express', user: false });
});

// io.configure(function () {
// 	io.set('log level', 1);
// });

function rand (min, max) {
	return ~~(Math.random() * (max - min + 1)) + min;
}

var game = {};

mobs.load_map(function(map){
	game.map = map;
});

io.sockets.on('connection', function (socket) {
	clients[socket.id] = socket;
	socket.emit('identifier', socket.id);
	socket.on('load_map', function(fn){
		fn(game.map);
	});

	socket.on('player_data', function(obj){
		players[obj.id] = obj.data;
	});

	socket.on('disconnect', function () {
		delete players[socket.id];
		delete clients[socket.id];
		io.sockets.emit('remove_player', socket.id);
		io.sockets.emit('update_players', players);
	});

	socket.on('attack', function (grid_x, grid_y, dir) {
		var keys = Object.keys(players), len = keys.length, i = 0, recoil = 30, bonus_damage = 0;

		while (i < len) {
			if(players[keys[i]]['gx'] == grid_x && players[keys[i]]['gy'] == grid_y && keys[i] != socket.id){
				if (typeof clients[keys[i]] !== 'undefined') {

					if(players[keys[i]]['y'] > 0){
						recoil += 30;
						bonus_damage *= 2;
					}

					if (keys[i].indexOf('_px') != -1) {
						players[keys[i]]['hp'] -= bonus_damage+players[socket.id]['a'];

						if(players[keys[i]]['hp'] <= 0){
							delete players[keys[i]];
							delete clients[keys[i]];
							io.sockets.emit('remove_player', keys[i]);
							io.sockets.emit('update_players', players);
							socket.emit('defeat_character', keys[i]);
						} else {
							if (players[keys[i]]['dir'] == 'l') {
								players[keys[i]]['x'] -= recoil;
							} else {
								players[keys[i]]['x'] += recoil;
							}
						}
					} else {
						// socket
						if(players[keys[i]]['hp']-players[socket.id]['a'] <= 0){
							socket.emit('defeat_character', keys[i]);
						} else {
							players[keys[i]]['hp'] = (players[keys[i]]['hp']-players[socket.id]['a']);
						}

						clients[keys[i]].emit('damage', {
							dir: dir,
							attack: (players[socket.id]['a']+bonus_damage),
							recoil: recoil
						});
					}
				};
			}

			i++;
		}
	});

	socket.on('acquired_item', function (coordinates) {
		socket.broadcast.emit('acquired_item', coordinates);
	});


	socket.on('healed', function (amount) {
		socket.emit('healed', amount);
	});

	socket.on('register_player', function () {
		players[socket.id] = { id: socket.id };
		io.sockets.emit('update_players', players);
	});
});

// Load monsters based on

// ==============
var players = {};
var clients = {};
var game = {};

mobs.load_map(function(map){
	game.map = map;
});

mobs.load_map(function(map){
	setInterval(function(){
		var player_hot_swap = {};

		var keys = Object.keys(players), key;
		while( key = keys.pop() ) {
			player_hot_swap[key] = {
				x: players[key].x,
				y: players[key].y,
				d: players[key].d,
				sx: players[key].sx,
				sy: players[key].sy,
				hp: players[key].hp,
				img: players[key].img,
				id: players[key].id,
				re: players[key].re
			}
		}

		io.sockets.emit('update_data', {p: player_hot_swap, m: mobs.monsters});
	}, (1000/60));
});

var auto_mobs = 0;

if (auto_mobs) {
	for(var i = 0; i < auto_mobs; i++){
		clients[i+'_player'] = {};
		players[i+'_player'] = {
			id: i+'_player',
			img: 'sprite'+(i+12),
			x: 0,
			y: 0,
			d: 'r',
			sx: 0, // sprite x
			sy: 0, // sprite y
			gx: 0, // grid x
			gy: 0, // grid y
			s: 3, // speed
			hp: 20,
			a: 2, // attack
			as: 0.5, // attack speed
			re: 0, // regenerate
			jp: 0, // jumping
			mr: 0, // moving right
			ml: 0, // movign left
			sl: 0, // sprint left
			sr: 0, // spring right
		};

		io.sockets.emit('update_players', players);
	}

	// Auto control them
	setInterval(function(){
		for(var i = 0; i < auto_mobs; i++){
			if (typeof players[i+'_player'] == 'undefined') continue;

			if(rand(1, 10) == 4){
				players[i+'_player']['jp'] = 11;
			}

			// stop sn!
			if (rand(1, 2) == 2) {
				if (players[i+'_player']['sl'] > 0) {
					players[i+'_player']['sl'] = 0;
				} else if (players[i+'_player']['sr'] > 0) {
					players[i+'_player']['sr'] = 0;
				}
			};

			if (players[i+'_player']['ml'] <= 0 && players[i+'_player']['mr'] <= 0) {
				if(rand(1, 4) == 4 && players[i+'_player']['ml'] <= 0){
					players[i+'_player']['mr'] = rand(25, 150);
					// players[i+'_player']['d'] = 'r';
				} else if(rand(1, 4) == 2 && players[i+'_player']['mr'] <= 0){
					players[i+'_player']['ml'] = rand(25, 150);
					// players[i+'_player']['d'] = 'l';
				}
			};

			if (rand(1, 2) == 2 && players[i+'_player']['jp'] <= 0) {
				if (players[i+'_player']['sl'] == 0 && rand(1, 5) == 5) {
					players[i+'_player']['sl'] = 2;
				} else if (players[i+'_player']['sr'] == 0 && rand(1, 5) == 5) {
					players[i+'_player']['sr'] = 2;
				}
			};
		}
	}, (400))

	setInterval(function(){
		for(var i = 0; i < auto_mobs; i++){
			if (typeof players[i+'_player'] == 'undefined') continue;
			var bot = players[i+'_player'];
			// bot['x']++;
			bot['x'] = Math.max(0, Math.min(bot['x'], 500-35));
			bot['y'] = Math.max(0, bot['y']);

			if(bot['ml']){
				bot['ml']--;
				var bonus_speed = 0;
				if(bot.sl == 2 && bot['re'] > 3){
					bonus_speed = 4;
					bot['re'] -= 4;
				}

				if(Math.max(0, bot.attack)) game.cancel_attack();
				bot['x'] -= bonus_speed+bot['s'];
				bot['sx'] += 0.25;
				bot['d'] = 'l';
			} else if(bot['mr']){
				bot['mr']--;
				var bonus_speed = 0;
				if(bot.sr == 2 && bot['re'] > 3){
					bonus_speed = 4;
					bot['re'] -= 4;
				}

				if(Math.max(0, bot.attack)) game.cancel_attack();
				bot['x'] += bonus_speed+bot['s'];
				bot['sx'] += 0.25;
				bot['d'] = 'r';
			}


			if(bot['re']+1 == 300 && bot['hp'] != 20){
				bot['hp']++;
				bot['re'] = 0;
			} else {
				if(bot['re']+1 == 300 && bot['hp'] == 20){
				} else {
					bot['re']++;
				}
			}

			if(bot.jp > 0){
				if(Math.floor(bot.jp-1) == 0){
					bot.jp = 0;
				} else {
					bot['y'] += bot.jp*(bot.jp/15);
					bot['re'] -= 1;
					bot.jp -= 0.4;
				}
			}

			if (bot['y'] > 30) {
				bot['y'] -= (bot['y']/14);
			} else if (bot['y'] > 10) {
				bot['y'] -= (bot['y']/6);
			} else {
				bot['y'] -= 1.75;
			}

			bot['gx'] = Math.round(bot['x']/35);
			bot['gy'] = Math.round(bot['y']/85);

			bot['hp'] = Math.min(20, bot['hp']);
			bot['re'] %= 300;

			// Post process
			players[i+'_player'] = bot;
		}

		io.sockets.emit('update_data', players);
	}, (1000/60))
};



// var starting_sprite = 1;
// fs.readdir('public/images/', function(err, files){
// 	for (var i = 0; i < files.length; i++) {
// 		if (files[i].match('sprite')) {
// 			// console.log(files[i]);
// 			var new_name = 's'+starting_sprite+'.gif';
// 			starting_sprite++;
// 			fs.renameSync('public/images/'+files[i], 'public/images/'+new_name);
// 		}
// 	};
// })

// var chokidar = require('chokidar');
// var file_watchers = {};
// fs.readdir('public/javascripts', function(err, files){
// 	for (var i = 0; i < files.length; i++) {
// 		if (files[i].match('game')) {
// 			file_watchers[files[i]] = chokidar.watch('public/javascripts/'+files[i], {persistent: true});
// 			file_watchers[files[i]].on('change', function(path) {
// 				io.sockets.emit('hotswap', path);
// 			})
// 		}
// 	};
// })

http_server.listen(3000);

console.log("Starting up LegendBit on port:3000");