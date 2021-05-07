<script context="module" lang="ts">
    enum MODIFY_IMAGE_TABS {
        crop = "crop",

        preview = "preview",
    }
</script>

<script lang="ts">
    import {
        Button,
        Dialog,
        Group,
        Scrollable,
        Spacer,
        Stack,
        // @ts-ignore
    } from "@kahi-ui/svelte";

    import {crop_image} from "../../client/image";
    import type {IModifyImagePromptOptions, IPromptHandle} from "../../client/prompts";

    import {PromptDismissedError} from "../../shared/errors";

    import EditorImageCrop from "../editor/EditorImageCrop.svelte";
    import BlobImage from "../utilities/BlobImage.svelte";

    let editor_crop: EditorImageCrop;

    let has_changed: boolean = false;
    let tab: MODIFY_IMAGE_TABS = MODIFY_IMAGE_TABS.preview;

    export let handle: IPromptHandle<Blob, IModifyImagePromptOptions>;

    function on_background_click(event: CustomEvent<MouseEvent>) {
        handle.reject(new PromptDismissedError("prompt dismissed"));
    }

    function on_dismiss_click(event: MouseEvent) {
        handle.reject(new PromptDismissedError("prompt dismissed"));
    }

    function on_crop_change() {
        has_changed = !!editor_crop.get_relative_points();
    }

    async function on_crop_clear_click(event: MouseEvent) {
        editor_crop.reset();
    }

    async function on_crop_commit_click(event: MouseEvent) {
        const points = editor_crop.get_relative_points();
        if (!points) return;

        editor_crop.reset();
        handle.options.blob = await crop_image(handle.options.blob, points.start, points.end);
    }

    async function on_submit(event: MouseEvent) {
        if (tab === MODIFY_IMAGE_TABS.crop) await on_crop_commit_click(event);
        handle.resolve(handle.options.blob);
    }

    $: {
        // HACK: `tab` is marked to make this block reactive
        tab;

        has_changed = false;
    }
</script>

<Dialog.Container
    class="dialog-modify-image dialog-modify-image-{tab}"
    id="dialog-modify-image"
    palette="light"
    viewport="large"
    stretch
    state
    on:backgroundclick={on_background_click}
>
    <Dialog.Region>
        <Dialog.Heading>{handle.options.title ?? "Modify Image"}</Dialog.Heading>

        <Dialog.Body>
            <Stack orientation="horizontal" alignment-x="stretch">
                <Group stretch>
                    <Button
                        disabled={tab === MODIFY_IMAGE_TABS.preview}
                        on:click={() => (tab = MODIFY_IMAGE_TABS.preview)}
                    >
                        Preview
                    </Button>

                    <Button
                        disabled={tab === MODIFY_IMAGE_TABS.crop}
                        on:click={() => (tab = MODIFY_IMAGE_TABS.crop)}
                    >
                        Crop
                    </Button>
                </Group>
            </Stack>

            <Spacer spacing="huge" />

            <Scrollable>
                <Stack alignment="center">
                    {#if tab === MODIFY_IMAGE_TABS.preview}
                        <BlobImage blob={handle.options.blob} />
                    {:else}
                        <EditorImageCrop
                            bind:this={editor_crop}
                            blob={handle.options.blob}
                            on:change={on_crop_change}
                        />
                    {/if}
                </Stack>
            </Scrollable>
        </Dialog.Body>

        <Dialog.Footer>
            <Dialog.Button variation="clear" on:click={on_dismiss_click}>Dismiss</Dialog.Button>

            {#if tab === MODIFY_IMAGE_TABS.crop}
                <Button palette="negative" disabled={!has_changed} on:click={on_crop_clear_click}>
                    Clear
                </Button>

                <Button
                    palette="affirmative"
                    disabled={!has_changed}
                    on:click={on_crop_commit_click}
                >
                    Commit
                </Button>
            {/if}

            <Button palette="accent" on:click={on_submit}>Submit</Button>
        </Dialog.Footer>
    </Dialog.Region>
</Dialog.Container>

<style>
    :global(.dialog-modify-image .scrollable) {
        max-height: calc(var(--dialog-region-max-height) * 0.6);

        /** source: https://pattern.monster/checkerboard */
        background-image: url("data:image/svg+xml,<svg id='patternId' width='100%' height='100%' xmlns='http://www.w3.org/2000/svg'><defs><pattern id='a' patternUnits='userSpaceOnUse' width='20' height='20' patternTransform='scale(1) rotate(0)'><rect x='0' y='0' width='100%' height='100%' fill='hsla(0,0%,100%,1)'/><path d='M0 0h10v10H0z'  stroke-width='1' stroke='none' fill='hsla(0, 0%, 77%, 1)'/><path d='M10 10h10v10H10z'  stroke-width='1' stroke='none' fill='hsla(0, 0%, 77%, 1)'/></pattern></defs><rect width='800%' height='800%' transform='translate(0,0)' fill='url(%23a)'/></svg>");
        background-attachment: local;
    }

    :global(.dialog-modify-image.dialog-modify-image-preview .scrollable > .stack) {
        min-height: 64px;
    }
</style>
