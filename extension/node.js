'use strict';

var format = require('repr-format');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var format__default = /*#__PURE__*/_interopDefaultLegacy(format);

console.repr = function repr(...data) {
    const fmt = new format__default["default"].Formatter({ pretty: true, style: applyStyle });
    let first = true;
    for (const item of data) {
        if (!first) {
            fmt.write(' ');
        }
        first = false;
        if (typeof item === 'string') {
            fmt.write(item);
            continue;
        }
        fmt.format(item);
    }
    console.log(fmt.toString());
};
const STYLES = {
    date: '\x1b[35m',
    hint: '\x1b[36m',
    null: '\x1b[1m',
    number: '\x1b[33m',
    regexp: '\x1b[31m',
    string: '\x1b[32m',
    symbol: '\x1b[32m',
    undefined: '\x1b[38;5;8m', // light black
};
const RESET = "\x1b[m";
function applyStyle(name) {
    return [STYLES[name], RESET];
}
//# sourceMappingURL=node.js.map
