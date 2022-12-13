declare let isProxy: <T extends object>(o: T) => boolean;
declare let inspectProxy: (o: unknown) => object | undefined;
export { isProxy, inspectProxy };
