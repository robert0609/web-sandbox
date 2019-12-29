/*
 * @Author: bluefox
 * @Date: 2019-12-28 23:58:46
 * @LastEditors  : bluefox
 * @LastEditTime : 2019-12-30 00:12:27
 * @Description: hack事件监听器
 */

export default function (target: EventTarget) {
  const originalAddEventListener = target.addEventListener;
  const originalRemoveEventListener = target.removeEventListener;

  const listenerMap = new Map<string, EventListenerOrEventListenerObject[]>();

  target.addEventListener = (
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions,
  ) => {
    const listeners = listenerMap.get(type) || [];
    listenerMap.set(type, [...listeners, listener]);
    if (process.env.NODE_ENV === 'development') {
      console.warn(`Call addEventListener. eventName: ${type}; eventHandler: ${listener.toString()}`);
    }
    return originalAddEventListener.call(target, type, listener, options);
  };

  target.removeEventListener = (
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions,
  ) => {
    const storedTypeListeners = listenerMap.get(type);
    if (storedTypeListeners && storedTypeListeners.length && storedTypeListeners.indexOf(listener) !== -1) {
      storedTypeListeners.splice(storedTypeListeners.indexOf(listener), 1);
    }
    if (process.env.NODE_ENV === 'development') {
      console.warn(`Call removeEventListener. eventName: ${type}; eventHandler: ${listener.toString()}`);
    }
    return originalRemoveEventListener.call(target, type, listener, options);
  };

  return {
    reset() {
      listenerMap.forEach((listeners, type) =>
        [...listeners].forEach(listener => target.removeEventListener(type, listener)),
      );
      target.addEventListener = originalAddEventListener;
      target.removeEventListener = originalRemoveEventListener;
    }
  };
};
