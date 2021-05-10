<script lang="ts">
    import "assets/styles/application.css";
    import "assets/styles/application.theme.css";

    import {session} from "$app/stores";
    import type {SupabaseClient} from "@supabase/supabase-js";
    import {setContext} from "svelte";

    import {notifications} from "../client/notifications";
    import {prompts} from "../client/prompts";
    import type {IUploadsStore} from "../client/uploads";
    import {uploads} from "../client/uploads";

    import {META_TITLE} from "../shared/environment";

    import {create_session_client} from "../shared/supabase/client";
    import {create_storage_client, StorageClient} from "../shared/supabase/storage";

    import * as Overlays from "../components/overlays";

    const _notifications = notifications();
    setContext("notifications", _notifications);

    const _prompts = prompts();
    setContext("prompts", _prompts);

    let _client: SupabaseClient | null;
    $: {
        _client = create_session_client($session);
        setContext("supabase", _client);
    }

    let _storage: StorageClient | null;
    $: {
        _storage = _client ? create_storage_client(_client, $session.bucket_id) : null;
        setContext("storage", _storage);
    }

    let _uploads: IUploadsStore | null;
    $: {
        _uploads = _client && _storage ? uploads(_client, _storage, _notifications) : null;
        setContext("uploads", _uploads);
    }
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
