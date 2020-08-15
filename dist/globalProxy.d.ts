import { HtmlElementType } from "./type";
export default function <T extends HtmlElementType>(target: T): {
    sandbox: T;
    reset(): void;
    setGetProperty(cb: (originalTarget: T, p: PropertyKey) => any): void;
};
