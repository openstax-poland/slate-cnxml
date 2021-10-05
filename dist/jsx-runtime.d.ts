import * as JSX from './jsx';
import { Element, Node } from './render';
export * as JSX from './jsx';
/** Old-style JSX factory */
export declare function createElement<K extends keyof JSX.IntrinsicElements, A extends JSX.IntrinsicAttributes>(name: K, attrs: A | null, ...children: Node[]): Element;
/** New-style JSX factory */
export declare function jsx<K extends keyof JSX.IntrinsicElements, A extends JSX.IntrinsicAttributes>(name: K, props: A): Element;
export declare const jsxs: typeof jsx;
