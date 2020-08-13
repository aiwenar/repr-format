import Formatter from '../formatter'
import util from '../util'
import { represent } from '../common'

export function formatObject(this: object, fmt: Formatter) {
    const prototype = Reflect.getPrototypeOf(this)
    const constructor = prototype && prototype.constructor
    const name = constructor === Object || !constructor ? null : constructor.name

    fmt.struct(name, fmt => {
        for (const key of Reflect.ownKeys(this).sort(util.compareKeys)) {
            fmt.field(key, this[key as keyof object])
        }
    })
}
util.extend(Object, represent, formatObject)
