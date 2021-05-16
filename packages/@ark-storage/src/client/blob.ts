import type {Readable} from "svelte/store";
import {derived, get, writable} from "svelte/store";

import {BlobTooLargeError, MimetypeNotModifiableError} from "../shared/errors";
import {MODIFIABLE_MAX_FILESIZE} from "../shared/environment";
import {can_modify as can_modify_file, can_preview as can_preview_file} from "../shared/files";

import {
    get_mime_type,
    MIMETYPES_MODIFIABLE,
    MIMETYPE_IMAGE,
    MIMETYPE_TEXT,
} from "../shared/util/mimetypes";

import type {IPromptsStore} from "./prompts";

export function blob_src(default_value: Blob | null = null) {
    const writable_store = writable<Blob | null>(default_value);
    const derived_store = derived<Readable<Blob | null>, string | null>(
        writable_store,
        ($blob, set) => {
            const src = $blob ? URL.createObjectURL($blob) : null;

            set(src);
            return () => {
                if (src) URL.revokeObjectURL(src);
            };
        }
    );

    return {
        get(): Blob | null {
            return get(writable_store);
        },

        set: writable_store.set,
        subscribe: derived_store.subscribe,
        update: writable_store.update,
    };
}

export function can_modify(blob: Blob): boolean {
    return can_modify_file(blob.type, blob.size);
}

export function can_preview(blob: Blob): boolean {
    return can_preview_file(blob.type, blob.size);
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
        text = await prompts.prompt_text({default_value: text, readonly: true});

        return new Blob([text], {type: blob.type});
    }

    return blob;
}
