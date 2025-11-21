# WCAG Contrast Checker

テキストと背景色のコントラスト比を自動計算し、デザインがWCAG 2.1 AAアクセシビリティ基準を満たしているかを確認できるFigmaプラグインです。

![WCAG Contrast Checker](https://img.shields.io/badge/WCAG-2.1%20AA-brightgreen)
![Figma Plugin](https://img.shields.io/badge/Figma-Plugin-orange)

## 機能

- ✅ **自動コントラスト計算**: WCAG 2.1の計算式を使用してコントラスト比を算出
- 🎯 **WCAG AA準拠チェック**: 最小比率4.5:1に対する検証
- 🎨 **色の可視化**: テキストと背景色をRGB値とともに表示
- ⚡ **リアルタイムフィードバック**: 即座にPass/Failを判定
- 🌐 **日本語UI**: 日本語のユーザーインターフェース

## スクリーンショット

<img src="screenshot.png" width="400" alt="プラグインのスクリーンショット" />

## 使い方

1. Figmaでテキストレイヤーを選択
2. 「Check Contrast」ボタンをクリック
3. コントラスト比とWCAG AA準拠状況を確認

プラグインの動作：

- 選択されたテキストレイヤーから文字色を抽出
- 親要素を遡って背景色を検索
- 両色の相対輝度を計算
- コントラスト比を算出: `(L_明るい + 0.05) / (L_暗い + 0.05)`
- WCAG 2.1 AA基準（4.5:1）に対して検証

## インストール

### 開発者向け

1. **前提条件**
   - [Node.js](https://nodejs.org) v22以上
   - [Figma デスクトップアプリ](https://figma.com/downloads/)

2. **クローンとインストール**

   ```bash
   git clone https://github.com/junhongo-ccs/wcag-contrast-checker.git
   cd wcag-contrast-checker/react-editor
   npm install
   ```

3. **プラグインのビルド**

   ```bash
   npm run build
   ```

4. **Figmaで読み込み**
   - Figmaデスクトップアプリを開く
   - `Cmd + /`（クイックアクション）を押す
   - 「Import plugin from manifest...」を検索
   - プロジェクトの`manifest.json`ファイルを選択

### ユーザー向け

*近日公開予定: このプラグインはFigma Communityで公開予定です*

## 開発

### ビルドコマンド

```bash
# プロダクションビルド
npm run build

# 開発モード（変更時に自動再ビルド）
npm run watch
```

### 技術スタック

- **フレームワーク**: [Create Figma Plugin](https://yuanqing.github.io/create-figma-plugin/)
- **UIライブラリ**: Preact（React互換）
- **言語**: TypeScript
- **スタイリング**: CSS

### プロジェクト構成

```
react-editor/
├── src/
│   ├── main.ts          # プラグインメインスレッド（Figma API）
│   ├── ui.tsx           # UIコンポーネント（Preact）
│   ├── types.ts         # TypeScript型定義
│   └── styles.css       # コンポーネントスタイル
├── build/               # ビルド出力（自動生成）
├── manifest.json        # Figmaプラグインマニフェスト（自動生成）
└── package.json         # プロジェクト設定
```

### デバッグ

`console.log()`を使用して値を確認できます。ログを表示するには：

1. Figmaで`Cmd + /`を押す
2. 「Show/Hide Console」を検索
3. コンソール出力を確認

## WCAGリソース

- [WCAG 2.1 ガイドライン](https://www.w3.org/TR/WCAG21/)
- [コントラスト比の定義](https://www.w3.org/TR/WCAG21/#dfn-contrast-ratio)
- [WCAG達成基準 1.4.3を理解する](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html)

## コントリビューション

プルリクエストを歓迎します！お気軽にご投稿ください。

## ライセンス

MIT

## クレジット

[@yuanqing](https://github.com/yuanqing)による[Create Figma Plugin](https://yuanqing.github.io/create-figma-plugin/)を使用して構築

## 作者

Created by [junhongo-ccs](https://github.com/junhongo-ccs)
