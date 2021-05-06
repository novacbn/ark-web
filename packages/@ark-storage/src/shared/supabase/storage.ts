import {browser} from "$app/env";
import type {SupabaseClient, SupabaseRealtimePayload} from "@supabase/supabase-js";
import type {FileObject as SupabaseFileObject, SortBy} from "@supabase/storage-js";
import {readable, Readable} from "svelte/store";

import {OBJECTS_TABLE, SHARED_FILES_TABLE, STORAGE_PREFIX, STORAGE_SCHEMA} from "../environment";

import {append_pathname, dir_pathname, normalize_pathname} from "../util/url";

import {create_client} from "./client";
import type {IObjectRow, ISharedFileRow} from "./schema";

export enum CHANGE_TYPES {
    created = "created",

    moved = "moved",

    removed = "removed",

    renamed = "renamed",

    updated = "updated",
}

export interface FileObject extends SupabaseFileObject {
    // HACK: Supabase by default doesn't define the `mimetype` / `size` in the typings, have to
    // investigate if these are only specific to their cloud dashboard
    metadata: {
        mimetype: string;

        share: string | undefined;

        size: number;
    };
}

export interface IChangeEvent {
    change: keyof typeof CHANGE_TYPES;

    path: string;
}

export interface IPathEvent extends IChangeEvent {
    change: "moved" | "renamed";

    new_path: string;
}

export interface IQueryOptions {
    limit: number;

    offset: number;

    sort_by: SortBy;
}

export function create_storage_client(
    client: SupabaseClient,
    prefix: string = STORAGE_PREFIX
): StorageClient | null {
    const user = client.auth.user();
    if (!user) return null;

    const {id} = user;
    return new StorageClient(client, id, prefix + id);
}

export class StorageClient {
    bucket_id: string;

    public_client: SupabaseClient;

    user_id: string;

    storage_client: SupabaseClient;

    constructor(client: SupabaseClient, user_id: string, bucket_id: string) {
        const session = client.auth.session();
        if (!session) {
            throw new Error("bad argument #0 to 'StorageClient' (client is not authorized)");
        }

        this.bucket_id = bucket_id;
        this.public_client = client;
        this.user_id = user_id;

        // NOTE: Since the Supabase / Postgrest client doesn't allow access to schemas not specified
        // when initialized, we need to create a new client namespaced to the `storage.*` schemas
        this.storage_client = create_client(session.access_token, {
            schema: STORAGE_SCHEMA,
        });
    }

    async download_file(file_path: string): Promise<Blob> {
        file_path = normalize_pathname(file_path).slice(1);

        const {error, data} = await this.public_client.storage
            .from(this.bucket_id)
            .download(file_path);

        if (error || !data) throw error;
        return data;
    }

    async delete_file(file_path: string): Promise<void> {
        file_path = normalize_pathname(file_path).slice(1);

        const {error} = await this.public_client.storage.from(this.bucket_id).remove([file_path]);
        if (error) throw error;
    }

    async is_file_shared(file_path: string): Promise<boolean> {
        const {bucket_id, user_id} = this;
        file_path = normalize_pathname(file_path).slice(1);

        const {error: object_error, data: object_data} = await this.storage_client
            .from<IObjectRow>(OBJECTS_TABLE)
            .select("bucket_id, id, name")
            .match({bucket_id, name: file_path})
            .limit(1);

        if (object_error || !object_data) throw object_error;
        if (object_data.length < 1) {
            throw new Error(`bad argument #0 to 'share_file' (file path '${file_path}' invalid)`);
        }

        const {id} = object_data[0];

        const {
            error: share_error,
            data: share_data,
        } = await this.public_client
            .from<ISharedFileRow>(SHARED_FILES_TABLE)
            .select("id, file_id, user_id")
            .match({file_id: id, user_id})
            .limit(1);

        if (share_error || !share_data) throw share_error;
        return share_data.length > 0;
    }

    async has_file(file_path: string): Promise<boolean> {
        file_path = normalize_pathname(file_path);

        const {error: object_error, data: object_data} = await this.storage_client
            .from<IObjectRow>(OBJECTS_TABLE)
            .select("bucket_id, name")
            .match({bucket_id: this.bucket_id, name: file_path.slice(1)})
            .limit(1);

        if (object_error || !object_data) throw object_error;
        return object_data.length > 0;
    }

    async rename_file(file_path: string, new_name: string): Promise<string> {
        file_path = normalize_pathname(file_path).slice(1);
        const new_path = append_pathname(dir_pathname(file_path), new_name).slice(1);

        const {error} = await this.public_client.storage
            .from(this.bucket_id)
            .move(file_path, new_path);

        if (error) throw error;
        return new_path;
    }

    async query_data(file_path: string): Promise<IObjectRow> {
        file_path = normalize_pathname(file_path).slice(1);

        const {error, data} = await this.storage_client
            .from<IObjectRow>(OBJECTS_TABLE)
            .select(
                "bucket_id, created_at, id, last_accessed_at, name, owner, updated_at, metadata"
            )
            .match({bucket_id: this.bucket_id, name: file_path})
            .limit(1)
            .single();

        if (error || !data) throw error;
        return data;
    }

