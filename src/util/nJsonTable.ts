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
        return wrapTable(headerStr, bodyArray)

    } else if (json instanceof Object) {
        const t_path = pt_path

        const hm = getHeaderRoot(json);

        const headerStr = thead(hm, t_path);

        // add table body

        const bodyStr = tbody(hm, json, path, t_path);


        return wrapTable(headerStr, new Array<string>(bodyStr));
    } else {
        return json.toString();
    }

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

function thead(headerSet: Map<string, any>, t_path: string = '') {

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


        console.log('-----------' + header[1].toString())
        const s = t_path + '.' + header[0] + s1;

        const th_center = document.createElement('div');
        th_center.className = 'th_center'

        // th_center.classList.add(s)
        th_center.dataset.jspath = s

        th_center.textContent = header[0];

        tableHeaderHtmlStr += '<th>' + th_left.outerHTML + th_center.outerHTML + th_right.outerHTML + '</th>'
    }
    tableHeaderHtmlStr = tableHeaderHtmlStr + '</tr> </thead> '

    return tableHeaderHtmlStr;
}

function tbody(hm: Map<string, any>, json: any, path: string = '', t_path: string) {

    let tableHeaderHtmlStr: string = ''

    // const button = '<div style="width: 20px;height: 20px"></div>'

    const tr = document.createElement('tr');

    if (hm.size === 0) {
        const s = genHtml(json, path, t_path);

        const td = document.createElement('td');
        // td.className = path
        //
        // td.classList.add(t_path)

        td.dataset.jspath = path

        td.classList.add('tds_content')


        td.innerHTML = s

        const tddiv = document.createElement('div');
        // tddiv.classList.add(path)

        tddiv.dataset.jspath = path

        tddiv.classList.add('td_content')
        tddiv.appendChild(td)

        // tableHeaderHtmlStr += td.outerHTML

        tr.appendChild(tddiv)
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
            if (josnElement instanceof Array){
                x_path = cur_path + '[*]'
            }else {
                 x_path = cur_path
            }


            const td = document.createElement('td');
            td.className = x_path
            // td.classList.add(cur_t_path)
            td.dataset.jspath = cur_t_path

            const s3 = genHtml(josnElement, cur_path, cur_t_path);


            const tddiv = document.createElement('div');
            // tddiv.classList.add(cur_path)
            tddiv.dataset.jspath = cur_path
            tddiv.classList.add('td_content')
            tddiv.innerHTML = s3

            td.appendChild(tddiv)

            td.classList.add('tds_content')

            tr.appendChild(td)
        }

    }


    tableHeaderHtmlStr += tr.outerHTML
    return tableHeaderHtmlStr

}

function wrapTable(theader: string, tbodyArray: Array<string>): string {

    let tableHeaderHtmlStr = ''


    if (theader === '') {
        tableHeaderHtmlStr += '<table  id="non_header_table" border="2">'
    } else {
        tableHeaderHtmlStr += '<table    border="2">'
    }


    tableHeaderHtmlStr += theader

    tableHeaderHtmlStr += '<tbody>'

    for (const tbody of tbodyArray) {
        tableHeaderHtmlStr += tbody
    }

    tableHeaderHtmlStr += '</tbody> '

    tableHeaderHtmlStr += '</table>'

    const add_td = document.createElement('div');
    add_td.textContent = 'add'

    tableHeaderHtmlStr += add_td.outerHTML

    return tableHeaderHtmlStr

}


// let s = genHtml(
//   JSON.parse('[{\"code\":0,\"message\":\"0\",\"ttl\":1,\"data\":{\"at\":0,\"chat\":0,\"like\":0,\"reply\":0,\"sys_msg\":0,\"up\":0}},{"code":0,"message":"0","ttl":1,"data":{"at":0,"chat":0,"like":0,"reply":0,"sys_msg":0,"up":0}}]')
// );
//
// console.log(s)

export {genHtml}

