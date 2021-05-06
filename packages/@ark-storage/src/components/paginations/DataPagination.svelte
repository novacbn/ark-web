<script lang="ts">
    import {Button, Group, Stack} from "@kahi-ui/svelte";

    import {ICON_NEXT, ICON_PREVIOUS} from "../../shared/icons";

    export let palette:
        | "accent"
        | "dark"
        | "light"
        | "alert"
        | "affirmative"
        | "negative"
        | undefined = undefined;
    export let size: "tiny" | "small" | "medium" | "large" | "huge" | undefined = undefined;
    export let variation: "clear" | "outline" | undefined = undefined;
</script>

<Stack orientation="horizontal" alignment-x="between">
    <Button {palette} {size} {variation}>
        <ICON_PREVIOUS size="1.25em" />
    </Button>

    <Group>
        <Button {palette} {size} {variation}>1</Button>
        <Button {palette} {size} {variation}>2</Button>
        <Button {palette} {size} {variation}>3</Button>
    </Group>

    <Button {palette} {size} {variation}>
        <ICON_NEXT size="1.25em" />
    </Button>
</Stack>
