import Formatter, { Options } from './formatter'
import { represent } from './common'

export { Style } from './common'

/**
 * Format a value.
 */
export default function format(value: unknown, formatterOrOptions?: Formatter | Options): string {
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

format.Formatter = Formatter
format.represent = represent
