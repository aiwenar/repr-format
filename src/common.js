/**
 * @function
 * @type Function
 * @name ReprFunction
 *
 * @param {Formatter}
 */

/**
 * If an object has a method with this symbol as it's name, and a signature
 * of {@link ReprFuction}, it will be used to represent that object.
 */
export const represent = Symbol.for('@@represent')
