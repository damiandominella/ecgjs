let ecgjs = EcgJs.init("ecg", {
	plotly: Plotly
});

ecgjs.setData({
	x: ECG.x,
	y: ECG.y
});

// let index = 0;
// let t = setInterval(() => {
// 	ecgjs.addData({
// 		x: ECG.x.slice(index, index + 10),
// 		y: ECG.y.slice(index, index + 10)
// 	});
// 	index += 10;
// }, 25);
// clearInterval(t);

$("#play").on("click", function() {
	ecgjs.play();
});

$("#pause").on("click", function() {
	ecgjs.pause();
});

$("#reset").on("click", function() {
	ecgjs.reset();
});

$(".speed-change").on("click", function() {
	var multiplier = parseInt($(this).attr("data-speed"));
	ecgjs.changeSpeed(multiplier);
	$("#speed").html(speed);
});

$("#ecg").on("plotly_click", function(event, data) {
	var text = prompt("Enter note;", "My note");

	if (text != null) {
		ecgjs.addNote(text, data);
	}
});

$("#clear-notes").on("click", function() {
	ecgjs.clearNotes();
});

$("#toggle-full").on("click", function() {
	if ($(this).attr("data-click-state") == 1) {
		$(this).attr("data-click-state", 0);
		ecgjs.hideFull();
	} else {
		$(this).attr("data-click-state", 1);
		ecgjs.showFull();
	}
});
