import { represent } from '../common'

export function formatMap(fmt) {
    const name = Reflect.getPrototypeOf(this).constructor.name

    fmt.map(name, fmt => {
        for (const [key, value] of this) {
            fmt.entry(key, value)
        }
    })
}
Map.prototype[represent] = formatMap

export function formatWeakMap(fmt) {
    const name = Reflect.getPrototypeOf(this).constructor.name
    fmt.write(name)
}
WeakMap.prototype[represent] = formatWeakMap
