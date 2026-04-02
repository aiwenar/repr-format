import { n as Formatter } from "../src-mIpV6APG.mjs";
//#region src/extension/node.ts
console.repr = function repr(...data) {
	const fmt = new Formatter({
		pretty: true,
		style: applyStyle
	});
	let first = true;
	for (const item of data) {
		if (!first) fmt.write(" ");
		first = false;
		if (typeof item === "string") {
			fmt.write(item);
			continue;
		}
		fmt.format(item);
	}
	console.log(fmt.toString());
};
const STYLES = {
	date: "\x1B[35m",
	hint: "\x1B[36m",
	null: "\x1B[1m",
	number: "\x1B[33m",
	regexp: "\x1B[31m",
	string: "\x1B[32m",
	symbol: "\x1B[32m",
	undefined: "\x1B[38;5;8m"
};
const RESET = "\x1B[m";
function applyStyle(name) {
	return [STYLES[name], RESET];
}
//#endregion
export {};
