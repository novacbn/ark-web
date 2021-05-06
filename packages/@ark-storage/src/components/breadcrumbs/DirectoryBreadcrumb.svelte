<script lang="ts">
    import {Breadcrumb} from "@kahi-ui/svelte";

    import {append_pathname, normalize_pathname} from "../../shared/util/url";

    export let directory_path: string = "";
    export let limit: number = 3;
    export let limit_small: number = 2;

    function get_directory_path(segment: string, index: number): string {
        if (index < 1) return "/" + segment;
        const previous_segments = segments.slice(0, index);

        return append_pathname(previous_segments.join("/"), segment);
    }

    let segments: string[];
    $: {
        const normalized = normalize_pathname(directory_path);
        segments = normalized === "/" ? [""] : normalized.split("/");
    }
</script>

<!--
    TODO: Display only the last two (2) path segments when viewport is too small,
    otherwise display only the last three (3) path segments
-->

<Breadcrumb.Container level={2}>
    {#each segments as segment, index (segment)}
        {#if index === segments.length - 1}
            <Breadcrumb.Item>
                {segment ? segment : "root"}
            </Breadcrumb.Item>
        {:else}
            <Breadcrumb.Anchor href="/storage{get_directory_path(segment, index)}">
                {segment ? segment : "root"}
            </Breadcrumb.Anchor>
        {/if}
    {/each}
</Breadcrumb.Container>

<style>
    :global(.breadcrumb.directory-breadcrumb) {
        white-space: nowrap;
    }
</style>
