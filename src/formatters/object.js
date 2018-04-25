import util from '../util'
import { represent } from '../common'

export function formatObject(fmt) {
    const { constructor } = Reflect.getPrototypeOf(this)
    const name = constructor === Object ? null : constructor.name

    fmt.struct(name, fmt => {
        for (const key of Reflect.ownKeys(this).sort(util.compareKeys)) {
            fmt.field(key, this[key])
        }
    })
}
Object.prototype[represent] = formatObject
