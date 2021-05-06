export interface IBucketRow {
    created_at: string;

    id: string;

    name: string;

    owner: string;

    updated_at: string;
}

export interface IProfileRow {
    id: string;

    name: string;

    user_id: string;
}

export interface ISharedFileRow {
    id: string;

    file_id: string;

    user_id: string;
}

export interface IObjectRow {
    bucket_id: string;

    created_at: string;

    id: string;

    last_accessed_at: string;

    name: string;

    owner: string;

    updated_at: string;

    metadata: {
        mimetype: string;

        size: number;
    };
}
