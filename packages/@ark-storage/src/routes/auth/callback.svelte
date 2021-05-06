<script context="module" lang="ts">
    import {browser} from "$app/env";

    import {reroute_auth} from "../../shared/page";

    // HACK: SupaBase sends the authentication callback data only
    // via hash params, so we can only run on Browser

    export const load = browser
        ? reroute_auth(() => {
              const {access_token, expires_in, refresh_token} = Object.fromEntries(
                  new URLSearchParams(location.hash.slice(1)).entries()
              );

              // NOTE: Removing authentication parameters to improve over-the-shoulder peepers
              history.replaceState(null, "", location.origin + location.pathname + location.search);

              return {
                  props: {
                      access_token,
                      expires_in,
                      refresh_token,
                  },
              };
          })
        : reroute_auth();
</script>

<script lang="ts">
    import {Box, Button, Heading, Spacer, Stack} from "@kahi-ui/svelte";

    export let access_token: string = "";
    export let expires_in: string = "";
    export let refresh_token: string = "";

    export let persist: boolean = false;
</script>

{#if browser}
    {#if !access_token || !expires_in || !refresh_token}
        <Box palette="negative" variation="outline">
            Failed to recieve Authentication data from Identity server.
        </Box>
    {:else}
        <Heading>Authorize Client</Heading>

        <Box>
            <form method="POST" action="/api/v1/auth/callback">
                <Stack alignment-x="between" alignment-y="center" orientation="horizontal">
                    <label for="persist">Remember Login?</label>

                    <input
                        type="checkbox"
                        role="switch"
                        id="persist"
                        name="persist"
                        bind:checked={persist}
                    />
                </Stack>

                <Spacer spacing="medium" />

                <input type="hidden" name="access_token" bind:value={access_token} />
                <input type="hidden" name="expires_in" bind:value={expires_in} />
                <input type="hidden" name="refresh_token" bind:value={refresh_token} />

                <Stack alignment-x="stretch">
                    <Button type="submit" value="Authorize" />
                </Stack>
            </form>
        </Box>
    {/if}
{:else}
    <Box palette="negative" variation="outline">
        Your Browser does not support Javascript or is disabled, which is required for
        Authentication.
    </Box>
{/if}
