import _forEachInstanceProperty from '@babel/runtime-corejs3/core-js-stable/instance/for-each';
import _concatInstanceProperty from '@babel/runtime-corejs3/core-js-stable/instance/concat';
import _spliceInstanceProperty from '@babel/runtime-corejs3/core-js-stable/instance/splice';
import _indexOfInstanceProperty from '@babel/runtime-corejs3/core-js-stable/instance/index-of';
import _toConsumableArray from '@babel/runtime-corejs3/helpers/toConsumableArray';
import _Map from '@babel/runtime-corejs3/core-js-stable/map';
import _Object$create from '@babel/runtime-corejs3/core-js-stable/object/create';

/*
 * @Author: bluefox
 * @Date: 2019-12-28 23:59:29
 * @Description: hack全局定时器
 */
function hackTimer (target) {
  var originalWindowInterval = target.setInterval;
  var originalWindowTimeout = target.setTimeout;
  var timerIds = [];
  var intervalIds = [];

  var hookSetInterval = function hookSetInterval(handler, timeout) {
    var _context;

    for (var _len = arguments.length, args = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
      args[_key - 2] = arguments[_key];
    }

    var intervalId = originalWindowInterval.apply(void 0, _concatInstanceProperty(_context = [handler, timeout]).call(_context, args));
    intervalIds.push(intervalId);

    if (process.env.NODE_ENV === 'development') {
      console.warn("Call setInterval. intervalId: ".concat(intervalId));
    }

    return intervalId;
  };

  var hookSetTimeout = function hookSetTimeout(handler, timeout) {
    var _context2;

    for (var _len2 = arguments.length, args = new Array(_len2 > 2 ? _len2 - 2 : 0), _key2 = 2; _key2 < _len2; _key2++) {
      args[_key2 - 2] = arguments[_key2];
    }

    var timerId = originalWindowTimeout.apply(void 0, _concatInstanceProperty(_context2 = [handler, timeout]).call(_context2, args));
    timerIds.push(timerId);

    if (process.env.NODE_ENV === 'development') {
      console.warn("Call setTimeout. timerId: ".concat(timerId));
    }

    return timerId;
  };

  return {
    hookSetInterval: hookSetInterval,
    hookSetTimeout: hookSetTimeout,
    reset: function reset() {
      _forEachInstanceProperty(timerIds).call(timerIds, function (id) {
        target.clearTimeout(id);

        if (process.env.NODE_ENV === 'development') {
          console.warn("ClearTimeout. timerId: ".concat(id));
        }
      });

      _forEachInstanceProperty(intervalIds).call(intervalIds, function (id) {
        target.clearInterval(id);

        if (process.env.NODE_ENV === 'development') {
          console.warn("ClearInterval. intervalId: ".concat(id));
        }
      });
    }
  };
}

/*
 * @Author: bluefox
 * @Date: 2019-12-28 23:58:46
 * @Description: hack事件监听器
 */
function hackEventListener (target) {
  var originalAddEventListener = target.addEventListener;
  var originalRemoveEventListener = target.removeEventListener;
  var listenerMap = new _Map();

  var hookAddEventListener = function hookAddEventListener(type, listener, options) {
    var _context;

    var listeners = listenerMap.get(type) || [];
    listenerMap.set(type, _concatInstanceProperty(_context = []).call(_context, _toConsumableArray(listeners), [listener]));

    if (process.env.NODE_ENV === 'development') {
      var _context2;

      console.warn(_concatInstanceProperty(_context2 = "Call addEventListener. eventName: ".concat(type, "; eventHandler: ")).call(_context2, listener.toString()));
    }

    return originalAddEventListener.call(target, type, listener, options);
  };

  var hookRemoveEventListener = function hookRemoveEventListener(type, listener, options) {
    var storedTypeListeners = listenerMap.get(type);

    if (storedTypeListeners && storedTypeListeners.length && _indexOfInstanceProperty(storedTypeListeners).call(storedTypeListeners, listener) !== -1) {
      _spliceInstanceProperty(storedTypeListeners).call(storedTypeListeners, _indexOfInstanceProperty(storedTypeListeners).call(storedTypeListeners, listener), 1);
    }

    if (process.env.NODE_ENV === 'development') {
      var _context3;

      console.warn(_concatInstanceProperty(_context3 = "Call removeEventListener. eventName: ".concat(type, "; eventHandler: ")).call(_context3, listener.toString()));
    }

    return originalRemoveEventListener.call(target, type, listener, options);
  };

  return {
    hookAddEventListener: hookAddEventListener,
    hookRemoveEventListener: hookRemoveEventListener,
    reset: function reset() {
      _forEachInstanceProperty(listenerMap).call(listenerMap, function (listeners, type) {
        var _context4;

        return _forEachInstanceProperty(_context4 = _toConsumableArray(listeners)).call(_context4, function (listener) {
          return hookRemoveEventListener(type, listener);
        });
      });
    }
  };
}

/*
 * @Author: bluefox
 * @Date: 2019-12-28 23:58:30
 * @Description: 生成HTML元素的代理对象，包括window，document和HtmlElement
 */
