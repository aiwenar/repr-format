//#region src/extension/node.d.ts
declare global {
  interface Console {
    repr(...data: unknown[]): void;
  }
}