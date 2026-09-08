'use client'

import { useMemo } from 'react'
import type { Candle } from '@/lib/market-data'

const W = 1000
const H = 420
const VOL_H = 90 // volume band height at the bottom
const PRICE_H = H - VOL_H - 8

type Props = {
  candles: Candle[]
  ema1: number[]
  ema2: number[]
  supports: number[]
}

export function CandlestickChart({ candles, ema1, ema2, supports }: Props) {
  const geo = useMemo(() => {
    const highs = candles.map((c) => c.h)
    const lows = candles.map((c) => c.l)
    const max = Math.max(...highs)
    const min = Math.min(...lows)
    const pad = (max - min) * 0.08
    const top = max + pad
    const bottom = min - pad
    const range = top - bottom || 1

    const priceY = (p: number) => ((top - p) / range) * PRICE_H
    const step = W / candles.length
    const bodyW = Math.max(2.5, step * 0.62)

    const maxVol = Math.max(...candles.map((c) => c.v))
    const volY = (v: number) => VOL_H - (v / maxVol) * VOL_H

    const line = (arr: number[]) =>
      arr
        .map((v, i) => `${(i + 0.5) * step},${priceY(v).toFixed(1)}`)
        .join(' ')

    return { priceY, volY, step, bodyW, ema1Path: line(ema1), ema2Path: line(ema2), top, bottom }
  }, [candles, ema1, ema2])

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      className="h-full w-full"
      role="img"
      aria-label="Gold spot candlestick price chart with moving averages and volume"
    >
      {/* horizontal grid + support/resistance lines */}
      {supports.map((p, i) => (
        <line
          key={i}
          x1={0}
          x2={W}
          y1={geo.priceY(p)}
          y2={geo.priceY(p)}
          stroke="var(--border)"
          strokeWidth={1}
          strokeDasharray="2 6"
          vectorEffect="non-scaling-stroke"
        />
      ))}

      {/* volume bars */}
      <g transform={`translate(0 ${PRICE_H + 8})`}>
        {candles.map((c, i) => {
          const up = c.c >= c.o
          return (
            <rect
              key={i}
              x={(i + 0.5) * geo.step - geo.bodyW / 2}
              y={geo.volY(c.v)}
              width={geo.bodyW}
              height={VOL_H - geo.volY(c.v)}
              fill={up ? 'var(--bull)' : 'var(--bear)'}
              opacity={0.35}
            />
          )
        })}
      </g>

      {/* candles */}
      {candles.map((c, i) => {
        const up = c.c >= c.o
        const color = up ? 'var(--bull)' : 'var(--bear)'
        const x = (i + 0.5) * geo.step
        const yO = geo.priceY(c.o)
        const yC = geo.priceY(c.c)
        const bodyTop = Math.min(yO, yC)
        const bodyH = Math.max(1.2, Math.abs(yC - yO))
        return (
          <g key={i}>
            <line
              x1={x}
              x2={x}
              y1={geo.priceY(c.h)}
              y2={geo.priceY(c.l)}
              stroke={color}
              strokeWidth={1}
              vectorEffect="non-scaling-stroke"
            />
            <rect
              x={x - geo.bodyW / 2}
              y={bodyTop}
              width={geo.bodyW}
              height={bodyH}
              fill={color}
              rx={0.5}
            />
          </g>
        )
      })}

      {/* moving averages */}
      <polyline
        points={geo.ema2Path}
        fill="none"
        stroke="var(--ma-orange)"
        strokeWidth={2}
        vectorEffect="non-scaling-stroke"
        strokeLinejoin="round"
      />
      <polyline
        points={geo.ema1Path}
        fill="none"
        stroke="var(--ma-blue)"
        strokeWidth={2}
        vectorEffect="non-scaling-stroke"
        strokeLinejoin="round"
      />
    </svg>
  )
}