    async query_directory(
        directory_path: string,
        options: Partial<IQueryOptions> = {}
    ): Promise<FileObject[]> {
        const {public_client} = this;
        const {limit, offset, sort_by} = options;

        directory_path = normalize_pathname(directory_path).slice(1);

        const {error: bucket_error, data: bucket_data} = await public_client.storage
            .from(this.bucket_id)
            .list(directory_path, {limit, offset, sortBy: sort_by});

        if (bucket_error || !bucket_data) throw bucket_error;
        const available_files = bucket_data.filter((file) => file.id).map((file) => file.id);

        const {error: table_error, data: table_data} = await public_client
            .from<ISharedFileRow>(SHARED_FILES_TABLE)
            .select("id, file_id, user_id")
            .match({user_id: this.user_id})
            .in("file_id", available_files);

        if (table_error || !table_data) throw table_error;
        const shared_files = new Map(table_data.map((row) => [row.file_id, row]));

        return (bucket_data as FileObject[]).map((file) => {
            const share = shared_files.get(file.id);

            return {
                ...file,

                metadata: {
                    ...file.metadata,
                    share: share ? share.id : undefined,
                },
            };
        });
    }

    async share_file(file_path: string, enable: true): Promise<string>;
    async share_file(file_path: string, enable: false): Promise<void>;
    async share_file(file_path: string, enable: boolean): Promise<string | void> {
        const {bucket_id, public_client, user_id} = this;
        file_path = normalize_pathname(file_path).slice(1);

        const {error: object_error, data: object_data} = await this.storage_client
            .from<IObjectRow>(OBJECTS_TABLE)
            .select("bucket_id, id, name")
            .match({bucket_id, name: file_path})
            .limit(1);

        if (object_error || !object_data) throw object_error;
        if (object_data.length < 1) {
            throw new Error(`bad argument #0 to 'share_file' (file path '${file_path}' invalid)`);
        }

        const {id: file_id} = object_data[0];
        const {error: share_error, data: share_data} = await public_client
            .from<ISharedFileRow>(SHARED_FILES_TABLE)
            .select("id, file_id, user_id")
            .match({file_id, user_id})
            .limit(1);

        if (share_error || !share_data) throw share_error;
        if (enable) {
            if (share_data.length > 0) return share_data[0].id;

            const {
                error: insert_error,
                data: insert_data,
            } = await public_client.from<ISharedFileRow>(SHARED_FILES_TABLE).insert([{file_id}]);

            if (insert_error || !insert_data) throw insert_error;
            return insert_data[0].id;
        } else if (!enable && share_data.length > 0) {
            const {error: delete_error} = await public_client
                .from<ISharedFileRow>(SHARED_FILES_TABLE)
                .delete()
                .match({file_id, user_id});

            if (delete_error) throw delete_error;
        }
    }

    async upload_file(directory_path: string, file: File): Promise<void> {
        const {bucket_id} = this;
        const file_path = append_pathname(directory_path, file.name).slice(1);

        if (await this.has_file(file_path)) {
            const {error: update_error} = await this.storage_client.storage
                .from(bucket_id)
                .update(file_path, file);

            if (update_error) throw update_error;
        } else {
            const {error: upload_error} = await this.storage_client.storage
                .from(bucket_id)
                .upload(file_path, file);

            if (upload_error) throw upload_error;
        }
    }

    watch_directory(directory_path: string): Readable<IChangeEvent | IPathEvent | null> {
        // @ts-ignore - NOTE: Store defaults to noop, but exported types don't reflect that
        if (!browser) return readable(null);

        const {bucket_id, storage_client} = this;
        directory_path = normalize_pathname(directory_path);

        return readable<IChangeEvent | IPathEvent | null>(null, (set) => {
            function on_payload(payload: SupabaseRealtimePayload<IObjectRow>) {
                // TODO: Clean up, can probably be made more concise
                // NOTE: `UPDATED` is called right away after `CREATED` is fired, which will
                // output a blank object to `payload.old`. So we can safely ignore it
                const {eventType: event_type} = payload;
                const object_row = event_type === "INSERT" ? payload.new : payload.old;
                if (object_row.name === undefined) return;

                const path = normalize_pathname(object_row.name);
                const dir_path = dir_pathname(path);
                if (dir_path !== directory_path) return;

                switch (event_type) {
                    case "DELETE":
                        set({
                            change: CHANGE_TYPES.removed,
                            path,
                        });

                        break;

                    case "INSERT":
                        set({
                            change: CHANGE_TYPES.created,
                            path,
                        });

                        break;

                    case "UPDATE": {
                        if (payload.new.updated_at !== object_row.updated_at) {
                            set({
                                change: CHANGE_TYPES.updated,
                                path,
                            });
                        } else if (payload.new.name !== path) {
                            const new_path = normalize_pathname(payload.new.name);
                            const new_base_path = dir_pathname(new_path);

                            set({
                                change:
                                    new_base_path === dir_path
                                        ? CHANGE_TYPES.renamed
                                        : CHANGE_TYPES.moved,
                                path,
                                new_path,
                            });
                        }

                        break;
                    }
                }
            }

            // TODO: Is there a way to have directory checks on server instead?
            const subscription = storage_client
                .from<IObjectRow>(`objects:bucket_id=eq.${bucket_id}`)
                .on("*", on_payload)
                .subscribe();

            return () => {
                if (!subscription.isClosed()) subscription.unsubscribe();
            };
        });
    }
}
