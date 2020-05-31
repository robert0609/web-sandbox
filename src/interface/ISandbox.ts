/*
 * @Author: bluefox
 * @Date: 2019-12-29 00:27:55
 * @Description: 沙盒类型接口
 */
export interface IModule {
  default?: any;
  [exportName: string]: any;
}
export interface ISandbox {
  mount(): IModule | Promise<IModule>;
  mountWithCommonjs(module: any, exports: any, require: any): void;
  unmount(): void;
}
