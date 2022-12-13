/**
 * Get name of an object
 *
 * Object's name is its constructor's name, optionally followed by tag in square
 * brackets (where tag is value of non-enumerable property
 * {@link Symbol.toStringTag}).
 *
 * If the object has no tag and its constructor is either {@link Object} or
 * {@link Array} `null` is returned instead.
 */
export default function objectName<T extends object>(obj: T): string | null;
