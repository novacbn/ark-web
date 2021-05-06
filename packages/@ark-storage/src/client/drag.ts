import type {IPoint} from "../shared/util/math";

import type {IActionHandle} from "./actions";

export interface IDragOptions {
    on_end?: () => void;

    on_start?: (point: IPoint) => void;

    on_update?: (point: IPoint) => void;
}

export function use_drag(
    element: HTMLElement,
    options: IDragOptions = {}
): IActionHandle<IDragOptions | undefined> {
    let {on_end, on_start, on_update} = options;
    let is_dragging = false;

    function get_mouse_point(event: MouseEvent | TouchEvent): IPoint {
        if (event instanceof TouchEvent) {
            const bounds = element.getBoundingClientRect();
            const touch = event.touches[0];

            return {
                x: touch.clientX - bounds.x,
                y: touch.clientY - bounds.y,
            };
        }

        return {
            x: event.offsetX,
            y: event.offsetY,
        };
    }

    function on_interact_start(event: MouseEvent | TouchEvent) {
        event.preventDefault();

        is_dragging = true;
        if (on_start) on_start(get_mouse_point(event));
    }

    function on_interact_end(event: MouseEvent | TouchEvent) {
        event.preventDefault();

        is_dragging = false;
        if (on_end) on_end();
    }

    function on_interact_move(event: MouseEvent | TouchEvent) {
        event.preventDefault();

        if (is_dragging && on_update) on_update(get_mouse_point(event));
    }

    function on_mouse_leave(event: MouseEvent) {
        is_dragging = false;
    }

    element.addEventListener("touchstart", on_interact_start);
    element.addEventListener("mousedown", on_interact_start);

    element.addEventListener("touchend", on_interact_end);
    element.addEventListener("mouseup", on_interact_end);

    element.addEventListener("touchmove", on_interact_move);
    element.addEventListener("mousemove", on_interact_move);

    element.addEventListener("mouseleave", on_mouse_leave);

    return {
        destroy() {
            element.removeEventListener("touchstart", on_interact_start);
            element.removeEventListener("mousedown", on_interact_start);

            element.removeEventListener("touchend", on_interact_end);
            element.removeEventListener("mouseup", on_interact_end);

            element.removeEventListener("touchmove", on_interact_move);
            element.removeEventListener("mousemove", on_interact_move);

            element.removeEventListener("mouseleave", on_mouse_leave);
        },

        update(options: IDragOptions = {}) {
            ({on_end, on_start, on_update} = options);
        },
    };
}
