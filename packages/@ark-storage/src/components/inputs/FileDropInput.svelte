<script context="module" lang="ts">
    export interface IDropInputEvent {
        detail: {
            files: File[];
        };
    }
</script>

<script lang="ts">
    import {Box, Stack} from "@kahi-ui/svelte";
    import {createEventDispatcher, getContext} from "svelte";

    import {ICON_NEGATIVE, ICON_UPLOAD} from "../../shared/icons";

    const dispatch = createEventDispatcher();
    const notifications = getContext("notifications");

    export let max_size: number = 0;

    function on_input(event: Event) {
        if (!event.isTrusted) return;

        const target = event.target as HTMLInputElement;
        const files = target.files ?? [];

        const _files = Array.from(files).filter((file) => {
            // HACK: For some reason when I dragged files (Manjaro / Gnome) onto the file
            // drop container, there's a chance of a invalid file handle being passed
            //
            // So instead, we just skip 0 byte files
            //
            // TODO: Is there a better way to check for invalid files? This skips legitmate 0 bytes files
            if (file.size === 0) {
                notifications.push_notification({
                    icon: ICON_NEGATIVE,
                    title: "File was Corrupted",
                    description: "Try uploading the file again",
                });

                return false;
            }

            if (max_size && file.size >= max_size) {
                notifications.push_notification({
                    icon: ICON_NEGATIVE,
                    title: "File is Too Large",
                    description: `Skipping file <code>${file.name}</code>`,
                });

                return false;
            }

            return true;
        });

        if (_files.length > 0) {
            target.value = "";
            dispatch("drop", {files: _files} as IDropInputEvent["detail"]);
        }
    }
</script>

<Box class="input-file-drop" for="input-file-drop">
    <Stack alignment-x="center" spacing="small">
        <ICON_UPLOAD size="2.25em" />
        <span>Drag-and-Drop files here...</span>
        <input name="input-file-drop" type="file" multiple on:input={on_input} />
    </Stack>
</Box>

<style>
    :global(.input-file-drop) {
        display: block;
        position: relative;

        padding: var(--spacing-block-huge);

        font-size: 95%;
        border: dashed var(--border-block) hsl(var(--palette-default-bold));

        opacity: var(--opacity-dull);
        z-index: var(--z-index-content);
    }

    input {
        position: absolute;

        top: 0;
        left: 0;

        width: 100%;
        height: 100%;

        opacity: 0;
        z-index: var(--z-index-inline);
    }

    input::file-selector-button {
        cursor: pointer;

        width: 100%;
        height: 100%;
    }
</style>
