import {basename} from "path";

import {reroute_unauth} from "../../../../../../_server/endpoint";
import {PREVIEW_MAX_FILESIZE} from "../../../../../../shared/environment";

export const get = reroute_unauth(async (request) => {
    const {logger, storage, user} = request.locals;
    const {file_path} = request.params;

    try {
        const data = await storage.query_data(file_path);

        if (data.metadata.size >= PREVIEW_MAX_FILESIZE) {
            logger.error(
                new Error(`file '${file_path}' too large`),
                `file '${file_path}' too large`
            );

            return {
                status: 413,
                body: "InvalidRequest",
            };
        }
    } catch (err) {
        logger.error(err, `failed to query '${file_path}'`);

        return {
            status: 404,
            body: "InvalidRequest",
        };
    }

    let blob: Blob;
    try {
        blob = await storage.download_file(file_path);
    } catch (err) {
        logger.error(err, `failed to download '${file_path}'`);

        return {
            status: 400,
            body: "InvalidRequest",
        };
    }

    // TODO: Look into the possibility of streaming instead
    //const stream = await blob.stream();
    const array_buffer = await blob.arrayBuffer();
    const buffer = Buffer.from(array_buffer);

    logger.info({user_id: user.id, file_path}, `responding with download for '${file_path}'`);

    // TODO: Compression, caching, creation / update headers?
    return {
        status: 200,
        headers: {
            "content-disposition": `attachment;filename=${basename(file_path)}`,
            "content-length": blob.size.toString(),
            // HACK: Seems like I should be able to respond with the proper mime type
            //"content-type": blob.type || "application/octet-stream",
            "content-type": "application/octet-stream",
        },

        body: buffer,
    };
});
