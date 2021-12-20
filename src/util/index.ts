import compareKeys from './compareKeys'
import escape from './escape'
import extend from './extend'
import isIdentifier from './isIdentifier'
import * as isProxy from './isProxy'
import objectName from './objectName'

export default {
    compareKeys,
    escape,
    extend,
    isIdentifier,
    ...isProxy,
    objectName,
}
