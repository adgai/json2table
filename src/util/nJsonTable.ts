function genHtml(json: any, path: string = '$', pt_path: string = '$'): string {

    if (json == null) {
        return ''
    } else if (json instanceof Array) {

        const t_path = pt_path
        // gen theader
        const hm = getHeaderRoot(json);
        const headerStr = thead(hm, t_path);

        const bodyArray: string[] = []

        // gen multi tbody
        for (let i = 0; i < json.length; i++) {
            const jsonElement = json[i];
            const path_i = path + '[' + i + ']';
            const s1 = tbody(hm, jsonElement, path_i, t_path);
            bodyArray.push(s1)
        }
        const s = wrapTable(path, headerStr, bodyArray);
        return s

    } else if (json instanceof Object) {
        const t_path = pt_path

        const hm = getHeaderRoot(json);

        const headerStr = thead(hm, t_path);

        // add table body

        const bodyStr = tbody(hm, json, path, t_path);


        return wrapTable(path, headerStr, new Array<string>(bodyStr));
    } else {
        //
        // json.split('\n').map((line: string) => {
        //
        // })
        //
        // console.log(json.includes('\n'))
        //
        // return json.toString();
        //

        const numeric = isNumeric(json);
        if (numeric) {
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

function getHeaderRoot(o: object): Map<string, any> {
    const header = new Set<string>();
    const hm: Map<string, any> = new Map

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
            hm.set(k, v instanceof Array)
            // console.log(hm)
            header.add(k)
        }
    }
    return header;

}

function thead(headerSet: Map<string, string>, t_path: string = '') {

    if (headerSet.size === 0) {
        return ''
    }
    let tableHeaderHtmlStr: string = ''
    // add table header
    tableHeaderHtmlStr = tableHeaderHtmlStr + '<thead> <tr>'

    const th_left = document.createElement('div');
    th_left.className = 'th_left'
    // console.log(th_left.innerHTML)
    const th_right = document.createElement('div');
    th_right.className = 'th_right'

    for (const header of headerSet) {
        let s1 = ''
        if (header[1]) {
            s1 = '[*]'
        }

        const s = t_path + '.' + header[0] + s1;

        const th_center = document.createElement('div');
        th_center.className = 'th_center'
        th_center.contentEditable = 'true'

        // th_center.classList.add(s)
        th_center.dataset.jspath = s
        th_center.dataset.cur_path = t_path + '.' + header[0]
        th_center.dataset.path = t_path + '.' + header[0]
        th_center.textContent = header[0];

        tableHeaderHtmlStr += '<th>' + th_left.outerHTML + th_center.outerHTML + th_right.outerHTML + '</th>'
    }
    tableHeaderHtmlStr = tableHeaderHtmlStr + '</tr> </thead> '

    return tableHeaderHtmlStr;
}

function tbody(hm: Map<string, string>, json: any, path: string = '', t_path: string) {

    let tableHeaderHtmlStr: string = ''

    // const button = '<div style="width: 20px;height: 20px"></div>'

    const tr = document.createElement('tr');
    tr.dataset.path = path;
    tr.dataset.t_path = t_path;

    if (hm.size === 0) {
        const s = genHtml(json, path, t_path);

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
        tddiv.innerHTML = s

        if (json == null) {
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
            if (header[1]) {
                // cur_path +='[*]'
                cur_t_path += '.' + header[0] + '[*]'
            } else {
                cur_t_path += '.' + header[0]
            }

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


    tableHeaderHtmlStr += tr.outerHTML
    return tableHeaderHtmlStr

}

function wrapTable(path: string, theader: string, tbodyArray: Array<string>): string {
    // 先生成 table
    let tableHtml = ''

    if (theader === '') {
        tableHtml += '<table id="non_header_table" border="2">'
    } else {
        tableHtml += '<table border="2">'
    }

    tableHtml += theader
    tableHtml += '<tbody>'

    for (const tbody of tbodyArray) {
        tableHtml += tbody
    }

    tableHtml += '</tbody>'
    tableHtml += '</table>'

    // 用 DOM 拼容器
    const container = document.createElement('div')
    container.className = 'table-container'
    container.innerHTML = tableHtml

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

export {genHtml}

