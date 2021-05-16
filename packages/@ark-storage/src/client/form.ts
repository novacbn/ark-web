import type {IActionHandle} from "./util/actions";

const ENCODING_URL_DATA = "application/x-www-form-urlencoded";

const MIMETYPE_JSON = "application/json";

export interface IFormContext {
    body: BodyInit | null;

    encoding: string;

    method: string;
}

export interface IFormOptions {
    on_form_response?: (response: Response) => void;

    on_form_submit?: (context: IFormContext) => Partial<IFormContext> | void;
}

export function use_form(
    element: HTMLFormElement,
    options: IFormOptions = {}
): IActionHandle<IFormOptions> {
    let {on_form_response, on_form_submit} = options;

    async function on_submit(event: Event) {
        event.preventDefault();

        const method = (element.method || "GET").toLowerCase();
        let context: IFormContext = {
            encoding: element.encoding,
            body: method === "post" || method === "put" ? new FormData(element) : null,
            method,
        };

        if (on_form_submit) {
            context = {...context, ...(on_form_submit(context) || {})};
        }

        const body =
            context.encoding === ENCODING_URL_DATA && context.body instanceof FormData
                ? // @ts-ignore - NOTE: This /is/ supported in modern Browser versions, however
                  // Typescript currently doesn't have it typed?
                  new URLSearchParams(context.body)
                : context.body;

        const response = await fetch(element.action, {
            method: context.method,
            body,
            headers: {
                accept: MIMETYPE_JSON,
                "Content-Type": context.encoding,
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
