import * as JSX from './jsx';
/** Qualified name of an element or attribute */
export interface Name {
    /**
     * Namespace
     *
     * When omitted for an element name it is inherited form the parent element.
     * When omitted for an attribute, the name refers to the default namespace.
     */
    namespace?: string;
    /** Local name */
    local: string;
}
/** An element */
export interface Element {
    /** Element's name */
    name: Name;
    /** Attributes set on this element */
    attributes: Attributes;
    /** Children nodes */
    children: Node;
}
export type Attributes = Omit<JSX.IntrinsicAttributes, 'children'> & {
    [key: string]: unknown;
};
/** A processing instruction */
export interface ProcessingInstruction {
    /** PI's target */
    target: string;
    /** PI's value */
    value: string;
}
/** Any value that can be used as child of a JSX element */
export type Node = Element | ProcessingInstruction | globalThis.Node | string | Node[] | null;
export declare const Node: {
    isElement(node: Node): node is Element;
    isProcessingInstruction(node: Node): node is ProcessingInstruction;
};
/** Render a JSX element into an XML document */
export declare function render(root: Element): Document;
