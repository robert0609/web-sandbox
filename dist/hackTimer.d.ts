export default function (target: Window): {
    hookSetInterval: (handler: TimerHandler, timeout?: number | undefined, ...args: any[]) => number;
    hookSetTimeout: (handler: TimerHandler, timeout?: number | undefined, ...args: any[]) => number;
    reset(): void;
};
