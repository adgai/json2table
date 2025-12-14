import {describeObjectTypes} from "@/util/typeJudge";

function genHtml(json: any, path: string = '$', pt_path: string = '$'): string {
    const type = describeObjectTypes({'v': json})['v'];

    if (json == null) {
        return ''
    } else if (json instanceof Array) {

        const t_path = pt_path.slice()
        // gen theader
        const hm = getHeaderRoot(json);
        const headerStr = thead(hm, t_path + '[*]');

        const bodyArray: HTMLTableRowElement[] = []

        // gen multi tbody
        for (let i = 0; i < json.length; i++) {
            const jsonElement = json[i];
            const path_i = path + '[' + i + ']';
            const s1 = tbody(hm, jsonElement, path_i, t_path+ '[*]');
            bodyArray.push(s1)
        }
        const s = wrapTable1(path, headerStr, bodyArray, true, type, json.length === 0);
        return s.outerHTML

    } else if (json instanceof Object) {
        if (Object.keys(json).length === 0) {
            return '';
        }
        const t_path = pt_path

        const hm = getHeaderRoot(json);

        const headerStr = thead(hm, t_path);

        // add table body

        const bodyStr = tbody(hm, json, path, t_path);


        return wrapTable1(path, headerStr, new Array<HTMLTableRowElement>(bodyStr), false, type).outerHTML;
    } else {
        const numeric = isNumeric(json);
        if (numeric) {
            return json.toString();
        }

        const boolean = isBoolean(json);
        if (boolean) {
            return json.toString();
        }

        if (!json.includes('\n')) {
            return json.toString();
        }

        return buildEditableChildrenArray(json)
            .map(elem => {
                return elem.outerHTML
            })
            .join('');
    }

}

export function isNumeric(str: unknown): str is string {
    if (typeof str !== 'string') {
        return Number.isFinite(str);
    }
    const s = str.trim();
    if (s === '') return false;
    // Number() 会拒绝 '123abc'、''、'   '，但会接受 '1e3'
    const n = Number(s);
    return Number.isFinite(n);
}

type IsBooleanOptions = {
    acceptWrapper?: boolean;        // 兼容 new Boolean(...)
    acceptStringBoolean?: boolean;  // 兼容 "true"/"false"
    acceptNumeric?: boolean;        // 兼容 0/1
};

export function isBoolean(
    value: unknown,
    opts: IsBooleanOptions = {}
): value is boolean {
    const {
        acceptWrapper = true,
        acceptStringBoolean = false,
        acceptNumeric = false,
    } = opts;

    // 原始 boolean
    if (typeof value === 'boolean') return true;

    // Boolean 包装对象
    if (acceptWrapper && Object.prototype.toString.call(value) === '[object Boolean]') {
        return true;
    }

    // 字符串 "true"/"false"
    if (acceptStringBoolean && typeof value === 'string') {
        return value === 'true' || value === 'false';
    }

    // 数字 0/1
    if (acceptNumeric && typeof value === 'number') {
        return value === 0 || value === 1;
    }

    return false;
}

/** 同上，但返回数组，便于你自行插入/排序/diff */
export function buildEditableChildrenArray(
    text: string,
    opts?: { lineTag?: keyof HTMLElementTagNameMap; lineClass?: string }
): HTMLElement[] {
    const {lineTag = 'div', lineClass} = opts ?? {};
    const out: HTMLElement[] = [];
    for (const [i, line] of splitLines(text).entries()) {
        const el = document.createElement(lineTag);
        if (lineClass) el.className = lineClass;
        el.dataset.line = String(i + 1);
        if (line === '') el.appendChild(document.createElement('br'));
        else el.textContent = line;
        out.push(el);
    }
    return out;
}

/** 行拆分：兼容 \r\n / \n / \r，保留末尾空行 */
function splitLines(input: string): string[] {
    const re = /\r\n|\n|\r/g;
    const out: string[] = [];
    let start = 0, m: RegExpExecArray | null;
    while ((m = re.exec(input))) {
        out.push(input.slice(start, m.index));
        start = re.lastIndex;
    }
    out.push(input.slice(start));
    return out;
}

function getHeaderRoot(o: object): Map<string, string> {
    const header = new Set<string>();
    const hm: Map<string, string> = new Map

    getHeader(header, hm, o);

    // console.log(JSON.stringify(hm))
    return hm
}

function getHeader(header: Set<string>, hm: Map<string, any>, json: object): Set<string> {

    if (json instanceof Array) {
        for (const jsonElement of json) {
            getHeader(header, hm, jsonElement)
        }
    } else if (json instanceof Object) {
        for (const [k, v] of Object.entries(json)) {
            const value = describeObjectTypes({'v': v});
            hm.set(k, value['v'])
            // console.log(value)
            header.add(k)
        }
    }
    return header;

}

