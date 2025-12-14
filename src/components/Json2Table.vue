<template>
  <div>
    <div class="header">
      <div class="header-controls">
        <div class="mode_toggle">
          <SimpleSwitch v-model="editSwitch"></SimpleSwitch>
        </div>
        <div class="theme_picker">
          <label for="theme-select">Theme:</label>
          <select id="theme-select" v-model="themeName">
            <option v-for="opt in themeOptions" :key="opt.value" :value="opt.value">
              {{ opt.label }}
            </option>
          </select>
        </div>
      </div>
      <div class="header-hint" v-if="!editSwitch">
        click value to copy value json path, click header to copy all value json path
      </div>

      <div class="header-hint" v-if="editSwitch">
        edit table equal edit json
      </div>
    </div>

    <div>
      <a href="https://github.com/adgai/json2table" target="_blank" class="github-corner"
         aria-label="View source on GitHub">
        <svg width="80" height="80" viewBox="0 0 250 250"
             style="fill:#151513; color:#fff; position: absolute; top: 0; border: 0; right: 0;" aria-hidden="true">
          <path d="M0,0 L115,115 L130,115 L142,142 L250,250 L250,0 Z"></path>
          <path
              d="M128.3,109.0 C113.8,99.7 119.0,89.6 119.0,89.6 C122.0,82.7 120.5,78.6 120.5,78.6 C119.2,72.0 123.4,76.3 123.4,76.3 C127.3,80.9 125.5,87.3 125.5,87.3 C122.9,97.6 130.6,101.9 134.4,103.2"
              fill="currentColor" style="transform-origin: 130px 106px;" class="octo-arm"></path>
          <path
              d="M115.0,115.0 C114.9,115.1 118.7,116.5 119.8,115.4 L133.7,101.6 C136.9,99.2 139.9,98.4 142.2,98.6 C133.8,88.0 127.5,74.4 143.8,58.0 C148.5,53.4 154.0,51.2 159.7,51.0 C160.3,49.4 163.2,43.6 171.4,40.1 C171.4,40.1 176.1,42.5 178.8,56.2 C183.1,58.6 187.2,61.8 190.9,65.4 C194.5,69.0 197.7,73.2 200.1,77.6 C213.8,80.2 216.3,84.9 216.3,84.9 C212.7,93.1 206.9,96.0 205.4,96.6 C205.1,102.4 203.0,107.8 198.3,112.5 C181.9,128.9 168.3,122.5 157.7,114.1 C157.9,116.9 156.7,120.9 152.7,124.9 L141.0,136.5 C139.8,137.7 141.6,141.9 141.8,141.8 Z"
              fill="currentColor" class="octo-body"></path>
        </svg>
      </a>
    </div>

    <div>
    <textarea class="json_input" v-model="jsonStr" @blur="formatJsonStr">

    </textarea>
    </div>


    <div v-if="!editSwitch" class="path_show_container">
      <div class="key-path path_show">
        <span class="path_show_desc">key path:</span>
        <span class="path_show_path">{{ jp }}</span>

        <div class="copy_value" v-if="jp.valueOf()" @click="copyValue(jp,json_o)">copy value</div>
      </div>

      <div class="value-path path_show">
        <span class="path_show_desc">value path:</span>
        <span class="path_show_path">{{ jp_v }}</span>

        <div class="copy_value" v-if="jp_v.valueOf()" @click="copyValue(jp_v,json_o)">copy value</div>
      </div>


    </div>

    <div>
      <div v-html="tableHtmlStr">

      </div>
    </div>


  </div>
</template>

<script setup lang="ts">
import {onMounted, onUpdated, ref, toRaw, watch, onBeforeUnmount} from 'vue'
import {genHtml} from "@/util/nJsonTable";
// eslint-disable-next-line no-unused-vars
import {buildOverlay} from "@/util/overlay";
import {onContentEditEnd, getTextFromCell} from "@/util/onContentEditEnd"

import SimpleSwitch from './SimpleSwitch.vue'

import {faker} from "@faker-js/faker"

import type {BaseMockRules} from './types'
import data from '../assets/data.json'
import {getThemeClass, getThemeConfig, themeOptions} from "@/util/themeConfig"

let editSwitch = ref(false)

const rules: BaseMockRules = {
  string: () => faker.lorem.word(),
  number: () => faker.number.int({min: 10, max: 99}),
  boolean: () => faker.datatype.boolean(),
}

import {useToast} from "@/util/useToast"

const {show} = useToast()
import {JSONPath} from 'jsonpath-plus';

let json_o = ref(null)
// let json_path = ref('')
let jp = ref('')
// let  a = '231'
let jp_v = ref('')
const jsonStr = ref(JSON.stringify(data))
const tableHtmlStr = ref('')
const themeName = ref('neutral')

let refresh_html = ref(true)
// 复制/粘贴状态
let selectedRowMeta: {parentPath: string; rowIndex: number} | null = null
let selectedColMeta: {arrayPath: string; fieldKey: string} | null = null
let copiedRow: {value: any} | null = null
let copiedCol: {values: any[]; fieldKey: string} | null = null

