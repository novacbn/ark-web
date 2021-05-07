import type {MIMETYPES_KNOWN} from "../shared/util/mimetypes";
import {get_mime_type} from "../shared/util/mimetypes";

import type {IActionHandle} from "./actions";

export interface IFilePasteOptions {
    types?: MIMETYPES_KNOWN[];

    on_file_paste: (blob: Blob[]) => void;
}

export function use_filepaste(
    element: Document | HTMLElement,
    options: IFilePasteOptions
): IActionHandle<IFilePasteOptions> {
    let {types, on_file_paste} = options;

    function on_paste(event: ClipboardEvent) {
        const {clipboardData: clipboard_data} = event;
        if (!clipboard_data) return;

        const blobs = Array.from<DataTransferItem>(clipboard_data.items)
            .filter((item) => {
                if (item.kind !== "file") return false;

                const type = get_mime_type(item.type);
                return item.kind === "file" && (types ? (types as string[]).includes(type) : true);
            })
            .map((item) => item.getAsFile() as Blob | null)
            .filter((blob) => blob !== null) as Blob[];

        if (blobs.length > 0) on_file_paste(blobs);
    }

    // @ts-ignore - HACK: Apparently Typescript doesn't type `ClipboardEvent` on `paste` event?
    element.addEventListener("paste", on_paste);

    return {
        destroy() {
            // @ts-ignore
            element.removeEventListener("paste", on_paste);
        },

        update(options: IFilePasteOptions) {
            ({types, on_file_paste} = options);
        },
    };
}
