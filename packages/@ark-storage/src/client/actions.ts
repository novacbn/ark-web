export interface IActionHandle<T = any> {
    destroy: () => void;

    update: (options: T) => void;
}
