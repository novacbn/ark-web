<script lang="ts">
    import {
        Button,
        Dialog,
        // @ts-ignore
    } from "@kahi-ui/svelte";
    import {onMount} from "svelte";
    import type {CodeJar} from "svelte-codejar";

    import type {ITextPromptHandle} from "../../client/prompts";

    import {PromptDismissedError} from "../../shared/errors";

    export let handle: ITextPromptHandle;

    let value: string = handle.options.default_value ?? "";

    function on_background_click(event: CustomEvent<MouseEvent>) {
        handle.reject(new PromptDismissedError("prompt dismissed"));
    }

    function on_confirm_click(event: MouseEvent) {
        handle.resolve(value);
    }

    function on_dismiss_click(event: MouseEvent) {
        handle.reject(new PromptDismissedError("prompt dismissed"));
    }

    let CJ: CodeJar;
    onMount(async () => {
        ({CodeJar: CJ} = await import("svelte-codejar"));
    });
</script>

<!--
    TODO: Syntax highlighting via `highlight.js`
-->

<Dialog.Container
    class="dialog-text"
    id="dialog-text"
    palette="light"
    viewport="large"
    stretch
    state
    on:backgroundclick={on_background_click}
>
    <Dialog.Region>
        <Dialog.Heading>{handle.options.title ?? "Edit Text"}</Dialog.Heading>

        <Dialog.Body>
            {#if CJ}
                <CJ addClosing={true} indentOn={/{$/} spellcheck={false} tab={"\t"} bind:value />
            {/if}
        </Dialog.Body>

        <Dialog.Footer>
            <Button variation="clear" on:click={on_dismiss_click}>Dismiss</Button>
            <Button palette="accent" on:click={on_confirm_click}>Confirm</Button>
        </Dialog.Footer>
    </Dialog.Region>
</Dialog.Container>

<style>
    :global(.dialog-text pre) {
        height: calc(var(--dialog-region-max-height) * 0.45);
        resize: none !important;
    }
</style>
