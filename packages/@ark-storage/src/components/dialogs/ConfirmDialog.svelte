<script lang="ts">
    import {
        Button,
        Dialog,
        // @ts-ignore
    } from "@kahi-ui/svelte";

    import type {IConfirmPromptHandle} from "../../client/prompts";

    export let handle: IConfirmPromptHandle;

    function on_background_click(event: CustomEvent<MouseEvent>) {
        handle.resolve(false);
    }

    function on_confirm_click(event: MouseEvent) {
        handle.resolve(true);
    }

    function on_dismiss_click(event: MouseEvent) {
        handle.resolve(false);
    }
</script>

<Dialog.Container
    class="dialog-confirm"
    id="dialog-confirm"
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
            <Button variation="clear" on:click={on_dismiss_click}>Dismiss</Button>
            <Button palette="accent" on:click={on_confirm_click}>Confirm</Button>
        </Dialog.Footer>
    </Dialog.Region>
</Dialog.Container>
