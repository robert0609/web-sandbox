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
    const documentProxy = createSandbox(window.document);
    const bodyProxy = createSandbox(window.document.body);
    // 监听定时器的调用
    const timerWatcher = hackTimer(window);
    // 监控事件的绑定/解绑
    const eventWatcherOfWindow = hackEventListener(window);
    const eventWatcherOfDocument = hackEventListener(window.document);
    const eventWatcherOfBody = hackEventListener(window.document.body);

    windowProxy.setGetProperty((t, p) => {
      if (p === 'top' || p === 'window' || p === 'self') {
        return windowProxy.sandbox;
      } else if (p === 'document') {
        return documentProxy.sandbox;
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
    documentProxy.setGetProperty((t, p) => {
      if (p === 'body') {
        return bodyProxy.sandbox;
      } else if (p === 'addEventListener') {
        return eventWatcherOfDocument.hookAddEventListener;
      } else if (p === 'removeEventListener') {
        return eventWatcherOfDocument.hookRemoveEventListener;
      }
    });
    bodyProxy.setGetProperty((t, p) => {
      if (p === 'addEventListener') {
        return eventWatcherOfBody.hookAddEventListener;
      } else if (p === 'removeEventListener') {
        return eventWatcherOfBody.hookRemoveEventListener;
      }
    });

    return {
      mount() {
        const wrapperFunction = function(window: any, document: any, setInterval: any, setTimeout: any) {
          return eval(source);
        };
        return wrapperFunction.call(windowProxy.sandbox, windowProxy.sandbox, documentProxy.sandbox, timerWatcher.hookSetInterval, timerWatcher.hookSetTimeout);
      },
      mountWithCommonjs(module: any, exports: any, require: any) {
        const wrapperFunction = function(window: any, document: any, setInterval: any, setTimeout: any, module: any, exports: any, require: any) {
          eval(source);
        };
        wrapperFunction.call(windowProxy.sandbox, windowProxy.sandbox, documentProxy.sandbox, timerWatcher.hookSetInterval, timerWatcher.hookSetTimeout, module, exports, require);
      },
      unmount() {
        [ windowProxy, documentProxy, bodyProxy, timerWatcher, eventWatcherOfWindow, eventWatcherOfDocument, eventWatcherOfBody ].forEach(m => {
          m.reset();
        });
      }
    };
  }
};


