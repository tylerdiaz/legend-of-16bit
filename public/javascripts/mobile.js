var ios = (navigator.platform.indexOf("iPhone") != -1) || navigator.platform.indexOf("iPad") != -1 || (navigator.platform.indexOf("iPod") != -1);
var kindle = (navigator.platform.indexOf("Kindle") != -1) || (navigator.platform.indexOf("Silk") != -1);

if(ios || kindle){
	game.mobile = true;
	var vp = document.createElement("meta");
	vp.name = "viewport";
	if(navigator.platform.indexOf("iPad") != -1){
		orientation = Math.abs(window.orientation);
		alert(orientation);
		if (orientation == 90) {
			vp.content = "width=440, initial-scale=2";
		} else {
			vp.content = "width=440, initial-scale=1.5";
		}
	} else {
		vp.content = "width=440, initial-scale=2.2";
	}
	document.getElementsByTagName("head")[0].appendChild(vp);

	$('#mobile_move_left, #mobile_move_right').css({ display: 'block'});

	function trigger_key_event(code, type){
		var e = jQuery.Event("key"+type);
		e.keyCode = code;
		return $(window).trigger(e);
	};

	$("#mobile_move_left").on('touchstart', function(){ trigger_key_event(37, 'down'); return false });
	$("#mobile_move_left").on('touchend', function(){ trigger_key_event(37, 'up'); return false });
	$("#mobile_move_right").on('touchstart', function(){ trigger_key_event(39, 'down'); return false });
	$("#mobile_move_right").on('touchend', function(){ trigger_key_event(39, 'up'); return false });
	$("#chrome_data").on('touchstart', function(){ trigger_key_event(32, 'down'); return false });
	$("#chrome_data").on('touchend', function(){ trigger_key_event(32, 'up'); return false });
	$("#mobile_attack").on('touchstart', function(){ trigger_key_event(40, 'down'); return false });
	$("#mobile_attack").on('touchend', function(){ trigger_key_event(40, 'up'); return false });

	$('#log_data').hide();
};