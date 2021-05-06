import type {SupabaseClient} from "@supabase/supabase-js";
import type {
    Page,
    LoadInput as SvelteKitLoadInput,
    LoadOutput as SvelteKitLoadOutput,
} from "@sveltejs/kit/types/page";
import type {getContext, setContext} from "svelte";
import type {Readable, Writable} from "svelte/store";

import type {ISession} from "./hooks";

import type {INotificationStore} from "./client/notifications";
import type {IUploadsStore} from "./client/uploads";

import type {StorageClient} from "./shared/supabase/storage";
import type {IPromptsStore} from "./client/prompts";

declare global {
    interface ImportMeta {
        env: Record<string, string | undefined>;
    }
}

declare module "$app/stores" {
    export function getStores(): {
        navigating: Readable<{from: string; to: string} | null>;
        page: Readable<Page>;
        session: Writable<ISession>;
    };

    export const session: Writable<ISession>;
}

declare module "@sveltejs/kit" {
    export interface LoadInputUnauth extends SvelteKitLoadInput {
        session: ISession;

        context: {
            supabase: SupabaseClient | null;
            storage: StorageClient | null;
        };
    }

    export interface LoadInputAuth extends LoadInputUnauth {
        session: Required<ISession>;

        context: {
            storage: StorageClient;
            supabase: SupabaseClient;
        };
    }

    interface LoadOutput extends SvelteKitLoadOutput {
        context?: {
            supabase?: SupabaseClient | null;
            storage?: StorageClient | null;
        };
    }

    export type LoadUnauth = (input: LoadInputUnauth) => LoadOutput | Promise<LoadOutput>;

    export type LoadAuth = (input: LoadInputAuth) => LoadOutput | Promise<LoadOutput>;
}

declare module "svelte" {
    export function getContext(key: "notifications"): INotificationStore;
    export function getContext(key: "preview"): Writable<string>;
    export function getContext(key: "prompts"): IPromptsStore;
    export function getContext(key: "supabase"): SupabaseClient | null;
    export function getContext(key: "storage"): StorageClient | null;
    export function getContext(key: "uploads"): IUploadsStore | null;

    export function setContext(key: "notifications", context: INotificationStore);
    export function setContext(key: "preview", context: Writable<string>);
    export function setContext(key: "prompts", context: IPromptsStore);
    export function setContext(key: "supabase", context: SupabaseClient | null);
    export function setContext(key: "storage", context: StorageClient | null);
    export function setContext(key: "uploads", context: IUploadsStore | null);
}
