import {browser} from "$app/env";
import type {SupabaseClient} from "@supabase/supabase-js";
import {readable, Readable} from "svelte/store";
import {get, writable} from "svelte/store";

import type {INotificationStore} from "../client/notifications";

import {ICON_AFFIRMATIVE, ICON_UPLOAD} from "../shared/icons";
import type {StorageClient} from "../shared/supabase/storage";

import {normalize_pathname} from "../shared/util/url";

export enum UPLOAD_STATE {
    finished = "finished",

    queued = "queued",

    uploading = "uploading",
}

export interface IFileUpload {
    directory_path: string;

    file: File;

    state: UPLOAD_STATE;
}

export interface IFileUploadHandle {
    directory_path: string;

    file: File;

    remove: () => void;
}

export interface IUploadsStore extends Readable<readonly Readonly<IFileUpload>[]> {
    clear(state?: UPLOAD_STATE): void;

    get_next_upload(): IFileUpload | null;

    is_uploading(): boolean;

    modify_upload(file: File, blob: Blob): void;

    queue_task(): void;

    queue_upload(directory_path: string, file: File): IFileUploadHandle;

    remove_upload(file: File): IFileUpload;

    rename_upload(file: File, name: string): void;
}

export function uploads(
    client: SupabaseClient,
    storage: StorageClient,
    notifications: INotificationStore
): IUploadsStore {
    // @ts-ignore - HACK: Other code should be aware methods are not assigned and
    // the store is noop
    if (!browser) return readable<readonly Readonly<IFileUpload>[]>([]);

    let identifier: number | null;

    const store = writable<readonly Readonly<IFileUpload>[]>([]);
    const {set, subscribe} = store;

    return {
        subscribe,

        clear(state?: UPLOAD_STATE): void {
            if (!state) {
                set([]);
                return;
            }

            const uploads = get(store).filter((upload) => upload.state === state);
            set(uploads);
        },

        is_uploading(): boolean {
            return get(store).find((upload) => upload.state === UPLOAD_STATE.uploading)
                ? true
                : false;
        },

        get_next_upload(): IFileUpload | null {
            return get(store).find((upload) => upload.state === UPLOAD_STATE.queued) ?? null;
        },

        queue_task(): void {
            if (identifier) return;

            identifier = requestAnimationFrame(async () => {
                let uploads: readonly Readonly<IFileUpload>[];
                let upload_count = 0;
                let upload_length = 0;

                const handle = notifications.push_notification({
                    icon: ICON_UPLOAD,
                    title: "Uploading File(s)",
                });

                let current_upload: IFileUpload | null;
                while ((current_upload = this.get_next_upload())) {
                    const {directory_path, file} = current_upload;

                    uploads = get(store);
                    upload_length = uploads.length;

                    handle.update({
                        title: `Uploading File(s) (${upload_count} / ${upload_length})`,
                        description: `<code>${file.name}</code>`,
                    });

                    set(
                        uploads.map((upload) => {
                            if (current_upload === upload) {
                                current_upload = {...current_upload, state: UPLOAD_STATE.uploading};

                                return current_upload;
                            }

                            return upload;
                        })
                    );

                    await storage.upload_file(directory_path, file);

                    uploads = get(store);
                    if (!uploads.includes(current_upload)) continue;

                    upload_count++;
                    upload_length = uploads.length;

                    handle.update({
                        title: `Uploading File(s) (${upload_count} / ${upload_length})`,
                    });

                    set(
                        uploads.map((upload) => {
                            if (current_upload === upload) {
                                current_upload = {...current_upload, state: UPLOAD_STATE.finished};

                                return current_upload;
                            }

                            return upload;
                        })
                    );

                    if (upload_count < upload_length) continue;
                    handle.update({
                        icon: ICON_AFFIRMATIVE,
                        title: `Uploading Complete (${upload_length} / ${upload_length})`,
                        description: "",
                    });
                }

                identifier = null;
            });
        },

        modify_upload(file: File, blob: Blob): void {
            const uploads = get(store);
            const upload = uploads.find(
                (upload) => upload.file === file && upload.state === UPLOAD_STATE.queued
            );

            if (!upload) {
                throw new ReferenceError(
                    `bad argument #0 to 'remove_upload' (file '${file.name}' not found)`
                );
            }

            set(
                uploads.map((upload) => {
                    if (upload.file !== file) return upload;

                    return {...upload, file: new File([blob], file.name, {type: blob.type})};
                })
            );
        },

        queue_upload(directory_path: string, file: File): IFileUploadHandle {
            // TODO: Provide a way to abort uploads whenever Supabase's JS client supports it
            let uploads = get(store);

            directory_path = normalize_pathname(directory_path);

            // NOTE: Users probably expect for same-path same-name file uploads to queue behind currently uploading version,
            // but replace non-uploading same-path same-name files and re-queue. So that's what we're doing here
            uploads = uploads.filter((upload) => {
                const in_progress =
                    upload.directory_path === directory_path &&
                    upload.file.name === file.name &&
                    upload.state !== UPLOAD_STATE.queued;

                const is_different =
                    upload.directory_path !== directory_path || upload.file.name !== file.name;

                return is_different || in_progress;
            });

            set([
                ...uploads,
                {
                    directory_path,
                    file,
                    state: UPLOAD_STATE.queued,
                },
            ]);

            return {
                directory_path,
                file,

                remove: () => this.remove_upload(file),
            };
        },

        remove_upload(file: File): IFileUpload {
            const uploads = get(store);
            const upload = uploads.find((upload) => upload.file === file);

            if (!upload) {
                throw new ReferenceError(
                    `bad argument #0 to 'remove_upload' (file '${file.name}' not found)`
                );
            }

            set(uploads.filter((upload) => upload.file !== file));
            return upload;
        },

        rename_upload(file: File, name: string): void {
            const uploads = get(store);
            const upload = uploads.find(
                (upload) => upload.file === file && upload.state === UPLOAD_STATE.queued
            );

            if (!upload) {
                throw new ReferenceError(
                    `bad argument #0 to 'remove_upload' (file '${file.name}' not found)`
                );
            }

            set(
                uploads.map((upload) => {
                    if (upload.file !== file) return upload;

                    return {...upload, file: new File([file], name, {type: file.type})};
                })
            );
        },
    };
}
