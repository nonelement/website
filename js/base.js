(function() {
	var interval = 30 * 1000,
	    index = 0, lastIndex = 0;
	    colors = [
			"#456",
			"#739",
			"#493",
			"#c72",
			"#840",
			"#3a9",
			"#733"
		];
	var interval = setInterval(function() {
		while(index === lastIndex)
			index = Math.floor(Math.random() * colors.length);
		lastIndex = index;
		color = colors[index];
		document.body.style.backgroundColor = color;
		if(isDebug())
			console.log("Selected %s, Color %s", index, color);
	}, interval);
}())

function isDebug() {
	return typeof DEBUG !== "undefined" && DEBUG;
}
