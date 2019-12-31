import { HtmlElementType } from "./type";

/*
 * @Author: bluefox
 * @Date: 2019-12-28 23:58:30
 * @LastEditors  : bluefox
 * @LastEditTime : 2019-12-31 18:41:13
 * @Description: 生成HTML元素的代理对象，包括window，document和HtmlElement
 */
export default function <T extends HtmlElementType>(target: T) {
  // 沙箱期间被更新的全局变量的原始值
  const modifiedPropsOriginalValueMapInSandbox = new Map<PropertyKey, any>();

  // 沙箱期间新增的全局变量
  const addedPropsMapInSandbox = new Map<PropertyKey, any>();
  // 沙箱期间更新的全局变量
  const updatedPropsMapInSandbox = new Map<PropertyKey, any>();

  const originalTarget = target;
  const fakeTarget = Object.create(null) as T;

  let getProperty: null | ((originalTarget: T, p: PropertyKey) => any);

  const sandbox: T = new Proxy(fakeTarget, {
    get(_: T, p: PropertyKey): any {
      if (getProperty) {
        const v = getProperty(originalTarget, p);
        if (v !== undefined) {
          return v;
        }
      }
      const v = (originalTarget as any)[p];
      return v;
    },
    set(_: T, p: PropertyKey, v: any): boolean {
      if (addedPropsMapInSandbox.has(p)) {
        addedPropsMapInSandbox.set(p, v);
      } else if (updatedPropsMapInSandbox.has(p)) {
        updatedPropsMapInSandbox.set(p, v);
      } else {
        if (Object.prototype.hasOwnProperty.call(originalTarget, p)) {
          modifiedPropsOriginalValueMapInSandbox.set(p, (originalTarget as any)[p]);
          updatedPropsMapInSandbox.set(p, v);
        } else {
          addedPropsMapInSandbox.set(p, v);
        }
      }
      (originalTarget as any)[p] = v;
      if (process.env.NODE_ENV === 'development') {
        let globalName = '';
        if (target instanceof Window) {
          globalName = 'window';
        } else if (target instanceof Document) {
          globalName = 'document';
        } else if (target instanceof HTMLElement) {
          globalName = target.tagName;
        }
        console.warn(`Set ${globalName}.${p.toString()} to ${v.toString()}! Original value is ${modifiedPropsOriginalValueMapInSandbox.get(p)}`);
      }
      return true;
    },
    has(_: T, p: PropertyKey): boolean {
      return p in originalTarget;
    }
  });

  const result = {
    sandbox,
    reset() {
      addedPropsMapInSandbox.forEach((v, k) => {
        delete (originalTarget as any)[k];
      });
      updatedPropsMapInSandbox.forEach((v, k) => {
        (originalTarget as any)[k] = modifiedPropsOriginalValueMapInSandbox.get(k);
      });
      addedPropsMapInSandbox.clear();
      updatedPropsMapInSandbox.clear();
      modifiedPropsOriginalValueMapInSandbox.clear();
    },
    setGetProperty(cb: (originalTarget: T, p: PropertyKey) => any) {
      getProperty = cb;
    }
  };

  return result;
}
