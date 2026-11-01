import type { GuiElement } from "@/domain/guiElement"

/**
 * 動作確認用の仮の要素。GUI 成果物のインポートができたら、そちらから読み込んだものに置き換える。
 */
export const SAMPLE_ELEMENTS: GuiElement[] = [
    { id: "sample-1", name: "ログイン画面", x: 0, y: 0, width: 360, height: 640 },
    { id: "sample-2", name: "ホーム画面", x: 440, y: 0, width: 360, height: 640 },
    { id: "sample-3", name: "設定ダイアログ", x: 880, y: 160, width: 320, height: 240 },
]
