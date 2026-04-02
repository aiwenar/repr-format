import Formatter from '../formatter'
import { extend, objectName } from '../util'
import { represent } from '../common'

export function formatArrayBuffer(this: ArrayBuffer | SharedArrayBuffer, fmt: Formatter): void {
    fmt.write(objectName(this)!, ' [ ')

    if (this.byteLength === 0) {
        fmt.write({ style: 'undefined', value: 'empty' })
    } else if (this.byteLength === 1) {
        fmt.write({ style: 'hint', value: '1 byte' })
    } else {
        fmt.write({ style: 'hint', value: [this.byteLength.toString(), ' bytes'] })
    }

    fmt.write(' ]')
}
extend(ArrayBuffer, represent, formatArrayBuffer)
extend(SharedArrayBuffer, represent, formatArrayBuffer)

export function formatDataView(this: DataView, fmt: Formatter): void {
    const name = objectName(this)!
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
extend(DataView, represent, formatDataView)
