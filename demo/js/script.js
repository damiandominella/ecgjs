var ecgjs = EcgJs.init("ecg", {
	plotly: Plotly,
	data: ECG
});


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
