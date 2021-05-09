import {MODIFIABLE_MAX_FILESIZE} from "../shared/environment";
import {BlobTooLargeError, MimetypeNotModifiableError} from "../shared/errors";
import {can_modify as can_modify_file} from "../shared/files";

import {
    get_mime_type,
    MIMETYPES_MODIFIABLE,
    MIMETYPE_IMAGE,
    MIMETYPE_TEXT,
} from "../shared/util/mimetypes";

import type {IPromptsStore} from "./prompts";

export function can_modify(blob: Blob): boolean {
    return can_modify_file(blob.type, blob.size);
}

export async function modify_blob(prompts: IPromptsStore, blob: Blob): Promise<Blob> {
    if (blob.size >= MODIFIABLE_MAX_FILESIZE) {
        throw new BlobTooLargeError("bad argument #1 to 'modify_blob' (blob too large)");
    }

    const mime_type = get_mime_type(blob.type);
    if (!MIMETYPES_MODIFIABLE.includes(mime_type)) {
        throw new MimetypeNotModifiableError(
            `bad argument #1 to 'modify_blob' (mimetype '${mime_type}' not supported)`
        );
    }

    if (MIMETYPE_IMAGE.includes(mime_type)) return prompts.prompt_modify_image({blob});
    else if (MIMETYPE_TEXT.includes(mime_type)) {
        // TODO: Syntax highlighting
        let text = await blob.text();
        text = await prompts.prompt_text({default_value: text});

        return new Blob([text], {type: blob.type});
    }

    return blob;
}
