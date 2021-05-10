import {MODIFIABLE_MAX_FILESIZE, PREVIEW_MAX_FILESIZE} from "./environment";

import {MIMETYPES_MODIFIABLE, MIMETYPES_PREVIEWABLE, get_mime_type} from "./util/mimetypes";

export function can_modify(mime_type: string, file_size: number): boolean {
    mime_type = get_mime_type(mime_type);

    return file_size < MODIFIABLE_MAX_FILESIZE && MIMETYPES_MODIFIABLE.includes(mime_type);
}

export function can_preview(mime_type: string, file_size: number): boolean {
    mime_type = get_mime_type(mime_type);

    return file_size < PREVIEW_MAX_FILESIZE && MIMETYPES_PREVIEWABLE.includes(mime_type);
}
