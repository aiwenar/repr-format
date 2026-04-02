import Formatter from '../formatter'
import { extend, objectName } from '../util'
import { represent } from '../common'

export function formatMap(this: Map<unknown, unknown>, fmt: Formatter): void {
    fmt.map(this, fmt => {
        for (const [key, value] of this) {
            fmt.entry(key, value)
        }
    })
}
extend(Map, represent, formatMap)

export function formatWeakMap(this: WeakMap<object, unknown>, fmt: Formatter): void {
    fmt.write(objectName(this)!)
}
extend(WeakMap, represent, formatWeakMap)
