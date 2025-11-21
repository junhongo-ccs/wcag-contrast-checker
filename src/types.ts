import { EventHandler } from '@create-figma-plugin/utilities'

// コントラストチェック実行イベント
export interface CheckContrastHandler extends EventHandler {
  name: 'CHECK_CONTRAST'
  handler: () => void
}

// コントラストチェック結果イベント
export interface ContrastResultHandler extends EventHandler {
  name: 'CONTRAST_RESULT'
  handler: (result: ContrastResult) => void
}

// コントラスト結果のデータ型
export interface ContrastResult {
  success: boolean
  contrastRatio?: number
  foregroundColor?: RGB
  backgroundColor?: RGB
  passes?: boolean // WCAG AA基準(4.5:1)を満たすか
  errorMessage?: string
}

// RGB色の型
export interface RGB {
  r: number // 0-255
  g: number // 0-255
  b: number // 0-255
}
