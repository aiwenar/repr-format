import format, { Style } from 'repr-format'

// Mark file as module, so that declare global {} is allowed.
export {}

declare global {
    interface Console {
        repr(...data: unknown[]): void
    }
}

console.repr = function repr(...data: unknown[]): void {
    console.log(data.map(item => {
        if (typeof item === 'string') {
            return item
        }

        return format(item, {
            pretty: true,
            style: applyStyle,
        })
    }).join(' '))
}

const STYLES: Record<Style, string> = {
    date: '\x1b[35m', // magenta
    hint: '\x1b[36m', // cyan
    null: '\x1b[1m', // bold
    number: '\x1b[33m', // yellow
    regexp: '\x1b[31m', // red
    string: '\x1b[32m', // green
    symbol: '\x1b[32m', // green
    undefined: '\x1b[38;5;8m', // light black
}

const RESET = "\x1b[m"

function applyStyle(name: Style): [string, string] {
    return [STYLES[name], RESET]
}
