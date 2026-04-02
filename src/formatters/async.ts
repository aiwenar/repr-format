import { represent } from '../common'
import type Formatter from '../formatter'
import { extend, inspectPromise, inspectProxy } from '../util'

export function formatPromise(this: Promise<unknown>, fmt: Formatter): void {
    const [state, value] = inspectPromise(this)
    console.log(inspectPromise(Promise.resolve(12)))
    console.log(inspectProxy(new Proxy({ a: 12 }, {})))
    switch (state) {
    case 'unknown':
            fmt.write({ style: 'hint', value: '[Promise]' })
            break

        case 'pending':
            fmt.write('Promise { ', { style: 'hint', value: 'pending' }, ' }')
            break

        case 'resolved':
        case 'rejected':
            fmt.struct('Promise', fmt => {
                fmt.write_item(() => {
                    fmt.write({ style: 'hint', value: state }, ' ')
                    fmt.format(value)
                })
            })
            break
    }
}
extend(Promise, represent, formatPromise)
