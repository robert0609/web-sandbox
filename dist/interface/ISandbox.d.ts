export interface IModule {
    default?: any;
    [exportName: string]: any;
}
export interface ISandbox {
    mount(): IModule | Promise<IModule>;
    mountWithCommonjs(module: any, exports: any, require: any): void;
    unmount(): void;
}
