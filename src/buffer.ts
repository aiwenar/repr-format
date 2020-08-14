export type Fragment = Immediate | Deferred

/**
 * Fragment immediately available for formatting.
 */
export type Immediate = string | HardBreak | SoftBreak

/**
 * Fragment which has not yet been formatted.
 */
export type Deferred = Buffer | (() => Fragment | Fragment[])

/**
 * Always break here
 *
 * When present in a {@link Buffer} this fragment forces the buffer (and all its
 * parent buffers) into multi-line rendering.
 *
 * This fragment will be rendered as a single line break (LF), and if `indent`
 * is set to a positive number, an `indent` number of indentation units. What
 * a single indentation unit is is controlled by {@link Options#indent}.
 */
export type HardBreak = {
    break: 'hard',
    indent?: number,
}

/**
 * Optionally break here
 *
 * This fragment will be rendered as its property `text` when the {@link Buffer}
 * containing it is rendered in single line, or as a hard break when rendering
 * in multiple lines.
 *
 * @see HardBreak for description how breaks are rendered.
 */
export type SoftBreak = {
    break: 'soft',
    text: string,
    indent?: number,
}

/**
 * Formatting options
 */
export type Options = {
    /**
     * How deeply nested is this buffer?
     */
    depth: number,
    /**
     * Value used to render indentation.
     */
    indent: string,
    /**
     * Maximum complexity allowed before formatting over multiple lines.
     *
     * Complexity of a buffer is measured by adding complexities of its
     * component buffers. Each buffer has complexity of at least one.
     */
    maxComplexity?: number
}

/**
 * Result of flushing a {@link Buffer}.
 */
export type Result = {
    /**
     * Result of formatting this buffer.
     */
    value: string
    /**
     * How complex is this buffer.
     */
    complexity: number
    /**
     * Was this buffer formatted over multiple lines?
     */
    multiline: boolean
}

/**
 * Buffers hold intermediate results of formatting.
 *
 * A buffer contains not a formatted string itself, but rather all information
 * required to construct said string. This allows a single buffer to output it's
 * contents in multiple ways depending on context.
 *
 * Contents of a buffer are represented by a sequence of fragments. When
 * building a formatted strings those fragments are concatenated. Some fragments
 * may have multiple representations, from which one is selected based on
 * context and parameters. For list of all possible fragments and their
 * description {@see Fragment}.
 *
 * Buffers may be nested. Nested buffers will be formatted independently, but
 * may of affect formatting of their parent buffer.
 */
export default class Buffer {
    private fragments: Fragment[]

    constructor() {
        this.fragments = []
    }

    /**
     * Flush this buffer
     */
    flush(options: Options): Result {
        const { depth, indent, maxComplexity } = options
        const result: Result = {
            value: '',
            complexity: 0,
            multiline: false,
        }
        const partial: Immediate[] = []

        let nestedBuffers = 0

        const processFragment = (fragment: Fragment | Fragment[]): void => {
            if (fragment instanceof Array) {
                fragment.forEach(processFragment)
                return
            }

            if (fragment instanceof Buffer) {
                const {
                    value, complexity, multiline,
                } = fragment.flush({ ...options, depth: depth + 1})

                result.complexity += complexity
                result.multiline = result.multiline || multiline

                fragment = value
                nestedBuffers += 1
            } else if (typeof fragment === 'function') {
                return processFragment(fragment())
            } else if (typeof fragment === 'object' && fragment.break === 'hard') {
                result.multiline = true
            }

            partial.push(fragment)
        }

        processFragment(this.fragments)

        if (maxComplexity != null && result.complexity >= maxComplexity) {
            result.multiline = true
        }

        for (const fragment of partial) {
            if (typeof fragment === 'string') {
                result.value += fragment
                continue
            }

            if (result.multiline) {
                result.value += '\n' + indent.repeat(fragment.indent ?? 0)
            } else if (fragment.break === 'soft') {
                result.value += fragment.text
            }
        }

        result.complexity += 1
        return result
    }

    /**
     * Push a fragment at the end of this buffer.
     */
    push(fragment: Fragment): void {
        this.fragments.push(fragment)
    }
}
