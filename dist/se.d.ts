import { MediaData } from 'cnx-designer';
import { Editor, Element, Node, Text } from 'slate';
import { Node as RenderNode } from './render';
import { Document as Doc } from '.';
/** Serialization options */
export interface Options<Format> {
    /** Format to which to serialize */
    format: Format;
    /** Function used to determine the MIME type of a media item */
    mediaMime: MediaMimeFunction;
    /** Function used to serialize custom elements */
    serializeElement?: PartialSerializer<Element, CommonAttrs>;
    /** Function used to serialize custom text */
    serializeText?: PartialSerializer<Text>;
}
/** Function used to determine the MIME type of a media item */
export type MediaMimeFunction = (media: MediaData) => string;
/**
 * Function used to serialize custom nodes
 *
 * If provided, the serialization routine will first consult this function. If
 * a non-null value is returned it will be used as node's serialization.
 * Otherwise serialization will proceed as if this function wasn't provided.
 *
 * The type parameter `N` specifies the type of node handled by this serializer,
 * `A` the attributes which the serializer should emit on the CNXML element.
 *
 * For element serializers (`serializeElement`) `N` is {@link Element} and `A`
 * is  {@link CommonAttrs}. `children` contains children of `node`, already
 * serialized.
 *
 * For text serializers (`serializeText`) `N` is {@link Text} and `A` is
 * an empty object. `children` is the text string, optionally wrapped in
 * elements as specified by text's formatting.
 */
export type PartialSerializer<N extends Node, A = Record<string, never>> = (node: N, attrs: A, children: RenderNode, ctx: Context) => RenderNode;
export default function serialize(editor: Editor, document: Doc, options: Options<'xml'>): string;
export default function serialize(editor: Editor, document: Doc, options: Options<'dom'>): Document;
/** Serialization context */
export interface Context {
    mediaMime: MediaMimeFunction;
    serializeElement?: PartialSerializer<Element, CommonAttrs>;
    serializeText?: PartialSerializer<Text>;
}
/** Attributes common to all elements */
export interface CommonAttrs {
    /** Element's ID */
    id: string;
    /** CSS classes */
    class?: string;
}
