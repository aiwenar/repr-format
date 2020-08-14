import Formatter from '../formatter'
import util from '../util'
import { represent } from '../common'

export function formatArrayBuffer(this: ArrayBuffer, fmt: Formatter) {
    fmt.write(util.objectName(this)!, ' [ ')

    if (this.byteLength === 0) {
        fmt.write({ style: 'undefined', value: 'empty' })
    } else if (this.byteLength === 1) {
        fmt.write({ style: 'hint', value: '1 byte' })
    } else {
        fmt.write({ style: 'hint', value: [this.byteLength.toString(), ' bytes'] })
    }

    fmt.write(' ]')
}
util.extend(ArrayBuffer, represent, formatArrayBuffer)

export function formatDataView(this: DataView, fmt: Formatter) {
    const name = util.objectName(this)!
    const byte_bytes = this.byteLength === 1 ? 'byte' : 'bytes'

    fmt.write(
        name,
        ' [ ',
        {
            style: 'hint',
            value: [
                this.byteLength.toString(),
                ' ',
                byte_bytes,
                ' from ',
                this.buffer.byteLength.toString(),
                ', starting at byte ',
                this.byteOffset.toString(),
            ],
        },
        ' ]',
    )
}
util.extend(DataView, represent, formatDataView)
