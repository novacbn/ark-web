import type {IActionHandle} from "./util/actions";

export interface IFileDropHandler {
    check: (items: DataTransferItemList) => boolean;

    on_drop: (event: DragEvent) => void;
}

export interface IFileDropOptions {
    handlers?: IFileDropHandler[];

    on_filedrop_enter?: (event: DragEvent) => void;

    on_filedrop_drop?: (event: DragEvent) => void;

    on_filedrop_exit?: (event: DragEvent) => void;
}

export function use_filedrop(
    element: Document | HTMLElement,
    options: IFileDropOptions = {}
): IActionHandle<IFileDropOptions | undefined> {
    let {handlers = [], on_filedrop_enter, on_filedrop_drop, on_filedrop_exit} = options;

    function on_drag_enter(event: DragEvent) {
        if (!on_filedrop_enter) return;

        const {dataTransfer: data_transfer, relatedTarget: related_target} = event;
        if (!related_target && data_transfer && data_transfer.types.includes("Files")) {
            on_filedrop_enter(event);
        }
    }

    function on_drag_leave(event: DragEvent) {
        if (!on_filedrop_exit) return;

        const {dataTransfer: data_transfer, relatedTarget: related_target} = event;
        if (!related_target && data_transfer && data_transfer.types.includes("Files")) {
            on_filedrop_exit(event);
        }
    }

    function on_drag_drop(event: DragEvent) {
        const {dataTransfer: data_transfer, relatedTarget: related_target} = event;
        if (!related_target && data_transfer && data_transfer.types.includes("Files")) {
            const handler = handlers.find((handler) => handler.check(data_transfer.items));

            const callback = handler ? handler.on_drop : on_filedrop_drop;
            if (callback) callback(event);
        }
    }

    // @ts-ignore - HACK: Apparently Typescript doesn't type `Document` with
    // `dragenter` / `dragleave` events by default? Even though it does work that way...
    element.addEventListener("dragenter", on_drag_enter);
    // @ts-ignore
    element.addEventListener("dragleave", on_drag_leave);
    // @ts-ignore
    element.addEventListener("drop", on_drag_drop);

    return {
        destroy() {
            // @ts-ignore
            element.removeEventListener("dragenter", on_drag_enter);
            // @ts-ignore
            element.removeEventListener("dragleave", on_drag_leave);
            // @ts-ignore
            element.removeEventListener("drop", on_drag_drop);
        },

        update(options: IFileDropOptions = {}) {
            ({handlers = [], on_filedrop_enter, on_filedrop_drop, on_filedrop_exit} = options);
        },
    };
}
