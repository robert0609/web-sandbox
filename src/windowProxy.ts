/*
 * @Author: bluefox
 * @Date: 2019-12-28 23:58:30
 * @LastEditors  : Please set LastEditors
 * @LastEditTime : 2019-12-30 15:51:33
 * @Description: 生成window代理对象，构造window全局沙盒
 */
function generate() {
  // 沙箱期间被更新的全局变量的原始值
  const modifiedPropsOriginalValueMapInSandbox = new Map<PropertyKey, any>();

  // 沙箱期间新增的全局变量
  const addedPropsMapInSandbox = new Map<PropertyKey, any>();
  // 沙箱期间更新的全局变量
  const updatedPropsMapInSandbox = new Map<PropertyKey, any>();

  const originalWindow = window;
  const fakeWindow = Object.create(null) as Window;

  const sandbox: WindowProxy = new Proxy(fakeWindow, {
    get(_: Window, p: PropertyKey): any {
      if (p === 'top' || p === 'window' || p === 'self') {
        return sandbox;
      }
      const v = (originalWindow as any)[p];
      return v;
    },
    set(_: Window, p: PropertyKey, v: any): boolean {
      if (addedPropsMapInSandbox.has(p)) {
        addedPropsMapInSandbox.set(p, v);
      } else if (updatedPropsMapInSandbox.has(p)) {
        updatedPropsMapInSandbox.set(p, v);
      } else {
        if (originalWindow.hasOwnProperty(p)) {
          modifiedPropsOriginalValueMapInSandbox.set(p, (originalWindow as any)[p]);
          updatedPropsMapInSandbox.set(p, v);
        } else {
          addedPropsMapInSandbox.set(p, v);
        }
      }
      (originalWindow as any)[p] = v;
      if (process.env.NODE_ENV === 'development') {
        console.warn(`Set window.${p.toString()} to ${v.toString()}! Original value is ${modifiedPropsOriginalValueMapInSandbox.get(p)}`);
      }
      return true;
    },
    has(_: Window, p: PropertyKey): boolean {
      return p in originalWindow;
    }
  });

  return {
    sandbox,
    reset() {
      addedPropsMapInSandbox.forEach((v, k) => {
        delete (originalWindow as any)[k];
      });
      updatedPropsMapInSandbox.forEach((v, k) => {
        (originalWindow as any)[k] = modifiedPropsOriginalValueMapInSandbox.get(k);
      });
      addedPropsMapInSandbox.clear();
      updatedPropsMapInSandbox.clear();
      modifiedPropsOriginalValueMapInSandbox.clear();
    }
  };
}
