export function generate_id_time(): string {
    return Date.now().toString(32);
}

export function generate_id_token(): string {
    const view = new Uint32Array(1);
    window.crypto.getRandomValues(view);

    return view[0].toString(32);
}

export function generate_id(): string {
    // NOTE: This is not meant to be cryptographically secure or any
    // thing really else, just a simple identifier generator
    const time = generate_id_time().slice(-4);
    const token = generate_id_token().slice(-4);

    return time + "-" + token;
}

export function generate_local_timestamp(): string {
    const date = new Date();

    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");

    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const seconds = date.getSeconds().toString().padStart(2, "0");

    return `${year}-${month}-${day}.${hours}-${minutes}-${seconds}`;
}
