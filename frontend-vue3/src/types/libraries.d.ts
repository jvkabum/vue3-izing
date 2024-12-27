// Vue Emoji Picker
declare module 'v-emoji-picker' {
  import { DefineComponent } from 'vue'

  export const VEmojiPicker: DefineComponent<{
    showSearch?: boolean
    emojisByRow?: number
    labelSearch?: string
    lang?: string
    onSelect?: (emoji: { data: string }) => void
  }>
}

// Mic Recorder
declare module 'mic-recorder-to-mp3' {
  export default class MicRecorder {
    constructor(options?: { bitRate?: number })
    start(): Promise<void>
    stop(): {
      getMp3(): Promise<[AudioBuffer, Blob]>
    }
  }
}

// Vue Global Components
declare module '@vue/runtime-core' {
  export interface GlobalComponents {
    QLayout: typeof import('quasar')['QLayout']
    QPageContainer: typeof import('quasar')['QPageContainer']
    QPage: typeof import('quasar')['QPage']
    QBtn: typeof import('quasar')['QBtn']
    QIcon: typeof import('quasar')['QIcon']
    QList: typeof import('quasar')['QList']
    QItem: typeof import('quasar')['QItem']
    QItemSection: typeof import('quasar')['QItemSection']
    QItemLabel: typeof import('quasar')['QItemLabel']
    QInput: typeof import('quasar')['QInput']
    QFile: typeof import('quasar')['QFile']
    QMenu: typeof import('quasar')['QMenu']
    QDialog: typeof import('quasar')['QDialog']
    QCard: typeof import('quasar')['QCard']
    QCardSection: typeof import('quasar')['QCardSection']
    QCardActions: typeof import('quasar')['QCardActions']
    QImg: typeof import('quasar')['QImg']
    QSkeleton: typeof import('quasar')['QSkeleton']
    QTooltip: typeof import('quasar')['QTooltip']
    QToggle: typeof import('quasar')['QToggle']
    QSpace: typeof import('quasar')['QSpace']
    QSeparator: typeof import('quasar')['QSeparator']
    QSpinner: typeof import('quasar')['QSpinner']
    QBadge: typeof import('quasar')['QBadge']
    QChip: typeof import('quasar')['QChip']
    QFab: typeof import('quasar')['QFab']
    QFabAction: typeof import('quasar')['QFabAction']
    QPageSticky: typeof import('quasar')['QPageSticky']
    QScrollArea: typeof import('quasar')['QScrollArea']
    QToolbar: typeof import('quasar')['QToolbar']
    QToolbarTitle: typeof import('quasar')['QToolbarTitle']
    QHeader: typeof import('quasar')['QHeader']
    QFooter: typeof import('quasar')['QFooter']
    QDrawer: typeof import('quasar')['QDrawer']
    QTabs: typeof import('quasar')['QTabs']
    QTab: typeof import('quasar')['QTab']
    QTabPanels: typeof import('quasar')['QTabPanels']
    QTabPanel: typeof import('quasar')['QTabPanel']
    QSelect: typeof import('quasar')['QSelect']
    QOptionGroup: typeof import('quasar')['QOptionGroup']
    QCheckbox: typeof import('quasar')['QCheckbox']
    QRadio: typeof import('quasar')['QRadio']
    QBtnDropdown: typeof import('quasar')['QBtnDropdown']
    QBtnGroup: typeof import('quasar')['QBtnGroup']
    QAvatar: typeof import('quasar')['QAvatar']
    QInnerLoading: typeof import('quasar')['QInnerLoading']
    QSpinnerDots: typeof import('quasar')['QSpinnerDots']
    QAjaxBar: typeof import('quasar')['QAjaxBar']
    QUploader: typeof import('quasar')['QUploader']
    QUploaderAddTrigger: typeof import('quasar')['QUploaderAddTrigger']
    QDatetime: typeof import('quasar')['QDatetime']
  }
}

// Vue Composition API
declare module 'vue' {
  export const ref: <T>(value: T) => Ref<T>
  export const computed: typeof import('@vue/runtime-core')['computed']
  export const onMounted: (fn: () => void) => void
  export const onUnmounted: (fn: () => void) => void
  export const watch: typeof import('@vue/runtime-core')['watch']
  export const defineProps: <T>() => T
  export const defineEmits: <T>() => T
  export const withDefaults: <T, U>(props: T, defaults: U) => T & U
}

// Quasar
declare module 'quasar' {
  export const uid: () => string
  export const useQuasar: () => typeof import('quasar')['Quasar']
  export const Notify: typeof import('quasar')['Notify']
  export const Dialog: typeof import('quasar')['Dialog']
  export const Loading: typeof import('quasar')['Loading']
  export const Dark: typeof import('quasar')['Dark']
  export const Screen: typeof import('quasar')['Screen']
}
