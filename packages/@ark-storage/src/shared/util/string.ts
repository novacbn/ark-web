const EXPRESSION_SUBSTITUTE = /%s/;

export function is_affirmative(text: string): boolean {
    text = text.toLowerCase();

    return text === "true" || text === "1" || text === "on" || text === "y" || text === "yes";
}

export function substitute_value(text: string, value: string): string {
    return text.replace(EXPRESSION_SUBSTITUTE, value);
}
