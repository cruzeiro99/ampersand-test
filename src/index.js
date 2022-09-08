const readline = require("node:readline/promises");
const {stdin:input, stdout:output} = require("node:process");
const { createAmpersand } = require("./helpers")
const { Renderer } = require("./Renderer")
const { TemplateHandler } = require("./TemplateHandler")


async function question(rl) {
	let answer = await rl.question('Um número (mínimo 6)>');
	answer = parseInt(answer);
	if (answer < 6) {
		console.log("Mínimo 6");
		return await question(rl);
	}
	return answer;
}

let renderer;
async function main() {
	const rl = readline.createInterface({ input, output });
	let n = await question(rl);
	if ( n % 2 > 0 )
		n += 1
	if (typeof n !== 'number') {
		console.log("Please type a number")
		return main();
	}
	let template = createAmpersand(n)
	let width = n;
	let height = n;
	global.bounds = [ width, height ];
	let handler = new TemplateHandler(template, width, height);
	let tiles = handler.render();
	renderer = new Renderer(tiles);
	renderer.loop();
	process.stdin.once('keypress', handleRestart);
}

function handleRestart(c ,key) {
	if (!key) return;
	let { name } = key;
	if (name === "r") {
		process.stdin.removeAllListeners('keypress', handleRestart);
		renderer.stopLoop();
		main();
	}
}


global._rendererInterval = 0;
main();

