<script context="module" lang="ts">
    import {reroute_auth} from "../../shared/page";

    export enum LoginStates {
        login = "login",

        logout = "logout",

        sent = "sent",

        timeout = "timeout",

        unauthenticated = "unauthenticated",
    }

    export const load = reroute_auth(({page}) => {
        let {state = LoginStates.login} = Object.fromEntries(page.query.entries());
        if (!(state in LoginStates)) state = LoginStates.login;

        return {
            props: {
                state,
            },
        };
    });

</script>

<script lang="ts">
    import {Box, Button, Heading, Spacer, Stack} from "@kahi-ui/svelte";

    export let email: string = "";
    export let state: LoginStates = LoginStates.login;

</script>

<Heading>Log In</Heading>

{#if state === LoginStates.logout}
    <Box palette="negative" variation="outline">Logged out of the Application</Box>
{:else if state === LoginStates.sent}
    <Box palette="affirmative" variation="outline">E-Mail sent to your Inbox</Box>
{:else if state === LoginStates.timeout}
    <Box palette="negative" variation="outline">
        Session timed out, logged out of the Application
    </Box>
{:else if state === LoginStates.unauthenticated}
    <Box palette="negative" variation="outline">
        Authentication required for access to the Application
    </Box>
{/if}

<Box>
    <form method="POST" action="/api/v1/auth/login">
        <label for="email">E-Mail:</label>
        <input type="text" name="email" placeholder="e.g. example@example.org" bind:value={email} />

        <Spacer spacing="medium" />

        <Stack alignment-x="stretch">
            <Button type="submit" value="Login with E-Mail" />
        </Stack>
    </form>
</Box>
