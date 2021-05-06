import {LOCALE_DEFAULT} from "../environment";

export function format_timestamp(timestamp: Date | number | string) {
    return new Date(timestamp).toLocaleString(LOCALE_DEFAULT);
}
