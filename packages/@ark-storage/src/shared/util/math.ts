export interface IBounds {
    height: number;

    x: number;

    y: number;

    width: number;
}

export interface IDimensions {
    height: number;

    width: number;
}

export interface IPoint {
    x: number;

    y: number;
}

export interface IRect {
    bottom: number;

    left: number;

    right: number;

    top: number;
}

export function get_bounds(rect: IRect): IBounds;
export function get_bounds(start: IPoint, end: IPoint): IBounds;
export function get_bounds(rect: IPoint | IRect, end?: IPoint): IBounds {
    const {left, right, top, bottom} = end ? get_rect(rect as IPoint, end) : (rect as IRect);

    return {
        x: left,
        y: top,

        width: right - left,
        height: bottom - top,
    };
}

export function get_rect(start: IPoint, end: IPoint): IRect {
    const {x: start_x, y: start_y} = start;
    const {x: end_x, y: end_y} = end;

    return {
        left: Math.min(start_x, end_x),
        right: Math.max(start_x, end_x),

        top: Math.min(start_y, end_y),
        bottom: Math.max(start_y, end_y),
    };
}

export function get_relative_point(from: IDimensions, to: IDimensions, point: IPoint): IPoint {
    const x_percent = point.x / from.width;
    const y_percent = point.y / from.height;

    return {
        x: to.width * x_percent,
        y: to.height * y_percent,
    };
}
