function rand (min, max) {
	return ~~(Math.random() * (max - min + 1)) + min;
}

String.prototype.format = function() {
	var args = arguments;
	return this.replace(/{(\d+)}/g, function(match, number) {
		return typeof args[number] != 'undefined' ? args[number] : match;
	});
};
