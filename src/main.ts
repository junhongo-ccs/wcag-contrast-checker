import { emit, on, showUI } from '@create-figma-plugin/utilities'

import { CheckContrastHandler, ContrastResultHandler, ContrastResult, RGB } from './types'

export default function () {
  // UIからのコントラストチェック要求を受信
  on<CheckContrastHandler>('CHECK_CONTRAST', function () {
    const result = checkContrast()
    emit<ContrastResultHandler>('CONTRAST_RESULT', result)
  })

  showUI({ height: 400, width: 360 })
}

/**
 * コントラスト比をチェックする
 */
function checkContrast(): ContrastResult {
  const selection = figma.currentPage.selection

  // 選択要素の検証
  if (selection.length === 0) {
    return {
      success: false,
      errorMessage: 'テキストレイヤーを選択してください。'
    }
  }

  if (selection.length > 1) {
    return {
      success: false,
      errorMessage: '複数のレイヤーが選択されています。単一のテキストレイヤーを選択してください。'
    }
  }

  const node = selection[0]

  // テキストノードかどうかを確認
  if (node.type !== 'TEXT') {
    return {
      success: false,
      errorMessage: '選択されたレイヤーはテキストではありません。テキストレイヤーを選択してください。'
    }
  }

  // 文字色の取得
  const foregroundColor = extractSolidColor(node.fills)
  if (!foregroundColor) {
    return {
      success: false,
      errorMessage: 'テキストの色を取得できませんでした。ソリッドカラーのテキストを選択してください。'
    }
  }

  // 背景色の取得
  const backgroundColor = extractBackgroundColor(node)
  if (!backgroundColor) {
    return {
      success: false,
      errorMessage: '背景色を取得できませんでした。テキストが配置されているフレームまたはシェイプを確認してください。'
    }
  }

  // コントラスト比を計算
  const contrastRatio = calculateContrastRatio(foregroundColor, backgroundColor)
  const passes = contrastRatio >= 4.5 // WCAG AA基準

  return {
    success: true,
    contrastRatio,
    foregroundColor,
    backgroundColor,
    passes
  }
}

/**
 * ソリッドカラーをRGB形式で抽出
 */
function extractSolidColor(fills: readonly Paint[] | symbol): RGB | null {
  if (typeof fills === 'symbol' || !fills || fills.length === 0) {
    return null
  }

  const solidPaint = fills.find((fill) => fill.type === 'SOLID') as SolidPaint | undefined
  if (!solidPaint) {
    return null
  }

  return {
    r: Math.round(solidPaint.color.r * 255),
    g: Math.round(solidPaint.color.g * 255),
    b: Math.round(solidPaint.color.b * 255)
  }
}

/**
 * 背景色を抽出
 */
function extractBackgroundColor(node: SceneNode): RGB | null {
  let parent = node.parent

  // 親ノードを遡って背景色を探す
  while (parent) {
    if ('fills' in parent) {
      const bgColor = extractSolidColor(parent.fills)
      if (bgColor) {
        return bgColor
      }
    }
    parent = parent.parent
  }

  // 背景が見つからない場合は白を返す
  return { r: 255, g: 255, b: 255 }
}

/**
 * 相対輝度を計算
 * https://www.w3.org/TR/WCAG21/#dfn-relative-luminance
 */
function calculateRelativeLuminance(rgb: RGB): number {
  // RGB値を0-1の範囲に正規化
  const r = rgb.r / 255
  const g = rgb.g / 255
  const b = rgb.b / 255

  // sRGBからlinear RGBへ変換
  const toLinear = (c: number) => {
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  }

  const rLinear = toLinear(r)
  const gLinear = toLinear(g)
  const bLinear = toLinear(b)

  // 相対輝度の計算
  return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear
}

/**
 * コントラスト比を計算
 * https://www.w3.org/TR/WCAG21/#dfn-contrast-ratio
 */
function calculateContrastRatio(color1: RGB, color2: RGB): number {
  const l1 = calculateRelativeLuminance(color1)
  const l2 = calculateRelativeLuminance(color2)

  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)

  return (lighter + 0.05) / (darker + 0.05)
}
