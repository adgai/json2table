// const menu = document.createElement('div');
//
// // 点击页面空白处关闭菜单
// document.addEventListener("click", (e) => {
//     if (!menu.contains(e.target)) {
//         menu.style.display = "none";
//         currentTarget = null;
//     }
// });

function buildOverlay(table: HTMLTableElement, overlay: HTMLDivElement): void {
    const add_point_h_w = 10
    const add_point_h_w_half = add_point_h_w / 2;
    const side_h_w = 10
    const side_all = add_point_h_w + side_h_w


    overlay.innerHTML = "";

    const rect = table.getBoundingClientRect();

    const x = rect.left + window.scrollX;
    const y = rect.top + window.scrollY;


    overlay.style.width = rect.width + "px";
    overlay.style.height = rect.height + "px";

    // overlay.style.left = x + "px";
    // overlay.style.top = y + "px";

    // 行左侧 overlay（包括 thead + tbody）
    Array.from(table.rows).forEach((row: HTMLTableRowElement, i: number) => {

        const rowHeight = row.getBoundingClientRect().height;  // 更精确

        const ro = document.createElement("div");
        ro.className = "row-overlay";
        ro.style.width = side_h_w + 'px'
        ro.dataset.table_path = row.dataset.path

        // ro.style.left = -side_h_w + 'px'
        ro.style.left = wrapOffset(-side_h_w, x, y, 'left') + 'px'


        ro.onmouseover = () => {
            row.classList.add("row-highlight");
        };
        ro.onmouseout = () => {
            row.classList.remove("row-highlight");
        };


        ro.style.top = row.offsetTop + "px";
        ro.style.top = wrapOffset(row.offsetTop, x, y, 'top') + "px";

        ro.style.height = rowHeight + "px";

        if (i === table.rows.length - 1) {
            ro.classList.add("row-overlay-last");
        }

        ro.dataset.row = ' + i+ ';

        // ro.onclick = (e) => {
        //     // e.stopPropagation();
        //     // currentTarget = i;
        //     // currentType = "row";
        //     // showMenu(e.pageX, e.pageY);
        // };


        overlay.appendChild(ro);

        const left_btn = document.createElement('div');
        left_btn.className = "left_btn";
        left_btn.style.height = add_point_h_w + 'px'
        left_btn.style.width = side_all + rect.width + "px";

        left_btn.style.textAlign = "center"
        const rRect = table.rows[i].getBoundingClientRect();

        // left_btn.style.top = table.rows[i].offsetHeight * i - add_point_h_w_half + "px";

        const topLocal = (rRect.top - rect.top) - add_point_h_w_half; // 相对 table 顶部
        left_btn.style.top = `${topLocal}px`;

        // left_btn.style.top = wrapOffset(table.rows[i].offsetHeight * i - add_point_h_w_half, x, y, 'top') + "px";

        left_btn.style.left = -side_all + 'px'
        left_btn.style.left = wrapOffset(-side_all, x, y, 'left') + 'px'

        const a_btn = document.createElement('div');
        a_btn.className = "left_btn_a_btn";
        a_btn.style.width = add_point_h_w + 'px'
        a_btn.style.height = add_point_h_w + 'px'

        const line = document.createElement('div');
        line.className = "left_btn_line";
        line.style.width = side_h_w + rect.width + "px";

        const l_innerLine = document.createElement('div');
        l_innerLine.className = "inner-line";
        line.appendChild(l_innerLine);

        left_btn.appendChild(a_btn)
        left_btn.appendChild(line)
        // console.log(row.offsetHeight)
        overlay.appendChild(left_btn);
    });

    const left_btn = document.createElement('div');
    left_btn.className = "left_btn";
    left_btn.style.height = add_point_h_w + 'px'
    left_btn.style.width = side_all + rect.width + "px";
    left_btn.style.textAlign = "center"
    // left_btn.style.top = table.rows[table.rows.length - 1].offsetHeight * table.rows.length - add_point_h_w_half + "px";

    left_btn.style.top = rect.height - add_point_h_w_half + "px";
    // left_btn.style.top =wrapOffset( table.rows[table.rows.length - 1].offsetHeight * table.rows.length - add_point_h_w_half ,x,y,'top')+ "px";
    //

    left_btn.style.left = -side_all + 'px'
    left_btn.style.left = wrapOffset(-side_all, x, y, 'left') + 'px'

    const a_btn = document.createElement('div');
    a_btn.className = "left_btn_a_btn";

    a_btn.style.width = add_point_h_w + 'px'
    a_btn.style.height = add_point_h_w + 'px'


    const line = document.createElement('div');
    line.className = "left_btn_line";
    line.style.width = side_h_w + rect.width + "px";
    // line.style.height = add_point_h_w + 'px'
    // line.style.backgroundColor = "#00aaff"

    const l_innerLine = document.createElement('div');
    l_innerLine.className = "inner-line";
    line.appendChild(l_innerLine);

    left_btn.appendChild(a_btn)
    left_btn.appendChild(line)

    overlay.appendChild(left_btn);

    // 列上方 overlay（取第一行的 cells）
    const firstRow = table.rows[0].cells;

    Array.from<HTMLTableCellElement>(firstRow).forEach((cell, j: number) => {
        const co = document.createElement("div");
        co.className = "col-overlay";
        co.style.left = cell.offsetLeft + "px";
        co.style.left = wrapOffset(cell.offsetLeft, x, y, 'left') + "px";


        // console.log(cell)
        const cell_tag_name = cell.tagName;
        if (cell_tag_name === 'TH') {
            const querySelector: HTMLDivElement | null = cell.querySelector('.th_center');

            co.dataset.table_path = querySelector === null ? '' : querySelector.dataset.cur_path;
        } else if (cell_tag_name === 'TD') {
            co.dataset.table_path = cell.dataset.jspath
        }

        co.style.width = cell.offsetWidth + "px";
        if (j == firstRow.length - 1) {
            co.classList.add("col-overlay-last");
        }
        co.style.height = side_h_w + 'px'
        co.style.top = -side_h_w + "px";
        co.style.top = wrapOffset(-side_h_w, x, y, 'top') + "px";


        co.onmouseover = () => {
            const rows: HTMLTableRowElement[] = Array.from(table.rows); // 明确行类型
            for (const row of rows) {
                const cell = row.cells.item(j); // 用 item() 拿到可能为 null 的单元格
                if (cell) cell.classList.add("col-highlight");
            }
        };

        co.onmouseout = () => {
            const rows: HTMLTableRowElement[] = Array.from(table.rows);
            for (const row of rows) {
                const cell = row.cells.item(j);
                if (cell) cell.classList.remove("col-highlight");
            }
        };

        // co.style.height = '0px'
        co.dataset.col = '';
        // co.onclick = (e) => {
        //     e.stopPropagation();
        //     alert("列操作菜单: 第 " + j + " 列（含表头）");
        // };
        overlay.appendChild(co);

        const top_btn = document.createElement('div');
        top_btn.className = "top_btn";
        top_btn.style.height = rect.height + side_all + "px"
        top_btn.style.width = add_point_h_w + 'px'
        // left_btn.style.backgroundColor = "#0af"
        top_btn.style.textAlign = "center"
        top_btn.style.top = -side_all + 'px'
        top_btn.style.top = wrapOffset(-side_all, x, y, 'top') + 'px'


        const cRect = firstRow[j].getBoundingClientRect();
        const leftLocal = (cRect.left - rect.left) - add_point_h_w_half;
        top_btn.style.left = `${leftLocal}px`;

        // top_btn.style.left = offsetWidth * j - add_point_h_w_half + "px";


        // top_btn.style.left = wrapOffset(offsetWidth * j - add_point_h_w_half, x, y, 'left') + "px";

        const t_a_btn = document.createElement('div');
        t_a_btn.className = "top_btn_a_btn";

        t_a_btn.style.width = add_point_h_w + "px";
        t_a_btn.style.height = add_point_h_w + 'px'

        const t_line = document.createElement('div');
        t_line.className = "top_btn_line";
        t_line.style.width = add_point_h_w + "px";
        t_line.style.height = side_h_w + rect.height + "px";
        // line.style.backgroundColor = "#00aaff"

        const innerLine = document.createElement('div');
        innerLine.className = "inner-line";
        t_line.appendChild(innerLine);


        top_btn.appendChild(t_a_btn)
        top_btn.appendChild(t_line)


        overlay.appendChild(top_btn);

    });


    const top_btn = document.createElement('div');
    top_btn.className = "top_btn";
    top_btn.style.height = rect.height + side_all + "px"
    top_btn.style.width = add_point_h_w + 'px'
    // left_btn.style.backgroundColor = "#0af"
    top_btn.style.textAlign = "center"
    top_btn.style.top = -side_all + 'px'
    top_btn.style.top = wrapOffset(-side_all, x, y, 'top') + 'px'


    // top_btn.style.left = firstRow[firstRow.length - 1].offsetWidth * firstRow.length - add_point_h_w_half + "px";

    const leftLocal = rect.width - add_point_h_w_half;
    top_btn.style.left = `${leftLocal}px`;

    // top_btn.style.left = wrapOffset(firstRow[firstRow.length - 1].offsetWidth * firstRow.length - add_point_h_w_half, x, y, 'left') + "px";


    const t_a_btn = document.createElement('div');
    t_a_btn.className = "top_btn_a_btn";
    t_a_btn.style.width = add_point_h_w + "px";
    t_a_btn.style.height = add_point_h_w + "px";

    const t_line = document.createElement('div');
    t_line.className = "top_btn_line";
    t_line.style.width = add_point_h_w + "px";
    t_line.style.height = side_h_w + rect.height + "px";
    // line.style.backgroundColor = "#00aaff"

    const innerLine = document.createElement('div');
    innerLine.className = "inner-line";
    t_line.appendChild(innerLine);


    top_btn.appendChild(t_a_btn)
    top_btn.appendChild(t_line)

    overlay.appendChild(top_btn);

    // menu.className = "menu";
    // menu.classList.add("sl-table-row-col-tool-popmenu");
    //
    // const del = document.createElement('button');
    // del.className = "btnDelete";
    // del.innerText = '删除'
    //
    //
    // menu.appendChild(del)
    // overlay.appendChild(menu);

}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function wrapOffset(source: number, x: number, y: number, direction: string): number {
    // if (direction === "left") {
    //     return source + x
    // }
    //
    // if (direction === "top") {
    //     return source + y
    // }

    return source

}

export {buildOverlay}
