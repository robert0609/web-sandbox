/*
 * @Author: bluefox
 * @Date: 2019-12-30 22:48:02
 * @LastEditors  : bluefox
 * @LastEditTime : 2019-12-30 22:59:29
 * @Description: hack html元素的style对象
 */

export default function (target: HTMLElement) {
  // 沙箱期间被更新的全局变量的原始值
  const modifiedPropsOriginalValueMapInSandbox = new Map<PropertyKey, any>();

  // 沙箱期间新增的全局变量
  const addedPropsMapInSandbox = new Map<PropertyKey, any>();
  // 沙箱期间更新的全局变量
  const updatedPropsMapInSandbox = new Map<PropertyKey, any>();

  const originalStyle = target.style;
  const fakeStyle = Object.create(null) as CSSStyleDeclaration;

  const styleProxy = new Proxy(fakeStyle, {
    set(_: CSSStyleDeclaration, p: PropertyKey, v: any): boolean {
      if (addedPropsMapInSandbox.has(p)) {
        addedPropsMapInSandbox.set(p, v);
      } else if (updatedPropsMapInSandbox.has(p)) {
        updatedPropsMapInSandbox.set(p, v);
      } else {
        if (originalStyle.hasOwnProperty(p)) {
          modifiedPropsOriginalValueMapInSandbox.set(p, (originalStyle as any)[p]);
          updatedPropsMapInSandbox.set(p, v);
        } else {
          addedPropsMapInSandbox.set(p, v);
        }
      }
      (originalStyle as any)[p] = v;
      if (process.env.NODE_ENV === 'development') {
        console.warn(`Set ${target.tagName}.style.${p.toString()} to ${v.toString()}! Original value is ${modifiedPropsOriginalValueMapInSandbox.get(p)}`);
      }
      return true;
    },
    has(_: CSSStyleDeclaration, p: PropertyKey): boolean {
      return p in originalStyle;
    }
  });
  target.style = styleProxy;

  return {
    reset() {}
  };
};
