import {reroute_unauth} from "../../../../../../_server/endpoint";

import {MIMETYPES_KNOWN} from "../../../../../../shared/util/mimetypes";
import {normalize_relative} from "../../../../../../shared/util/url";

export const post = reroute_unauth(async (request) => {
    const {headers} = request;
    const {logger, storage, user} = request.locals;
    const {file_path = ""} = request.params;

    const redirect = request.query.has("redirect")
        ? normalize_relative(request.query.get("redirect") as string)
        : "/";

    try {
        await storage.delete_file(file_path);
    } catch (err) {
        logger.error(err, `failed to delete '${file_path}'`);

        return {
            status: 400,
            body: "InvalidRequest",
        };
    }

    logger.info({user_id: user.id, file_path}, `deleted '${file_path}'`);

    if (headers.accept === MIMETYPES_KNOWN.json) {
        return {
            status: 200,
            body: {
                data: {
                    file_path,
                },
            },
        };
    }

    return {
        status: 303,
        headers: {
            location: redirect,
        },

        body: `Redirecting to back to Client, if not redirected <a href='${redirect}'>click here</a>.`,
    };
});
