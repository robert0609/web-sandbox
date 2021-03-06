import { HtmlElementType } from "./type";
import global from './global';
import { safeLog, isClass } from "./utils";

/*
 * @Author: bluefox
 * @Date: 2019-12-28 23:58:30
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
      let v = (originalTarget as any)[p];
      // when v === "createElement", here reports "Type error: illegal invocation". For fix that, function "v" must be bind originalTarget so that "this" point to document.
      // reference: https://stackoverflow.com/questions/32423584/document-createelement-illegal-invocation
      if (typeof v === 'function' && !isClass(v)) {
        v = v.bind(originalTarget);
      }
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
      if (global.debug) {
        let globalName = '';
        if (target instanceof Window) {
          globalName = 'window';
        } else if (target instanceof Document) {
          globalName = 'document';
        } else if (target instanceof HTMLElement) {
          globalName = target.tagName;
        }
        safeLog('Set ', `${globalName}.${p.toString()} to `, v, '! Original value is ', modifiedPropsOriginalValueMapInSandbox.get(p));
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
