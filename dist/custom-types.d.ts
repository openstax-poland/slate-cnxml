import { BaseEditor } from 'slate';
import { BulletedList, CnxEditor, CnxElement, ElementExtensions, EnumeratedList, StyledText, TextExtensions } from 'cnx-designer';
declare module 'slate' {
    interface CustomTypes {
        Element: CnxElement & ElementExtensions;
        Text: StyledText & TextExtensions;
        Editor: BaseEditor & CnxEditor & {
            id?: void;
        };
    }
}
declare module 'slate-lists' {
    interface CustomTypes {
        List: BulletedList | EnumeratedList;
    }
}
