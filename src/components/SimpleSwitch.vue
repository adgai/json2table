<script setup lang="ts">
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const props = defineProps<{ modelValue: boolean }>()
const emit = defineEmits<{ (e:'update:modelValue', v:boolean): void }>()

function onChange(e: Event) {
  emit('update:modelValue', (e.target as HTMLInputElement).checked)
}
function setMode(v: boolean) {
  emit('update:modelValue', v)
}
</script>

<template>
  <div class="mode-wrap" role="group" aria-label="模式切换">
    <!-- 左侧：查看模式（false） -->
    <button
        type="button"
        class="label"
        :class="{ active: !modelValue }"
        @click="setMode(false)"
        aria-pressed="!modelValue"
    >
      查看模式
    </button>

    <!-- 中间：原有开关 -->
    <label class="switch">
      <input
          type="checkbox"
          :checked="modelValue"
          @change="onChange"
          role="switch"
          :aria-checked="modelValue ? 'true' : 'false'"
          aria-label="切换查看/编辑"
      />
      <span class="slider" />
    </label>

    <!-- 右侧：编辑模式（true） -->
    <button
        type="button"
        class="label"
        :class="{ active: modelValue }"
        @click="setMode(true)"
        aria-pressed="modelValue"
    >
      编辑模式
    </button>
  </div>
</template>

<style scoped>
.mode-wrap {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
}

/* 左右文字标签 */
.label {
  border: none;
  background: transparent;
  padding: 4px 8px;
  color: #64748b; /* slate-500 */
  cursor: pointer;
  border-radius: 8px;
  transition: background .15s, color .15s, font-weight .15s;
}
.label:hover { background: #f1f5f9; }       /* slate-100 */
.label.active { color: #16a34a; font-weight: 600; } /* green-600 */

/* 开关本体（沿用你的样式） */
.switch {
  position: relative;
  display: inline-block;
  width: 42px;
  height: 24px;
}
.switch input {
  opacity: 0; width: 0; height: 0; position: absolute;
}
.slider {
  position: absolute; inset: 0;
  background: #cbd5e1; border-radius: 999px;
  transition: .2s;
}
.slider::before {
  content: ""; position: absolute; left: 3px; top: 3px;
  width: 18px; height: 18px; border-radius: 50%;
  background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,.18);
  transition: .2s;
}
input:checked + .slider { background: #22c55e; }
input:checked + .slider::before { transform: translateX(18px); }
input:focus-visible + .slider { box-shadow: 0 0 0 3px rgba(59,130,246,.45); }

/* 键盘聚焦可见性（给两侧按钮） */
.label:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px rgba(59,130,246,.45);
}
</style>
