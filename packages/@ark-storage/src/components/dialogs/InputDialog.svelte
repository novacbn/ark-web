<script lang="ts">
    import {
        Button,
        Dialog,
        // @ts-ignore
    } from "@kahi-ui/svelte";

    import type {IInputPromptHandle} from "../../client/prompts";

    import {PromptDismissedError} from "../../shared/errors";

    let form_element: HTMLFormElement;
    let input_element: HTMLInputElement;
    let is_valid: boolean = false;

    export let handle: IInputPromptHandle;

    function on_background_click(event: CustomEvent<MouseEvent>) {
        if (!handle.options.required) handle.reject(new PromptDismissedError("prompt dismissed"));
    }

    function on_dismiss_click(event: MouseEvent) {
        handle.reject(new PromptDismissedError("prompt dismissed"));
    }

    function on_input(event: Event) {
        is_valid = form_element.checkValidity();
    }

    function on_submit(event: Event) {
        event.preventDefault();

        const formdata = new FormData(form_element);
        const value = formdata.get("input");

        if (value) handle.resolve(value.valueOf() as string);
        else handle.resolve("");
    }

    $: if (input_element) input_element.focus();
</script>

<form bind:this={form_element} on:input={on_input} on:submit={on_submit}>
    <Dialog.Container
        class="dialog-input"
        id="dialog-input"
        captive={handle.options.required}
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
                <label>
                    {handle.options.text}:
                    <input
                        bind:this={input_element}
                        type={handle.options.type ?? "text"}
                        name="input"
                        maxlength={handle.options.max_length}
                        minlength={handle.options.min_length}
                        pattern={handle.options.pattern ? handle.options.pattern.source : undefined}
                        placeholder={handle.options.placeholder}
                        value={handle.options.default_value ?? ""}
                        data-validate
                        required
                    />
                </label>
            </Dialog.Body>

            <Dialog.Footer>
                {#if !handle.options.required}
                    <Button variation="clear" value="Dismiss" on:click={on_dismiss_click} />
                {/if}

                <Button palette="accent" type="submit" value="Submit" disabled={!is_valid} />
            </Dialog.Footer>
        </Dialog.Region>
    </Dialog.Container>
</form>
