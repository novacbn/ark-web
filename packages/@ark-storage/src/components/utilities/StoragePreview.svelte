<script lang="ts">
    import {
        Box,
        // @ts-ignore
    } from "@kahi-ui/svelte";

    import {PREVIEW_MAX_FILESIZE} from "../../shared/environment";

    import type {FileObject} from "../../shared/supabase/storage";

    import {
        MIMETYPE_AUDIO,
        MIMETYPE_IMAGE,
        MIMETYPES_PREVIEWABLE,
        MIMETYPE_VIDEO,
        get_mime_type,
    } from "../../shared/util/mimetypes";

    export let file: FileObject;
    export let preview_url: string;

    $: _mime_type = get_mime_type(file.metadata.mimetype);
</script>

{#if MIMETYPES_PREVIEWABLE.includes(_mime_type)}
    {#if file.metadata.size >= PREVIEW_MAX_FILESIZE}
        <Box palette="alert" variation="outline">File is too large, skipping preview</Box>
    {:else if !preview_url}
        <Box palette="alert" variation="outline">File preview currently not available</Box>
    {:else}
        <!--
            TODO: Look into preventing loading when dialog is closed
        -->

        {#if MIMETYPE_AUDIO.includes(_mime_type)}
            <audio preload="none" controls>
                <source src={preview_url} />
            </audio>
        {:else if MIMETYPE_IMAGE.includes(_mime_type)}
            <img src={preview_url} loading="lazy" />
            <img src={preview_url} loading="lazy" />
        {:else if MIMETYPE_VIDEO.includes(_mime_type)}
            <video preload="none" controls>
                <source src={preview_url} />
            </video>
        {/if}
    {/if}
{:else}
    <Box palette="alert" variation="outline">File is unsupported, skipping preview</Box>
{/if}

<style>
    audio {
        height: revert;
    }

    img:first-child {
        position: absolute;
        width: 100%;

        filter: blur(5px) brightness(0.8);
    }

    img:last-child {
        z-index: 1;
    }

    video {
        background-color: black;
    }

    img:last-child,
    video {
        object-fit: contain !important;
    }
</style>
