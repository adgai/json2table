
function genHtml(json: any, path: string = ''): string {

    if (json == null) {
        return ''
    } else if (json instanceof Array) {

        // gen theader
        const headerRoot = getHeaderRoot(json);
        const headerStr = thead(headerRoot);

        const bodyArray: string[] = []

        // gen multi tbody
        for (let i = 0; i < json.length; i++) {
            const jsonElement = json[i];
            const path_i = path + '[' + i + ']';
            const s1 = tbody(headerRoot, jsonElement, path_i);
            bodyArray.push(s1)
        }
        return wrapTable(headerStr, bodyArray)

    } else if (json instanceof Object) {
        const headerSet = getHeaderRoot(json);

        const headerStr = thead(headerSet);

        // add table body

        const bodyStr = tbody(headerSet, json, path);


        return wrapTable(headerStr, new Array<string>(bodyStr));
    } else {
        return json.toString();
    }

}

function getHeader(header: Set<string>, json: object): Set<string> {

    if (json instanceof Array) {
        for (const jsonElement of json) {
            getHeader(header, jsonElement)
        }
    } else if (json instanceof Object) {
        for (const [k, v] of Object.entries(json)) {
            header.add(k)
        }
    }
    return header;

}

function getHeaderRoot(o: object): Set<string> {
    const header = new Set<string>();
    getHeader(header, o);
    return header
}


function thead(headerSet: Set<string>) {

    if (headerSet.size === 0) {
        return ''
    }
    let tableHeaderHtmlStr: string = ''

    const htmlHeadElement = new HTMLHeadElement();

    // add table header
    tableHeaderHtmlStr = tableHeaderHtmlStr + '<thead> <tr>'

    for (const header of headerSet) {
        tableHeaderHtmlStr += '<th>' + header + '</th>'
    }
    tableHeaderHtmlStr = tableHeaderHtmlStr + '</tr> </thead> '

    return tableHeaderHtmlStr;
}

function tbody(headerSet: Set<string>, json: any, path: string = '') {

    let tableHeaderHtmlStr: string = ''

    tableHeaderHtmlStr += '<tr>'
    const button = '<button>copy</button>'

    if (headerSet.size === 0) {
        const s = genHtml(json, path);
        tableHeaderHtmlStr += '<td p=' + path + '>'  + s + '</td>'
    } else {
        for (const header of headerSet) {
            const josnElement = json[header];
            const cur_path = path + '.' + header;
            tableHeaderHtmlStr += '<td p=' + cur_path + '>' + button +genHtml(josnElement, cur_path) + '</td>'
        }
    }


    tableHeaderHtmlStr += '</tr>'
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
    return tableHeaderHtmlStr

}


// let s = genHtml(
//   JSON.parse('[{\"code\":0,\"message\":\"0\",\"ttl\":1,\"data\":{\"at\":0,\"chat\":0,\"like\":0,\"reply\":0,\"sys_msg\":0,\"up\":0}},{"code":0,"message":"0","ttl":1,"data":{"at":0,"chat":0,"like":0,"reply":0,"sys_msg":0,"up":0}}]')
// );
//
// console.log(s)

export {genHtml}

