import type {FileObject} from "./supabase/storage";
import {base_pathname, dir_pathname, normalize_pathname} from "./util/url";

export type IUnnormalizedFile = File | FileObject;

export type IUnnormalizedFiles = File[] | FileList | FileObject[];

export enum FILE_TYPES {
    directory = "directory",

    file = "file",
}

export interface INormalizedFile {
    created_at?: number | string;

    directory_path: string;

    mimetype?: string;

    name: string;

    size?: number;

    type: FILE_TYPES;

    updated_at?: number | string;
}

export function is_builtin_file(value: any): value is File {
    return typeof File != "undefined" && value instanceof File;
}

export function is_builtin_filelist(value: any): value is FileList {
    return typeof FileList != "undefined" && value instanceof FileList;
}

export function normalize_file(file: IUnnormalizedFile): INormalizedFile {
    if (is_builtin_file(file)) {
        const {name, lastModified: last_modified, size, type} = file;

        // NOTE: The built-in `File` type obviously **never** represents a
        // a directory, so we can safely always set to "file" type
        return {
            created_at: undefined,
            directory_path: "/",
            mimetype: type,
            name: normalize_pathname(name),
            size,
            type: FILE_TYPES.file,
            updated_at: last_modified,
        };
    }

    const {created_at, id, name, updated_at} = file;
    const {mimetype, size} = file.metadata || {};
    const type = id ? FILE_TYPES.file : FILE_TYPES.directory;

    return {
        created_at,
        directory_path: dir_pathname(name),
        mimetype,
        name: base_pathname(name),
        size,
        type,
        updated_at,
    };
}

export function normalize_files(files: IUnnormalizedFiles): INormalizedFile[] {
    if (is_builtin_filelist(files)) files = Array.from(files);

    return files.map<INormalizedFile>((file: File | FileObject) => normalize_file(file));
}
