<script lang="ts">
    import {createEventDispatcher} from "svelte";

    import {ICON_MODIFY, ICON_OVERFLOW} from "../../shared/icons";

    import type {
        IPopoverAction,
        IPopoverAnchor,
        IPopoverItem,
        IPopoverSeparator,
    } from "./DataPopover.svelte";
    import DataPopover from "./DataPopover.svelte";

    const dispatch = createEventDispatcher();

    export let id: string = "";

    export let can_modify: boolean = false;

    // HACK: Svelte doesn't like type annotations in reactive variables definitions
    let ACTION_MODIFY: IPopoverItem;
    $: ACTION_MODIFY = {
        icon: ICON_MODIFY,
        palette: "dark",
        text: "Modify",
        on_click: (event: MouseEvent) => dispatch("modify", event),
    };

    let _actions: (IPopoverAction | IPopoverAnchor | IPopoverItem | IPopoverSeparator)[];
    $: {
        _actions = [];
        if (can_modify) _actions.push(ACTION_MODIFY);
    }
</script>

{#if _actions.length > 0}
    <DataPopover
        class="popover-upload-actions"
        button_palette="dark"
        button_variation="clear"
        menu_palette="light"
        popover_id={id}
        popover_position="left+bottom"
        popover_sizing="medium"
        icon={ICON_OVERFLOW}
        items={_actions}
    />
{/if}
