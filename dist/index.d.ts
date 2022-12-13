import Formatter, { Options } from './formatter';
export { Style } from './common';
/**
 * Format a value.
 */
declare function format(value: unknown, formatterOrOptions?: Formatter | Options): string;
declare namespace format {
    var Formatter: typeof import("./formatter").default;
    var represent: typeof import("./common").represent;
}
export default format;
