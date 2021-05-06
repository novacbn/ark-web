<script context="module" lang="ts">
    import type {INotification} from "../../client/notifications";

    export interface INotificationToastEvent {
        detail: {
            notification: INotification;
        };
    }
</script>

<script lang="ts">
    // @ts-ignore
    import {Button, Toast} from "@kahi-ui/svelte";
    import {createEventDispatcher} from "svelte";

    import {ICON_CLOSE, ICON_REMOVE} from "../../shared/icons";

    const dispatch = createEventDispatcher();

    export let notification: INotification;

    function on_remove_click(event: MouseEvent) {
        dispatch("remove", {notification} as INotificationToastEvent["detail"]);
    }
</script>

<Toast.Region class="toast-notification" palette="light">
    {#if notification.icon}
        <Toast.Figure>
            <svelte:component this={notification.icon} />
        </Toast.Figure>
    {/if}

    <Toast.Body>
        <Toast.Heading>{notification.title}</Toast.Heading>

        {#if notification.description}
            <Toast.Text>{@html notification.description}</Toast.Text>
        {/if}
    </Toast.Body>

    <Toast.Footer>
        <Button palette="negative" variation="clear" on:click={on_remove_click}>
            {#if notification.on_remove}
                <ICON_REMOVE size="1.25em" />
            {:else}
                <ICON_CLOSE size="1.25em" />
            {/if}
        </Button>
    </Toast.Footer>
</Toast.Region>
