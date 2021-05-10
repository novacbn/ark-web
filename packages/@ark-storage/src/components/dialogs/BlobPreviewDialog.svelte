<script lang="ts">
    import {
        Button,
        Dialog,
        Formatting,
        Modifiers,
        // @ts-ignore
    } from "@kahi-ui/svelte";

    import type {IBlobPreviewPromptHandle} from "../../client/prompts";

    import {format_bytes} from "../../shared/util/filesize";
    import {get_mime_type} from "../../shared/util/mimetypes";

    import URLPreview from "../utilities/URLPreview.svelte";

    export let handle: IBlobPreviewPromptHandle;

    const src = URL.createObjectURL(handle.options.blob);

    function on_background_click(event: CustomEvent<MouseEvent>) {
        URL.revokeObjectURL(src);
        handle.resolve();
    }

    function on_dismiss_click(event: MouseEvent) {
        URL.revokeObjectURL(src);
        handle.resolve();
    }

    $: _mime_type = get_mime_type(handle.options.blob.type);
</script>

<Dialog.Container
    class="dialog-preview"
    id="dialog-preview"
    palette="light"
    viewport="tiny"
    stretch
    state
    on:backgroundclick={on_background_click}
>
    <Dialog.Region>
        <Dialog.Figure>
            <URLPreview file_size={handle.options.blob.size} mime_type={_mime_type} {src} />
        </Dialog.Figure>

        <Dialog.Heading>{handle.options.title ?? "Preview"}</Dialog.Heading>

        <Dialog.Body>
            <Formatting.Paragraph>
                <Modifiers.Small>
                    {format_bytes(handle.options.blob.size)} &bullet; {_mime_type}
                </Modifiers.Small>
            </Formatting.Paragraph>
        </Dialog.Body>

        <Dialog.Footer>
            <Button palette="accent" on:click={on_dismiss_click}>Dismiss</Button>
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
</style>
