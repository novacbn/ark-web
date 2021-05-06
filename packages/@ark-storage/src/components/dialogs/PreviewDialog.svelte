<script lang="ts">
    import {browser} from "$app/env";
    import {
        Box,
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

    import {META_URL, PREVIEW_MAX_FILESIZE} from "../../shared/environment";
    import {ICON_AFFIRMATIVE, ICON_COPY, ICON_DOWNLOAD, ICON_NEGATIVE} from "../../shared/icons";

    import type {FileObject} from "../../shared/supabase/storage";

    import {format_bytes} from "../../shared/util/filesize";
    import {format_timestamp} from "../../shared/util/locale";
    import {MIMETYPE_IMAGE, MIMETYPE_PREVIEWABLE} from "../../shared/util/mimetypes";
    import {base_pathname, dir_pathname, normalize_pathname} from "../../shared/util/url";

    const notifications = getContext("notifications");
    const preview = getContext("preview");

    export let file: FileObject;
    export let state: boolean = $preview === file.name;

    let previous_state: boolean = state;

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

    $: _directory_path = dir_pathname(file.name);
    //$: _base_name = base_pathname(file.name);
    $: _file_path = normalize_pathname(file.name);
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
        {#if MIMETYPE_PREVIEWABLE.includes(file.metadata.mimetype)}
            {#if file.metadata.size >= PREVIEW_MAX_FILESIZE}
                <Dialog.Body>
                    <Box palette="alert" variation="outline">
                        File is too large, skipping preview
                    </Box>
                </Dialog.Body>
            {:else}
                <Dialog.Figure>
                    <!--
                        TODO: This needs to be changed back to the preview URLs whenever
                        SvelteKit is no longer bugged and server routes can serve file blobs again

                        TODO: Look into preventing loading loading when dialog is closed
                    -->

                    {#if MIMETYPE_IMAGE.includes(file.metadata.mimetype)}
                        <img src="/api/v1/storage/files/download{_file_path}" loading="lazy" />
                        <img src="/api/v1/storage/files/download{_file_path}" loading="lazy" />
                    {/if}
                </Dialog.Figure>
            {/if}
        {:else}
            <Dialog.Body>
                <Box palette="alert" variation="outline">File is unsupported, skipping preview</Box>
            </Dialog.Body>
        {/if}

        <!-- TODO: File overflow actions -->
        <Dialog.Heading>{file.name}</Dialog.Heading>

        <Dialog.Body>
            <Formatting.Paragraph>
                <Modifiers.Small>
                    {format_bytes(file.metadata.size)} &bullet; {file.metadata.mimetype}
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

            {#if browser && file.metadata.share}
                <Button palette="affirmative" on:click={on_copy_click}>
                    <ICON_COPY size="1.25em" />
                    <Spacer inline />
                    Copy URL
                </Button>
            {/if}

            <!-- TODO: Auto prompt to download, maybe via `fetch`? -->
            <!-- download={_base_name} -->
            <Button
                href="/api/v1/storage/files/download{_file_path}"
                target="_blank"
                rel="noopener noreferrer"
                palette="negative"
            >
                <ICON_DOWNLOAD size="1.25em" />
                <Spacer inline />
                Download
            </Button>
        </Dialog.Footer>
    </Dialog.Region>
</Dialog.Container>

<style>
    :global(.dialog-preview img) {
        max-height: calc(var(--dialog-region-max-height) * 0.35);
    }

    :global(.dialog-preview img:first-child) {
        position: absolute;
        width: 100%;

        filter: blur(5px) brightness(0.8);
    }

    :global(.dialog-preview img:last-child) {
        object-fit: contain !important;

        z-index: 1;
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
        height: 5ex;
    }
</style>
