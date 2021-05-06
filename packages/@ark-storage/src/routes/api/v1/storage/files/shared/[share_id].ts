import type {RequestHandler} from "@sveltejs/kit";

import type {ILocals} from "../../../../../../hooks";

import {SERVICE_PUBLIC_CLIENT, SERVICE_STORAGE_CLIENT} from "../../../../../../_server/supabase";

import {
    OBJECTS_TABLE,
    SHARED_FILES_TABLE,
    SHARED_FILES_TTL,
    STORAGE_PREFIX,
} from "../../../../../../shared/environment";

import type {IObjectRow, ISharedFileRow} from "../../../../../../shared/supabase/schema";

export const get: RequestHandler<ILocals, unknown> = async (request) => {
    const {logger} = request.locals;
    const {share_id = ""} = request.params;

    const {error: table_error, data: table_data} = await SERVICE_PUBLIC_CLIENT.from<ISharedFileRow>(
        SHARED_FILES_TABLE
    )
        .select("id, file_id, user_id")
        .match({id: share_id})
        .limit(1)
        .single();

    if (table_error || !table_data) {
        // @ts-ignore
        logger.error(table_error, `failed to check share of '${share_id}'`);

        return {
            status: 400,
            body: "InvalidRequest",
        };
    }

    const bucket_id = STORAGE_PREFIX + table_data.user_id;

    const {error: bucket_error, data: bucket_data} = await SERVICE_STORAGE_CLIENT.from<IObjectRow>(
        OBJECTS_TABLE
    )
        .select("id, bucket_id, name")
        .match({id: table_data.file_id, bucket_id})
        .limit(1);

    if (bucket_error || !bucket_data || bucket_data.length === 0) {
        logger.error(
            bucket_error
                ? new Error(bucket_error.details)
                : new Error(`failed to fetch '${share_id}' ('${bucket_id}')`),
            `failed to fetch '${share_id}' from table`
        );

        return {
            status: 400,
            body: "InvalidRequest",
        };
    }

    const name: string = bucket_data[0].name;
    const {error: url_error, signedURL: signed_url} = await SERVICE_STORAGE_CLIENT.storage
        .from(bucket_id)
        .createSignedUrl(name, SHARED_FILES_TTL);

    if (url_error || !signed_url) {
        logger.error(
            // @ts-ignore
            table_error,
            `failed to create signed url for path '${name}' ('${bucket_id}')`
        );

        return {
            status: 400,
            body: "InvalidRequest",
        };
    }

    const expires = new Date(Date.now() + SHARED_FILES_TTL);

    logger.info(
        {bucket_id, file_path: name},
        `responding with hotlink to '${name}' ('${bucket_id}')`
    );

    return {
        status: 302,
        headers: {
            expires: expires.toUTCString(),
            "cache-control": "private",
            location: signed_url,
        },

        body: `Redirecting to File, if not redirected <a href='${signed_url}'>click here</a>.`,
    };
};
