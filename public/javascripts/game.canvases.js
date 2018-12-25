var canvas = {
	final_canvas: $('#final_canvas')[0].getContext("2d"),
	load: {
		canvas_positioning: function(){
			var visible_attr = {width: game.visible_width, height: game.visible_height};
			var actual_attr = {width: game.width, height: game.height};
			$('canvas').css(visible_attr).attr(visible_attr);
			$('#canvas_slider > canvas').css(actual_attr).attr(actual_attr);

			var virtual_screen_canvases = ['runnable'];
			var virtual_canvases = ['shadow', 'background'];

			for (var i = virtual_canvases.length - 1; i >= 0; i--) {
				game['virtual_'+virtual_canvases[i]+'_canvas'] = document.createElement('canvas');
				game['virtual_'+virtual_canvases[i]+'_canvas'].width = game.width;
				game['virtual_'+virtual_canvases[i]+'_canvas'].height = game.height;
				game['virtual_'+virtual_canvases[i]] = game['virtual_'+virtual_canvases[i]+'_canvas'].getContext('2d');
			};

			for (var i = virtual_screen_canvases.length - 1; i >= 0; i--) {
				game['virtual_'+virtual_screen_canvases[i]+'_canvas'] = document.createElement('canvas');
				game['virtual_'+virtual_screen_canvases[i]+'_canvas'].width = game.visible_width;
				game['virtual_'+virtual_screen_canvases[i]+'_canvas'].height = game.visible_height;
				game['virtual_'+virtual_screen_canvases[i]] = game['virtual_'+virtual_screen_canvases[i]+'_canvas'].getContext('2d');
			};

			if ( ! game.mobile) {
				$('#canvas_constructer').css({width: game.visible_width, height: game.visible_height, marginLeft: "-"+(game.visible_width/2)+"px"});
				$('#arrow_boxes').css({
					width: game.visible_width+10, // accounting for the borders
					marginLeft: "-"+(game.visible_width >> 1)+"px",
					top: ($('#canvas_constructer').position().top+game.visible_height)
				});
			} else {
				$('#canvas_constructer').css({width: game.visible_width, height: game.visible_height, marginLeft:0, left:0, top:0});
				$('#arrow_boxes').css({left:0, width: game.visible_width+10, top: ($('#canvas_constructer').position().top+game.visible_height)})
			}
		}
	}
}

jQuery.extend(true, game, canvas);