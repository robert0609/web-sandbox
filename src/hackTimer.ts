/*
 * @Author: bluefox
 * @Date: 2019-12-28 23:59:29
 * @LastEditors  : bluefox
 * @LastEditTime : 2019-12-31 18:51:57
 * @Description: hack全局定时器
 */

export default function (target: Window) {
  const originalWindowInterval = target.setInterval;
  const originalWindowTimeout = target.setTimeout;

  const timerIds: number[] = [];
  const intervalIds: number[] = [];

  const hookSetInterval = (...args: any[]) => {
    // @ts-ignore
    const intervalId = originalWindowInterval(...args);
    intervalIds.push(intervalId);
    if (process.env.NODE_ENV === 'development') {
      console.warn(`Call setInterval. intervalId: ${intervalId}`);
    }
    return intervalId;
  };

  const hookSetTimeout = (...args: any[]) => {
    // @ts-ignore
    const timerId = originalWindowTimeout(...args);
    timerIds.push(timerId);
    if (process.env.NODE_ENV === 'development') {
      console.warn(`Call setTimeout. timerId: ${timerId}`);
    }
    return timerId;
  };

  return {
    hookSetInterval,
    hookSetTimeout,
    reset() {
      timerIds.forEach(id => {
        target.clearTimeout(id);
        if (process.env.NODE_ENV === 'development') {
          console.warn(`ClearTimeout. timerId: ${id}`);
        }
      });
      intervalIds.forEach(id => {
        target.clearInterval(id);
        if (process.env.NODE_ENV === 'development') {
          console.warn(`ClearInterval. intervalId: ${id}`);
        }
      });
    }
  };
};
