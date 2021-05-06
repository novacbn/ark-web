<script lang="ts">
    import {
        Anchor,
        Dialog,
        Formatting,
        Modifiers,
        Scrollable,
        Spacer,
        Stack,
        // @ts-ignore
    } from "@kahi-ui/svelte";
    import {GitMerge} from "svelte-feather/components/GitMerge";
    import {Github} from "svelte-feather/components/Github";

    import PACKAGE from "../../../package.json";

    export let state: boolean = false;
</script>

<Dialog.Container
    class="dialog-about"
    id="dialog-about"
    palette="light"
    viewport="tiny"
    stretch
    bind:state
>
    <Dialog.Region>
        <Dialog.Heading>Ark Storage</Dialog.Heading>

        <Dialog.Body>
            <Scrollable>
                <Stack spacing="tiny">
                    <Formatting.Paragraph>
                        <Modifiers.Small>
                            <GitMerge />
                            <Spacer inline />
                            Version
                        </Modifiers.Small>
                        <br />
                        <code>v{PACKAGE.version}</code>
                    </Formatting.Paragraph>

                    <Formatting.Paragraph>
                        <Modifiers.Small>
                            <Github />
                            <Spacer inline />
                            GitHub
                        </Modifiers.Small>
                        <br />
                        <Anchor
                            href={PACKAGE.repository.url}
                            rel="noopener noreferrer"
                            target="_blank"
                        >
                            Source Code
                        </Anchor>
                    </Formatting.Paragraph>
                </Stack>
            </Scrollable>
        </Dialog.Body>

        <Dialog.Footer>
            <Dialog.Button palette="accent">Dismiss</Dialog.Button>
        </Dialog.Footer>
    </Dialog.Region>
</Dialog.Container>

<style>
    :global(.dialog-about small) {
        opacity: var(--opacity-dull);
    }
</style>
