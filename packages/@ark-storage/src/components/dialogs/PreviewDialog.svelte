<script lang="ts">
    import {browser} from "$app/env";
    import {
        Button,
        Dialog,
        Formatting,
        Modifiers,
        Scrollable,
        Spacer,
        Stack,
        // @ts-ignore
    } from "@kahi-ui/svelte";
    import {getContext} from "svelte";

    import {modify_blob} from "../../client/blob";

    import {PromptDismissedError} from "../../shared/errors";
    import {META_URL} from "../../shared/environment";
    import {can_modify} from "../../shared/files";
    import {
        ICON_AFFIRMATIVE,
        ICON_COPY,
        ICON_DOWNLOAD,
        ICON_MODIFY,
        ICON_NEGATIVE,
        ICON_UPLOAD,
    } from "../../shared/icons";

    import type {FileObject} from "../../shared/supabase/storage";

    import {format_bytes} from "../../shared/util/filesize";
    import {format_timestamp} from "../../shared/util/locale";
    import {get_mime_type} from "../../shared/util/mimetypes";
    import {base_pathname, dir_pathname, normalize_pathname} from "../../shared/util/url";

    import StoragePreview from "../utilities/StoragePreview.svelte";

    const prompts = getContext("prompts");
    const storage = getContext("storage");
    const notifications = getContext("notifications");
    const preview = getContext("preview");

    export let file: FileObject;
    export let state: boolean = $preview === file.name;

    let previous_state: boolean = state;
    let is_modifying: boolean = false;

    async function on_copy_click(event: MouseEvent) {
        if (!notifications) return;

        const permission = await navigator.permissions.query({name: "clipboard-write"});
        if (!_share_url || permission.state !== "granted") {
            notifications.push_notification({
                icon: ICON_NEGATIVE,
                title: "Failed to Copy URL",
            });

            return;
        }

        await navigator.clipboard.writeText(_share_url as string);
        notifications.push_notification({
            icon: ICON_AFFIRMATIVE,
            title: "Copied URL to Clipboard",
        });
    }

    async function on_modify_click(event: MouseEvent) {
        if (!storage) return;
        is_modifying = true;

        let blob: Blob;
        try {
            const response = await fetch(_download_url);
            blob = await response.blob();
        } catch (err) {
            notifications.push_notification({
                icon: ICON_NEGATIVE,
                title: "Failed to Download File",
            });

            is_modifying = false;
            return;
        }

        try {
            blob = await modify_blob(prompts, blob);
        } catch (err) {
            if (!(err instanceof PromptDismissedError)) {
                notifications.push_notification({
                    icon: ICON_NEGATIVE,
                    title: "Failed to Modify File",
                });
            }

            is_modifying = false;
            return;
        }

        // TODO: Update to use `/api/v1/storage/directories/upload` API when available
        const file = new File([blob], _base_name, {type: blob.type});
        await storage.upload_file(_directory_path, file);

        notifications.push_notification({
            icon: ICON_UPLOAD,
            title: "Modified File",
        });

        is_modifying = false;
    }

    $: _base_name = base_pathname(file.name);
    $: _can_modify = can_modify(file.metadata.mimetype, file.metadata.size);
    $: _directory_path = dir_pathname(file.name);
    $: _download_url = `/api/v1/storage/files/download${_file_path}`;
    $: _file_path = normalize_pathname(file.name);
    $: _mime_type = get_mime_type(file.metadata.mimetype);
    // TODO: This needs to be changed back to the preview URLs whenever
    // SvelteKit is no longer bugged and server routes can serve file blobs again
    $: _preview_url = state && !is_modifying ? `/api/v1/storage/files/download${_file_path}` : "";
    $: _share_url = file.metadata.share
        ? `${META_URL}/api/v1/storage/files/shared/${file.metadata.share}`
        : null;

    $: {
        if (browser) {
            if (state) $preview = file.name;
            else if (previous_state) $preview = "";

            previous_state = state;
        }
    }
</script>

