<script lang="ts">
    import {browser} from "$app/env";
    import {Button, Hero, Modifiers, Spacer} from "@kahi-ui/svelte";

    import {ICON_SEARCH, ICON_UPLOAD} from "../../shared/icons";

    export let size: "parent" | "viewport" | undefined = undefined;
</script>

<Hero.Container {...$$props} {size}>
    <Hero.Heading>
        <ICON_SEARCH size="1.25em" />
    </Hero.Heading>

    <Hero.Body>
        No files
        <Modifiers.Bold>were found</Modifiers.Bold>.
    </Hero.Body>

    {#if browser}
        <Hero.Footer>
            <!-- TODO: Supabase doesn't support serverside uploads yet -->
            <Button for="dialog-upload" palette="affirmative" variation="outline">
                <ICON_UPLOAD size="1.25em" />
                <Spacer inline />
                Upload File(s)
            </Button>
        </Hero.Footer>
    {/if}
</Hero.Container>
