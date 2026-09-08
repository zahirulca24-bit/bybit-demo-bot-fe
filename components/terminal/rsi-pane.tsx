'use client'

import { useMemo } from 'react'

const W = 1000
const H = 120

export function RsiPane({ values }: { values: number[] }) {
  const { line, area } = useMemo(() => {
    const step = W / values.length
    const y = (v: number) => H - (v / 100) * H
    const pts = values.map((v, i) => `${((i + 0.5) * step).toFixed(1)},${y(v).toFixed(1)}`)
    return {
      line: pts.join(' '),
      area: `M0,${H} L${pts.join(' L')} L${W},${H} Z`,
    }
  }, [values])

  const last = values[values.length - 1]
  const yFor = (v: number) => (1 - v / 100) * 100

  return (
    <div className="relative h-full w-full">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        className="h-full w-full"
        role="img"
        aria-label="RSI 14-period oscillator"
      >
        <defs>
          <linearGradient id="rsiFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        {[30, 50, 70].map((lvl) => (
          <line
            key={lvl}
            x1={0}
            x2={W}
            y1={H - (lvl / 100) * H}
            y2={H - (lvl / 100) * H}
            stroke="var(--border)"
            strokeWidth={1}
            strokeDasharray={lvl === 50 ? '1 7' : '3 5'}
            vectorEffect="non-scaling-stroke"
          />
        ))}
        <path d={area} fill="url(#rsiFill)" />
        <polyline
          points={line}
          fill="none"
          stroke="var(--primary)"
          strokeWidth={1.75}
          vectorEffect="non-scaling-stroke"
          strokeLinejoin="round"
        />
      </svg>

      <div className="pointer-events-none absolute inset-0 font-mono text-[9px] text-muted-foreground">
        <span className="absolute left-1" style={{ top: `${yFor(70)}%` }}>
          70
        </span>
        <span className="absolute left-1 -translate-y-full" style={{ top: `${yFor(30)}%` }}>
          30
        </span>
        <span className="absolute left-1 top-1 font-semibold text-foreground">
          RSI(14){' '}
          <span className={last >= 70 ? 'text-accent' : last <= 30 ? 'text-bull' : 'text-muted-foreground'}>
            {last.toFixed(2)}
          </span>
        </span>
      </div>
    </div>
  )
}
