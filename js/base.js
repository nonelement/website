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

console.log("Hello! The script that prints this message is currently the only one on the page.");
console.log("You might wonder why I put a script on this page that does basically nothing.");
console.log("Well... I got nothing for you. Yet. But there will be things here in the future.");
console.log("I've got some ideas. A few decent ones at least.");
console.log("Check back often for changes. :: AK (If you find yourself wanting to speak with me, send a few lines to anthony.j.kirkpatrick@gmail.com)");
