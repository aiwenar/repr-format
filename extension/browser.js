'use strict';

var format = require('repr-format');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var format__default = /*#__PURE__*/_interopDefaultLegacy(format);

console.repr = function repr(...data) {
    const result = [];
    const styles = [];
    const style = (name) => {
        styles.push.apply(styles, STYLES[name]);
        return ['%c', '%c'];
    };
    for (const item of data) {
        if (typeof item === 'string') {
            result.push(item);
            continue;
        }
        result.push(format__default["default"](item, {
            pretty: true,
            style,
        }));
    }
    console.log(result.join(' '), ...styles);
};
const STYLES = {
    date: ['color: magenta', 'color: unset'],
    hint: ['color: cyan', 'color: unset'],
    null: ['font-weight: bold', 'font-weight: unset'],
    number: ['color: goldenrod', 'color: unset'],
    regexp: ['color: red', 'color: unset'],
    string: ['color: green', 'color: unset'],
    symbol: ['color: green', 'color: unset'],
    undefined: ['color: lightgray', 'color: unset'],
};
//# sourceMappingURL=browser.js.map
