<script lang="ts">
    export let element: HTMLInputElement;

    export let name: string = "";
    export let placeholder: string = "";
    export let value: string = "";

    export let max_length: number | string | undefined = undefined;
    export let min_length: number | string | undefined = undefined;
    export let pattern: string | undefined = undefined;

    export let palette:
        | "accent"
        | "dark"
        | "light"
        | "alert"
        | "affirmative"
        | "negative"
        | undefined;
</script>

<input
    bind:this={element}
    class="input-editable-text"
    type="text"
    maxlength={max_length}
    minlength={min_length}
    data-palette={palette}
    {name}
    {pattern}
    {placeholder}
    bind:value
    on:change
    on:input
/>

<style>
    /** TODO: inherit highlighting */
    .input-editable-text {
        padding: 0;

        border: none;
        border-radius: 0;

        background-color: whitesmoke;
        color: currentColor;

        font-size: inherit;
        font-weight: inherit;
    }
</style>
