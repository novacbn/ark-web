<script lang="ts">
    import {Toast} from "@kahi-ui/svelte";
    import {getContext} from "svelte";

    import * as Toasts from "../toasts";
    import type {INotificationToastEvent} from "../toasts/NotificationToast.svelte";

    const notifications = getContext("notifications");

    function on_remove(event: INotificationToastEvent) {
        const {notification} = event.detail;

        notifications.remove_notification(notification.identifier);
    }
</script>

<Toast.Container
    class="overlay-notifications"
    alignment-x="right"
    alignment-y="bottom"
    spacing="small"
>
    {#each $notifications as notification (notification.identifier)}
        <Toasts.Notification {notification} on:remove={on_remove} />
    {/each}
</Toast.Container>
