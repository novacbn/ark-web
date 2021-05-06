import {reroute_unauth} from "../../../../../../_server/endpoint";

import type {FileObject} from "../../../../../../shared/supabase/storage";

export const get = reroute_unauth(async (request) => {
    const {logger, storage, user} = request.locals;
    const {directory_path} = request.params;

    const {limit = "25", offset = "0"} = Object.fromEntries(request.query);

    const parsed_limit = parseInt(limit);
    const parsed_offset = parseInt(offset);

    if (isNaN(parsed_limit) || isNaN(parsed_offset)) {
        return {
            status: 400,
            body: "InvalidRequest",
        };
    }

    let entries: FileObject[];
    try {
        entries = await storage.query_directory(directory_path, {
            limit: parsed_limit,
            offset: parsed_offset,
        });
    } catch (err) {
        logger.error(err, `failed to query '${directory_path}'`);

        return {
            status: 404,
            body: "InvalidRequest",
        };
    }

    const directories = entries.filter((file) => !file.id);
    const files = entries.filter((file) => file.id);

    logger.info(
        {user_id: user.id, directory_path},
        `responding with listing for '${directory_path}'`
    );

    return {
        status: 200,

        body: {
            data: {
                directories,
                files,
            },
        },
    };
});