function createSandbox (target) {
  // 沙箱期间被更新的全局变量的原始值
  var modifiedPropsOriginalValueMapInSandbox = new _Map(); // 沙箱期间新增的全局变量

  var addedPropsMapInSandbox = new _Map(); // 沙箱期间更新的全局变量

  var updatedPropsMapInSandbox = new _Map();
  var originalTarget = target;

  var fakeTarget = _Object$create(null);

  var getProperty;
  var sandbox = new Proxy(fakeTarget, {
    get: function get(_, p) {
      if (getProperty) {
        var _v = getProperty(originalTarget, p);

        if (_v !== undefined) {
          return _v;
        }
      }

      var v = originalTarget[p];
      return v;
    },
    set: function set(_, p, v) {
      if (addedPropsMapInSandbox.has(p)) {
        addedPropsMapInSandbox.set(p, v);
      } else if (updatedPropsMapInSandbox.has(p)) {
        updatedPropsMapInSandbox.set(p, v);
      } else {
        if (Object.prototype.hasOwnProperty.call(originalTarget, p)) {
          modifiedPropsOriginalValueMapInSandbox.set(p, originalTarget[p]);
          updatedPropsMapInSandbox.set(p, v);
        } else {
          addedPropsMapInSandbox.set(p, v);
        }
      }

      originalTarget[p] = v;

      if (process.env.NODE_ENV === 'development') {
        var _context, _context2, _context3;

        var globalName = '';

        if (target instanceof Window) {
          globalName = 'window';
        } else if (target instanceof Document) {
          globalName = 'document';
        } else if (target instanceof HTMLElement) {
          globalName = target.tagName;
        }

        console.warn(_concatInstanceProperty(_context = _concatInstanceProperty(_context2 = _concatInstanceProperty(_context3 = "Set ".concat(globalName, ".")).call(_context3, p.toString(), " to ")).call(_context2, v.toString(), "! Original value is ")).call(_context, modifiedPropsOriginalValueMapInSandbox.get(p)));
      }

      return true;
    },
    has: function has(_, p) {
      return p in originalTarget;
    }
  });
  var result = {
    sandbox: sandbox,
    reset: function reset() {
      _forEachInstanceProperty(addedPropsMapInSandbox).call(addedPropsMapInSandbox, function (v, k) {
        delete originalTarget[k];
      });

      _forEachInstanceProperty(updatedPropsMapInSandbox).call(updatedPropsMapInSandbox, function (v, k) {
        originalTarget[k] = modifiedPropsOriginalValueMapInSandbox.get(k);
      });

      addedPropsMapInSandbox.clear();
      updatedPropsMapInSandbox.clear();
      modifiedPropsOriginalValueMapInSandbox.clear();
    },
    setGetProperty: function setGetProperty(cb) {
      getProperty = cb;
    }
  };
  return result;
}

/*
 * @Author: bluefox
 * @Date: 2019-12-28 23:20:23
 * @Description: 浏览器端JavaScript脚本的沙盒执行环境，会记录全局变量的修改
 *               create方法返回沙盒环境，只有在调用mount挂载沙盒的时候，才会执行hack处理并且运行沙盒中的js逻辑
 */

var index = {
  create: function create(source) {
    // 创建全局代理对象，监控全局属性的变化
    var windowProxy = createSandbox(window);
    var documentProxy = createSandbox(window.document);
    var bodyProxy = createSandbox(window.document.body); // 监听定时器的调用

    var timerWatcher = hackTimer(window); // 监控事件的绑定/解绑

    var eventWatcherOfWindow = hackEventListener(window);
    var eventWatcherOfDocument = hackEventListener(window.document);
    var eventWatcherOfBody = hackEventListener(window.document.body);
    windowProxy.setGetProperty(function (t, p) {
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
      }
    });
    documentProxy.setGetProperty(function (t, p) {
      if (p === 'body') {
        return bodyProxy.sandbox;
      } else if (p === 'addEventListener') {
        return eventWatcherOfDocument.hookAddEventListener;
      } else if (p === 'removeEventListener') {
        return eventWatcherOfDocument.hookRemoveEventListener;
      }
    });
    bodyProxy.setGetProperty(function (t, p) {
      if (p === 'addEventListener') {
        return eventWatcherOfBody.hookAddEventListener;
      } else if (p === 'removeEventListener') {
        return eventWatcherOfBody.hookRemoveEventListener;
      }
    });
    return {
      mount: function mount() {
        var wrapperFunction = new Function('window', 'document', 'setInterval', 'setTimeout', source);
        var result = wrapperFunction.call(windowProxy.sandbox, windowProxy.sandbox, documentProxy.sandbox, timerWatcher.hookSetInterval, timerWatcher.hookSetTimeout);
        return result;
      },
      unmount: function unmount() {
        var _context;

        _forEachInstanceProperty(_context = [windowProxy, documentProxy, bodyProxy, timerWatcher, eventWatcherOfWindow, eventWatcherOfDocument, eventWatcherOfBody]).call(_context, function (m) {
          m.reset();
        });
      }
    };
  }
};

export default index;
//# sourceMappingURL=index.esm.js.map