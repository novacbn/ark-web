<script context="module" lang="ts">
    import {Info} from "svelte-feather/components/Info";
    import {LogOut} from "svelte-feather/components/LogOut";
    import {Settings} from "svelte-feather/components/Settings";

    import type {
        IOmniAction,
        IOmniAnchor,
        IOmniSeparator,
    } from "../components/shell/ShellOmni.svelte";

    export const NAVIGATION_RIGHT: (IOmniAction | IOmniAnchor | IOmniSeparator)[] = [
        {icon: Info, for: "dialog-about", text: "About"},
        //{icon: Settings, href: "/settings", text: "Settings"},
        {separator: ""},
        {icon: LogOut, href: "/auth/logout", text: "Logout", palette: "negative"},
    ];
</script>

<script lang="ts">
    import {Container, Scrollable, Stack} from "@kahi-ui/svelte";

    import * as Dialogs from "../components/dialogs";
    import * as Omnis from "../components/omnis";

    export let branding: string = "N/A";
    export let href: string = "/";
</script>

<Stack class="client-layout-stack" alignment-x="stretch">
    <Omnis.App right={NAVIGATION_RIGHT} {branding} {href} />

    <Scrollable stretch>
        <Container viewport="large">
            <slot />
        </Container>
    </Scrollable>
</Stack>

<Dialogs.About />

<style>
    :global(.client-layout-stack) {
        height: 100vh;
    }

    :global(.client-layout-stack .container) {
        display: flex;
        flex-direction: column;

        min-height: 100%;
    }

    :global(.client-layout-stack .container > [data-stretch]) {
        flex-grow: 1;
    }
</style>
