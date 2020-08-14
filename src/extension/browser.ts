import format, { Style } from 'repr-format'

// Mark file as module, so that declare global {} is allowed.
export {}

declare global {
    interface Console {
        repr(...data: unknown[]): void
    }
}

console.repr = function repr(...data: unknown[]): void {
    const result = []
    const styles: string[] = []

    const style = (name: Style): [string, string] => {
        styles.push.apply(styles, STYLES[name])
        return ['%c', '%c']
    }

    for (const item of data) {
        if (typeof item === 'string') {
            result.push(item)
            continue
        }

        result.push(format(item, {
            pretty: true,
            style,
        }))
    }

    console.log(result.join(' '), ...styles)
}

const STYLES: Record<Style, [string, string]> = {
    date: ['color: magenta', 'color: unset'],
    hint: ['color: cyan', 'color: unset'],
    null: ['font-weight: bold', 'font-weight: unset'],
    number: ['color: yellow', 'color: unset'],
    regexp: ['color: red', 'color: unset'],
    string: ['color: green', 'color: unset'],
    symbol: ['color: green', 'color: unset'],
    undefined: ['color: light-gray', 'color: unset'],
}
