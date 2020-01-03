/*
 * @Author: bluefox
 * @Date: 2019-12-28 23:59:29
 * @Description: hack全局定时器
 */

export default function (target: Window) {
  const originalWindowInterval = target.setInterval;
  const originalWindowTimeout = target.setTimeout;

  const timerIds: number[] = [];
  const intervalIds: number[] = [];

  const hookSetInterval = (handler: TimerHandler, timeout?: number, ...args: any[]) => {
    const intervalId = originalWindowInterval(handler, timeout, ...args);
    intervalIds.push(intervalId);
    if (process.env.NODE_ENV === 'development') {
      console.warn(`Call setInterval. intervalId: ${intervalId}`);
    }
    return intervalId;
  };

  const hookSetTimeout = (handler: TimerHandler, timeout?: number, ...args: any[]) => {
    const timerId = originalWindowTimeout(handler, timeout, ...args);
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
}
