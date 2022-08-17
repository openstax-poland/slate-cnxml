import * as JSX from './jsx';
import { Element } from './render';
export * from './jsx-runtime';
/** New-style JSX factory */
export declare function jsxDEV<K extends keyof JSX.IntrinsicElements, A extends JSX.IntrinsicAttributes>(name: K, props: A, key?: unknown, isStaticChildren?: unknown, source?: unknown, self?: unknown): Element;
