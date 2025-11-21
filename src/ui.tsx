import { emit, on } from '@create-figma-plugin/utilities'
import { h, render, Fragment } from 'preact'
import { useState, useEffect, useRef } from 'preact/hooks'

import { CheckContrastHandler, ContrastResultHandler, ContrastResult, RGB } from './types'
import './styles.css'

function ColorBox({ color }: { color: RGB }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (ref.current) {
      ref.current.style.backgroundColor = `rgb(${color.r}, ${color.g}, ${color.b})`
    }
  }, [color.r, color.g, color.b])

  return <div className="color-box" ref={ref} />
}

function App() {
  const [result, setResult] = useState<ContrastResult | null>(null)
  const [isChecking, setIsChecking] = useState(false)

  useEffect(() => {
    // コントラストチェックの結果を受信
    return on<ContrastResultHandler>('CONTRAST_RESULT', function (data: ContrastResult) {
      setResult(data)
      setIsChecking(false)
    })
  }, [])

  const handleCheckContrast = () => {
    setIsChecking(true)
    setResult(null)
    emit<CheckContrastHandler>('CHECK_CONTRAST')
  }

  const formatRatio = (ratio: number): string => {
    return `${ratio.toFixed(2)}:1`
  }

  const formatColor = (color: RGB): string => {
    return `rgb(${color.r}, ${color.g}, ${color.b})`
  }

  return (
    <div className="container">
      <div className="header">
        <h2>WCAG Contrast チェッカー</h2>
        <p className="subtitle">テキストレイヤーを選択してコントラストをチェックします</p>
      </div>

      <div className="content">
        <button
          className="button-primary"
          onClick={handleCheckContrast}
          disabled={isChecking}
        >
          {isChecking ? 'チェック中...' : 'Check Contrast'}
        </button>

        {result && <div className="spacer" />}

        {result && (
          <div className="result-container">
            {result.success ? (
              <Fragment>
                <div className="color-display">
                  <div className="color-item">
                    <ColorBox color={result.foregroundColor!} />
                    <span className="color-label">文字色</span>
                    <span className="color-value">{formatColor(result.foregroundColor!)}</span>
                  </div>
                  <div className="color-item">
                    <ColorBox color={result.backgroundColor!} />
                    <span className="color-label">背景色</span>
                    <span className="color-value">{formatColor(result.backgroundColor!)}</span>
                  </div>
                </div>

                <div className="ratio-display">
                  <div className="ratio-label">コントラスト比</div>
                  <div className="ratio-value">{formatRatio(result.contrastRatio!)}</div>
                </div>

                <div className={`result-badge ${result.passes ? 'pass' : 'fail'}`}>
                  {result.passes ? '✓ Pass (AA)' : '✗ Fail (AA)'}
                </div>

                <div className="info-text">
                  {result.passes
                    ? 'WCAG 2.1 AA基準(4.5:1)を満たしています。'
                    : 'WCAG 2.1 AA基準(4.5:1)を満たしていません。'}
                </div>
              </Fragment>
            ) : (
              <div className="error-message">
                <span className="error-icon">⚠️</span>
                {result.errorMessage}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

render(<App />, document.body)