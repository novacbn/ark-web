<script context="module" lang="ts">
    import {reroute_unauth} from "../../shared/page";

    export const load = reroute_unauth();
</script>

<script lang="ts">
    import {Box, Button, Formatting, Heading, Stack} from "@kahi-ui/svelte";
</script>

<Heading>Log Out</Heading>

<Box>
    <form method="POST" action="/api/v1/auth/logout">
        <Formatting.Paragraph>Are you sure you want to log out?</Formatting.Paragraph>

        <Stack alignment-x="stretch">
            <Button type="submit" value="Logout" />
        </Stack>
    </form>
</Box>
