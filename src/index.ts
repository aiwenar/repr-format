import Formatter, { type Options } from './formatter'

export { type Style, represent } from './common'
export { default as Formatter } from './formatter'

/**
 * Format a value.
 */
function format(value: unknown, formatterOrOptions?: Formatter | Options): string {
    let options = {}
    let formatter = null

    if (formatterOrOptions) {
        if (formatterOrOptions instanceof Formatter) {
            formatter = formatterOrOptions
        } else {
            options = formatterOrOptions
        }
    }

    if (!formatter) {
        formatter = new Formatter(options)
    }

    formatter.format(value)

    return formatter.toString()
}

export default format
