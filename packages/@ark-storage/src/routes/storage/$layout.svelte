<script lang="ts">
    import {setContext} from "svelte";

    import ClientLayout from "../_ClientLayout.svelte";

    import {query_param} from "../../shared/location";

    const _preview = query_param("preview");

    setContext("preview", _preview);
</script>

<ClientLayout branding="Files" href="/storage">
    <slot />
</ClientLayout>
