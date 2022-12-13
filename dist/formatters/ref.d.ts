import Formatter from '../formatter';
import { Fragment } from '../buffer';
export declare type Reference = {
    source: Fragment;
    addRef: () => Fragment;
};
export declare function formatReference(fmt: Formatter): Reference;
