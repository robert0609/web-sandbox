import { ISandbox } from "./interface/ISandbox";

/*
 * @Author: bluefox
 * @Date: 2019-12-28 23:20:23
 * @LastEditors  : bluefox
 * @LastEditTime : 2019-12-29 00:30:35
 * @Description: 浏览器端JavaScript脚本的沙盒执行环境，会记录全局变量的修改
 */

export default {
  create(source: string | ((...args: any[]) => void)): ISandbox {}
};
