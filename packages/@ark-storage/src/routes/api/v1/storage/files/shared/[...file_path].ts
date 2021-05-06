import {guard_formdata, reroute_unauth} from "../../../../../../_server/endpoint";

import {normalize_relative} from "../../../../../../shared/util/url";

export const post = reroute_unauth(
    guard_formdata(async (request) => {
        const {logger, storage, user} = request.locals;
        const {file_path = ""} = request.params;
        const enable = request.body.get("enable") === "on";
        const redirect = request.query.has("redirect")
            ? normalize_relative(request.query.get("redirect") as string)
            : "/";

        try {
            // HACK: We don't care about the return, so we
            // can just skip the type checking
            await storage.share_file(file_path, enable as any);
        } catch (err) {
            logger.error(
                err,
                `failed to ${enable ? "enable" : "disable"} sharing of file '${file_path}'`
            );

            return {
                status: 400,
                body: "InvalidRequest",
            };
        }

        logger.info(
            {user_id: user.id, file_path, enable},
            `${enable ? "enabled" : "disabled"} sharing of file '${file_path}'`
        );

        return {
            status: 303,
            headers: {
                location: redirect,
            },

            body: `Redirecting to back to Client, if not redirected <a href='${redirect}'>click here</a>.`,
        };
    })
);
