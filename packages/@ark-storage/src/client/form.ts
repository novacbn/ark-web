const ENCODING_URL_DATA = "application/x-www-form-urlencoded";

const MIMETYPE_JSON = "application/json";

export interface IFormDetails {
    body: BodyInit | null;

    encoding: string;

    method: string;
}

export interface IFormOptions {
    on_form_response?: (response: Response) => void;

    on_form_submit?: (details: IFormDetails) => Partial<IFormDetails> | void;
}

export function use_form(element: HTMLFormElement, options: IFormOptions = {}) {
    let {on_form_response, on_form_submit} = options;

    async function on_submit(event: Event) {
        event.preventDefault();

        const method = (element.method || "GET").toLowerCase();
        let details: IFormDetails = {
            encoding: element.encoding,
            body: method === "post" || method === "put" ? new FormData(element) : null,
            method,
        };

        if (on_form_submit) {
            details = {...details, ...(on_form_submit(details) || {})};
        }

        const body =
            details.encoding === ENCODING_URL_DATA && details.body instanceof FormData
                ? // @ts-ignore - NOTE: This /is/ supported in modern Browser versions, however
                  // Typescript currently doesn't have it typed?
                  new URLSearchParams(details.body)
                : details.body;

        const response = await fetch(element.action, {
            method: details.method,
            body,
            headers: {
                accept: MIMETYPE_JSON,
                "Content-Type": details.encoding,
            },
        });

        if (on_form_response) on_form_response(response);
    }

    element.addEventListener("submit", on_submit);
    return {
        destroy() {
            element.removeEventListener("submit", on_submit);
        },

        update(options: IFormOptions = {}) {
            ({on_form_response, on_form_submit} = options);
        },
    };
}
