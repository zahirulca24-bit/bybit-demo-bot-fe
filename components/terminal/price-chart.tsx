'use client'

import { useMemo } from 'react'
import { ema, MONTHS, type Candle } from '@/lib/market-data'
import { fmtPrice } from '@/lib/instruments'

const W = 1000
const H = 400
const VOL_H = 70
const PRICE_H = H - VOL_H - 6

export type ChartType = 'Candles' | 'Line' | 'Area'

export function PriceChart({
  candles,
  type,
  decimals,
}: {
  candles: Candle[]
  type: ChartType
  decimals: number
}) {
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
    const frac = (p: number) => (top - p) / range
    const step = W / candles.length
    const bodyW = Math.max(2.5, step * 0.6)

    const maxVol = Math.max(...candles.map((c) => c.v))
    const volY = (v: number) => VOL_H - (v / maxVol) * VOL_H

    const e12 = ema(candles, 12)
    const e30 = ema(candles, 30)
    const toLine = (arr: number[]) =>
      arr.map((v, i) => `${(i + 0.5) * step},${priceY(v).toFixed(1)}`).join(' ')

    const closeLine = candles
      .map((c, i) => `${(i + 0.5) * step},${priceY(c.c).toFixed(1)}`)
      .join(' ')

    const levels = Array.from({ length: 5 }, (_, i) => bottom + pad + ((range - 2 * pad) * i) / 4)

    return {
      priceY,
      frac,
      volY,
      step,
      bodyW,
      ema12Path: toLine(e12),
      ema30Path: toLine(e30),
      closeLine,
      levels,
      last: candles[candles.length - 1].c,
    }
  }, [candles])

  const up = candles[candles.length - 1].c >= candles[0].c

  return (
    <div className="relative h-full w-full">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        className="h-full w-full"
        role="img"
        aria-label="Price chart with moving averages and volume"
      >
        <defs>
          <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.28" />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
          </linearGradient>
        </defs>

        {geo.levels.map((p, i) => (
          <line
            key={i}
            x1={0}
            x2={W}
            y1={geo.priceY(p)}
            y2={geo.priceY(p)}
            stroke="var(--border)"
            strokeWidth={1}
            strokeDasharray="1 7"
            vectorEffect="non-scaling-stroke"
          />
        ))}

        <g transform={`translate(0 ${PRICE_H + 6})`}>
          {candles.map((c, i) => {
            const cUp = c.c >= c.o
            return (
              <rect
                key={i}
                x={(i + 0.5) * geo.step - geo.bodyW / 2}
                y={geo.volY(c.v)}
                width={geo.bodyW}
                height={VOL_H - geo.volY(c.v)}
                fill={cUp ? 'var(--bull)' : 'var(--bear)'}
                opacity={0.3}
              />
            )
          })}
        </g>

        {type === 'Area' && (
          <path
            d={`M0,${PRICE_H} L${geo.closeLine.replaceAll(' ', ' L')} L${W},${PRICE_H} Z`}
            fill="url(#areaFill)"
          />
        )}

        {type === 'Candles' ? (
          candles.map((c, i) => {
            const cUp = c.c >= c.o
            const color = cUp ? 'var(--bull)' : 'var(--bear)'
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
          })
        ) : (
          <polyline
            points={geo.closeLine}
            fill="none"
            stroke="var(--primary)"
            strokeWidth={2}
            vectorEffect="non-scaling-stroke"
            strokeLinejoin="round"
          />
        )}

        {type === 'Candles' && (
          <>
            <polyline
              points={geo.ema30Path}
              fill="none"
              stroke="var(--ma-slow)"
              strokeWidth={1.75}
              vectorEffect="non-scaling-stroke"
              strokeLinejoin="round"
            />
            <polyline
              points={geo.ema12Path}
              fill="none"
              stroke="var(--ma-fast)"
              strokeWidth={1.75}
              vectorEffect="non-scaling-stroke"
              strokeLinejoin="round"
            />
          </>
        )}

        <line
          x1={0}
          x2={W}
          y1={geo.priceY(geo.last)}
          y2={geo.priceY(geo.last)}
          stroke={up ? 'var(--bull)' : 'var(--bear)'}
          strokeWidth={1}
          strokeDasharray="4 4"
          vectorEffect="non-scaling-stroke"
          opacity={0.7}
        />
      </svg>

      {/* Overlaid HTML price axis (avoids stretched SVG text) */}
      <div className="pointer-events-none absolute inset-0">
        {geo.levels.map((p, i) => (
          <span
            key={i}
            className="absolute right-1 -translate-y-1/2 font-mono text-[10px] tabular-nums text-muted-foreground"
            style={{ top: `${geo.frac(p) * (PRICE_H / H) * 100}%` }}
          >
            {fmtPrice(p, decimals)}
          </span>
        ))}
        <span
          className={`absolute right-1 -translate-y-1/2 rounded px-1 font-mono text-[10px] font-semibold tabular-nums ${
            up ? 'bg-bull text-primary-foreground' : 'bg-bear text-white'
          }`}
          style={{ top: `${geo.frac(geo.last) * (PRICE_H / H) * 100}%` }}
        >
          {fmtPrice(geo.last, decimals)}
        </span>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-between px-2 font-mono text-[9px] text-muted-foreground">
        {MONTHS.map((m) => (
          <span key={m}>{m}</span>
        ))}
      </div>
    </div>
  )
}
