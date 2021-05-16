import type {SupabaseClient, User} from "@supabase/supabase-js";
import type {Readable} from "svelte/store";
import {derived} from "svelte/store";

import type {ISession} from "../hooks";

import type {INotificationStore} from "../client/notifications";
import type {IUploadsStore} from "../client/uploads";
import {uploads} from "../client/uploads";

import {create_client} from "./supabase/client";
import {StorageClient} from "./supabase/storage";

export interface IAuthContext {
    storage: StorageClient;

    supabase: SupabaseClient;

    uploads: IUploadsStore;

    user: User;
}

export interface IAuthStore extends Readable<IAuthContext | null> {}

export function auth(session: Readable<ISession>, notifications: INotificationStore) {
    // TODO: Add timeout redirect

    return derived(session, ($session) => {
        const {authentication, storage, user} = $session;
        if (!authentication || !storage || !user) return null;

        const client = create_client(authentication.access_token, user);
        const storage_client = new StorageClient(client, user.id, storage.id);
        const uploads_store = uploads(storage_client, notifications);

        return {
            storage: storage_client,
            supabase: client,
            uploads: uploads_store,
            user,
        };
    });
}
