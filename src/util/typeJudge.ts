type BaseKind = 'null' | 'boolean' | 'number' | 'string' | 'object' | 'array';
type ArrayElemKind = Exclude<BaseKind, 'null' | 'array'> | 'array' | 'null';

function baseKindOf(v: unknown): BaseKind {
    if (v === null) return 'null';
    if (Array.isArray(v)) return 'array';
    const t = typeof v;
    if (t === 'boolean' || t === 'number' || t === 'string') return t;
    return 'object';
}

// 把 <...> 换成 《...》
function toCjkBrackets(s: string): string {
    return s.replace(/</g, '《').replace(/>/g, '》');
}

function describeValueType(v: unknown): string {
    const k = baseKindOf(v);
    if (k !== 'array') return k;

    const arr = v as unknown[];
    if (arr.length === 0) return toCjkBrackets('array<empty>');

    const elemKinds = new Set<ArrayElemKind>();
    for (const e of arr) elemKinds.add(baseKindOf(e) as ArrayElemKind);

    if (elemKinds.size === 1 && elemKinds.has('array')) {
        const innerKinds = new Set<ArrayElemKind>();
        for (const sub of arr as unknown[][]) {
            if (!Array.isArray(sub)) continue;
            if (sub.length === 0) { innerKinds.add('null'); continue; }
            for (const se of sub) innerKinds.add(baseKindOf(se) as ArrayElemKind);
        }
        innerKinds.delete('array');
        const s = innerKinds.size === 1
            ? `array<array<${[...innerKinds][0]}>>`
            : `array<array<mixed: ${[...innerKinds].join(' | ')}>>`;
        return toCjkBrackets(s);
    }

    const pureAtom = (k: ArrayElemKind) => k === 'string' || k === 'number' || k === 'boolean' || k === 'null';
    if (elemKinds.size === 1 && elemKinds.has('object')) return toCjkBrackets('array<object>');
    if (elemKinds.size === 1 && pureAtom([...elemKinds][0])) {
        return toCjkBrackets(`array<${[...elemKinds][0]}>`);
    }

    return toCjkBrackets(`array<mixed: ${[...elemKinds].join(' | ')}>`);
}

function describeObjectTypes(obj: unknown): Record<string, string> {
    if (baseKindOf(obj) !== 'object') throw new Error('describeObjectTypes 只接受 object 顶层输入');
    const o = obj as Record<string, unknown>;
    const out: Record<string, string> = {};
    for (const key of Object.keys(o)) out[key] = describeValueType(o[key]);
    return out;
}

export {describeObjectTypes}
