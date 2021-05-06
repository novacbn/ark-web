import {reroute_unauth} from "../../../../../../_server/endpoint";

import {DOWNLOAD_TTL} from "../../../../../../shared/environment";

export const get = reroute_unauth(async (request) => {
    const {logger, supabase, storage, user} = request.locals;
    const {file_path = ""} = request.params;

    const {error: url_error, signedURL: signed_url} = await supabase.storage
        .from(storage.bucket_id)
        .createSignedUrl(file_path, DOWNLOAD_TTL);

    if (url_error || !signed_url) {
        logger.error(
            // @ts-ignore
            table_error,
            `failed to create signed url for path '${file_path}'`
        );

        return {
            status: 400,
            body: "InvalidRequest",
        };
    }

    const expires = new Date(Date.now() + DOWNLOAD_TTL);

    logger.info({user_id: user.id, file_path}, `responding with hotlink to '${file_path}'`);

    return {
        status: 302,
        headers: {
            expires: expires.toUTCString(),
            "cache-control": "private",
            location: signed_url,
        },

        body: `Redirecting to File, if not redirected <a href='${signed_url}'>click here</a>.`,
    };
});
