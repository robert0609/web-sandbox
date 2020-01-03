/*
 * @Author: bluefox
 * @Date: 2019-12-29 23:43:56
 * @Description: 辅助函数
 */


export async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
