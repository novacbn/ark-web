import {get_filesize, get_integer, get_milliseconds, get_string} from "./util/environment";

export const AVATARS_BUCKET = get_string(import.meta.env.VITE_AVATARS_BUCKET, "avatars");

export const AVATARS_DIMENSIONS = get_integer(import.meta.env.VITE_AVATARS_DIMENSIONS, "256");

export const AVATARS_MAX_FILESIZE = get_filesize(
    import.meta.env.VITE_AVATARS_MAX_FILESIZE,
    "2 MiB"
);

export const BUCKETS_TABLE = get_string(import.meta.env.VITE_BUCKETS_TABLE, "buckets");

export const DOWNLOAD_TTL = get_milliseconds(import.meta.env.VITE_DOWNLOAD_TTL, "1 minute");

export const LOCALE_DEFAULT = get_string(import.meta.env.VITE_LOCALE_DEFAULT, "en-US");

export const META_BASE = import.meta.env.BASE_URL;

export const META_TITLE = get_string(
    import.meta.env.VITE_META_TITLE,
    "Ark Storage :: Simplistic Personal File Sharing, in a Nutshell"
);

export const META_URL = get_string(import.meta.env.VITE_META_URL);

export const PASTE_PREFIX = get_string(import.meta.env.VITE_PASTE_PREFIX, "paste.");

export const PREVIEW_MAX_FILESIZE = get_filesize(
    import.meta.env.VITE_PREVIEW_MAX_FILESIZE,
    "25 MiB"
);

export const PROFILES_TABLE = get_string(import.meta.env.VITE_PROFILES_TABLE, "profiles");

export const PUBLIC_SCHEMA = get_string(import.meta.env.VITE_PUBLIC_SCHEMA, "public");

export const OBJECTS_TABLE = get_string(import.meta.env.VITE_OBJECTS_TABLE, "objects");

export const SHARED_FILES_TABLE = get_string(
    import.meta.env.VITE_SHARED_FILES_TABLE,
    "shared_files"
);

export const SHARED_FILES_TTL = get_milliseconds(
    import.meta.env.VITE_SHARED_FILES_TTL,
    "5 minutes"
);

export const STORAGE_PREFIX = get_string(import.meta.env.VITE_STORAGE_PREFIX, "ugc_");

export const STORAGE_SCHEMA = get_string(import.meta.env.VITE_STORAGE_SCHEMA, "storage");

export const SUPABASE_ANON_KEY = get_string(import.meta.env.VITE_SUPABASE_ANON_KEY);

export const SUPABASE_URL = get_string(import.meta.env.VITE_SUPABASE_URL);

export const UPLOAD_MAX_FILESIZE = get_filesize(
    import.meta.env.VITE_UPLOAD_MAX_FILESIZE,
    "100 MiB"
);
