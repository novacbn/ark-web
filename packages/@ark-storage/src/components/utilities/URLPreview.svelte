<script lang="ts">
    import {
        Box,
        // @ts-ignore
    } from "@kahi-ui/svelte";

    import {PREVIEW_MAX_FILESIZE} from "../../shared/environment";

    import {
        MIMETYPE_AUDIO,
        MIMETYPE_IMAGE,
        MIMETYPES_PREVIEWABLE,
        MIMETYPE_VIDEO,
    } from "../../shared/util/mimetypes";

    export let file_size: number;
    export let mime_type: string;
    export let src: string;
</script>

{#if MIMETYPES_PREVIEWABLE.includes(mime_type)}
    {#if file_size >= PREVIEW_MAX_FILESIZE}
        <Box palette="alert" variation="outline">File is too large, skipping preview</Box>
    {:else if !src}
        <Box palette="alert" variation="outline">File preview currently not available</Box>
    {:else}
        <!--
            TODO: Look into preventing loading when dialog is closed
        -->

        {#if MIMETYPE_AUDIO.includes(mime_type)}
            <audio preload="none" controls>
                <source {src} />
            </audio>
        {:else if MIMETYPE_IMAGE.includes(mime_type)}
            <img {src} loading="lazy" />
            <img {src} loading="lazy" />
        {:else if MIMETYPE_VIDEO.includes(mime_type)}
            <video preload="none" controls>
                <source {src} />
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
