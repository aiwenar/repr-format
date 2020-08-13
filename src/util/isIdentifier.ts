/**
 * Check whether string is a valid ECMAScript identifier.
 */
export default function isIdentifier(name: string): boolean {
    // TODO: proper check according to ES6: ID_Start ID_Continue*
    return name.match(/^[a-zA-Z_$][a-zA-Z0-9_$]*$/) !== null
}
