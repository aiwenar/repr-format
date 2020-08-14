import Formatter from '../formatter'
import util from '../util'
import { represent } from '../common'

export function formatMap(this: Map<unknown, unknown>, fmt: Formatter) {
    fmt.map(this, fmt => {
        for (const [key, value] of this) {
            fmt.entry(key, value)
        }
    })
}
util.extend(Map, represent, formatMap)

export function formatWeakMap(this: WeakMap<object, unknown>, fmt: Formatter) {
    fmt.write(util.objectName(this)!)
}
util.extend(WeakMap, represent, formatWeakMap)
