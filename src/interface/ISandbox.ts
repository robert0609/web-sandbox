/*
 * @Author: bluefox
 * @Date: 2019-12-29 00:27:55
 * @Description: 沙盒类型接口
 */
export interface ISandbox {
  mount(): void;
  unmount(): void;
}
