<template>
  <div>
    <div class="header">
      <div class="header-controls">
        <div class="mode_toggle">
          <SimpleSwitch v-model="editSwitch"></SimpleSwitch>
        </div>
        <div class="theme_picker">
          <label for="theme-select">主题：</label>
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
import {onMounted, onUpdated, ref, toRaw, watch} from 'vue'
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

// 可以直接侦听一个 ref
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
  applyTheme(themeName.value)
  formatJsonStr()

})
onUpdated(() => {

      setAddButtonsVisible(editSwitch.value)
      setEditableVisible(editSwitch.value)

      if (editSwitch.value) {
        buildOverlayLocal()
      }

      if (!editSwitch.value) {

        var comments = Array.from(document.getElementsByClassName('tds_content'));
        var numComments = comments.length;
        for (var i = 0; i < numComments; i++) {

          bindOnce(comments[i], 'click', () => function (e) {
            // console.log(1332313);
            if (editSwitch.value) {
              return
            }
            // 使用 e.stopPropagation() 来阻止事件冒泡
            e.stopPropagation();

            // 使用 `this` 获取被点击的元素
            // console.log(this);

            // 获取被点击元素的类名
            // const classListElement1 = this.classList[0];
            const classListElement1 = this.dataset.jspath;

            jp_v.value = classListElement1;
            show("提示：已复制 \n     " + classListElement1)
            navigator.clipboard.writeText(classListElement1)

            // 这里可以添加其他代码
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
            show("提示：已复制 \n     " + jpv)

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

                // 修改
                JSONPath({
                  path: curPath,
                  json: toRaw(json_o.value),
                  // eslint-disable-next-line no-unused-vars,@typescript-eslint/no-unused-vars
                  callback: (value, type, payload) => {

                    const suggested = makeUniqueKey(value);
                    const key = prompt('新字段名：', suggested) || suggested;

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

            // 修改
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
                  payload.parent[payload.parentProperty] = source// 直接改

                }

              }
            })

            refresh_html.value = true;
            // jsonStr.value = JSON.stringify(toRaw(json_o.value))
            jsonStr.value = prettyJson(JSON.stringify(toRaw(json_o.value)), 4)

          }, 'bottom_add_click')
        }

        batchAddEventListener('click', 'row-overlay', function (e) {
          if (!editSwitch.value) {
            return
          }
          e.stopPropagation();

          const tablePath = this.dataset.table_path;
          if (!tablePath || /^(null|undefined)$/i.test(tablePath)) return;

          console.log(tablePath);

          // 注意：这里用 reactive 的 json_o.value，别用 toRaw
          JSONPath({
            path: tablePath,
            json: json_o.value,
            callback: (value, type, payload) => {

              // 命中根：要单独处理
              if (tablePath === '$') {
                if (Array.isArray(json_o.value)) {
                  // 清空根数组（两种都行）
                  json_o.value.length = 0;
                  // 或者：json_o.value = []
                } else if (json_o.value && typeof json_o.value === 'object') {
                  // 清空根对象
                  Object.keys(json_o.value).forEach(k => delete json_o.value[k]);
                } else {
                  // 其他类型，按需处理
                  json_o.value = null as any;
                }
                return;
              }

              const parent = payload.parent;
              const key = payload.parentProperty;

              if (Array.isArray(parent)) {
                // 删除当前命中的这个元素
                parent.splice(Number(key), 1);
              } else if (parent && typeof parent === 'object') {
                // 删除当前命中的这个字段
                delete parent[key];
              }
            }
          });

          refresh_html.value = true;
          // jsonStr.value = JSON.stringify(toRaw(json_o.value))
          jsonStr.value = prettyJson(JSON.stringify(toRaw(json_o.value)), 4)

        })

        batchAddEventListener('click', 'col-overlay', function (e) {
          e.stopPropagation();

          const tablePath = this.dataset.table_path;
          if (!tablePath || /^(null|undefined)$/i.test(tablePath)) return;

          console.log(tablePath);

          // 注意：这里用 reactive 的 json_o.value，别用 toRaw
          JSONPath({
            path: tablePath,
            json: json_o.value,
            callback: (value, type, payload) => {

              const parent = payload.parent;
              const key = payload.parentProperty;

              if (Array.isArray(parent)) {
                // 删除当前命中的这个元素
                parent.splice(Number(key), 1);
              } else if (parent && typeof parent === 'object') {
                // 删除当前命中的这个字段
                delete parent[key];
              }
            }
          });

          refresh_html.value = true;
          // jsonStr.value = JSON.stringify(toRaw(json_o.value))
          jsonStr.value = prettyJson(JSON.stringify(toRaw(json_o.value)), 4)

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

                // 注意：这里用 reactive 的 json_o.value，别用 toRaw
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

                // 注意：这里用 reactive 的 json_o.value，别用 toRaw

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
                        const before_value = k[beforeText];
                        k[afterText] = before_value;

                        delete k[beforeText];
                      });

                    } else if (parent && typeof parent === 'object') {
                      // 删除当前命中的这个字段
                      const before_value = parent[beforeText];
                      parent[afterText] = before_value;

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

/** 将最后一个点后的内容替换为 replacement。
 * 例：foo.bar.baz -> foo.bar.NEW
 */
function replaceAfterLastDot(s: string, replacement: string): string {
  const i = s.lastIndexOf('.');
  if (i === -1) return s;          // 没有点，原样返回
  if (i === s.length - 1) return s + replacement; // 末尾就是点
  return s.slice(0, i + 1) + replacement;
}

/**
 * 把 JSON 字符串格式化为可读文本
 * @param jsonText 原始 JSON 字符串
 * @param indent 缩进空格数（默认 2）
 * @param eol 行尾（默认 '\n'，可传 '\r\n' 适配 Windows）
 */
function prettyJson(
    jsonText: string,
    indent: number = 2,
    eol: '\n' | '\r\n' = '\n'
): string {
  // 1) 解析（验证 JSON 合法性）
  const obj = JSON.parse(jsonText);

  // 2) 序列化 + 缩进
  const pretty = JSON.stringify(obj, null, indent);

  // 3) 统一行尾
  return pretty.replace(/\n/g, eol);
}

// 工具：为对象生成一个唯一 key
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

// 控制 contenteditable，非编辑模式禁用
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
//   if (idx < 0) idx += arr.length; // 负下标支持
//   if (idx < 0 || idx >= arr.length) return arr.slice(); // 越界：返回拷贝或原数组
//   return [...arr.slice(0, idx), ...arr.slice(idx + 1)];
// }
//
// // eslint-disable-next-line no-unused-vars
// function getLastBracketContent(str) {
//   const re = /\[([^\]]+)\](?!.*\[)/; // 匹配最后一个 [...]
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
  show("提示：已复制 \n     " + value)


}

// 递归 mock 函数
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
    return rules.string ? rules.string() : value
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
