import {browser} from "$app/env";
import {getStores} from "$app/stores";
import type {Page} from "@sveltejs/kit";
import {get, Readable, Writable} from "svelte/store";
import {derived} from "svelte/store";

import {is_affirmative} from "./util/string";

// TODO: cleanup

export interface IQueryParamOptions<T> {
    default_value?: T;

    replace_state?: boolean;
}

export function query_param(
    name: string,
    options: IQueryParamOptions<string> = {}
): Writable<string> {
    const {default_value = "", replace_state = true} = options;
    const {page} = getStores();

    let _store_set: (value: string) => void;
    const store = derived<Readable<Page>, string>(page, ($page, set) => {
        const {query} = $page;

        _store_set = set;
        set(query.has(name) ? (query.get(name) as string) : default_value);
    });

    function set(value: string) {
        if (!browser) {
            throw new Error(
                "bad dispatch to 'query_param.set' (store is read-only while in server context)"
            );
        }

        const {hash, pathname} = location;
        const query = new URLSearchParams(location.search);

        if (value === default_value) query.delete(name);
        else query.set(name, value);

        const search = query.toString();
        const href = pathname + (search ? "?" + search : "") + hash;

        if (replace_state) history.replaceState(history.state, document.title, href);
        else history.pushState(history.state, document.title, href);

        _store_set(value);
    }

    function update(updater: (value: string) => string) {
        const value = get(store);

        set(updater(value));
    }

    return {set, subscribe: store.subscribe, update};
}

export function query_param_boolean(
    name: string,
    options: IQueryParamOptions<boolean> = {}
): Writable<boolean> {
    function to_boolean(value: string) {
        return is_affirmative(value);
    }

    function from_boolean(value: boolean) {
        return value.toString();
    }

    const {default_value = false, replace_state = true} = options;
    const {set, subscribe, update} = query_param(name, {
        default_value: default_value.toString(),
        replace_state,
    });

    return {
        set(value) {
            set(from_boolean(value));
        },

        subscribe(callback) {
            return subscribe((value) => {
                callback(to_boolean(value));
            });
        },

        update(callback) {
            update((value) => {
                return from_boolean(callback(to_boolean(value)));
            });
        },
    };
}
