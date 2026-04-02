import { t as format } from "../src-mIpV6APG.mjs";
//#region src/extension/browser.ts
console.repr = function repr(...data) {
	const result = [];
	const styles = [];
	const style = (name) => {
		styles.push.apply(styles, STYLES[name]);
		return ["%c", "%c"];
	};
	for (const item of data) {
		if (typeof item === "string") {
			result.push(item);
			continue;
		}
		result.push(format(item, {
			pretty: true,
			style
		}));
	}
	console.log(result.join(" "), ...styles);
};
const STYLES = {
	date: ["color: magenta", "color: unset"],
	hint: ["color: cyan", "color: unset"],
	null: ["font-weight: bold", "font-weight: unset"],
	number: ["color: yellow", "color: unset"],
	regexp: ["color: red", "color: unset"],
	string: ["color: green", "color: unset"],
	symbol: ["color: green", "color: unset"],
	undefined: ["color: light-gray", "color: unset"]
};
//#endregion
export {};
