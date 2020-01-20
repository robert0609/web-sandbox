export interface IModule {
    default?: any;
    [exportName: string]: any;
}
export interface ISandbox {
    mount(): IModule | Promise<IModule>;
    unmount(): void;
}
