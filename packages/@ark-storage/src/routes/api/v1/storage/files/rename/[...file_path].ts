import {guard_formdata, reroute_unauth} from "../../../../../../_server/endpoint";

import {MIMETYPES_KNOWN} from "../../../../../../shared/util/mimetypes";
import {normalize_relative} from "../../../../../../shared/util/url";

export const post = reroute_unauth(
    guard_formdata(async (request) => {
        const {headers} = request;
        const {logger, storage, user} = request.locals;
        const {file_path = ""} = request.params;
        const name = request.body.get("name");

        const redirect = request.query.has("redirect")
            ? normalize_relative(request.query.get("redirect") as string)
            : "/";

        if (!name) {
            return {
                status: 400,
                body: "InvalidRequest",
            };
        }

        let new_path: string;
        try {
            new_path = await storage.rename_file(file_path, name);
        } catch (err) {
            logger.error(err, `failed to rename '${file_path}' to '${name}'`);

            return {
                status: 400,
                body: "InvalidRequest",
            };
        }

        logger.info({user_id: user.id, file_path, new_path}, `renamed '${file_path}' to '${name}'`);

        if (headers.accept === MIMETYPES_KNOWN.json) {
            return {
                status: 200,
                body: {
                    data: {
                        old_path: file_path,
                        new_path,
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
    })
);
