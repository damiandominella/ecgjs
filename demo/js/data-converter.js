const fs = require("fs");

let ecgData = fs.readFileSync("./data/ECG.txt", "utf-8");
let breathData = fs.readFileSync("./data/BREATH.txt", "utf-8");

function convert(data) {
	let array = data.split("\n");

	let x_values = [],
		y_values = [];

	for (let row of array) {
		row = row.replace(/\s+/g, " "); // One whitespace

		let splitted = row.split("ms ");

		x_values.push(splitted[0]);
		y_values.push(splitted[1]);
	}

	return {
		x: x_values,
		y: y_values
	};
}

let ECG = convert(ecgData);
let BREATH = convert(breathData);

let script = `const ECG = ${JSON.stringify(ECG)};\nconst BREATH = ${JSON.stringify(BREATH)};`;

fs.writeFileSync("./js/data.js", script);
