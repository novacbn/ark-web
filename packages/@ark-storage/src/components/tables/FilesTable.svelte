<script context="module" lang="ts">
    import {format_bytes} from "../../shared/util/filesize";
    import {format_timestamp} from "../../shared/util/locale";

    import type {ITableColumn} from "./DataTable.svelte";

    export const TABLE_COLUMNS: Readonly<ITableColumn>[] = [
        {member: "icon", text: "", "alignment-x": "center", "alignment-y": "center"},
        {member: "name", text: "File Name"},
        {
            member: "size",
            text: "Size",
            on_render: (member, value: number) => format_bytes(value),
        },
        {member: "mimetype", text: "Mimetype", hidden: "tiny small"},

        {
            member: "created_at",
            text: "Created",
            hidden: "tiny small",
            on_render: (member, value: string) => format_timestamp(value),
        },

        {
            member: "updated_at",
            text: "Last Modified",
            hidden: "tiny small",
            on_render: (member, value: string) => format_timestamp(value),
        },
        {member: "popover", text: ""},
    ];
</script>

<script lang="ts">
    import {Dialog} from "@kahi-ui/svelte";

    import {ICON_FILE} from "../../shared/icons";

    import type {FileObject} from "../../shared/supabase/storage";

    import {MIMETYPE_ICONS} from "../../shared/util/mimetypes";
    import {base_pathname, normalize_pathname} from "../../shared/util/url";

    import * as Popovers from "../popovers";
    import DataTable from "./DataTable.svelte";

    export let entries: FileObject[] = [];

    export let can_delete: boolean = false;
    export let can_download: boolean = false;
    export let can_preview: boolean = false;
    export let can_rename: boolean = false;

    $: _rows = entries.map((entry) => {
        const {created_at, metadata, name, updated_at} = entry;
        const {mimetype, size} = metadata;

        return {
            created_at,
            file_path: normalize_pathname(name),
            name: base_pathname(name).slice(1),
            mimetype,
            size,
            updated_at,
        };
    });
</script>

<DataTable class="table-files" columns={TABLE_COLUMNS} rows={_rows} variation="striped">
    <svelte:fragment slot="column" let:column let:row>
        {#if column.member === "icon"}
            <svelte:component this={MIMETYPE_ICONS[row.mimetype] ?? ICON_FILE} size="2.25em" />
        {:else if column.member === "name" && can_preview}
            <Dialog.Button for="dialog-preview-{row.file_path}" palette="accent" variation="clear">
                {row.name}
            </Dialog.Button>
        {:else if column.member === "popover"}
            <Popovers.FileActions
                id="files-table-popover-{row.file_path}"
                file_path={row.file_path}
                {can_delete}
                {can_download}
                {can_preview}
                {can_rename}
            />
        {:else}
            {column.render(row)}
        {/if}
    </svelte:fragment>
</DataTable>
