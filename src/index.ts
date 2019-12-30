import { ISandbox } from "./interface/ISandbox";
import hackTimer from "./hackTimer";
import hackEventListener from "./hackEventListener";
import createWindowSandbox from './windowProxy';

/*
 * @Author: bluefox
 * @Date: 2019-12-28 23:20:23
 * @LastEditors  : bluefox
 * @LastEditTime : 2019-12-31 00:05:04
 * @Description: 浏览器端JavaScript脚本的沙盒执行环境，会记录全局变量的修改
 */

export default {
  create(source: string): ISandbox {
    const wrapperScript = `;(function (window) { ${source} }).bind(window.__proxy)(window.__proxy);`;

    return {
      mount() {
        // hack定时器和事件绑定器，用来在沙盒运行的时候监控微应用对全局定时器和监听事件的修改
        const hackWatchers = [ hackTimer(), hackEventListener(window), hackEventListener(window.document), hackEventListener(window.document.body) ];

        const windowProxy = createWindowSandbox();
        (window as any).__proxy = windowProxy.sandbox;
      },
      unmount() {}
    };
  }
};
