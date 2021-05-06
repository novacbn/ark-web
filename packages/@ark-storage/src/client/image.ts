import type {IPoint} from "../shared/util/math";
import {get_bounds} from "../shared/util/math";

import {to_blob} from "./bitmap";

export async function crop_image(blob: Blob, start: IPoint, end: IPoint): Promise<Blob> {
    const {x, y, width, height} = get_bounds(start, end);

    const bitmap = await createImageBitmap(blob, x, y, width, height);
    blob = await to_blob(bitmap, blob.type);

    bitmap.close();
    return blob;
}

export async function resize_image(blob: Blob, width: number, height: number): Promise<Blob> {
    const bitmap = await createImageBitmap(blob, {
        resizeHeight: height,
        resizeWidth: width,
        resizeQuality: "high",
    });

    blob = await to_blob(bitmap, blob.type);
    bitmap.close();

    return blob;
}
