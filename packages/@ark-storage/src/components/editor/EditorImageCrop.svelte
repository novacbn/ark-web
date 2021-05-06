<script context="module" lang="ts">
    import type {IBounds, IPoint, IRect} from "../../shared/util/math";

    const TEMPLATE_CSS_BOUNDS = (bounds: IBounds) =>
        `left:${bounds.x}px;top:${bounds.y}px;width:${bounds.width}px;height:${bounds.height}px;`;

    const TEMPLATE_CSS_POINT = (point: IPoint) => `${point.x}px ${point.y}px`;

    const TEMPLATE_CSS_CLIP_PATH = (rect: IRect) => {
        const {bottom, left, right, top} = rect;

        const top_left = TEMPLATE_CSS_POINT({x: left, y: top});
        const top_right = TEMPLATE_CSS_POINT({x: right, y: top});

        const bottom_left = TEMPLATE_CSS_POINT({x: left, y: bottom});
        const bottom_right = TEMPLATE_CSS_POINT({x: right, y: bottom});

        return `clip-path: polygon(${top_left}, ${bottom_left}, ${bottom_right}, ${top_right});`;
    };
</script>

<script lang="ts">
    import {createEventDispatcher} from "svelte";

    import type {IActionHandle} from "../../client/actions";
    import {use_drag} from "../../client/drag";

    import type {IDimensions} from "../../shared/util/math";
    import {get_bounds, get_rect, get_relative_point} from "../../shared/util/math";

    import BlobImage from "../utilities/BlobImage.svelte";

    const dispatch = createEventDispatcher();

    let image_element: HTMLImageElement;

    let is_dragging: boolean = false;
    let position_end: IPoint | undefined = undefined;
    let position_start: IPoint | undefined = undefined;

    export let blob: Blob;

    function on_end() {
        is_dragging = false;
        if (!position_end || !position_start) return;

        if (position_start.x === position_end.x && position_start.y === position_end.y) {
            position_start = undefined;
            position_end = undefined;
        }
    }

    function on_start(point: IPoint) {
        is_dragging = true;

        position_start = point;
        position_end = point;
    }

    function on_update(point: IPoint) {
        position_end = point;
    }

    export function get_relative_points(): {end: IPoint; start: IPoint} | void {
        if (!image_element || !position_end || !position_start) return;

        const from: IDimensions = {
            width: image_element.width,
            height: image_element.height,
        };

        const to: IDimensions = {
            width: image_element.naturalWidth,
            height: image_element.naturalHeight,
        };

        return {
            end: get_relative_point(from, to, position_end),
            start: get_relative_point(from, to, position_start),
        };
    }

    export function reset(): void {
        position_end = undefined;
        position_start = undefined;
    }

    $: _rect = position_end && position_start ? get_rect(position_start, position_end) : null;
    $: _bounds = _rect ? get_bounds(_rect) : null;

    let _image_bounds: IBounds | null;
    $: {
        // HACK: Just here to make the block reactive
        image_element;
        _bounds;

        const points = get_relative_points();
        _image_bounds = points ? get_bounds(points.start, points.end) : null;
    }

    let _clip_path: string, _crop_bounds: string;
    $: {
        let old_clip_path = _clip_path;
        if (_rect && _bounds) {
            _clip_path = TEMPLATE_CSS_CLIP_PATH(_rect);
            _crop_bounds = TEMPLATE_CSS_BOUNDS(_bounds);
        } else (_clip_path = ""), (_crop_bounds = "");

        if (_clip_path !== old_clip_path) dispatch("change");
    }

    $: _is_cropping = _clip_path ? true : false;

    let _action: IActionHandle | null;
    $: {
        if (image_element) {
            if (_action) {
                _action.destroy();
                _action = null;
            }

            _action = use_drag(image_element, {
                on_end,
                on_start,
                on_update,
            });
        }
    }

    // HACK: Need to investigate why parent element adds footer spacing
    let _max_height: string;
    $: {
        if (image_element) {
            image_element.addEventListener(
                "load",
                () => (_max_height = image_element ? `max-height:${image_element.height}px;` : "")
            );
        } else _max_height = "";
    }
</script>

<div
    class="editor-image-crop"
    data-cropping={_is_cropping ? true : undefined}
    data-dragging={is_dragging ? true : undefined}
    style={_max_height}
>
    <BlobImage bind:element={image_element} class="editor-image-crop-background" {blob} />

    <div class="editor-image-crop-preview">
        <BlobImage style={_clip_path} {blob} />
        <div class="editor-image-crop-border" style={_crop_bounds}>
            {#if _image_bounds}
                {_image_bounds.width.toFixed()}x{_image_bounds.height.toFixed()}px
            {/if}
        </div>
    </div>
</div>

<style>
    :global(.editor-image-crop) {
        position: relative;

        cursor: se-resize;
        overflow: hidden;
    }

    :global(.editor-image-crop[data-dragging]) {
        cursor: crosshair;
    }

    :global(.editor-image-crop),
    :global(.editor-image-crop-preview),
    :global(.editor-image-crop img) {
        width: 100%;
    }

    :global(.editor-image-crop[data-cropping] > .editor-image-crop-background) {
        filter: blur(1px) brightness(65%);
    }

    :global(.editor-image-crop:not([data-cropping]) > .editor-image-crop-preview) {
        opacity: 0;
    }

    :global(.editor-image-crop-preview) {
        display: inline;
        position: absolute;

        left: 0;
        top: 0;

        pointer-events: none;
    }

    :global(.editor-image-crop-border) {
        display: flex;
        position: absolute;

        align-items: center;
        justify-content: center;

        box-sizing: border-box;

        color: whitesmoke;

        font-size: 0.8rem;
        font-weight: 900;

        filter: drop-shadow(0px 0px 6px black);
        border: 1px solid whitesmoke;
    }
</style>
