import Formatter from '../formatter'
import { represent } from '../common'

export function formatMap(this: Map<unknown, unknown>, fmt: Formatter) {
    const name = Reflect.getPrototypeOf(this).constructor.name

    fmt.map(name, fmt => {
        for (const [key, value] of this) {
            fmt.entry(key, value)
        }
    })
}
Map.prototype[represent] = formatMap

export function formatWeakMap(this: WeakMap<object, unknown>, fmt: Formatter) {
    const name = Reflect.getPrototypeOf(this).constructor.name
    fmt.write(name)
}
WeakMap.prototype[represent] = formatWeakMap
