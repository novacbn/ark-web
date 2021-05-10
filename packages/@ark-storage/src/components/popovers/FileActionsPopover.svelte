<script lang="ts">
    import {
        ICON_ATTACHMENT,
        ICON_DOWNLOAD,
        ICON_EDIT,
        ICON_OVERFLOW,
        ICON_REMOVE,
    } from "../../shared/icons";

    import {normalize_pathname} from "../../shared/util/url";

    import type {IPopoverAction, IPopoverAnchor, IPopoverSeparator} from "./DataPopover.svelte";
    import DataPopover from "./DataPopover.svelte";

    export let id: string = "";

    export let file_path: string = "";

    export let can_delete: boolean = false;
    export let can_download: boolean = false;
    export let can_preview: boolean = false;
    export let can_rename: boolean = false;

    $: _file_path = normalize_pathname(file_path);

    // HACK: Svelte doesn't like type annotations in reactive variables definitions
    let ACTION_DELETE: IPopoverAction;
    $: ACTION_DELETE = {
        icon: ICON_REMOVE,
        for: `dialog-storage-delete-${_file_path}`,
        palette: "negative",
        text: "Delete",
    };

    let ACTION_DOWNLOAD: IPopoverAnchor;
    $: ACTION_DOWNLOAD = {
        icon: ICON_DOWNLOAD,
        href: `/api/v1/storage/files/download${_file_path}`,
        is_external: true,
        text: "Download",
    };

    let ACTION_PREVIEW: IPopoverAction;
    $: ACTION_PREVIEW = {
        icon: ICON_ATTACHMENT,
        for: `dialog-storage-preview-${_file_path}`,
        text: "Preview",
    };

    let ACTION_RENAME: IPopoverAction;
    $: ACTION_RENAME = {
        icon: ICON_EDIT,
        for: `dialog-storage-rename-${_file_path}`,
        text: "Rename",
    };

    let _actions: (IPopoverAction | IPopoverAnchor | IPopoverSeparator)[];
    $: {
        _actions = [];
        if (can_preview) _actions.push(ACTION_PREVIEW);
        if (can_download) _actions.push(ACTION_DOWNLOAD);
        if (can_rename) _actions.push(ACTION_RENAME);
        if (can_delete) _actions.push({separator: ""}, ACTION_DELETE);
    }
</script>

{#if _actions.length > 0}
    <DataPopover
        class="popover-file-actions"
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
