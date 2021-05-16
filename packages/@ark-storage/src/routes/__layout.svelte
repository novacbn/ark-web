<script lang="ts">
    import "assets/styles/application.css";
    import "assets/styles/application.theme.css";

    import {session} from "$app/stores";
    import {setContext} from "svelte";

    import {notifications} from "../client/notifications";
    import {prompts} from "../client/prompts";

    import {auth} from "../shared/auth";
    import {META_TITLE} from "../shared/environment";

    import * as Overlays from "../components/overlays";

    const _notifications = notifications();
    setContext("notifications", _notifications);

    const _prompts = prompts();
    setContext("prompts", _prompts);

    const _auth = auth(session, _notifications);
    setContext("auth", _auth);

</script>

<svelte:head>
    <title>{META_TITLE}</title>
</svelte:head>

<slot />

{#if $_prompts}
    <svelte:component this={$_prompts.component} handle={$_prompts} />
{/if}

<Overlays.Notifications />

<style>
    :global(body) {
        min-height: 100vh;
    }

</style>
