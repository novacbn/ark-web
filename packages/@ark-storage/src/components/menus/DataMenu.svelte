<script context="module" lang="ts">
    import type {SvelteComponent} from "svelte";

    export interface IMenuItem {
        icon?: SvelteComponent;

        palette?: "accent" | "dark" | "light" | "alert" | "affirmative" | "negative";

        text: string;

        on_click?: (event: MouseEvent) => void;
    }

    export interface IMenuAction extends IMenuItem {
        for: string;
    }

    export interface IMenuAnchor extends IMenuItem {
        current?: string;

        href: string;

        is_external?: boolean;
    }

    export interface IMenuSeparator {
        separator: string;
    }
</script>

<script lang="ts">
    import {Menu} from "@kahi-ui/svelte";

    let _class: string = "";

    export {_class as class};

    export let palette:
        | "accent"
        | "dark"
        | "light"
        | "alert"
        | "affirmative"
        | "negative"
        | undefined = undefined;

    export let items: (IMenuAction | IMenuAnchor | IMenuItem | IMenuSeparator)[] = [];
</script>

<Menu.Container class={_class} {palette}>
    {#each items as item, index (index)}
        {#if "separator" in item}
            <Menu.Divider />
        {:else if "href" in item}
            <Menu.Button
                current={item.current}
                href={item.href}
                palette={item.palette}
                target={item.is_external ? "_blank" : undefined}
                rel={item.is_external ? "noopener noreferrer" : undefined}
                variation="clear"
                on:click={item.on_click}
            >
                {#if item.icon}
                    <svelte:component this={item.icon} size="1.25em" />
                {/if}

                {item.text}
            </Menu.Button>
        {:else}
            <Menu.Button
                for={item.for ?? undefined}
                palette={item.palette}
                variation="clear"
                on:click={item.on_click}
            >
                {#if item.icon}
                    <svelte:component this={item.icon} size="1.25em" />
                {/if}

                {item.text}
            </Menu.Button>
        {/if}
    {/each}
</Menu.Container>
