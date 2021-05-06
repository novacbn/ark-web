import {browser} from "$app/env";
import type {SvelteComponent} from "svelte";
import type {Readable} from "svelte/store";
import {readable, writable} from "svelte/store";

import {Alert, Confirm, Input, ModifyImage} from "../components/dialogs";

export interface IAlertPromptOptions {
    text: string;

    title?: string;
}

export interface IConfirmPromptOptions {
    text: string;

    title?: string;
}

export interface IInputPromptOptions {
    default_value?: string;

    max_length?: number;

    min_length?: number;

    pattern?: RegExp;

    placeholder?: string;

    required?: boolean;

    text: string;

    title?: string;

    type?: "email" | "password" | "text" | "url";
}

export interface IModifyImagePromptOptions {
    blob: Blob;

    title?: string;
}

export interface IPromptHandle<T = any, V extends Record<string, any> = Record<string, any>> {
    component: SvelteComponent;

    reject: (reason: any) => void;

    resolve: (value: T) => void;

    options: V;
}

export interface IPromptsStore extends Readable<IPromptHandle | null> {
    create_prompt: <T, V extends Record<string, any>>(
        component: SvelteComponent,
        options: V
    ) => Promise<T>;

    prompt_alert: (options: IAlertPromptOptions) => Promise<void>;

    prompt_confirm: (options: IConfirmPromptOptions) => Promise<boolean>;

    prompt_input: (options: IInputPromptOptions) => Promise<string>;

    prompt_modify_image: (options: IModifyImagePromptOptions) => Promise<Blob>;
}

export function prompts(): IPromptsStore {
    // @ts-ignore - HACK: Other code should be aware methods are not assigned and
    // the store is noop
    if (!browser) return readable<null>(null);

    const store = writable<IPromptHandle | null>(null);
    const {set, subscribe} = store;

    return {
        subscribe,

        create_prompt<T, V extends Record<string, any>>(
            component: SvelteComponent,
            options: V
        ): Promise<T> {
            return new Promise<T>((resolve, reject) => {
                const _reject = (reason: any) => {
                    set(null);
                    reject(reason);
                };

                const _resolve = (value: T) => {
                    set(null);
                    resolve(value);
                };

                const handle: IPromptHandle<T, V> = {
                    component,
                    options,
                    reject: _reject,
                    resolve: _resolve,
                };

                set(handle);
            });
        },

        prompt_alert(options: IAlertPromptOptions): Promise<void> {
            return this.create_prompt<void, IAlertPromptOptions>(
                // @ts-ignore - HACK: `SvelteComponent` not the same as `SvelteComponentDev`?
                Alert,
                options
            );
        },

        prompt_confirm(options: IConfirmPromptOptions): Promise<boolean> {
            return this.create_prompt<boolean, IConfirmPromptOptions>(
                // @ts-ignore - HACK: `SvelteComponent` not the same as `SvelteComponentDev`?
                Confirm,
                options
            );
        },

        prompt_input(options: IInputPromptOptions): Promise<string> {
            return this.create_prompt<string, IInputPromptOptions>(
                // @ts-ignore - HACK: `SvelteComponent` not the same as `SvelteComponentDev`?
                Input,
                options
            );
        },

        prompt_modify_image(options: IModifyImagePromptOptions): Promise<Blob> {
            return this.create_prompt<Blob, IModifyImagePromptOptions>(
                // @ts-ignore - HACK: `SvelteComponent` not the same as `SvelteComponentDev`?
                ModifyImage,
                options
            );
        },
    };
}
