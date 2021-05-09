<script context="module" lang="ts">
    import {reroute_unauth} from "../../shared/page";

    import type {FileObject} from "../../shared/supabase/storage";

    import {normalize_pathname} from "../../shared/util/url";

    async function query_directory(
        fetch: typeof window.fetch,
        directory_path: string = "",
        limit: string = "25",
        offset: string = "0"
    ): Promise<{directories: FileObject[]; files: FileObject[]}> {
        // NOTE: The serverside `fetch` doesn't handle transforming `/path/to/something/` -> `/path/to/something`
        directory_path = normalize_pathname(directory_path);
        directory_path = directory_path === "/" ? "" : directory_path;

        const response = await fetch(
            `/api/v1/storage/directories/list${directory_path}?limit=${limit}&offset=${offset}`
        );

        if (!response.ok) {
            throw new Error(`failed to query directory '${directory_path}'`);
        }

        const {directories, files} = (await response.json()).data;

        return {
            directories,
            files,
        };
    }

    export const load = reroute_unauth(async ({fetch, page}) => {
        try {
            const {directory_path} = page.params;
            const {directories, files} = await query_directory(fetch, directory_path);

            return {
                props: {
                    directory_path,
                    directories,
                    files,
                },
            };
        } catch (err) {
            return {
                error: err,
            };
        }
    });
</script>

<script lang="ts">
    import {browser} from "$app/env";
    import {Modifiers, Spacer, Stack} from "@kahi-ui/svelte";
    import {getContext, onDestroy, onMount} from "svelte";

    import type {IActionHandle} from "../../client/actions";
    import {modify_blob} from "../../client/blob";
    import {use_filedrop} from "../../client/filedrop";
    import {use_filepaste} from "../../client/filepaste";

    import {PASTE_PREFIX, UPLOAD_MAX_FILESIZE} from "../../shared/environment";
    import {BlobTooLargeError} from "../../shared/errors";
    import {ICON_ALERT, ICON_COPY, ICON_NEGATIVE, ICON_UPLOAD} from "../../shared/icons";
    import {query_param, query_param_boolean} from "../../shared/location";

    import {await_for, debounce} from "../../shared/util/functional";
    import {
        MIMETYPES_KNOWN,
        MIMETYPE_EXTENSIONS,
        MIMETYPES_PASTEABLE,
    } from "../../shared/util/mimetypes";
    import {generate_local_timestamp} from "../../shared/util/generate";

    import * as Breadcrumbs from "../../components/breadcrumbs";
    import * as Dialogs from "../../components/dialogs";
    import * as Heroes from "../../components/heroes";
    import * as Paginations from "../../components/paginations";
    import * as Popovers from "../../components/popovers";
    import * as Tables from "../../components/tables";

    const notifications = getContext("notifications");
    const preview = getContext("preview");
    const prompts = getContext("prompts");
    const storage = getContext("storage");
    const uploads = getContext("uploads");

    const limit = query_param("limit", {default_value: "25"});
    const offset = query_param("offset", {default_value: "0"});
    const uploading = query_param_boolean("uploading", {default_value: false});

    let initial = true;

    export let directory_path: string = "";
    export let directories: FileObject[] = [];
    export let files: FileObject[] = [];

    const refresh_listing = debounce(
        await_for(async (_limit: string = $limit, _offset: string = $offset) => {
            try {
                ({directories, files} = await query_directory(
                    fetch,
                    directory_path,
                    _limit,
                    _offset
                ));
            } catch (err) {}
        }),
        100
    );

    function has_active_prompt() {
        // TODO: Probably a better way to so this yeah? This also misses the other non-prompt dialogs
        return !!$preview || !!$prompts;
    }

    let handle_file_drop: IActionHandle, handle_file_paste: IActionHandle;
    onMount(() => {
        handle_file_drop = use_filedrop(document, {
            on_filedrop_enter(event) {
                if (!has_active_prompt()) $uploading = true;
            },

            on_filedrop_exit(event) {
                $uploading = false;
            },
        });

        handle_file_paste = use_filepaste(document, {
            types: MIMETYPES_PASTEABLE as MIMETYPES_KNOWN[],

            async on_file_paste(blobs) {
                if (has_active_prompt() || !uploads) return;

                $uploading = false;
                if (blobs.length > 1) {
                    notifications.push_notification({
                        icon: ICON_ALERT,
                        title: "Too Many Clipboard Items",
                        description: "Only the first clipboard item is being used",
                    });
                }

                let [blob] = blobs;
                const handle = notifications.push_notification({
                    icon: ICON_COPY,
                    title: "Loading Clipboard Item",
                });

                if (blob.size > UPLOAD_MAX_FILESIZE) {
                    handle.update({
                        icon: ICON_NEGATIVE,
                        title: "Clipboard Item Too Large for Uploading",
                    });

                    return;
                }

                try {
                    blob = await modify_blob(prompts, blob);
                } catch (err) {
                    if (err instanceof BlobTooLargeError) {
                        notifications.push_notification({
                            icon: ICON_ALERT,
                            title: "Clipboard Item Too Large for Editing",
                            description: "Skipping in-Browser Editor",
                        });
                    }
                }

                const extension = MIMETYPE_EXTENSIONS[blob.type] ?? "";
                const timestamp = generate_local_timestamp();

                const file_name = `${PASTE_PREFIX}${timestamp}.${extension}`;
                const file = new File([blob], file_name, {type: blob.type});

                try {
                    handle.update({
                        icon: ICON_UPLOAD,
                        title: "Queueing Clipboard Item",
                    });
                } catch (err) {}

                uploads.queue_upload(directory_path, file);
                $uploading = true;
            },
        });
    });

    onDestroy(() => {
        if (handle_file_drop) handle_file_drop.destroy();
        if (handle_file_paste) handle_file_paste.destroy();
    });

    $: _entries = [...directories, ...files];

    $: if (browser && !initial) refresh_listing($limit, $offset);
    $: if (!initial) initial = true;

    // TODO: Look into in-place updating
    const watch = storage ? storage.watch_directory(directory_path) : null;
    $: if (watch && $watch) refresh_listing();
</script>

<Stack alignment-x="between" alignment-y="center" orientation="horizontal">
    <Breadcrumbs.Directory {directory_path} />
    <Popovers.ListingActions can_upload />
</Stack>

<Spacer spacing="huge" />

{#if _entries.length < 1}
    <Heroes.NoFiles stretch />
{:else}
    <Tables.Files entries={_entries} can_delete can_download can_preview can_rename />

    <!--
        NOTE: We want to support non-JS enabled clients as much as possible, so we need to abuse
        putting logic in CSS / HTML as much as possible. And premaking all the individual File modals
    -->

    {#each files as file (file.name)}
        <Dialogs.Preview {file} />
    {/each}

    {#each _entries as entry (entry.name)}
        <Dialogs.Delete file_path={entry.name} />
        <Dialogs.Rename file_path={entry.name} />
    {/each}

    <Spacer spacing="huge" stretch />
    <center>
        <Modifiers.Small>
            {directories.length} directories, {files.length} files
        </Modifiers.Small>
    </center>

    <Spacer spacing="tiny" />
    <Paginations.Data
        href="/storage{directory_path}?offset=%s"
        palette="accent"
        variation="clear"
        current={13}
        delta={2}
        pages={25}
    />
{/if}

<Dialogs.Upload {directory_path} bind:state={$uploading} />

<style>
    center {
        opacity: var(--opacity-dull);
    }
</style>
