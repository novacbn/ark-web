export function await_for<F extends (...args: any[]) => void | Promise<void>>(
    func: F
): (...args: Parameters<F>) => void | Promise<void> {
    let running = false;

    return (...args: any[]) => {
        if (!running) {
            running = true;
            const ret = func(...args);

            if (ret instanceof Promise) {
                ret.then(() => (running = false));
            } else running = false;
        }
    };
}

export function debounce<F extends (...args: any[]) => void | Promise<void>>(
    func: F,
    duration: number
): (...args: Parameters<F>) => void | Promise<void> {
    let identifier: number | NodeJS.Timeout;

    return (...args: any[]) => {
        // @ts-ignore - NOTE: NodeJS having to make this difficult...
        clearTimeout(identifier);

        identifier = setTimeout(() => func(...args), duration);
    };
}
