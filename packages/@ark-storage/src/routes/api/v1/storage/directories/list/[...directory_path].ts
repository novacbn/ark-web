import {reroute_unauth} from "../../../../../../_server/endpoint";

import type {IQueryResults} from "../../../../../../shared/supabase/storage";

export const get = reroute_unauth(async (request) => {
    const {logger, storage, user} = request.locals;
    const {directory_path} = request.params;
    const {page = "1"} = Object.fromEntries(request.query);

    const parsed_page = parseInt(page);

    if (isNaN(parsed_page)) {
        return {
            status: 400,
            body: "InvalidRequest",
        };
    }

    let results: IQueryResults;
    try {
        results = await storage.query_directory(directory_path, {
            limit: 100,
            offset: (parsed_page - 1) * 100,
        });
    } catch (err) {
        logger.error(err, `failed to query '${directory_path}'`);

        return {
            status: 404,
            body: "InvalidRequest",
        };
    }

    logger.info(
        {user_id: user.id, directory_path},
        `responding with listing for '${directory_path}'`
    );

    return {
        status: 200,

        body: {
            data: results,
        },
    };
});
