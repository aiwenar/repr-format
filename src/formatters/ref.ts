import Formatter from '../formatter'
import { Fragment } from '../buffer'

const REF_NUMBER: WeakMap<Formatter, number> = new WeakMap()

export type Reference = {
    source: Fragment,
    addRef: () => Fragment,
}

export function formatReference(fmt: Formatter): Reference {
    const ref = { count: 0, number: 0 }

    const source = (): Fragment | Fragment[] => {
        if (ref.count === 0) return []

        const num = REF_NUMBER.get(fmt) ?? 0
        REF_NUMBER.set(fmt, num + 1)

        ref.number = num

        return [{ style: 'hint', value: '#' + num }, ' = ']
    }

    const reference = (): Fragment => ({ style: 'hint', value: '#' + ref.number + '#' })

    const addRef = (): Fragment => {
        ref.count += 1
        return reference
    }

    return { source, addRef }
}
