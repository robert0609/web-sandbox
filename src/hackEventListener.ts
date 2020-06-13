import global from './global';
import { safeLog } from './utils';

/*
 * @Author: bluefox
 * @Date: 2019-12-28 23:58:46
 * @Description: hack事件监听器
 */

export default function (target: EventTarget) {
  const originalAddEventListener = target.addEventListener;
  const originalRemoveEventListener = target.removeEventListener;

  const listenerMap = new Map<string, EventListenerOrEventListenerObject[]>();

  const hookAddEventListener = (
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions,
  ) => {
    const listeners = listenerMap.get(type) || [];
    listenerMap.set(type, [...listeners, listener]);
    if (global.debug) {
      safeLog(`Call addEventListener. eventName: ${type}; eventHandler: ${listener ? listener.toString() : 'null'}`);
    }
    return originalAddEventListener.call(target, type, listener, options);
  };

  const hookRemoveEventListener = (
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions,
  ) => {
    const storedTypeListeners = listenerMap.get(type);
    if (storedTypeListeners && storedTypeListeners.length && storedTypeListeners.indexOf(listener) !== -1) {
      storedTypeListeners.splice(storedTypeListeners.indexOf(listener), 1);
    }
    if (global.debug) {
      safeLog(`Call removeEventListener. eventName: ${type}; eventHandler: ${listener ? listener.toString() : 'null'}`);
    }
    return originalRemoveEventListener.call(target, type, listener, options);
  };

  return {
    hookAddEventListener,
    hookRemoveEventListener,
    reset() {
      listenerMap.forEach((listeners, type) =>
        [...listeners].forEach(listener => hookRemoveEventListener(type, listener)),
      );
    }
  };
}
