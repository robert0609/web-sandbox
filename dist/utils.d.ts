export declare function sleep(ms: number): Promise<unknown>;
export declare function safeLog(...args: any[]): void;
/**
 * Checks if an object could be an instantiable class.
 * @param {any} obj
 * @returns {obj is new (...args: any[]) => any}
 */
export declare function isClass(obj: any): boolean;
