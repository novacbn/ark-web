import {createClient} from "@supabase/supabase-js";
import type {SupabaseClient} from "@supabase/supabase-js";
import type {Request} from "@sveltejs/kit";

import {SUPABASE_SERVICE_KEY} from "./environment";

import {PUBLIC_SCHEMA, STORAGE_PREFIX, STORAGE_SCHEMA, SUPABASE_URL} from "../shared/environment";

import {create_client} from "../shared/supabase/client";

import {parse_auth_cookies} from "./auth";

export const SERVICE_PUBLIC_CLIENT: SupabaseClient = createClient(
    SUPABASE_URL,
    SUPABASE_SERVICE_KEY,
    {
        schema: PUBLIC_SCHEMA,
    }
);

export const SERVICE_STORAGE_CLIENT: SupabaseClient = createClient(
    SUPABASE_URL,
    SUPABASE_SERVICE_KEY,
    {
        schema: STORAGE_SCHEMA,
    }
);

export async function create_request_client(request: Request): Promise<SupabaseClient | null> {
    const {headers} = request;

    const {access_token} = parse_auth_cookies(headers.cookie ?? "");
    if (!access_token) return null;

    const client = create_client(access_token);
    const {user} = await client.auth.api.getUser(access_token);
    if (!user) return null;

    // @ts-ignore - HACK: No public method (?) to manually update
    client.auth.currentUser = user;
    return client;
}

export async function create_refresh_client(request: Request): Promise<SupabaseClient | null> {
    const {headers} = request;

    let {refresh_token} = parse_auth_cookies(headers.cookie ?? "");
    if (!refresh_token) return null;

    const client = create_client();
    const {data: session} = await client.auth.api.refreshAccessToken(refresh_token);
    if (!session) return null;

    // @ts-ignore - HACK: No public method (?) to manually update
    client.auth.currentSession = session;
    // @ts-ignore
    client.auth.currentUser = session.user;

    return client;
}

export async function initialize_user(access_token: string): Promise<SupabaseClient> {
    const client = create_client(access_token);
    if (!client) throw new Error("failed to initialize client");

    const {user} = await client.auth.api.getUser(access_token);
    if (!user) throw Error("failed to get user");

    const bucket_id = STORAGE_PREFIX + user.id;
    const response = await client.storage.getBucket(bucket_id);

    if (!response.data) {
        const response = await client.storage.createBucket(bucket_id);
        if (!response.data) throw new Error("failed to create user bucket");
    }

    // @ts-ignore - HACK: No public method (?) to manually update
    client.auth.currentUser = user;
    return client;
}
