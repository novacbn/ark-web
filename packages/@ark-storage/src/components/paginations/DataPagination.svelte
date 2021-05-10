<script lang="ts">
    import {Button, Group, Stack} from "@kahi-ui/svelte";

    import {ICON_NEXT, ICON_PREVIOUS} from "../../shared/icons";

    import {substitute_value} from "../../shared/util/string";

    export let current: number;
    export let delta: number;
    export let href: string;
    export let pages: number;

    export let palette:
        | "accent"
        | "dark"
        | "light"
        | "alert"
        | "affirmative"
        | "negative"
        | undefined = undefined;
    export let size: "tiny" | "small" | "medium" | "large" | "huge" | undefined = undefined;
    export let variation: "clear" | "outline" | undefined = undefined;

    function format_href(page: number): string {
        return substitute_value(href, page);
    }

    let _pages: number[];
    $: {
        _pages = [];

        const range_low = Math.max(2, current - delta - Math.max(delta + 1 - (pages - current), 0));
        const range_high = Math.min(
            pages - 1,
            current + delta + Math.max(delta + 1 - (current - 1), 0)
        );

        for (let count = range_low; count <= range_high; count++) _pages.push(count);
    }

    $: _prev_page = Math.max(1, current - 1);
    $: _next_page = Math.min(pages, current + 1);
</script>

<Stack orientation="horizontal" alignment-x="between">
    <Button
        href={format_href(_prev_page)}
        disabled={current === _prev_page}
        {palette}
        {size}
        {variation}
    >
        <ICON_PREVIOUS size="1.25em" />
    </Button>

    <Group>
        <Button href={format_href(1)} disabled={current === 1} {palette} {size} {variation}>
            1
        </Button>

        {#if pages > 1 && _pages[0] !== 2}
            <span>...</span>
        {/if}

        {#each _pages as page (page)}
            <Button
                href={format_href(page)}
                disabled={current === page}
                {palette}
                {size}
                {variation}
            >
                {page}
            </Button>
        {/each}

        {#if pages > 1}
            {#if _pages[_pages.length - 1] !== pages - 1}
                <span>...</span>
            {/if}

            <Button
                href={format_href(pages)}
                disabled={current === pages}
                {palette}
                {size}
                {variation}
            >
                {pages}
            </Button>
        {/if}
    </Group>

    <Button
        href={format_href(_next_page)}
        disabled={current === _next_page}
        {palette}
        {size}
        {variation}
    >
        <ICON_NEXT size="1.25em" />
    </Button>
</Stack>

<style>
    span {
        align-self: center;
    }
</style>
