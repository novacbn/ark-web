<script lang="ts">
    import {
        Button,
        Dialog,
        // @ts-ignore
    } from "@kahi-ui/svelte";

    import type {IAlertPromptOptions, IPromptHandle} from "../../client/prompts";

    export let handle: IPromptHandle<void, IAlertPromptOptions>;

    function on_background_click(event: CustomEvent<MouseEvent>) {
        handle.resolve();
    }

    function on_dismiss_click(event: MouseEvent) {
        handle.resolve();
    }
</script>

<Dialog.Container
    class="dialog-alert"
    id="dialog-alert"
    palette="light"
    viewport="tiny"
    stretch
    state
    on:backgroundclick={on_background_click}
>
    <Dialog.Region>
        {#if handle.options.title}
            <Dialog.Heading>{handle.options.title}</Dialog.Heading>
        {/if}

        <Dialog.Body>
            {handle.options.text}
        </Dialog.Body>

        <Dialog.Footer>
            <Button palette="accent" on:click={on_dismiss_click}>Dismiss</Button>
        </Dialog.Footer>
    </Dialog.Region>
</Dialog.Container>
