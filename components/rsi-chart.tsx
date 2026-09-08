'use client'

import { useMemo } from 'react'

const W = 1000
const H = 140

export function RsiChart({ values }: { values: number[] }) {
  const { area, line } = useMemo(() => {
    const step = W / values.length
    const y = (v: number) => H - (v / 100) * H
    const pts = values.map((v, i) => `${(i + 0.5) * step},${y(v).toFixed(1)}`)
    const linePath = pts.join(' ')
    const areaPath = `M0,${H} L${pts.join(' L')} L${W},${H} Z`
    return { area: areaPath, line: linePath }
  }, [values])

  const bandTop = H - (70 / 100) * H
  const bandBottom = H - (30 / 100) * H

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      className="h-full w-full"
      role="img"
      aria-label="RSI 14-period oscillator"
    >
      <defs>
        <linearGradient id="rsiFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--bull)" stopOpacity="0.35" />
          <stop offset="100%" stopColor="var(--bull)" stopOpacity="0.02" />
        </linearGradient>
      </defs>

      {/* overbought / oversold band */}
      <line
        x1={0}
        x2={W}
        y1={bandTop}
        y2={bandTop}
        stroke="var(--border)"
        strokeWidth={1}
        strokeDasharray="2 6"
        vectorEffect="non-scaling-stroke"
      />
      <line
        x1={0}
        x2={W}
        y1={bandBottom}
        y2={bandBottom}
        stroke="var(--border)"
        strokeWidth={1}
        strokeDasharray="2 6"
        vectorEffect="non-scaling-stroke"
      />

      <path d={area} fill="url(#rsiFill)" />
      <polyline
        points={line}
        fill="none"
        stroke="var(--bull)"
        strokeWidth={1.75}
        vectorEffect="non-scaling-stroke"
        strokeLinejoin="round"
      />
    </svg>
  )
}
