import format, { Style } from 'repr-format'

// Mark file as module, so that declare global {} is allowed.
export {}

declare global {
    interface Console {
        repr(...data: unknown[]): void
    }
}

console.repr = function repr(...data: unknown[]): void {
    const fmt = new format.Formatter({ pretty: true, style: applyStyle })

    let first = true

    for (const item of data) {
        if (!first) {
            fmt.write(' ')
        }
        first = false

        if (typeof item === 'string') {
            fmt.write(item)
            continue
        }

        fmt.format(item)
    }

    console.log(fmt.toString())
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
