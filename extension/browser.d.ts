export {};
declare global {
    interface Console {
        repr(...data: unknown[]): void;
    }
}
