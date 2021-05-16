import {browser} from "$app/env";
import type {Readable} from "svelte/store";
import {get, readable} from "svelte/store";

import type {FileObject, StorageClient} from "../supabase/storage";

import {await_for, debounce} from "../util/functional";
import {normalize_pathname} from "../util/url";

export type IResponseDirectory = {directories: FileObject[]; files: FileObject[]; pages: number};

export async function query_directory(
    directory_path: string = "",
    page: string = "1",
    fetch: typeof window.fetch = window.fetch
): Promise<IResponseDirectory> {
    directory_path = normalize_pathname(directory_path);

    const response = await fetch(`/api/v1/storage/directories/list${directory_path}?page=${page}`);
    if (!response.ok) {
        throw new Error(`failed to query directory '${directory_path}'`);
    }

    const {directories, files, pages} = (await response.json()).data;

    return {
        directories,
        files,
        pages,
    };
}

export function watch_directory(
    storage: StorageClient,
    page: Readable<string>,
    directory_path: string,
    default_value: IResponseDirectory = {directories: [], files: [], pages: 1}
): Readable<IResponseDirectory> {
    // TODO: When SvelteKit gets Serverside Events (SSE) / WebSockets support, use one
    // of those to get updates from the server instead of Supabase directly

    // @ts-expect-error - HACK: `readable` is mistyped, doesn't require a callback
    if (!browser) return readable<IResponseDirectory>(default_value);

    return readable<IResponseDirectory>(default_value, (set) => {
        // TODO: Instead of performing a full page refresh is would be better to perform in-place
        // delta updates for non-(creation / deletion / moving) events. However would also need to account
        // for updates in page counts...

        const refresh_page = debounce(
            await_for(async () => {
                default_value = await query_directory(directory_path, get(page));
                set(default_value);
            }),
            100
        );

        const watch = storage.watch_directory(directory_path);

        const page_listener = page.subscribe(refresh_page);
        const watch_listener = watch.subscribe(refresh_page);

        return () => {
            page_listener();
            watch_listener();
        };
    });
}
