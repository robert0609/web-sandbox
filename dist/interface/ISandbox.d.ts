export interface IModule {
    default?: any;
    [exportName: string]: any;
}
export interface ISandbox {
    mount(): IModule;
    unmount(): void;
}