<Dialog.Container
    class="dialog-preview"
    id="dialog-preview-{_file_path}"
    palette="light"
    viewport="tiny"
    stretch
    bind:state
>
    <Dialog.Region>
        <Dialog.Figure>
            <StoragePreview preview_url={_preview_url} {file} />
        </Dialog.Figure>

        <!-- TODO: File overflow actions -->
        <Dialog.Heading>{file.name}</Dialog.Heading>

        <Dialog.Body>
            <Formatting.Paragraph>
                <Modifiers.Small>
                    {format_bytes(file.metadata.size)} &bullet; {_mime_type}
                </Modifiers.Small>
            </Formatting.Paragraph>

            <Spacer spacing="huge" />

            <Scrollable>
                <Stack spacing="tiny">
                    <Formatting.Paragraph>
                        <Modifiers.Small>Created</Modifiers.Small>
                        <br />
                        {format_timestamp(file.created_at)}
                    </Formatting.Paragraph>

                    <Formatting.Paragraph>
                        <Modifiers.Small>Modified</Modifiers.Small>
                        <br />
                        {format_timestamp(file.updated_at)}
                    </Formatting.Paragraph>

                    {#if file.metadata.share}
                        <Formatting.Paragraph>
                            <Modifiers.Small>Share Link</Modifiers.Small>
                            <br />
                            <Modifiers.Small>
                                <Formatting.Code>
                                    {_share_url}
                                </Formatting.Code>
                            </Modifiers.Small>
                        </Formatting.Paragraph>
                    {/if}
                </Stack>
            </Scrollable>
        </Dialog.Body>

        <Dialog.Footer>
            <!--
                TODO: Need to support in-place updating of Disable / Enable of
                File sharing on JS-enabled client
            -->

            <form
                action="/api/v1/storage/files/shared{_file_path}?redirect=/storage{_directory_path}?preview={file.name}"
                method="post"
            >
                <input type="hidden" name="enable" value={_share_url ? "off" : "on"} />
                <Button
                    palette="accent"
                    type="submit"
                    value={file.metadata.share ? "Disable Sharing" : "Enable Sharing"}
                />
            </form>

            {#if browser}
                {#if file.metadata.share}
                    <Button palette="affirmative" on:click={on_copy_click}>
                        <ICON_COPY size="1.25em" />
                        <Spacer inline />
                        Copy URL
                    </Button>
                {/if}

                {#if _can_modify}
                    <Button palette="alert" disabled={is_modifying} on:click={on_modify_click}>
                        <ICON_MODIFY size="1.25em" />
                        <Spacer inline />
                        Modify
                    </Button>
                {/if}
            {/if}

            <!-- TODO: Auto prompt to download, maybe via `fetch`? -->
            <!-- download={_base_name} -->
            {#if is_modifying}
                <Button palette="negative" disabled>
                    <ICON_DOWNLOAD size="1.25em" />
                    <Spacer inline />
                    Download
                </Button>
            {:else}
                <Button
                    href={_download_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    palette="negative"
                >
                    <ICON_DOWNLOAD size="1.25em" />
                    <Spacer inline />
                    Download
                </Button>
            {/if}
        </Dialog.Footer>
    </Dialog.Region>
</Dialog.Container>

<style>
    :global(.dialog-preview .box) {
        margin: var(--dialog-region-padding) var(--dialog-region-padding) 0
            var(--dialog-region-padding);
    }

    :global(.dialog-preview :is(img, video)) {
        max-height: calc(var(--dialog-region-max-height) * 0.35);
    }

    :global(.dialog-preview section) {
        margin-top: calc(var(--dialog-region-spacing) * -1);
    }

    :global(.dialog-preview code) {
        user-select: all;
    }

    :global(.dialog-preview small) {
        opacity: var(--opacity-dull);
    }

    :global(.dialog-preview input[type="submit"]) {
        /**
            HACK: Input buttons cannot use icons, so by
            default it doesn't stretch its height to match siblings
        */

        height: 5ex;
    }
</style>
