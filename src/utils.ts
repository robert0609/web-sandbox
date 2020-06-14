/*
 * @Author: bluefox
 * @Date: 2019-12-29 23:43:56
 * @Description: 辅助函数
 */


export async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function safeLog(...args: any[]) {
  try {
    console.log(...args);
  } catch (e) {
    console.warn(e);
  }
}

/**
 * Checks if an object could be an instantiable class.
 * @param {any} obj
 * @returns {obj is new (...args: any[]) => any}
 */
export function isClass(obj: any) {
  if (typeof obj != "function") return false;

  // async function or arrow function
  if (obj.prototype === undefined)
      return false;

  // generator function and malformed inheritance
  if (obj.prototype.constructor !== obj)
      return false;

  // has own prototype properties
  if (Object.getOwnPropertyNames(obj.prototype).length >= 2)
      return true;

  var str = String(obj);

  // ES6 class
  if (str.slice(0, 5) == "class")
      return true;

  // anonymous function
  if (/^function\s*\(|^function anonymous\(/.test(str))
      return false;

  var hasThis = /(call|apply|_classCallCheck)\(this(, arguments)?\)|\bthis(.\S+|\[.+?\])\s*(=|\()|=\s*this[,;]/.test(str);

  // Upper-cased first char of the name and has `this` in the body, or it's
  // a native class in ES5 style.
  if (/^function\s+[A-Z]/.test(str) && (hasThis ||
      (/\[native code\]/.test(str) &&
          obj.name !== "BigInt" && // ES6 BigInt and Symbol is not class
          obj.name !== "Symbol"
      )
  )) {
      return true;
  }

  // TypeScript anonymous class to ES5 with default export
  if (hasThis && obj.name === "default_1")
      return true;

  return false;
}
