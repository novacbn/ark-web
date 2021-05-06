import {MIMETYPES_KNOWN} from "../shared/util/mimetypes";

export function to_blob(
    bitmap: ImageBitmap,
    mimetype: string = MIMETYPES_KNOWN.png,
    quality: number = 1
): Promise<Blob> {
    return new Promise((resolve, reject) => {
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("bitmaprenderer");

        if (!context) {
            reject(
                new Error("bad dispatch to 'to_blob' (context of 'bitmaprendered' unretrievable)")
            );

            return;
        }

        canvas.width = bitmap.width;
        canvas.height = bitmap.height;

        context.transferFromImageBitmap(bitmap);

        canvas.toBlob(
            (blob) => {
                if (blob) resolve(blob);
                else reject(new Error("bad dispatch to 'to_blob' (failed to convert to blob)"));

                canvas.remove();
            },
            mimetype,
            quality
        );
    });
}
