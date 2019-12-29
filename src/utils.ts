/*
 * @Author: bluefox
 * @Date: 2019-12-29 23:43:56
 * @LastEditors  : bluefox
 * @LastEditTime : 2019-12-29 23:44:20
 * @Description: 辅助函数
 */


export async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
