<script context="module" lang="ts">
    import type {SvelteComponent} from "svelte";

    import type {
        IMenuAction,
        IMenuAnchor,
        IMenuItem,
        IMenuSeparator,
    } from "../menus/DataMenu.svelte";

    export interface IPopoverAction extends IMenuAction {}

    export interface IPopoverAnchor extends IMenuAnchor {}

    export interface IPopoverItem extends IMenuItem {}

    export interface IPopoverSeparator extends IMenuSeparator {}
</script>

<script lang="ts">
    import {Popover} from "@kahi-ui/svelte";

    import DataMenu from "../menus/DataMenu.svelte";

    let _class: string = "";

    export {_class as class};

    export let popover_id: string;
    export let popover_position:
        | "top"
        | "bottom"
        | "left"
        | "right"
        | string
        | undefined = undefined;
    export let popover_sizing:
        | "tiny"
        | "small"
        | "medium"
        | "large"
        | "huge"
        | undefined = undefined;

    export let button_palette:
        | "accent"
        | "dark"
        | "light"
        | "alert"
        | "affirmative"
        | "negative"
        | undefined = undefined;
    export let button_size: "tiny" | "small" | "large" | "huge" | undefined = undefined;
    export let button_variation: "clear" | "outline";

    export let menu_palette:
        | "accent"
        | "dark"
        | "light"
        | "alert"
        | "affirmative"
        | "negative"
        | undefined = undefined;

    export let items: (IPopoverAction | IPopoverAnchor | IPopoverItem | IPopoverSeparator)[] = [];

    export let icon: SvelteComponent | undefined = undefined;
    export let text: string | undefined = undefined;
</script>

<Popover.Container
    class={_class}
    id={popover_id}
    position={popover_position}
    sizing={popover_sizing}
>
    <Popover.Button palette={button_palette} size={button_size} variation={button_variation}>
        {#if icon}
            <svelte:component this={icon} size="1.25em" />
        {/if}

        {#if text}
            {text}
        {/if}
    </Popover.Button>

    <Popover.Region>
        <DataMenu palette={menu_palette} {items} />
    </Popover.Region>
</Popover.Container>
