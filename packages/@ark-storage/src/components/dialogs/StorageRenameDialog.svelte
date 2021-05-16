<script lang="ts">
    import {browser} from "$app/env";

    import {
        Button,
        Dialog,
        Formatting,
        // @ts-ignore
    } from "@kahi-ui/svelte";
    import {getContext} from "svelte";

    import type {IFormDetails} from "../../client/form";
    import {use_form} from "../../client/form";
    import type {INotificationHandle} from "../../client/notifications";

    import {ICON_AFFIRMATIVE, ICON_NEGATIVE, ICON_UPLOAD} from "../../shared/icons";

    import {base_pathname, dir_pathname, normalize_pathname} from "../../shared/util/url";

    const notifications = getContext("notifications");

    let handle: INotificationHandle | null;
    let form_element: HTMLFormElement;
    let is_valid: boolean = !browser;

    export let file_path: string = "";
    export let value: string = "";
    export let state: boolean = false;

    function on_form_response(response: Response) {
        if (!handle) return;

        try {
            if (response.ok) {
                handle.update({
                    icon: ICON_AFFIRMATIVE,
                    title: "Successfully Renamed File",
                });
            } else {
                handle.update({
                    icon: ICON_NEGATIVE,
                    title: "Failed to Rename File",
                });
            }
        } catch (err) {}

        handle = null;
    }

    function on_form_submit(context: IFormDetails) {
        if (handle) return;

        state = false;
        handle = notifications.push_notification({
            icon: ICON_UPLOAD,
            title: "Renaming File",
            description: `<code>${_file_path.slice(1)}</code>`,
        });
    }

    function on_input(event: Event) {
        is_valid = form_element.checkValidity();
    }

    $: _base_name = base_pathname(file_path);
    $: _directory_path = dir_pathname(file_path);
    $: _file_path = normalize_pathname(file_path);
    $: if (!state) value = "";
</script>

<form
    bind:this={form_element}
    action="/api/v1/storage/files/rename{_file_path}?redirect=/storage{_directory_path}"
    method="post"
    use:use_form={{on_form_submit, on_form_response}}
    on:input={on_input}
>
    <Dialog.Container
        class="dialog-storage-rename"
        id="dialog-storage-rename-{_file_path}"
        palette="light"
        viewport="tiny"
        stretch
        bind:state
    >
        <Dialog.Region>
            <Dialog.Heading>Rename File</Dialog.Heading>

            <Dialog.Body>
                <label>
                    Rename from <Formatting.Code>{_base_name.slice(1)}</Formatting.Code>:
                    <input
                        type="text"
                        name="name"
                        minlength="1"
                        pattern="[\w\-. ]+"
                        placeholder="e.g. my_file.txt"
                        required
                        data-validate
                        bind:value
                    />
                </label>
            </Dialog.Body>

            <Dialog.Footer>
                <Dialog.Button variation="clear">Dismiss</Dialog.Button>
                <Button
                    palette="accent"
                    type="submit"
                    value="Rename"
                    disabled={!!handle || !is_valid}
                />
            </Dialog.Footer>
        </Dialog.Region>
    </Dialog.Container>
</form>
