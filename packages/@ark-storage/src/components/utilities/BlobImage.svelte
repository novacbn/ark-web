<script lang="ts">
    import {onDestroy} from "svelte";

    export let blob: Blob;
    export let element: HTMLImageElement | undefined = undefined;

    onDestroy(() => {
        if (_src) URL.revokeObjectURL(_src);
    });

    let _src: string | undefined;
    $: {
        if (_src) {
            URL.revokeObjectURL(_src);
            _src = undefined;
        }

        if (blob) _src = URL.createObjectURL(blob);
    }
</script>

<img bind:this={element} {...$$props} blob={undefined} src={_src} />
