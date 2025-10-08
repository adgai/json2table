// onContentEditEnd.ts
import {EditEndReason, OnContentEditEndOptions, OnEditEndPayload} from './types';

export type Unbind = () => void;

/** 将 contenteditable 容器中的 <br> 还原为 \n，返回纯文本 */
export function getTextFromCell(el: HTMLElement): string {
    return el.innerText
}


/**
 * 只在“输入结束”时触发回调：
 * - 停顿一段时间（debounce）
 * - IME 结束（compositionend）
 * - 失焦（blur）
 * - 粘贴/拖放
 * - （可选）回车立即触发
 */
export function onContentEditEnd(
    el: Element,
    onEnd: (payload: OnEditEndPayload) => void,
    opts: OnContentEditEndOptions = {}
): Unbind {
    // 开启可编辑
    el.setAttribute('contenteditable', 'true');
    (el as HTMLDivElement).spellcheck = false;

    const debounceMs = opts.debounceMs ?? 300;
    const fireOnEnter = opts.fireOnEnter ?? false;

    let composing = false;
    let timer: number | null = null;

    const getText = (): string => {
        // 把 <br> 还原成 \n，其他节点取 textContent
        let t = '';
        el.childNodes.forEach((n) => {
            if (n.nodeType === Node.TEXT_NODE) t += n.nodeValue ?? '';
            else if ((n as HTMLElement).nodeName === 'BR') t += '\n';
            else t += (n as HTMLElement).textContent ?? '';
        });
        return t;
    };

    const fire = (reason: EditEndReason): void => {
        onEnd({el: el as HTMLDivElement, html: el.innerHTML, text: getText(), reason});
    };

    const clear = (): void => {
        if (timer != null) {
            clearTimeout(timer);
            timer = null;
        }
    };

    const schedule = (): void => {
        clear();
        timer = window.setTimeout(() => {
            timer = null;
            fire('debounce');
        }, debounceMs);
    };

    // 事件处理器（保存引用便于解绑）
    const handleCompositionStart = (): void => {
        composing = true;
        clear();
    };

    const handleCompositionEnd = (): void => {
        composing = false;
        clear();
        fire('compositionend');
    };

    const handleInput = (): void => {
        if (!composing) schedule();
    };

    const handlePaste = (): void => {
        clear();
        // 让浏览器先完成粘贴，再读取内容
        setTimeout(() => fire('paste'), 0);
    };

    const handleDrop = (): void => {
        clear();
        setTimeout(() => fire('drop'), 0);
    };

    const handleBlur = (): void => {
        clear();
        fire('blur');
    };

    const handleBeforeInput = (e: InputEvent): void => {
        if (!fireOnEnter) return;
        // 回车立即触发一次“输入结束”，不阻止默认编辑行为
        // insertParagraph / insertLineBreak 均覆盖
        if (e.inputType === 'insertParagraph' || e.inputType === 'insertLineBreak') {
            clear();
            // 放到事件尾部，等浏览器把 <br>/换行插入完
            setTimeout(() => fire('enter'), 0);
        }
    };

    // 绑定
    el.addEventListener('compositionstart', handleCompositionStart);
    el.addEventListener('compositionend', handleCompositionEnd);
    el.addEventListener('input', handleInput);
    el.addEventListener('paste', handlePaste);
    el.addEventListener('drop', handleDrop);
    el.addEventListener('blur', handleBlur);
    // el.addEventListener('beforeinput', handleBeforeInput);

    // 返回解绑函数
    return () => {
        clear();
        el.removeEventListener('compositionstart', handleCompositionStart);
        el.removeEventListener('compositionend', handleCompositionEnd);
        el.removeEventListener('input', handleInput);
        el.removeEventListener('paste', handlePaste);
        el.removeEventListener('drop', handleDrop);
        el.removeEventListener('blur', handleBlur);
        // el.removeEventListener('beforeinput', handleBeforeInput);
    };
}