// ����ֱ������һ??ref
watch(jsonStr, async (newQuestion) => {
      if (newQuestion === '') {
        return
      }

      if (!refresh_html.value) {
        return
      }

      try {
        let json = JSON.parse(newQuestion);
        console.log(json)
        json_o.value = json;
        tableHtmlStr.value = genHtml(
            json
        )
      } catch (e) {
        tableHtmlStr.value = newQuestion
        console.log("e", e)
      }
    },
)

watch(themeName, (t) => applyTheme(t))

onMounted(() => {

  if (jsonStr.value === '') {
    return
  }
  formatJsonStr()
  try {
    let json = JSON.parse(jsonStr.value);

    json_o.value = json;
    console.log(json)
    tableHtmlStr.value = genHtml(
        json
    )
  } catch (e) {
    console.log(e)
    tableHtmlStr.value = jsonStr.value
  }

  buildOverlayLocal();
  window.addEventListener('resize', buildOverlayLocal)

  setAddButtonsVisible(editSwitch.value)
  setEditableVisible(editSwitch.value)
  setupCellClickToFocus()
  applyTheme(themeName.value)
  formatJsonStr()
  setupClearSelectionListeners()
  setupCopyPasteHotkeys()

})
onUpdated(() => {

      setAddButtonsVisible(editSwitch.value)
      setEditableVisible(editSwitch.value)
      setupCellClickToFocus()

      if (editSwitch.value) {
        buildOverlayLocal()
      }

      if (!editSwitch.value) {

        var comments = Array.from(document.getElementsByClassName('tds_content'));
        var numComments = comments.length;
        for (var i = 0; i < numComments; i++) {

          bindOnce(comments[i], 'click', () => function () {
            // console.log(1332313);
            if (editSwitch.value) {
              return
            }
            // ʹ�� e.stopPropagation() ����ֹ�¼�ð??            e.stopPropagation();

            // ʹ�� `this` ��ȡ�������Ԫ��
            // console.log(this);

            // ��ȡ�����Ԫ�ص�����
            // const classListElement1 = this.classList[0];
            const classListElement1 = this.dataset.jspath;

            jp_v.value = classListElement1;
            show("��ʾ���Ѹ��� \n     " + classListElement1)
            navigator.clipboard.writeText(classListElement1)

            // ������������������
          }, 'tds_content_click');


          comments[i].onmouseover = function (e) {
            if (editSwitch.value) {
              return
            }
            // eslint-disable-next-line @typescript-eslint/no-unused-expressions
            window.event ? window.event.cancelBubble = true : e.stopPropagation();

            var element = document.elementFromPoint(e.pageX, e.pageY);

            if (!element) {
              return;
            }
            const tagName = element.tagName;

            // console.log(tagName)
            if (tagName === 'TD') {
              this.style.backgroundColor = "#8bc34a45"
            }

            if (element.classList.contains('td_content')) {
              this.style.backgroundColor = "#8bc34a45"
            }

          }
          comments[i].onmouseout = function (e) {
            // eslint-disable-next-line @typescript-eslint/no-unused-expressions
            window.event ? window.event.cancelBubble = true : e.stopPropagation();
            this.style.backgroundColor = "";
          }

        }

        var th_centers = document.getElementsByClassName('th_center');
        const length = th_centers.length;
        for (let i = 0; i < length; i++) {
          bindOnce(th_centers[i], 'click', () => function (e) {
            if (editSwitch.value) {
              return
            }
            e.stopPropagation();
            // const classs = this.classList.toString();
            // const jpv = classs.split(' ')[1];
            const jpv = this.dataset.jspath
            jp.value = jpv
            navigator.clipboard.writeText(jpv)
            show("��ʾ���Ѹ��� \n     " + jpv)

            console.log(jp)
            var j_ses = Array.from(document.getElementsByClassName('json-selected'));
            j_ses.forEach(jS => {
              // console.log('=================' + jS.classList);
              jS.classList.remove('json-selected');
              // console.log('=================' + jS.classList);
            });


            const classListElement = this.classList[1];
            // console.log('222222222222' + this.classList);
            var alls = document.getElementsByClassName(classListElement);
            const length1 = alls.length;

            for (let i = 0; i < length1; i++) {
              alls[i].classList.add('json-selected')
            }
          }, 'th_center_click')

          // th_centers[i].onmouseover = function (e) {
          //   window.event ? window.event.cancelBubble = true : e.stopPropagation();
          //
          //   var element = document.elementFromPoint(e.pageX, e.pageY);
          //
          //   const tagName = element.tagName;
          //   // console.log(tagName)
          //   if (tagName === 'TD') {
          //     this.style.backgroundColor = "#8bc34a45"
          //   }
          //
          // }
          // th_centers[i].onmouseout = function (e) {
          //   window.event ? window.event.cancelBubble = true : e.stopPropagation();
          //   this.style.backgroundColor = "";
          // }

        }
      }

      if (editSwitch.value) {

        var right_add_ = document.getElementsByClassName('right_add');
        const r_l = right_add_.length;
        for (let i = 0; i < r_l; i++) {
          bindOnce(right_add_[i], 'click', () => function (e) {
                if (!editSwitch.value) {
                  return
                }
                e.stopPropagation();
                // const classs = this.classList.toString();
                // const jpv = classs.split(' ')[1];
                const curPath = this.dataset.cur_path;

                // �޸�
                JSONPath({
                  path: curPath,
                  json: toRaw(json_o.value),
                  // eslint-disable-next-line no-unused-vars,@typescript-eslint/no-unused-vars
                  callback: (value, type, payload) => {

                    const suggested = makeUniqueKey(value);
                    const key = prompt('New field name?', suggested) || suggested;

                    if (Array.isArray(value)) {
                      value.forEach(item => {
                        item[key] = 123;
                      })
                      // eslint-disable-next-line no-empty
                    } else if (value instanceof Object) {
                      value[key] = 123;
                    }

                  }
                })

                refresh_html.value = true;
                // jsonStr.value = JSON.stringify(toRaw(json_o.value))
                jsonStr.value = prettyJson(JSON.stringify(toRaw(json_o.value)), 4)

              }
          , 'right_add_click')
        }
        var bottom_add_ = document.getElementsByClassName('bottom_add');
        const b_l = bottom_add_.length;
        for (let i = 0; i < b_l; i++) {
          bindOnce(bottom_add_[i], 'click', () => function (e) {
            if (!editSwitch.value) {
              return
            }
            e.stopPropagation();

            const curPath = this.dataset.cur_path;

            const evaluate = JSONPath({
              path: curPath,
              json: toRaw(json_o.value)
            });

            console.log(JSON.stringify(evaluate[0]));

            // �޸�
            JSONPath({
              path: curPath,
              json: toRaw(json_o.value),
              callback: (value, type, payload) => {


                if (curPath === '$' && value instanceof Array) {

                  value.push(value[0])

                } else {
                  const source = payload.parent[payload.parentProperty];
                  const mock = mockJson(source[0], rules)
                  source.push(mock);
                  payload.parent[payload.parentProperty] = source// ֱ��??
                }

              }
            })

            refresh_html.value = true;
            // jsonStr.value = JSON.stringify(toRaw(json_o.value))
            jsonStr.value = prettyJson(JSON.stringify(toRaw(json_o.value)), 4)

          }, 'bottom_add_click')
        }

        batchAddEventListener('click', 'row-overlay', function (e: MouseEvent) {
          if (!editSwitch.value) return;
          e.stopPropagation();

          const rowPath = this.dataset.table_path as string | undefined;
          if (!rowPath) return;

          toggleRowSelection(this as HTMLElement);

          const {parentPath, rowIndex} = parseRowPath(rowPath);
          if (parentPath == null || rowIndex == null) return;

          const insertRow = (insertAfter: boolean) => {
            JSONPath({
              path: parentPath,
              json: json_o.value,
              callback: (value) => {
                if (!Array.isArray(value)) return;
                const template = value[Math.min(rowIndex, Math.max(0, value.length - 1))];
                const blank = cloneStructure(template);
                const pos = insertAfter ? rowIndex + 1 : rowIndex;
                value.splice(Math.min(pos, value.length), 0, blank);
              }
            });
            refresh_html.value = true;
            jsonStr.value = prettyJson(JSON.stringify(toRaw(json_o.value)), 4)
          };

          const deleteRow = () => {
            JSONPath({
              path: parentPath,
              json: json_o.value,
              callback: (value) => {
                if (!Array.isArray(value)) return;
                if (rowIndex < 0 || rowIndex >= value.length) return;
                value.splice(rowIndex, 1);
              }
            });
            refresh_html.value = true;
            jsonStr.value = prettyJson(JSON.stringify(toRaw(json_o.value)), 4)
          };

          showContextMenu(e, [
            {label: '<img src="/add/up.svg" alt="向上添加一行" class="menu-icon">', action: () => insertRow(false)},
            {label: '<img src="/add/down.svg" alt="向下添加一行" class="menu-icon">', action: () => insertRow(true)},
            {label: '<img src="/add/delete.svg" alt="删除这行" class="menu-icon">', action: deleteRow},
          ]);
        })

        const leftBtns = document.getElementsByClassName('left_btn_a_btn');
        const leftBtnsLength = leftBtns.length;
        for (let i = 0; i < leftBtnsLength; i++) {
          bindOnce(leftBtns[i], 'click', () => function (e) {
            if (!editSwitch.value) {
              return
            }
            e.stopPropagation();

            const rowPath = this.dataset.row_path;
            if (!rowPath) return;

            const match = rowPath.match(/\[(\d+)\]\s*$/);
            if (!match) return;
            const rowIndex = Number(match[1]);
            const parentPath = rowPath.replace(/\[\d+\]\s*$/, '');
            const insertAfter = this.dataset.insert_after === 'true';
            const insertPos = insertAfter ? rowIndex + 1 : rowIndex;

            JSONPath({
              path: parentPath,
              json: json_o.value,
              callback: (value) => {
                if (!Array.isArray(value)) return;
                const template = value[Math.min(rowIndex, value.length - 1)];
                const blank = cloneStructure(template);
                value.splice(insertPos, 0, blank);
              }
            });

            refresh_html.value = true;
            jsonStr.value = prettyJson(JSON.stringify(toRaw(json_o.value)), 4)

          }, 'left_btn_insert')
        }

        const topBtns = document.getElementsByClassName('top_btn_a_btn');
        const topBtnsLength = topBtns.length;
        for (let i = 0; i < topBtnsLength; i++) {
          bindOnce(topBtns[i], 'click', () => function (e) {
            if (!editSwitch.value) return;
            e.stopPropagation();

            const colPath = this.dataset.col_path;
            const m = colPath ? colPath.match(/^(.*)\.([^.[]+)(\[\*\])?$/) : null;
            const parentPath = m ? m[1] : '$';
            const fieldKey = m ? m[2] : 'field';
            const arrayPath = parentPath.replace(/\[\*\]$/, '') || '$';
            const insertAfter = this.dataset.insert_after === 'true';

            JSONPath({
              path: arrayPath,
              json: json_o.value,
              callback: (value) => {
                const key = makeUniqueKey(
                    (Array.isArray(value) ? value.find(v => v && typeof v === 'object') : value) ?? {},
                    fieldKey || 'field'
                );

                const insertField = (obj: Record<string, any>): Record<string, any> =>
                    insertKeyWithOrder(obj, key, fieldKey, insertAfter);

                if (Array.isArray(value)) {
                  if (value.length === 0) {
                    value.push(insertField({}));
                    return;
                  }
                  value.forEach((obj, idx) => {
                    if (obj && typeof obj === 'object') {
                      value[idx] = insertField(obj);
                    } else {
                      value[idx] = insertField({});
                    }
                  });
                } else if (value && typeof value === 'object') {
                  const newObj = insertField(value as Record<string, any>);
                  Object.keys(value as Record<string, any>).forEach(k => delete (value as Record<string, any>)[k]);
                  Object.assign(value as Record<string, any>, newObj);
                }
              }
            });

            refresh_html.value = true;
            jsonStr.value = prettyJson(JSON.stringify(toRaw(json_o.value)), 4)

          }, 'top_btn_insert')
        }

        batchAddEventListener('click', 'col-overlay', function (e: MouseEvent) {
          if (!editSwitch.value) return;
          e.stopPropagation();

          const colPath = this.dataset.table_path as string | undefined;
          if (!colPath) return;

          toggleColSelection(this as HTMLElement);

          const parsed = parseColPath(colPath);
          const parentPath = parsed.parentPath ?? '$';
          const fieldKey = parsed.fieldKey ?? 'field';
          const arrayPath = parentPath.replace(/\[\*\]$/, '') || '$';

          const mutate = (insertAfter: boolean) => {
            JSONPath({
              path: arrayPath,
              json: json_o.value,
              callback: (value) => {
                const sample = Array.isArray(value)
                    ? (value.find(v => v && typeof v === 'object') ?? {})
                    : (value && typeof value === 'object' ? value : {});
                const newKey = makeUniqueKey(sample as Record<string, any>, fieldKey);
                const insertField = (obj: Record<string, any>): Record<string, any> =>
                    insertKeyWithOrder(obj, newKey, fieldKey, insertAfter);

                if (Array.isArray(value)) {
                  if (value.length === 0) {
                    value.push(insertField({}));
                    return;
                  }
                  value.forEach((obj, idx) => {
                    value[idx] = insertField(obj && typeof obj === 'object' ? obj : {});
                  });
                } else if (value && typeof value === 'object') {
                  const newObj = insertField(value as Record<string, any>);
                  Object.keys(value as Record<string, any>).forEach(k => delete (value as Record<string, any>)[k]);
                  Object.assign(value as Record<string, any>, newObj);
                }
              }
            });
            refresh_html.value = true;
            jsonStr.value = prettyJson(JSON.stringify(toRaw(json_o.value)), 4)
          };

          const deleteCol = () => {
            JSONPath({
              path: arrayPath,
              json: json_o.value,
              callback: (value) => {
                if (Array.isArray(value)) {
                  value.forEach((obj, idx) => {
                    if (obj && typeof obj === 'object') {
                      delete (obj as Record<string, any>)[fieldKey];
                    } else {
                      value[idx] = {};
                    }
                  });
                } else if (value && typeof value === 'object') {
                  delete (value as Record<string, any>)[fieldKey];
                }
              }
            });
            refresh_html.value = true;
            jsonStr.value = prettyJson(JSON.stringify(toRaw(json_o.value)), 4)
          };

          showContextMenu(e, [
            {label: '<img src="/add/left.svg" alt="向左添加一列" class="menu-icon">', action: () => mutate(false)},
            {label: '<img src="/add/right.svg" alt="向右添加一列" class="menu-icon">', action: () => mutate(true)},
            {label: '<img src="/add/delete.svg" alt="删除该列" class="menu-icon">', action: deleteCol},
          ]);
        })
        const leafs = document.getElementsByClassName('td_content_leaf');
        const leafs_length = leafs.length;
        for (let i = 0; i < leafs_length; i++) {
          const leaf = leafs[i] as HTMLDivElement;
          const pathKey = leaf.dataset.path ?? `leaf_${i}`;
          bindEditEndOnce(
              leaf,
              pathKey,
              // eslint-disable-next-line no-unused-vars
              payload1 => {
                const textFromCell = getTextFromCell(payload1.el);
                console.log(textFromCell)
                // console.log(JSON.stringify(toRaw(payload)));
                const tablePath = payload1.el.dataset.path;

                // ע�⣺������ reactive ??json_o.value����??toRaw
                JSONPath({
                  path: tablePath,
                  json: json_o.value,
                  callback: (value, type, payload) => {

                    const parent = payload.parent;
                    const key = payload.parentProperty;

                    parent[key] = textFromCell
                  }
                });

                refresh_html.value = false
                jsonStr.value = prettyJson(JSON.stringify(toRaw(json_o.value)), 4)

              }
          )
        }

        const headers = document.getElementsByClassName('th_center');

        const headers_length = headers.length;
        for (let i = 0; i < headers_length; i++) {
          const header = headers[i] as HTMLDivElement;
          const headerPath = header.dataset.path ?? `header_${i}`;
          bindEditEndOnce(
              header,
              headerPath,
              // eslint-disable-next-line no-unused-vars
              payload1 => {
                const afterText = getTextFromCell(payload1.el);
                // console.log(afterText)
                // console.log(JSON.stringify(toRaw(payload)));
                let tablePath: string | undefined = payload1.el.dataset.path;

                const beforeText = payload1.beforeText;
                if (afterText === beforeText) {
                  return
                }

                console.log(afterText)
                console.log(beforeText)

                // ע�⣺������ reactive ??json_o.value����??toRaw

                const cur_path = replaceAfterLastDot(tablePath === undefined ? '' : tablePath, beforeText);
                JSONPath({
                  path: cur_path,
                  json: json_o.value,
                  // eslint-disable-next-line @typescript-eslint/no-unused-vars
                  callback: (value, type, payload) => {

                    const parent = payload.parent;
                    // console.log(payload1)

                    if (Array.isArray(parent)) {
                      parent.forEach(k => {
                        const beforeValue = k[beforeText];
                        k[afterText] = beforeValue;

                        delete k[beforeText];
                      });

                    } else if (parent && typeof parent === 'object') {
                      const beforeValue = parent[beforeText];
                      parent[afterText] = beforeValue;

                      delete parent[beforeText];
                    }

                  }
                });

                refresh_html.value = false
                jsonStr.value = prettyJson(JSON.stringify(toRaw(json_o.value)), 4)

              }
          )
        }


      }
    }
)

/** �����һ�����������滻??replacement?? * ����foo.bar.baz -> foo.bar.NEW
 */
function replaceAfterLastDot(s: string, replacement: string): string {
  const i = s.lastIndexOf('.');
  if (i === -1) return s;          // û�е㣬ԭ������
  if (i === s.length - 1) return s + replacement; // ĩβ����??  return s.slice(0, i + 1) + replacement;
}

/**
 * ??JSON �ַ�����ʽ��Ϊ�ɶ���?? * @param jsonText ԭʼ JSON �ַ�?? * @param indent �����ո�����Ĭ�� 2?? * @param eol ��β��Ĭ??'
'����??'\r
' ���� Windows?? */
function prettyJson(
    jsonText: string,
    indent: number = 2,
    eol: '\n' | '\r\n' = '\n'
): string {
  // 1) ��������֤ JSON �Ϸ��ԣ�
  const obj = JSON.parse(jsonText);

  // 2) ���л� + ����
  const pretty = JSON.stringify(obj, null, indent);

  // 3) ͳһ��β
  return pretty.replace(/\r?\n/g, eol);
}

// ���ߣ�Ϊ��������һ��Ψһ key
// eslint-disable-next-line no-unused-vars
function makeUniqueKey(obj: Record<string, any>, base = 'field') {
  let key = base;
  let i = 1;
  while (Object.prototype.hasOwnProperty.call(obj, key)) {
    key = `${base}_${i++}`;
  }
  return key;
}

// Avoid duplicate bindings on each onUpdated; one element/one handler
function bindOnce(
    el: Element,
    event: string,
    handlerFactory: () => (ev: Event) => void,
    key?: string
): void {
  const flag = `__bound_${key ?? event}`;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const anyEl = el as any;
  if (anyEl[flag]) return;
  const handler = handlerFactory();
  el.addEventListener(event, handler);
  anyEl[flag] = true;
}

// Avoid re-binding contenteditable listeners repeatedly
function bindEditEndOnce(
    el: HTMLDivElement,
    key: string,
    onEnd: Parameters<typeof onContentEditEnd>[1]
): void {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const anyEl = el as any;
  const flag = `__edit_bound_${key}`;
  if (anyEl[flag]) return;
  anyEl[flag] = true;
  onContentEditEnd(el, onEnd);
}

function cloneStructure(template: unknown): any {
  if (Array.isArray(template)) {
    return [];
  }
  if (template && typeof template === 'object') {
    const out: Record<string, any> = {};
    Object.entries(template as Record<string, any>).forEach(([k, v]) => {
      if (Array.isArray(v)) out[k] = [];
      else out[k] = null;
    });
    return out;
  }
  return {};
}

function insertKeyWithOrder(
    obj: Record<string, any>,
    newKey: string,
    targetKey: string | undefined,
    insertAfter: boolean
): Record<string, any> {
  const out: Record<string, any> = {};
  let inserted = false;
  for (const [k, v] of Object.entries(obj)) {
    if (targetKey && k === targetKey && !insertAfter && !inserted) {
      out[newKey] = null;
      inserted = true;
    }
    out[k] = v;
    if (targetKey && k === targetKey && insertAfter && !inserted) {
      out[newKey] = null;
      inserted = true;
    }
  }
  if (!inserted) out[newKey] = null;
  return out;
}

function parseRowPath(path: string): {parentPath: string | null; rowIndex: number | null} {
  const m = path.match(/^(.*)\[(\d+)\]\s*$/);
  if (!m) return {parentPath: null, rowIndex: null};
  return {parentPath: m[1], rowIndex: Number(m[2])};
}

function parseColPath(path: string): {parentPath: string | null; fieldKey: string | null} {
  if (!path) return {parentPath: null, fieldKey: null};

  const m = path.match(/^(.*)\.([^.[]+)(\[\*\])?$/);
  if (m) return {parentPath: m[1], fieldKey: m[2]};

  // 仅数组路径（如 "$[*]"）或根路径 "$"
  const arrOnly = path.match(/^(.*)\[\*\]$/);
  if (arrOnly) return {parentPath: arrOnly[1] || '$', fieldKey: 'field'};
  if (path === '$') return {parentPath: '$', fieldKey: 'field'};

  // 兜底
  return {parentPath: path, fieldKey: 'field'};
}

function toggleRowSelection(target: HTMLElement): void {
  const table = target.closest('.table-container')?.querySelector('table');
  if (!table) return;

  // 清除所有行的选中状态
  Array.from(table.rows).forEach(r => {
    r.classList.remove('row-highlight');
    r.classList.remove('row-selected');
  });

  const idx = Number(target.dataset.row_index);
  if (!Number.isFinite(idx)) return;
  const row = table.rows.item(idx);
  if (!row) return;

  // 选中当前行
  row.classList.add('row-highlight');
  row.classList.add('row-selected');

  const rowPath = target.dataset.table_path || '';
  const parsed = parseRowPath(rowPath);
  if (parsed.parentPath != null && parsed.rowIndex != null) {
    selectedRowMeta = {parentPath: parsed.parentPath, rowIndex: parsed.rowIndex};
  }
}

function toggleColSelection(target: HTMLElement): void {
  const table = target.closest('.table-container')?.querySelector('table');
  if (!table) return;
  const idx = Number(target.dataset.col_index);
  if (!Number.isFinite(idx)) return;

  // 清除所有列的高亮/选中
  Array.from(table.rows).forEach(r => {
    Array.from(r.cells).forEach(c => {
      c.classList.remove('col-highlight');
      c.classList.remove('col-selected');
    });
  });

  // 选中当前列
  Array.from(table.rows).forEach(r => {
    const cell = r.cells.item(idx);
    if (cell) {
      cell.classList.add('col-highlight');
      cell.classList.add('col-selected');
    }
  });

  const colPath = target.dataset.table_path || '';
  const parsed = parseColPath(colPath);
  if (parsed.parentPath && parsed.fieldKey) {
    const arrayPath = parsed.parentPath.replace(/\[\*\]$/, '') || '$';
    selectedColMeta = {arrayPath, fieldKey: parsed.fieldKey};
  }
}

function clearRowSelection(): void {
  document.querySelectorAll('.row-highlight').forEach(el => el.classList.remove('row-highlight'));
  document.querySelectorAll('.row-selected').forEach(el => el.classList.remove('row-selected'));
  selectedRowMeta = null;
}

function clearColSelection(): void {
  document.querySelectorAll('.col-highlight').forEach(el => el.classList.remove('col-highlight'));
  document.querySelectorAll('.col-selected').forEach(el => el.classList.remove('col-selected'));
  selectedColMeta = null;
}

function setupClearSelectionListeners(): void {
  const handler = (ev: Event) => {
    const target = ev.target as HTMLElement | null;
    if (!target) return;
    if (!target.closest('.row-overlay')) {
      clearRowSelection();
    }
    if (!target.closest('.col-overlay')) {
      clearColSelection();
    }
  };
  document.addEventListener('click', handler, true);
  onBeforeUnmount(() => document.removeEventListener('click', handler, true));
}

function parseCellPath(path: string): {arrayPath: string | null; rowIndex: number | null; fieldKey: string | null} {
  const m = path.match(/^(.*)\[(\d+)\]\.([^.[]+)$/);
  if (m) return {arrayPath: m[1], rowIndex: Number(m[2]), fieldKey: m[3]};
  const m2 = path.match(/^(.*)\.([^.[]+)$/);
  if (m2) return {arrayPath: m2[1], rowIndex: null, fieldKey: m2[2]};
  return {arrayPath: null, rowIndex: null, fieldKey: null};
}

function cloneDeep<T>(v: T): T {
  return JSON.parse(JSON.stringify(v));
}

function setupCopyPasteHotkeys(): void {
  const handler = (e: KeyboardEvent) => {
    if (!editSwitch.value) return;
    const key = e.key.toLowerCase();
    const target = e.target as HTMLElement | null;
    const path = target?.dataset?.jspath || target?.closest('[data-jspath]')?.getAttribute('data-jspath');

    if ((e.ctrlKey || e.metaKey) && key === 'c') {
      if (selectedColMeta) {
        JSONPath({
          path: selectedColMeta.arrayPath,
          json: json_o.value,
          callback: (value) => {
            if (!Array.isArray(value)) return;
            copiedCol = {
              values: value.map(v => (v && typeof v === 'object') ? cloneDeep((v as Record<string, any>)[selectedColMeta!.fieldKey]) : null),
              fieldKey: selectedColMeta.fieldKey
            };
          }
        });
        e.preventDefault();
        return;
      }
      if (selectedRowMeta) {
        const rowPath = `${selectedRowMeta.parentPath}[${selectedRowMeta.rowIndex}]`;
        JSONPath({
          path: rowPath,
          json: json_o.value,
          callback: (value) => {
            copiedRow = {value: cloneDeep(value)};
          }
        });
        e.preventDefault();
      }
    }

    if ((e.ctrlKey || e.metaKey) && key === 'v') {
      if (copiedCol && path) {
        const info = parseCellPath(path);
        const arrayPath = info.arrayPath;
        const fieldKey = info.fieldKey || copiedCol.fieldKey;
        if (!arrayPath || !fieldKey) return;
        JSONPath({
          path: arrayPath,
          json: json_o.value,
          callback: (value) => {
            if (!Array.isArray(value)) return;
            value.forEach((row, idx) => {
              if (!row || typeof row !== 'object') value[idx] = {};
              (value[idx] as Record<string, any>)[fieldKey] = cloneDeep(copiedCol!.values[idx] ?? null);
            });
          }
        });
        refresh_html.value = true;
        jsonStr.value = prettyJson(JSON.stringify(toRaw(json_o.value)), 4);
        e.preventDefault();
        return;
      }
      if (copiedRow && path) {
        const info = parseCellPath(path);
        const arrayPath = info.arrayPath;
        const rowIndex = info.rowIndex;
        if (!arrayPath || rowIndex == null) return;
        JSONPath({
          path: arrayPath,
          json: json_o.value,
          callback: (value) => {
            if (!Array.isArray(value)) return;
            value[rowIndex] = cloneDeep(copiedRow!.value);
          }
        });
        refresh_html.value = true;
        jsonStr.value = prettyJson(JSON.stringify(toRaw(json_o.value)), 4);
        e.preventDefault();
      }
    }
  };
  document.addEventListener('keydown', handler, true);
  onBeforeUnmount(() => document.removeEventListener('keydown', handler, true));
}
type MenuItem = {label: string; action: () => void};

function showContextMenu(e: MouseEvent, items: MenuItem[]): void {
  removeContextMenu();
  const menu = document.createElement('div');
  menu.className = 'context-menu';

  items.forEach(item => {
    const btn = document.createElement('button');
    if (item.label.trim().startsWith('<')) {
      btn.innerHTML = item.label;
    } else {
      btn.textContent = item.label;
    }
    btn.addEventListener('click', (ev) => {
      ev.stopPropagation();
      item.action();
      removeContextMenu();
    });
    menu.appendChild(btn);
  });

  document.body.appendChild(menu);

  // ���ȷ��ڱ����ࣺ��������пռ������࣬������Ҳ࣬�������ڱ�����·�Χ��
  const rect = menu.getBoundingClientRect();
  const margin = 12;
  const targetEl = e.currentTarget as HTMLElement | null;
  const targetRect = targetEl?.getBoundingClientRect(); // eslint-disable-line @typescript-eslint/no-unused-vars
  const tableEl = targetEl?.closest('.table-container') as HTMLElement | null;
  const tableRect = tableEl?.getBoundingClientRect();

  const isColOverlay = targetEl?.classList.contains('col-overlay');

  let leftCandidate = e.pageX + margin;
  let topCandidate = e.pageY - rect.height / 2;

  if (isColOverlay && targetRect) {
    // �в˵���������ʾ�ڵ�������Ϸ�
    leftCandidate = targetRect.left + window.scrollX + (targetRect.width - rect.width) / 2;
    topCandidate = targetRect.top + window.scrollY - rect.height - margin;
    if (topCandidate < window.scrollY + margin) {
      // ����Ϸ��������ٷŵ��·�
      topCandidate = targetRect.bottom + window.scrollY + margin;
    }
    // ���ֲ������ӿ�
    leftCandidate = Math.max(window.scrollX + margin, Math.min(leftCandidate, window.scrollX + window.innerWidth - rect.width - margin));
    topCandidate = Math.max(window.scrollY + margin, Math.min(topCandidate, window.scrollY + window.innerHeight - rect.height - margin));
  } else if (tableRect) {
    const tableLeft = tableRect.left + window.scrollX;
    const tableRight = tableRect.right + window.scrollX;
    const tableTop = tableRect.top + window.scrollY;
    const tableBottom = tableRect.bottom + window.scrollY;

    if (tableLeft - rect.width - margin > window.scrollX + margin) {
      leftCandidate = tableLeft - rect.width - margin;
    } else {
      leftCandidate = tableRight + margin;
    }

    // ��ֱλ�������ڱ��Χ��
    topCandidate = Math.min(Math.max(topCandidate, tableTop), tableBottom - rect.height);
  } else {
    // �ޱ����Ϣ���˻�Ϊ�ӿ�����
    leftCandidate = Math.max(window.scrollX + margin, e.pageX - rect.width - margin);
    if (leftCandidate < window.scrollX + margin) leftCandidate = e.pageX + margin;
    const maxTop = window.scrollY + window.innerHeight - rect.height - margin;
    topCandidate = Math.min(Math.max(topCandidate, window.scrollY + margin), maxTop);
  }

  menu.style.left = `${leftCandidate}px`;
  menu.style.top = `${topCandidate}px`;

  const close = () => {
    removeContextMenu();
    document.removeEventListener('click', close, true);
  };
  document.addEventListener('click', close, true);
}

function removeContextMenu(): void {
  const old = document.querySelector('.context-menu');
  if (old) old.remove();
}

function batchAddEventListener(event: string, className: string, listener): void {
  var bottom_add_ = document.getElementsByClassName(className);
  const b_l = bottom_add_.length;
  for (let i = 0; i < b_l; i++) {
    bindOnce(bottom_add_[i], event, () => listener, `${className}_${event}`);
  }

}

function setAddButtonsVisible(visible: boolean): void {
  const display = visible ? '' : 'none';
  ['right_add', 'bottom_add', 'cooner', 'ever_layer'].forEach(cls => {
    Array.from(document.getElementsByClassName(cls)).forEach(el => {
      (el as HTMLElement).style.display = display;
    });
  });
}

// ���� contenteditable���Ǳ༭ģʽ����
function setEditableVisible(enabled: boolean): void {
  toggleEditableByClass('td_content_leaf', enabled);
  toggleEditableByClass('th_center', enabled);
}

function toggleEditableByClass(cls: string, enabled: boolean): void {
  const value = enabled ? 'true' : 'false';
  Array.from(document.getElementsByClassName(cls)).forEach(el => {
    (el as HTMLElement).setAttribute('contenteditable', value);
  });
}

// 点击单元格时，聚焦其直接子元素（td_content/td_content_leaf）
function setupCellClickToFocus(): void {
  const cells = Array.from(document.getElementsByClassName('tds_content'));
  cells.forEach(cell => {
    bindOnce(cell, 'click', () => function (ev: Event) {
      if (!editSwitch.value) return;
      const el = cell as HTMLElement;
      const child = Array.from(el.children).find(
          c => c.classList.contains('td_content_leaf') || c.classList.contains('td_content')
      ) as HTMLElement | undefined;
      if (child) {
        child.focus();
        const isClickOnCell = ev.target === cell;
        if (isClickOnCell || !child.textContent || child.textContent.length === 0) {
          placeCaretAtEnd(child);
        }
        ev.stopPropagation();
      }
    }, 'tds_content_focus');
  });
}

function placeCaretAtEnd(el: HTMLElement): void {
  const selection = window.getSelection();
  if (!selection) return;
  const range = document.createRange();
  range.selectNodeContents(el);
  range.collapse(false);
  selection.removeAllRanges();
  selection.addRange(range);
}

function formatJsonStr(): void {
  try {
    jsonStr.value = prettyJson(jsonStr.value, 2);
  } catch {
    // ignore invalid json
  }
}

function applyTheme(theme: string): void {
  const body = document.body;
  themeOptions.forEach(t => body.classList.remove(t.className));
  const cfg = getThemeConfig(theme);
  body.classList.add(getThemeClass(theme));
  const palette = cfg.palette;
  const rootStyle = document.documentElement.style;
  Object.entries(palette).forEach(([k, v]) => {
    const cssVarName = '--' + k.replace(/[A-Z]/g, (m) => '-' + m.toLowerCase());
    rootStyle.setProperty(cssVarName, v);
  });
}

// eslint-disable-next-line no-unused-vars
// function removeAt(arr, idx) {
//   if (idx < 0) idx += arr.length; // ���±�֧??//   if (idx < 0 || idx >= arr.length) return arr.slice(); // Խ�磺���ؿ�����ԭ��??//   return [...arr.slice(0, idx), ...arr.slice(idx + 1)];
// }
//
// // eslint-disable-next-line no-unused-vars
// function getLastBracketContent(str) {
//   const re = /\[([^\]]+)\](?!.*\[)/; // ƥ�����һ??[...]
//   const m = str.match(re);
//   return m ? m[1] : null;
// }

function buildOverlayLocal() {
  var ever_layer_ = document.getElementsByClassName('ever_layer');
  const ever_layer_l = ever_layer_.length;
  for (let i = 0; i < ever_layer_l; i++) {
    const iEverLayer = ever_layer_[i];

    const table = iEverLayer.parentElement?.querySelector('.table-container table');
    buildOverlay(table, iEverLayer);
  }
}

function copyValue(jsonPath, json) {
  const value = JSONPath({
    path: jsonPath,
    json: json
  });

  navigator.clipboard.writeText(JSON.stringify(value));
  show("��ʾ���Ѹ��� \n     " + value)


}

// �ݹ� mock ����
function mockJson(value: unknown, rules: BaseMockRules): any {
  if (Array.isArray(value)) {
    return value.map(item => mockJson(item, rules))
  } else if (typeof value === "object" && value !== null) {
    const result: any = {}
    for (const [k, v] of Object.entries(value)) {
      result[k] = mockJson(v, rules)
    }
    return result
  } else if (typeof value === "string") {
    return ''
    // return rules.string ? rules.string() : value
  } else if (typeof value === "number") {
    return rules.number ? rules.number() : value
  } else if (typeof value === "boolean") {
    return rules.boolean ? rules.boolean() : value
  } else if (value === null) {
    return rules.null ? rules.null() : null
  }
  return value
}
</script>
<style type="text/css">
@import url(../table.css);
@import url(../overlay.css);
</style>
