<script lang="ts">
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

    export let file_path: string = "";
    export let state: boolean = false;

    function on_form_response(response: Response) {
        if (!handle) return;

        try {
            if (response.ok) {
                handle.update({
                    icon: ICON_AFFIRMATIVE,
                    title: "Successfully Deleted File",
                });
            } else {
                handle.update({
                    icon: ICON_NEGATIVE,
                    title: "Failed to Delete File",
                });
            }
        } catch (err) {}

        handle = null;
    }

    function on_form_submit(details: IFormDetails) {
        if (handle) return;

        state = false;
        handle = notifications.push_notification({
            icon: ICON_UPLOAD,
            title: "Deleting File",
            description: `<code>${_file_path.slice(1)}</code>`,
        });
    }

    $: _base_name = base_pathname(file_path);
    $: _directory_path = dir_pathname(file_path);
    $: _file_path = normalize_pathname(file_path);
</script>

<form
    action="/api/v1/storage/files/delete{_file_path}?redirect=/storage{_directory_path}"
    method="post"
    use:use_form={{on_form_submit, on_form_response}}
>
    <Dialog.Container
        class="dialog-delete"
        id="dialog-delete-{_file_path}"
        palette="light"
        viewport="tiny"
        stretch
        bind:state
    >
        <Dialog.Region>
            <Dialog.Heading>Delete File</Dialog.Heading>

            <Dialog.Body>
                Are you sure you want to delete <Formatting.Code>
                    {_base_name.slice(1)}
                </Formatting.Code>?
            </Dialog.Body>

            <Dialog.Footer>
                <Dialog.Button variation="clear">Dismiss</Dialog.Button>
                <Button palette="accent" type="submit" value="Delete" disabled={!!handle} />
            </Dialog.Footer>
        </Dialog.Region>
    </Dialog.Container>
</form>
