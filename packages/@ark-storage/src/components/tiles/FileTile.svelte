<script context="module" lang="ts">
    import {UPLOAD_STATE} from "../../client/uploads";

    import {ICON_AFFIRMATIVE, ICON_UPLOAD} from "../../shared/icons";

    const STATE_ICONS = {
        [UPLOAD_STATE.finished]: ICON_AFFIRMATIVE,
        [UPLOAD_STATE.uploading]: ICON_UPLOAD,
    };

    export interface IFileTileModifyEvent {
        detail: {
            blob: Blob;

            file: File;
        };
    }

    export interface IFileTileRemoveEvent {
        detail: {
            file: File;
        };
    }

    export interface IFileTileRenameEvent {
        detail: {
            file: File;

            name: string;
        };
    }
</script>

<script lang="ts">
    import {
        Button,
        Tile,
        // @ts-ignore
    } from "@kahi-ui/svelte";
    import {createEventDispatcher, getContext} from "svelte";

    import {
        can_modify as can_modify_blob,
        can_preview as can_preview_blob,
        modify_blob,
    } from "../../client/blob";

    import {
        ICON_ATTACHMENT,
        ICON_EDIT,
        ICON_FILE,
        ICON_MODIFY,
        ICON_NEGATIVE,
        ICON_REMOVE,
    } from "../../shared/icons";

    import {format_bytes} from "../../shared/util/filesize";
    import {MIMETYPE_ICONS, get_mime_type} from "../../shared/util/mimetypes";

    import * as Inputs from "../inputs";
    import {PromptDismissedError} from "../../shared/errors";

    const dispatch = createEventDispatcher();
    const notifications = getContext("notifications");
    const prompts = getContext("prompts");

    let input_element: HTMLInputElement;
    let is_rename_valid: boolean = false;

    export let can_modify: boolean = false;
    export let can_preview: boolean = false;
    export let can_rename: boolean = false;
    export let can_remove: boolean = false;
    export let file: File;

    export let state: UPLOAD_STATE | undefined = undefined;

    let is_renaming: boolean = false;
    let value: string = "";

    async function on_modify_click(event: MouseEvent) {
        let blob: Blob;
        try {
            blob = await modify_blob(prompts, file);
        } catch (err) {
            if (!(err instanceof PromptDismissedError)) {
                notifications.push_notification({
                    icon: ICON_NEGATIVE,
                    title: "Failed to Modify File",
                });
            }

            return;
        }

        if (blob !== file) {
            dispatch("modify", {
                blob,
                file,
            } as IFileTileModifyEvent["detail"]);
        }
    }

    function on_preview_click(event: MouseEvent) {
        prompts.prompt_blob_preview({blob: file, title: file.name});
    }

    function on_remove_click(event: MouseEvent) {
        dispatch("remove", {file} as IFileTileRemoveEvent["detail"]);
    }

    function on_rename_click(event: MouseEvent) {
        if (is_renaming && value !== file.name) {
            dispatch("rename", {file, name: value} as IFileTileRenameEvent["detail"]);
        } else {
            is_rename_valid = true;
            value = file.name;
        }

        is_renaming = !is_renaming;
    }

    function on_rename_input(event: Event) {
        // HACK: Minimum length attribute not working without `<form>` parent?
        is_rename_valid = value.length > 0 && input_element.checkValidity();
    }

    $: _can_change = !state || state === UPLOAD_STATE.queued;
    $: _can_remove = !state || state === UPLOAD_STATE.finished || state === UPLOAD_STATE.queued;
    $: _can_modify = can_modify && can_modify_blob(file);
    $: _can_preview = can_preview && can_preview_blob(file);
    $: _mime_type = get_mime_type(file.type);
    // @ts-ignore - HACK: Yes I know, `undefined` "cannot" be used as an index
    $: _icon = STATE_ICONS[state] ?? MIMETYPE_ICONS[_mime_type] ?? ICON_FILE;
</script>

<Tile.Container class="tile-file" palette="light">
    <Tile.Figure>
        <svelte:component this={_icon} size="2.25em" />
    </Tile.Figure>

    <Tile.Body>
        <Tile.Heading>
            {#if is_renaming}
                <!-- TODO: Enter key submit value -->
                <Inputs.Editable
                    bind:element={input_element}
                    min_length="1"
                    pattern="[\w\-. ]+"
                    palette="light"
                    placeholder="e.g. my_file.txt"
                    bind:value
                    on:input={on_rename_input}
                />
            {:else}
                {file.name}
            {/if}
        </Tile.Heading>

        <Tile.Text>
            {format_bytes(file.size || 0)} &bullet; {_mime_type || "application/octet-stream"}
        </Tile.Text>
    </Tile.Body>

    <Tile.Footer>
        {#if _can_change && _can_modify}
            <Button palette="alert" on:click={on_modify_click}>
                <ICON_MODIFY size="1.25em" />
            </Button>
        {:else if _can_preview}
            <Button palette="accent" on:click={on_preview_click}>
                <ICON_ATTACHMENT size="1.25em" />
            </Button>
        {/if}

        {#if _can_change && can_rename}
            <Button
                palette={is_renaming ? "affirmative" : "accent"}
                disabled={is_renaming ? !is_rename_valid : false}
                on:click={on_rename_click}
            >
                {#if is_renaming}
                    <ICON_AFFIRMATIVE size="1.25em" />
                {:else}
                    <ICON_EDIT size="1.25em" />
                {/if}
            </Button>
        {/if}

        {#if _can_remove && can_remove}
            <Button palette="negative" on:click={on_remove_click}>
                <ICON_REMOVE size="1.25em" />
            </Button>
        {/if}
    </Tile.Footer>
</Tile.Container>
