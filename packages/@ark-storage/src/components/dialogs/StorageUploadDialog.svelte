<script lang="ts">
    import {browser} from "$app/env";
    import {
        Button,
        Dialog,
        Modifiers,
        Scrollable,
        Spacer,
        Stack,
        // @ts-ignore
    } from "@kahi-ui/svelte";
    import {getContext} from "svelte";

    import type {IUploadsStore} from "../../client/uploads";
    import {UPLOAD_STATE} from "../../client/uploads";

    import {ICON_AFFIRMATIVE, ICON_ALERT} from "../../shared/icons";

    import {append_pathname} from "../../shared/util/url";

    import * as Inputs from "../inputs";
    import type {IDropInputEvent} from "../inputs/FileDropInput.svelte";
    import * as Tiles from "../tiles";
    import type {
        IFileTileModifyEvent,
        IFileTileRemoveEvent,
        IFileTileRenameEvent,
    } from "../tiles/FileTile.svelte";

    const notifications = getContext("notifications");
    const prompts = getContext("prompts");
    const auth = getContext("auth");

    if (!$auth) throw new Error("not authenticated");
    const {uploads} = $auth;

    export let directory_path: string = "";
    export let state: boolean = false;

    function on_drop(event: IDropInputEvent) {
        for (const file of event.detail.files) uploads.queue_upload(directory_path, file);
    }

    function on_clear_click(event: MouseEvent) {
        uploads.clear();

        notifications.push_notification({
            icon: ICON_AFFIRMATIVE,
            title: "Cleared Uploads",
        });
    }

    function on_modify(event: IFileTileModifyEvent) {
        const {blob, file} = event.detail;

        try {
            uploads.modify_upload(file, blob);

            notifications.push_notification({
                icon: ICON_AFFIRMATIVE,
                title: "Modified Upload",
                description: `<code>${file.name}</code> was modified`,
            });
        } catch (err) {
            notifications.push_notification({
                icon: ICON_ALERT,
                title: "Failed to Modify Upload",
                description: `<code>${file.name}</code> was canceled or changed`,
            });
        }
    }

    function on_remove_click(event: IFileTileRemoveEvent) {
        const {file} = event.detail;

        try {
            const upload = uploads.remove_upload(file);
            if (upload.state !== UPLOAD_STATE.queued) return;

            notifications.push_notification({
                icon: ICON_AFFIRMATIVE,
                title: "Removed Upload",
                description: `<code>${file.name}</code> was removed`,
            });
        } catch (err) {
            notifications.push_notification({
                icon: ICON_ALERT,
                title: "Failed to Remove Upload",
                description: `<code>${file.name}</code> was canceled or changed`,
            });
        }
    }

    function on_rename(event: IFileTileRenameEvent) {
        const {file, name} = event.detail;

        try {
            uploads.rename_upload(file, name);

            notifications.push_notification({
                icon: ICON_AFFIRMATIVE,
                title: "Renamed Upload",
                description: `<code>${file.name}</code> was renamed to <code>${name}</code>`,
            });
        } catch (err) {
            notifications.push_notification({
                icon: ICON_ALERT,
                title: "Failed to Remove Upload",
                description: `<code>${file.name}</code> was canceled or changed`,
            });
        }
    }

    function on_upload_click(event: MouseEvent) {
        uploads.queue_task();
    }

    let is_uploading: boolean;
    $: {
        if (browser) {
            // HACK: Marking the store to make this block reactive
            $uploads;
            is_uploading = uploads.is_uploading();
        }
    }

    let awaiting_prompt: boolean;
    $: {
        if ($prompts && state) {
            awaiting_prompt = true;
            state = false;
        }
    }

    $: {
        if (!$prompts && awaiting_prompt) {
            state = true;
            awaiting_prompt = false;
        }
    }

</script>

<!--
    TODO: Supabase current does not support non-Browser
    uploads in its JS client
-->
{#if browser}
    <Dialog.Container
        class="dialog-storage-upload"
        id="dialog-storage-upload"
        palette="light"
        viewport="tiny"
        stretch
        bind:state
    >
        <Dialog.Region>
            <Dialog.Heading>Upload File(s)</Dialog.Heading>

            <Dialog.Body>
                <Inputs.FileDrop on:drop={on_drop} />

                {#if $uploads.length > 0}
                    <Spacer spacing="huge" />
                {/if}

                <Scrollable>
                    <Modifiers.Small>
                        <Stack alignment-x="stretch" spacing="tiny">
                            {#each $uploads as upload (append_pathname(upload.directory_path, upload.file.name))}
                                <Tiles.File
                                    file={upload.file}
                                    state={upload.state}
                                    can_modify
                                    can_preview
                                    can_rename
                                    can_remove
                                    on:modify={on_modify}
                                    on:remove={on_remove_click}
                                    on:rename={on_rename}
                                />
                            {/each}
                        </Stack>
                    </Modifiers.Small>
                </Scrollable>
            </Dialog.Body>

            <Dialog.Footer>
                <Dialog.Button variation="clear">Dismiss</Dialog.Button>

                <Button palette="negative" disabled={$uploads.length < 1} on:click={on_clear_click}>
                    Clear
                </Button>

                <Button
                    palette="accent"
                    disabled={$uploads.length < 1 || is_uploading}
                    on:click={on_upload_click}
                >
                    Upload
                </Button>
            </Dialog.Footer>
        </Dialog.Region>
    </Dialog.Container>
{/if}

<style>
    :global(.dialog-storage-upload .scrollable) {
        max-height: calc(var(--dialog-region-max-height) * 0.35);
    }

    /**
     * HACK: Resetting the `<small>` modifier
     */
    :global(.dialog-storage-upload .popover-upload-actions) {
        font-size: calc(var(--typography-small-font-size) * 1.5);
    }

    /**
     *  HACK: Might have to rethink how popovers are styled, so they
     *  work properly in dialogs and scrollables 
     */
    :global(.dialog-storage-upload .popover-upload-actions > :last-child) {
        position: fixed;

        right: initial;
        bottom: initial;

        transform: translate(-100%, -25%);
    }

</style>
