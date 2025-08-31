// src/composables/useToast.ts
import {h, createApp, defineComponent, reactive, Transition} from "vue"

interface ToastMessage {
    msg: string
    duration: number
}

const state = reactive<{ queue: ToastMessage[] }>({
    queue: []
})

let timer: ReturnType<typeof setTimeout> | null = null

export function useToast() {
    const show = (msg: string, duration: number = 2000): void => {
        state.queue.push({ msg, duration })
        if (state.queue.length === 1) {
            processQueue()
        }
    }

    const processQueue = (): void => {
        if (state.queue.length === 0) return

        const current = state.queue[0]
        if (timer) clearTimeout(timer)

        timer = setTimeout(() => {
            state.queue.shift()
            processQueue()
        }, current.duration)
    }

    return { show }
}

// 内部全局 Toast 组件
const ToastComponent = defineComponent({
    name: "ToastComponent",
    setup() {
        return () => {
            if (state.queue.length === 0) return null

            const toast = state.queue[0]

            return h(
                Transition,
                {
                    name: "fade", // 对应 CSS 过渡
                    appear: true,
                },
                {
                    default: () =>
                        h(
                            "div",
                            {
                                key: toast.msg, // 让 Transition 能区分不同的 toast
                                class:
                                    "copy_value_tip fixed top-5 left-1/2 transform -translate-x-1/2 bg-black text-white px-4 py-2 rounded shadow-lg z-50 transition-opacity duration-500"
                            },
                            toast.msg
                        )
                }
            )
        }
    }
})// 挂载一次

let mounted = false
export function installToast(): void {
    if (mounted) return
    const div = document.createElement("div")
    document.body.appendChild(div)
    createApp(ToastComponent).mount(div)
    mounted = true
}
