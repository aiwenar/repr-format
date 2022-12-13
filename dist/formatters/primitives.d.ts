import Formatter from '../formatter';
export declare function formatDate(this: Date, fmt: Formatter): void;
export declare function formatSymbol(this: symbol, fmt: Formatter): void;
export declare function formatString(this: string, fmt: Formatter): void;
export declare function formatRegExp(this: RegExp, fmt: Formatter): void;
export declare function formatNumberWrapper(this: Boolean | Number, fmt: Formatter): void;
export declare function formatStringWrapper(this: String, fmt: Formatter): void;
export declare function formatError(this: Error, fmt: Formatter): void;
