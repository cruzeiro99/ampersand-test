// let n    = 32;
let EMP  = " ";
let HASH = "#";
let STR  = '';

function createAmpersand(n=32) {
	let prevDist = 0;
	let lines = [];
	for (let i = 1; i < n; i++) {
		let line = '#';
		if (i === 1 || i == n-1) {
			line = line.padEnd(n+1, '#');
		} else {
			line = line.padStart(prevDist, ' ');
			line = `#`+line;
			if (i < n/2)
				line = line.padEnd(n-prevDist, 'a');
			else
				line = line.padEnd(n-prevDist, ' ');
			line = line+'#';
			line = line.padEnd(n, ' ');
			line = line+'#';
		}
		line = line.split('');
		lines.push(line);
		if (i >= n / 2) {
			prevDist--;
		} else {
			prevDist++;
		}
	}
	return lines;
	// return lines.join("\n");
}
// const FPS = 5;
// setInterval(() => {
// 	console.clear();
// 	console.log(fill());
// }, 1000 / FPS);
module.exports = { createAmpersand }