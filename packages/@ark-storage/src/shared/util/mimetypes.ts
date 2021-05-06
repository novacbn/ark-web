import type {SvelteComponent} from "svelte";

import {ICON_MIMETYPE_AUDIO, ICON_MIMETYPE_IMAGE, ICON_MIMETYPE_VIDEO} from "../icons";

export enum MIMETYPES_KNOWN {
    json = "application/json",

    flac = "audio/flac",
    mp3 = "audio/mp3",
    ogg = "audio/ogg",

    apng = "image/apng",
    bmp = "image/bmp",
    gif = "image/gif",
    jpg = "image/jpeg",
    jpeg = "image/jpeg",
    png = "image/png",
    svg = "image/svg+xm",
    webp = "image/webp",

    mp4 = "video/mp4",
    webm = "video/webm",
}

export const MIMETYPE_EXTENSIONS: Readonly<Record<string, string | undefined>> = {
    [MIMETYPES_KNOWN.bmp]: "bmp",
    [MIMETYPES_KNOWN.jpeg]: "jpeg",
    [MIMETYPES_KNOWN.png]: "png",
};

export const MIMETYPE_ICONS: Readonly<Record<string, SvelteComponent | undefined>> = {
    [MIMETYPES_KNOWN.flac]: ICON_MIMETYPE_AUDIO,
    [MIMETYPES_KNOWN.mp3]: ICON_MIMETYPE_AUDIO,
    [MIMETYPES_KNOWN.ogg]: ICON_MIMETYPE_AUDIO,

    [MIMETYPES_KNOWN.apng]: ICON_MIMETYPE_IMAGE,
    [MIMETYPES_KNOWN.bmp]: ICON_MIMETYPE_IMAGE,
    [MIMETYPES_KNOWN.gif]: ICON_MIMETYPE_IMAGE,
    [MIMETYPES_KNOWN.jpeg]: ICON_MIMETYPE_IMAGE,
    [MIMETYPES_KNOWN.png]: ICON_MIMETYPE_IMAGE,
    [MIMETYPES_KNOWN.svg]: ICON_MIMETYPE_IMAGE,
    [MIMETYPES_KNOWN.webp]: ICON_MIMETYPE_IMAGE,

    [MIMETYPES_KNOWN.mp4]: ICON_MIMETYPE_VIDEO,
    [MIMETYPES_KNOWN.webm]: ICON_MIMETYPE_VIDEO,
};

export const MIMETYPE_PASTEABLE: readonly string[] = [
    MIMETYPES_KNOWN.bmp,
    MIMETYPES_KNOWN.jpeg,
    MIMETYPES_KNOWN.png,
];

export const MIMETYPE_PREVIEWABLE: readonly string[] = [
    MIMETYPES_KNOWN.flac,
    MIMETYPES_KNOWN.gif,
    MIMETYPES_KNOWN.ogg,
    MIMETYPES_KNOWN.jpeg,
    MIMETYPES_KNOWN.mp3,
    MIMETYPES_KNOWN.mp4,
    MIMETYPES_KNOWN.png,
    MIMETYPES_KNOWN.svg,
    MIMETYPES_KNOWN.webm,
];

export const MIMETYPE_AUDIO: readonly string[] = [
    MIMETYPES_KNOWN.flac,
    MIMETYPES_KNOWN.mp3,
    MIMETYPES_KNOWN.ogg,
];

export const MIMETYPE_IMAGE: readonly string[] = [
    MIMETYPES_KNOWN.apng,
    MIMETYPES_KNOWN.bmp,
    MIMETYPES_KNOWN.gif,
    MIMETYPES_KNOWN.jpeg,
    MIMETYPES_KNOWN.png,
    MIMETYPES_KNOWN.svg,
    MIMETYPES_KNOWN.webp,
];

export const MIMETYPE_VIDEO: readonly string[] = [MIMETYPES_KNOWN.mp4, MIMETYPES_KNOWN.webm];
