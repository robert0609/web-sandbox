import { ISandbox } from "./interface/ISandbox";
import hackTimer from "./hackTimer";
import hackEventListener from "./hackEventListener";
import createSandbox from './globalProxy';
import global from './global';

/*
 * @Author: bluefox
 * @Date: 2019-12-28 23:20:23
 * @Description: 浏览器端JavaScript脚本的沙盒执行环境，会记录全局变量的修改
 *               create方法返回沙盒环境，只有在调用mount挂载沙盒的时候，才会执行hack处理并且运行沙盒中的js逻辑
 */

export default {
  set debug(v: boolean) {
    global.debug = v;
  },
  create(source: string): ISandbox {
    // 创建全局代理对象，监控全局属性的变化
    const windowProxy = createSandbox(window);
    /**
     * element-ui的popper模块，isFixed方法里有如下判断：
     *  if (element === root.document.body) {
     *      return false;
     *  }
     * 由于这里的element是递归查询的parentNode，最终会递归到真实的body节点上，而这里的root.document.body由于运行在sandbox中，body是proxy的对象，这里的判断肯定不过了，因此报错：Failed to execute 'getComputedStyle' on 'Window': parameter 1 is not of type 'Element'
     *
     * 因此这里暂时不代理document和body元素了
     */
    // const documentProxy = createSandbox(window.document);
    // const bodyProxy = createSandbox(window.document.body);
    // 监听定时器的调用
    const timerWatcher = hackTimer(window);
    // 监控事件的绑定/解绑
    const eventWatcherOfWindow = hackEventListener(window);
    const eventWatcherOfDocument = hackEventListener(window.document);
    const eventWatcherOfBody = hackEventListener(window.document.body);

    windowProxy.setGetProperty((t, p) => {
      if (p === 'top' || p === 'window' || p === 'self') {
        return windowProxy.sandbox;
      } else if (p === 'setInterval') {
        return timerWatcher.hookSetInterval;
      } else if (p === 'setTimeout') {
        return timerWatcher.hookSetTimeout;
      } else if (p === 'addEventListener') {
        return eventWatcherOfWindow.hookAddEventListener;
      } else if (p === 'removeEventListener') {
        return eventWatcherOfWindow.hookRemoveEventListener;
      } else if (p === 'Promise') {
        return t.Promise;
      } else if (p === 'Object') {
        return t.Object;
      }
    });
    windowProxy.sandbox.document.addEventListener = eventWatcherOfDocument.hookAddEventListener;
    windowProxy.sandbox.document.removeEventListener = eventWatcherOfDocument.hookRemoveEventListener;
    windowProxy.sandbox.document.body.addEventListener = eventWatcherOfBody.hookAddEventListener;
    windowProxy.sandbox.document.body.removeEventListener = eventWatcherOfBody.hookRemoveEventListener;
    // documentProxy.setGetProperty((t, p) => {
    //   if (p === 'addEventListener') {
    //     return eventWatcherOfDocument.hookAddEventListener;
    //   } else if (p === 'removeEventListener') {
    //     return eventWatcherOfDocument.hookRemoveEventListener;
    //   }
    // });
    // bodyProxy.setGetProperty((t, p) => {
    //   if (p === 'addEventListener') {
    //     return eventWatcherOfBody.hookAddEventListener;
    //   } else if (p === 'removeEventListener') {
    //     return eventWatcherOfBody.hookRemoveEventListener;
    //   }
    // });

    return {
      mount() {
        const wrapperFunction = function(window: any, setInterval: any, setTimeout: any) {
          return eval(source);
        };
        return wrapperFunction.call(windowProxy.sandbox, windowProxy.sandbox, timerWatcher.hookSetInterval, timerWatcher.hookSetTimeout);
      },
      mountWithCommonjs(module: any, exports: any, require: any) {
        const wrapperFunction = function(window: any, setInterval: any, setTimeout: any, module: any, exports: any, require: any) {
          eval(source);
        };
        wrapperFunction.call(windowProxy.sandbox, windowProxy.sandbox, timerWatcher.hookSetInterval, timerWatcher.hookSetTimeout, module, exports, require);
      },
      unmount() {
        [ windowProxy, timerWatcher, eventWatcherOfWindow, eventWatcherOfDocument, eventWatcherOfBody ].forEach(m => {
          m.reset();
        });
      }
    };
  }
};