function thead(headerSet: Map<string, string>, t_path: string = ''): HTMLTableSectionElement | null {

    if (headerSet.size === 0) {
        return null
    }

    let tableHeaderHtmlStr: string = ''
    // add table header
    tableHeaderHtmlStr = tableHeaderHtmlStr + '<thead> <tr>'

    const the = document.createElement('thead');
    const tr = document.createElement('tr');
    the.appendChild(tr);


    for (const header of headerSet) {
        const s1 = ''
        // if (header[1]) {
        //     s1 = '[*]'
        // }

        const th_right = document.createElement('div');
        th_right.className = 'th_right'
        th_right.dataset.type = header[1];

        const s = t_path + '.' + header[0] + s1;

        const th_center = document.createElement('div');
        th_center.className = 'th_center'
        th_center.contentEditable = 'true'

        // th_center.classList.add(s)
        th_center.dataset.jspath = s
        th_center.dataset.cur_path = t_path + '.' + header[0]
        th_center.dataset.path = t_path + '.' + header[0]
        th_center.textContent = header[0];

        const th_left = document.createElement('div');
        th_left.className = 'th_left'

        tableHeaderHtmlStr += '<th>' + th_left.outerHTML + th_center.outerHTML + th_right.outerHTML + '</th>'

        const th = document.createElement('th');
        th.appendChild(th_left);
        th.appendChild(th_center);
        th.appendChild(th_right);

        tr.appendChild(th);
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    tableHeaderHtmlStr = tableHeaderHtmlStr + '</tr> </thead> '

    // console.log(the.outerHTML)
    // console.log(tableHeaderHtmlStr)
    //
    //
    // console.log(the.outerHTML.trim() === tableHeaderHtmlStr.trim())

    return the;


}

function tbody(hm: Map<string, string>, json: any, path: string = '', t_path: string): HTMLTableRowElement {

    // eslint-disable-next-line @typescript-eslint/no-unused-vars

    // const button = '<div style="width: 20px;height: 20px"></div>'

    const tr = document.createElement('tr');
    tr.dataset.path = path;
    tr.dataset.t_path = t_path;

    if (hm.size === 0) {
        const s = (json === null || json === undefined) ? '' : json.toString();

        const td = document.createElement('td');
        // td.className = path
        //
        // td.classList.add(t_path)

        td.dataset.jspath = path

        td.classList.add('tds_content')


        // td.innerHTML = s

        const tddiv = document.createElement('div');
        // tddiv.classList.add(path)

        tddiv.dataset.path = path

        tddiv.classList.add('td_content')
        tddiv.textContent = s

        if (json == null || (json instanceof Object && Object.keys(json).length === 0)) {
            tddiv.setAttribute('contenteditable', 'true');
            // tddiv.setAttribute('-webkit-user-modify', 'read-write-plaintext-only')
            tddiv.classList.add('td_content_leaf')
        } else if (json instanceof Array) {
            // console.log(1);
        } else if (json instanceof Object) {
            // console.log(1);
        } else {
            tddiv.setAttribute('contenteditable', 'true');
            // tddiv.setAttribute('-webkit-user-modify', 'read-write-plaintext-only')
            tddiv.classList.add('td_content_leaf')
        }
        // tddiv.appendChild(td)

        // tableHeaderHtmlStr += td.outerHTML
        td.appendChild(tddiv)
        tr.appendChild(td)
    } else {
        for (const header of hm) {
            const josnElement = json[header[0]];
            const cur_path = path + '.' + header[0];
            let cur_t_path = t_path

            // console.log(cur_path)
            // console.log(cur_t_path)
            // if (header[1]) {
            //     // cur_path +='[*]'
            //     cur_t_path += '.' + header[0] + '[*]'
            // } else {
                cur_t_path += '.' + header[0]
            // }

            let x_path = ''
            if (josnElement instanceof Array) {
                x_path = cur_path + '[*]'
            } else {
                x_path = cur_path
            }


            const td = document.createElement('td');
            // td.className = x_path
            // td.classList.add(cur_t_path)

            const s3 = genHtml(josnElement, cur_path, cur_t_path);


            const tddiv = document.createElement('div');
            // tddiv.classList.add(cur_path)
            tddiv.dataset.jspath = cur_path

            tddiv.dataset.cur_path = cur_path
            tddiv.dataset.x_path = x_path
            tddiv.dataset.path = cur_path

            tddiv.classList.add('td_content')
            tddiv.innerHTML = s3

            if (josnElement == null) {
                tddiv.setAttribute('contenteditable', 'true');
                // td.setAttribute('-webkit-user-modify', 'read-write-plaintext-only')
                tddiv.classList.add('td_content_leaf')
            } else if (josnElement instanceof Array) {
                // console.log(1);
            } else if (josnElement instanceof Object) {
                // console.log(1);
            } else {
                tddiv.setAttribute('contenteditable', 'true');
                // td.setAttribute('-webkit-user-modify', 'read-write-plaintext-only')
                tddiv.classList.add('td_content_leaf')
            }


            td.appendChild(tddiv)

            td.classList.add('tds_content')
            td.dataset.jspath = x_path

            tr.appendChild(td)
        }

    }


    return tr

}


function wrapTable1(
    path: string,
    theader: HTMLTableSectionElement | null,
    tbodyArray: HTMLTableRowElement[],
    array: boolean,
    type: string,
    isArrayEmpty: boolean = false
): HTMLElement {
    // ====== 创建表格 ======
    const table = document.createElement('table');
    table.dataset.type = String(type);
    if (array && isArrayEmpty) {
        table.style.minWidth = '40px';
    }

    if (theader === null) {
        table.id = 'non_header_table';
    } else {
        table.setAttribute('border', '2');
        table.appendChild(theader);
    }

    // ====== 创建 tbody ======
    const tbody = document.createElement('tbody');
    for (const row of tbodyArray) {
        tbody.appendChild(row);
    }
    table.appendChild(tbody);

    // ====== 创建容器 ======
    const container = document.createElement('div');
    container.className = 'table-container';
    container.appendChild(table);

    // ====== 右侧加号 ======
    const rightAdd = document.createElement('div');
    rightAdd.textContent = '+';
    rightAdd.className = 'right_add';
    rightAdd.dataset.cur_path = path;
    container.appendChild(rightAdd);

    // ====== 底部加号 ======
    const bottomAdd = document.createElement('div');
    bottomAdd.textContent = '+';
    bottomAdd.className = 'bottom_add';
    bottomAdd.dataset.cur_path = path;
    if (array && isArrayEmpty) {
        bottomAdd.style.opacity = '1';
        bottomAdd.style.pointerEvents = 'auto';
        bottomAdd.style.height = '20px';
        bottomAdd.style.width = '30px';
        bottomAdd.style.minWidth = '30px';
        bottomAdd.style.left = '50%';
        bottomAdd.style.right = '';
        bottomAdd.style.transform = 'translateX(-50%)';
    }
    container.appendChild(bottomAdd);

    // ====== 右下角加号 ======
    const cooner = document.createElement('div');
    cooner.textContent = '+';
    cooner.className = 'cooner';
    container.appendChild(cooner);

    // ====== 悬浮层 overlay ======
    const overlay = document.createElement('div');
    overlay.className = 'ever_layer overlay-container';
    overlay.id = `overlay_${Date.now()}`; // 避免重复 ID
    container.appendChild(overlay);

    // ====== 返回 DOM 元素 ======
    return container;
}


// eslint-disable-next-line @typescript-eslint/no-unused-vars
function wrapTable(path: string, theader: null | HTMLTableSectionElement, tbodyArray: Array<HTMLTableRowElement>, array: boolean, type: string): string {
    // 先生成 table
    let tableHtml = ''

    // console.log(type)

    const table = document.createElement('table');
    table.dataset.type = String(type)
    // table.style.border = '2px';

    if (theader === null) {
        tableHtml += '<table id="non_header_table"  data-type= ' + String(type) + '>'
        table.id = 'non_header_table'

    } else {
        tableHtml += '<table border="2" title="11111111111111111111111111111111111111111111" data-type= ' + String(type) + '>'
        table.appendChild(theader)
    }


    tableHtml += theader
    tableHtml += '<tbody>'
    const tbody = document.createElement('tbody');
    table.appendChild(tbody)

    for (const tbodya of tbodyArray) {
        tableHtml += tbodya.outerHTML

        tbody.appendChild(tbodya)
    }

    tableHtml += '</tbody>'
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    tableHtml += '</table>'

    // 用 DOM 拼容器
    const container = document.createElement('div')
    container.className = 'table-container'
    // container.innerHTML = tableHtml
    container.appendChild(table)

    const right_add = document.createElement('div')
    right_add.textContent = '+'
    right_add.className = 'right_add'
    right_add.dataset.cur_path = path


    const bottom_add = document.createElement('div')
    bottom_add.textContent = '+'
    bottom_add.className = 'bottom_add'
    bottom_add.dataset.cur_path = path

    const cooner = document.createElement('div')
    cooner.textContent = '+'
    cooner.className = 'cooner'

    container.appendChild(right_add)
    container.appendChild(bottom_add)
    container.appendChild(cooner)


    const everLayer = document.createElement('div')
    everLayer.className = 'ever_layer'
    everLayer.classList.add('overlay-container')
    everLayer.id = 'overlay'
    container.appendChild(everLayer)

    return container.outerHTML
}

// let s = genHtml(
//   JSON.parse('[{\"code\":0,\"message\":\"0\",\"ttl\":1,\"data\":{\"at\":0,\"chat\":0,\"like\":0,\"reply\":0,\"sys_msg\":0,\"up\":0}},{"code":0,"message":"0","ttl":1,"data":{"at":0,"chat":0,"like":0,"reply":0,"sys_msg":0,"up":0}}]')
// );
//
// console.log(s)

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function htmlToEl(html: string): Element {
    const tpl = document.createElement('div');
    tpl.innerHTML = html.trim();
    return <Element>tpl.firstElementChild;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function parseHTML(html: string) {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.childNodes; // 或 doc.body.firstElementChild 等
}

export {genHtml}
