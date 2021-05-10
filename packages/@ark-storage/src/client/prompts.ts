import {browser} from "$app/env";
import type {SvelteComponent} from "svelte";
import type {Readable} from "svelte/store";
import {readable, writable} from "svelte/store";

import {Alert, BlobPreview, Confirm, Input, ModifyImage, Text} from "../components/dialogs";

export interface IPromptOptions {
    title?: string;
}

export interface IPromptHandle<T = any, V extends Record<string, any> = Record<string, any>> {
    component: SvelteComponent;

    reject: (reason: any) => void;

    resolve: (value: T) => void;

    options: V;
}

export interface IAlertPromptHandle extends IPromptHandle<void, IAlertPromptOptions> {}

export interface IAlertPromptOptions extends IPromptOptions {
    text: string;
}

export interface IBlobPreviewPromptHandle extends IPromptHandle<void, IBlobPreviewPromptOptions> {}

export interface IBlobPreviewPromptOptions extends IPromptOptions {
    blob: Blob;
}

export interface IConfirmPromptHandle extends IPromptHandle<boolean, IConfirmPromptOptions> {}

export interface IConfirmPromptOptions extends IPromptOptions {
    text: string;
}

export interface IInputPromptHandle extends IPromptHandle<string, IInputPromptOptions> {}

export interface IInputPromptOptions extends IPromptOptions {
    default_value?: string;

    max_length?: number;

    min_length?: number;

    pattern?: RegExp;

    placeholder?: string;

    required?: boolean;

    text: string;

    type?: "email" | "password" | "text" | "url";
}

export interface IModifyImagePromptHandle extends IPromptHandle<Blob, IModifyImagePromptOptions> {}

export interface IModifyImagePromptOptions extends IPromptOptions {
    blob: Blob;
}

export interface ITextPromptHandle extends IPromptHandle<string, ITextPromptOptions> {}

export interface ITextPromptOptions extends IPromptOptions {
    default_value?: string;

    syntax?: string;
}

export interface IPromptsStore extends Readable<IPromptHandle | null> {
    create_prompt: <T, V extends Record<string, any>>(
        component: SvelteComponent,
        options: V
    ) => Promise<T>;

    prompt_alert: (options: IAlertPromptOptions) => Promise<void>;

    prompt_blob_preview: (options: IBlobPreviewPromptOptions) => Promise<void>;

    prompt_confirm: (options: IConfirmPromptOptions) => Promise<boolean>;

    prompt_input: (options: IInputPromptOptions) => Promise<string>;

    prompt_modify_image: (options: IModifyImagePromptOptions) => Promise<Blob>;

    prompt_text: (options: ITextPromptOptions) => Promise<string>;
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

        prompt_blob_preview(options: IBlobPreviewPromptOptions): Promise<void> {
            return this.create_prompt<void, IBlobPreviewPromptOptions>(
                // @ts-ignore - HACK: `SvelteComponent` not the same as `SvelteComponentDev`?
                BlobPreview,
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

        prompt_text(options: ITextPromptOptions): Promise<string> {
            return this.create_prompt<string, ITextPromptOptions>(
                // @ts-ignore - HACK: `SvelteComponent` not the same as `SvelteComponentDev`?
                Text,
                options
            );
        },
    };
}
