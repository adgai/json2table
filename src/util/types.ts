export interface BaseMockRules {
    string?: () => any
    number?: () => any
    boolean?: () => any
    null?: () => any
}


// types.ts
export type EditEndReason =
    | 'debounce'
    | 'compositionend'
    | 'blur'
    | 'paste'
    | 'drop'
    | 'enter';

export interface OnEditEndPayload {
    el:HTMLDivElement;
    html: string;     // 当前 innerHTML
    text: string;     // 将 <br> 还原为 \n 的纯文本
    reason: EditEndReason;

}

export interface OnContentEditEndOptions {
    /** 输入停止多少毫秒后认为“输入结束”（默认 300ms） */
    debounceMs?: number;
    /** 拦截回车并立即触发一次“输入结束”（默认 false） */
    fireOnEnter?: boolean;
}