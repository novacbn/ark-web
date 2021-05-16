<script context="module" lang="ts">
    import {reroute_unauth} from "../../shared/page";

    import {query_directory} from "../../shared/api/storage";

    import type {FileObject} from "../../shared/supabase/storage";

    export const load = reroute_unauth(async ({fetch, page}) => {
        try {
            const {directory_path} = page.params;
            const {page: _page} = Object.fromEntries(page.query.entries());

            const response = await query_directory(directory_path, _page, fetch);

            return {
                props: {
                    directory_path,
                    response,
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
    import {Modifiers, Spacer, Stack} from "@kahi-ui/svelte";
    import {getContext, onDestroy, onMount} from "svelte";

    import type {IActionHandle} from "../../client/actions";
    import {modify_blob} from "../../client/blob";
    import {use_filedrop} from "../../client/filedrop";
    import {use_filepaste} from "../../client/filepaste";

    import {PASTE_PREFIX, UPLOAD_MAX_FILESIZE} from "../../shared/environment";
    import {BlobTooLargeError, PromptDismissedError} from "../../shared/errors";
    import {ICON_ALERT, ICON_COPY, ICON_NEGATIVE, ICON_UPLOAD} from "../../shared/icons";
    import {query_param, query_param_boolean} from "../../shared/location";

    import type {IResponseDirectory} from "../../shared/api/storage";
    import {watch_directory} from "../../shared/api/storage";

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

    const auth = getContext("auth");
    const notifications = getContext("notifications");
    const preview = getContext("preview");
    const prompts = getContext("prompts");

    if (!$auth) throw new Error("not authenticated");
    const {storage, uploads} = $auth;

    const page = query_param("page", {default_value: "1"});
    const uploading = query_param_boolean("uploading", {default_value: false});

    export let directory_path: string;
    export let response: IResponseDirectory;

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
                    } else if (err instanceof PromptDismissedError) {
                        handle.update({
                            icon: ICON_ALERT,
                            title: "Dismissed, Skipping Clipboard Item",
                        });

                        return;
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

    $: _watch = watch_directory(storage, page, directory_path, response);

    let _directories: FileObject[], _files: FileObject[], _pages: number;
    $: ({directories: _directories, files: _files, pages: _pages} = $_watch);

    $: _entries = [..._directories, ..._files];

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

    {#each _files as file (file.name)}
        <Dialogs.StoragePreview {file} />
    {/each}

    {#each _entries as entry (entry.name)}
        <Dialogs.StorageDelete file_path={entry.name} />
        <Dialogs.StorageRename file_path={entry.name} />
    {/each}

    <Spacer spacing="huge" stretch />
    <center>
        <Modifiers.Small>
            {_directories.length} directories, {_files.length} files — {_entries.length} total
        </Modifiers.Small>
    </center>

    {#if _pages > 1}
        <Spacer spacing="tiny" />
        <Paginations.Data
            href="/storage{directory_path}?page=%s"
            palette="accent"
            variation="clear"
            current={parseInt($page)}
            delta={2}
            pages={_pages}
        />
    {/if}
{/if}

<Dialogs.StorageUpload {directory_path} bind:state={$uploading} />

<style>
    center {
        opacity: var(--opacity-dull);
    }

</style>
