<script context="module" lang="ts">
    import {ICON_DIRECTORY_NEW, ICON_UPLOAD} from "../../shared/icons";

    import type {IPopoverAction} from "./DataPopover.svelte";

    const ACTION_CREATE_DIRECTORY: IPopoverAction = {
        icon: ICON_DIRECTORY_NEW,
        for: "dialog-create-directory",
        text: "Create Directory",
    };

    const ACTION_UPLOAD: IPopoverAction = {
        icon: ICON_UPLOAD,
        for: "dialog-upload",
        text: "Upload File(s)",
    };
</script>

<script lang="ts">
    import {browser} from "$app/env";

    import {ICON_NEW} from "../../shared/icons";

    import type {IPopoverAnchor, IPopoverSeparator} from "./DataPopover.svelte";
    import DataPopover from "./DataPopover.svelte";

    export let can_create_directory: boolean = false;
    export let can_upload: boolean = false;

    let _actions: (IPopoverAction | IPopoverAnchor | IPopoverSeparator)[];
    $: {
        _actions = [];
        if (can_create_directory) _actions.push(ACTION_CREATE_DIRECTORY);

        // TODO: Supabase current does not support non-Browser uploads in its JS client
        if (browser && can_upload) _actions.push(ACTION_UPLOAD);
    }
</script>

{#if _actions.length > 0}
    <DataPopover
        class="popover-listing-actions"
        button_palette="affirmative"
        button_size="large"
        button_variation="clear"
        menu_palette="light"
        popover_id="popover-listing-actions"
        popover_position="left+bottom"
        popover_sizing="large"
        icon={ICON_NEW}
        items={_actions}
    />
{/if}
