/*
 * @Author: bluefox
 * @Date: 2019-12-28 23:59:29
 * @LastEditors  : bluefox
 * @LastEditTime : 2019-12-30 22:54:30
 * @Description: hack全局定时器
 */

const originalWindowInterval = window.setInterval;
const originalWindowTimeout = window.setTimeout;

export default function () {
  const timerIds: number[] = [];
  const intervalIds: number[] = [];

  window.setInterval = (...args: any[]) => {
    // @ts-ignore
    const intervalId = rawWindowInterval(...args);
    intervalIds.push(intervalId);
    if (process.env.NODE_ENV === 'development') {
      console.warn(`Call window.setInterval. intervalId: ${intervalId}`);
    }
    return intervalId;
  };

  (window as Window).setTimeout = (...args: any[]) => {
    // @ts-ignore
    const timerId = rawWindowTimeout(...args);
    timerIds.push(timerId);
    if (process.env.NODE_ENV === 'development') {
      console.warn(`Call window.setTimeout. timerId: ${timerId}`);
    }
    return timerId;
  };

  return {
    reset() {
      window.setInterval = originalWindowInterval;
      window.setTimeout = originalWindowTimeout;

      timerIds.forEach(id => {
        window.clearTimeout(id);
        if (process.env.NODE_ENV === 'development') {
          console.warn(`ClearTimeout. timerId: ${id}`);
        }
      });
      intervalIds.forEach(id => {
        window.clearInterval(id);
        if (process.env.NODE_ENV === 'development') {
          console.warn(`ClearInterval. intervalId: ${id}`);
        }
      });
    }
  };
};
