<script lang="ts">
    import {Stack} from "@kahi-ui/svelte";
</script>

<Stack class="layout-auth-stack" alignment="center" spacing="huge">
    <slot />
</Stack>

<style>
    :global(.layout-auth-stack) {
        height: 100vh;
    }

    :global(.layout-auth-stack > .box) {
        width: var(--sizing-block-huge);
    }
</style>
