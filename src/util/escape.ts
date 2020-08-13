/**
 * Escape a string.
 *
 * @param {string} str
 * @param {string} terminator
 *
 * @return {string}
 */
// TODO: escape non-printables
export default function escape(str, terminator) {
    const r = str.replace(/[\0\n\r\v\t\b\f]/g, char => {
        switch (char) {
        case '\0':  return '\\0'
        case '\n':  return '\\n'
        case '\r':  return '\\r'
        case '\v':  return '\\v'
        case '\t':  return '\\t'
        case '\b':  return '\\b'
        case '\f':  return '\\f'
        }
    })

    return terminator
        ? r.replace(RegExp(terminator, 'g'), '\\' + terminator)
        : r
}
