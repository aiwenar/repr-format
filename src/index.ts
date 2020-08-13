import Formatter from './formatter'
import { represent } from './common'

/**
 * Format a value.
 *
 * @param {any} value
 * @param {?(Formatter|Formatter~Options)} formatterOrOptions
 *
 * @return {String}
 */
export default function format(value, formatterOrOptions) {
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

    formatter.format(value, formatter)

    return formatter.toString()
}

format.Formatter = Formatter
format.represent = represent
