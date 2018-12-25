var monsters = {
	monster_images_src: ['bat', 'kingbat', 'mana', 'rat', 'slime', 'zombiebat'],
	monster_images: {},
	load: {
		monsters: function(callback){
			var sprites_loaded = 0;
			for (var i = game.monster_images_src.length - 1; i >= 0; i--) {
				game.monster_images[game.monster_images_src[i]] = new Image();
				game.monster_images[game.monster_images_src[i]].src = '/monsters/'+game.monster_images_src[i]+'.png';
				game.monster_images[game.monster_images_src[i]].onload = function(){
					if(sprites_loaded+1 == game.monster_images_src.length){
						callback();
					} else {
						sprites_loaded++;
					}
				};
			};
		},
	}
}

jQuery.extend(true, game, monsters);