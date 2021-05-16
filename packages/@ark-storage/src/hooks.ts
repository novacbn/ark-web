import type {Session, SupabaseClient, User} from "@supabase/supabase-js";
import type {GetSession, Handle} from "@sveltejs/kit";

import {format_auth_cookies, format_unauth_cookies} from "./_server/auth";
import type {IServerLogger} from "./_server/logger";
import {make_logger} from "./_server/logger";
import {create_refresh_client, create_request_client} from "./_server/supabase";

import {STORAGE_PREFIX} from "./shared/environment";

import {StorageClient} from "./shared/supabase/storage";

export interface ILocals {
    logger: IServerLogger;

    session?: Session;

    storage?: StorageClient;

    supabase?: SupabaseClient;

    user?: User;
}

export interface ISession {
    authentication?: {
        access_token: string;
    };

    storage?: {
        id: string;
    };

    user?: User;
}

export const getSession: GetSession<ILocals, ISession> = ({locals}) => {
    const {storage, supabase} = locals;
    if (!supabase || !storage) return {};

    const user = supabase.auth.user();
    const session = supabase.auth.session();
    if (!session || !user) return {};

    return {
        authentication: {
            access_token: session.access_token,
        },

        storage: {
            id: storage.bucket_id,
        },

        user,
    };
};

export const handle: Handle<ILocals> = async ({request, render}) => {
    const logger = make_logger(request);
    logger.request();

    const hook_headers: Record<string, string | string[]> = {};

    let client = await create_request_client(request);
    if (!client) {
        client = await create_refresh_client(request);
        if (client) {
            const {access_token, expires_in, refresh_token} = client.auth.session() as Session;

            hook_headers["set-cookie"] = format_auth_cookies({
                access_token,
                // @ts-ignore - HACK: This really should never be undefined?
                expires_in,
                refresh_token,
                persist: true,
            });

            logger.info({}, "refreshing authentication for session");
        } else {
            hook_headers["set-cookie"] = format_unauth_cookies();
            logger.info({}, "deleting outdated authentication for session");
        }
    }

    let storage: StorageClient | null = null;
    if (client) {
        const user = client.auth.user();
        if (user) storage = new StorageClient(client, user.id, `${STORAGE_PREFIX}${user.id}`);
    }

    request.locals = {
        logger,
        supabase: client || undefined,
        storage: storage || undefined,
        session: client?.auth.session() || undefined,
        user: client?.auth.user() || undefined,
    };

    const response = await render(request);
    logger.response(response);

    return {
        ...response,
        headers: {
            // HACK: SvelteKit's typings don't accept `Record<string, string | string[]>` at the momenet
            ...(hook_headers as any),
            ...response.headers,
        },
    };
};
