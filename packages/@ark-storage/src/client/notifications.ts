import {browser} from "$app/env";
import type {SvelteComponent} from "svelte";
import type {Readable} from "svelte/store";
import {get, readable, writable} from "svelte/store";

import {generate_id} from "../shared/util/generate";

export interface INotification {
    description?: string;

    icon?: SvelteComponent;

    identifier: string;

    title: string;

    on_remove?: (notification: INotification) => void;
}

export interface INotificationInput extends Omit<INotification, "identifier"> {}

export interface INotificationHandle {
    identifier: string;

    remove: () => void;

    update: (notification: Partial<INotificationInput>) => void;
}

export interface INotificationStore extends Readable<readonly Readonly<INotification>[]> {
    push_notification: (input: INotificationInput) => INotificationHandle;

    remove_notification: (identifier: string) => void;

    update_notification: (identifier: string, input: Partial<INotificationInput>) => void;
}

export function notifications(default_value: INotification[] = []): INotificationStore {
    // @ts-ignore - HACK: Other code should be aware methods are not assigned and
    // the store is noop
    if (!browser) readable<readonly Readonly<INotification>[]>(default_value);

    const store = writable<readonly Readonly<INotification>[]>(default_value);
    const {subscribe, set} = store;

    return {
        subscribe,

        push_notification(input) {
            const identifier = generate_id();
            const notification = {
                identifier,
                ...input,
            };

            set([...get(store), notification]);

            return {
                identifier,
                remove: () => this.remove_notification(identifier),
                update: (input: Partial<INotificationInput>) =>
                    this.update_notification(identifier, input),
            };
        },

        remove_notification(identifier) {
            let notifications = [...get(store)];
            const index = notifications.findIndex(
                (notification) => notification.identifier === identifier
            );

            if (index < 0) {
                throw new ReferenceError(
                    `bad argument #0 to 'remove_notification' (identifier '${identifier}' not found)`
                );
            }

            const [notification] = notifications.splice(index, 1);
            if (notification.on_remove) notification.on_remove(notification);

            set(notifications);
        },

        update_notification(identifier, input) {
            let notifications = [...get(store)];
            const index = notifications.findIndex(
                (notification) => notification.identifier === identifier
            );

            if (index < 0) {
                throw new ReferenceError(
                    `bad argument #0 to 'update_notification' (identifier '${identifier}' not found)`
                );
            }

            notifications[index] = {...notifications[index], ...input};
            set(notifications);
        },
    };
}
