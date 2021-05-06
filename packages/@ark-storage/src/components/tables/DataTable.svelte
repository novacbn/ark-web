<script context="module" lang="ts">
    export type ITableRow = Record<string, any>;

    export interface ITableColumn {
        "alignment-x"?: "left" | "center" | "right";

        "alignment-y"?: "top" | "center" | "bottom";

        hidden?: string;

        member: string;

        text?: string;

        on_render?: (member: string, value?: any) => string;
    }
</script>

<script lang="ts">
    import {Table} from "@kahi-ui/svelte";

    let _class: string = "";

    export {_class as class};

    export let variation: string;

    export let columns: ITableColumn[] = [];
    export let rows: ITableRow[] = [];

    function create_render(column: ITableColumn): (row: ITableRow) => string {
        const {member, on_render} = column;

        if (on_render) return (row) => on_render(member, row[member]);
        return (row) => (row[member] ?? "undefined").toString();
    }

    $: _columns = columns.map((column) => {
        const render = create_render(column);

        return {...column, render};
    });
</script>

<Table.Container class={_class} {variation}>
    <Table.Heading>
        <Table.Row>
            {#each _columns as column (column.member)}
                <Table.Column hidden={column.hidden} heading>
                    {column.text ?? column.member}
                </Table.Column>
            {/each}
        </Table.Row>
    </Table.Heading>

    <Table.Body>
        {#each rows as row, index (index)}
            <Table.Row>
                {#each _columns as column (column.member)}
                    <td
                        data-alignment-x={column["alignment-x"]}
                        data-alignment-y={column["alignment-y"]}
                        data-hidden={column.hidden}
                    >
                        <slot name="column" {column} {row}>
                            {column.render(row)}
                        </slot>
                    </td>
                {/each}
            </Table.Row>
        {/each}
    </Table.Body>
</Table.Container>

<style>
    td[data-alignment-x="left"] {
        text-align: left;
    }

    td[data-alignment-x="center"] {
        text-align: center;
    }

    td[data-alignment-x="right"] {
        text-align: right;
    }

    td[data-alignment-y="top"] > :global(*) {
        vertical-align: top;
    }

    td[data-alignment-y="center"] > :global(*) {
        vertical-align: middle;
    }

    td[data-alignment-y="bottom"] > :global(*) {
        vertical-align: bottom;
    }
</style>
