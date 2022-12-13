import compareKeys from './compareKeys';
import escape from './escape';
import extend from './extend';
import isIdentifier from './isIdentifier';
import objectName from './objectName';
declare const _default: {
    objectName: typeof objectName;
    isProxy: <T extends object>(o: T) => boolean;
    inspectProxy: (o: unknown) => object | undefined;
    compareKeys: typeof compareKeys;
    escape: typeof escape;
    extend: typeof extend;
    isIdentifier: typeof isIdentifier;
};
export default _default;
