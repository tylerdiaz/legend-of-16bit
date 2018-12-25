var sounds = {
	default_sounds: ['cave', 'fall', 'walk', 'run', 'pickup'],
	sounds: {},
	load: {
		sounds: function(){
			for (var i = game.default_sounds.length - 1; i >= 0; i--) {
				game.sounds[game.default_sounds[i]] = new buzz.sound("/sounds/"+game.default_sounds[i], {
					formats: ["ogg","mp3"],
					preload: true,
					loop: false
				});
			};
		}
	}
}

jQuery.extend(true, game, sounds);