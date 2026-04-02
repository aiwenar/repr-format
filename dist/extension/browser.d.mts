//#region src/extension/browser.d.ts
declare global {
  interface Console {
    repr(...data: unknown[]): void;
  }
}