<script context="module" lang="ts">
    import type {IMenuAction, IMenuAnchor, IMenuSeparator} from "../menus/DataMenu.svelte";

    export interface IOmniAction extends IMenuAction {}

    export interface IOmniAnchor extends IMenuAnchor {}

    export interface IOmniSeparator extends IMenuSeparator {}
</script>

<script lang="ts">
    import {session} from "$app/stores";
    import {Anchor, Button, Dialog, Omni} from "@kahi-ui/svelte";

    import type {ISession} from "../../hooks";

    import {ICON_CLOSE, ICON_MENU} from "../../shared/icons";

    import DataMenu from "../menus/DataMenu.svelte";
    import DataPopover from "../popovers/DataPopover.svelte";

    export let branding: string = "N/A";
    export let href: string = "/";

    export let center: IOmniAnchor[] = [];
    export let right: (IOmniAction | IOmniAnchor | IOmniSeparator)[] = [];

    $: _session = $session as ISession;
</script>

<Dialog.Container
    id="dialog-omni-app"
    palette="light"
    hidden="medium large"
    viewport="tiny"
    stretch
>
    <Dialog.Region>
        <Dialog.Heading>
            {_session.user?.email ?? "N/A"}
            <Dialog.Button palette="dark" variation="clear" size="small">
                <ICON_CLOSE size="1.25em" />
            </Dialog.Button>
        </Dialog.Heading>

        <Dialog.Body>
            <DataMenu palette="light" items={[...center, ...right]} />
        </Dialog.Body>
    </Dialog.Region>
</Dialog.Container>

<Omni.Container class="omni-app" palette="dark">
    <Omni.Heading>
        <Anchor {href}>{branding}</Anchor>
    </Omni.Heading>

    <Omni.Body hidden="tiny small">
        {#each center as link (link.href)}
            <Button
                href={link.href}
                target={link.is_external ? "_blank" : undefined}
                rel={link.is_external ? "noopener noreferrer" : undefined}
                palette={link.palette ?? "light"}
                variation="clear"
            >
                {link.text}
            </Button>
        {/each}
    </Omni.Body>

    <Omni.Footer hidden="medium large" />

    <Omni.Body hidden="medium large">
        <Dialog.Button for="dialog-omni-app" palette="light" variation="clear">
            <ICON_MENU size="1.25em" />
        </Dialog.Button>
    </Omni.Body>

    <Omni.Footer hidden="tiny small">
        <DataPopover
            button_palette="light"
            button_variation="clear"
            menu_palette="light"
            popover_id="popover-omni-right"
            popover_position="bottom+left"
            popover_sizing="medium"
            items={right}
            text={_session.user?.email ?? "N/A"}
        />
    </Omni.Footer>
</Omni.Container>
