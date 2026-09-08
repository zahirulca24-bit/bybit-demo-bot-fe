'use client'

import { useMemo, useState } from 'react'
import { ArrowUpRight, CandlestickChart, LineChart } from 'lucide-react'
import { CandlestickChart as CandleChart } from '@/components/candlestick-chart'
import { RsiChart } from '@/components/rsi-chart'
import { generateCandles, ema, rsi, MONTHS } from '@/lib/market-data'

const TIMEFRAMES = ['1m', '5m', '15m', '1h', '4h', '1D', '1W', '1M', '1Y', 'All']

const SUMMARY = [
  { label: 'Open', value: '2,031.22' },
  { label: 'High', value: '2,061.50' },
  { label: 'Low', value: '2,041.80' },
  { label: '52W High', value: '2,145.86' },
  { label: '52W Low', value: '1,810.13' },
  { label: 'Avg Vol (3M)', value: '21.73M' },
  { label: 'Shares Out', value: '7.438B' },
  { label: 'Div Yield', value: '0.74%' },
]

export function ChartWorkspace() {
  const [tf, setTf] = useState('1D')
  const [chartType, setChartType] = useState<'candle' | 'line'>('candle')

  const { candles, ema1, ema2, rsiValues, supports, priceLabels, lastRsi } = useMemo(() => {
    const candles = generateCandles(120, 42)
    const ema1 = ema(candles, 12)
    const ema2 = ema(candles, 30)
    const rsiValues = rsi(candles, 14)

    const highs = candles.map((c) => c.h)
    const lows = candles.map((c) => c.l)
    const max = Math.max(...highs)
    const min = Math.min(...lows)
    const supports = [
      min + (max - min) * 0.72,
      min + (max - min) * 0.42,
      min + (max - min) * 0.18,
    ]

    const steps = 5
    const priceLabels = Array.from({ length: steps + 1 }, (_, i) => {
      const p = max - ((max - min) / steps) * i
      return { p, top: `${(i / steps) * 100}%` }
    })

    return {
      candles,
      ema1,
      ema2,
      rsiValues,
      supports,
      priceLabels,
      lastRsi: rsiValues[rsiValues.length - 1],
    }
  }, [])

  const last = candles[candles.length - 1]

  return (
    <section className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border border-border bg-surface">
      {/* Asset header */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-b border-border px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f0a020]/15 text-lg font-bold text-[#f0a020]">
            Au
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold leading-none">GOLD</h1>
              <span className="rounded-md bg-primary/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                Future
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Gold Spot / U.S. Dollar</p>
          </div>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="font-mono text-3xl font-semibold tabular-nums">$2,054.32</span>
          <span className="flex items-center gap-0.5 rounded-md bg-primary/15 px-1.5 py-1 text-xs font-medium text-primary">
            <ArrowUpRight className="h-3.5 w-3.5" />
            +2.47 (0.12%)
          </span>
        </div>

        <div className="ml-auto grid grid-cols-2 gap-x-8 gap-y-1 sm:grid-cols-4">
          {[
            ['Day High', '2,061.50'],
            ['Day Low', '2,041.80'],
            ['24h Volume', '12.4M'],
            ['Market Cap', '$14.2T'],
          ].map(([label, value]) => (
            <div key={label}>
              <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
                {label}
              </div>
              <div className="font-mono text-sm tabular-nums">{value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 border-b border-border px-5 py-3">
        <div className="flex items-center rounded-lg border border-border bg-background/50 p-0.5">
          {(['candle', 'line'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setChartType(t)}
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium capitalize transition-colors ${
                chartType === t
                  ? 'bg-muted text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {t === 'candle' ? (
                <CandlestickChart className="h-3.5 w-3.5" />
              ) : (
                <LineChart className="h-3.5 w-3.5" />
              )}
              {t}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-0.5 rounded-lg border border-border bg-background/50 p-0.5">
          {TIMEFRAMES.map((t) => (
            <button
              key={t}
              onClick={() => setTf(t)}
              className={`rounded-md px-2.5 py-1 text-xs font-medium tabular-nums transition-colors ${
                tf === t
                  ? 'bg-primary/15 text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-4 text-[11px]">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <span className="h-0.5 w-4 rounded bg-[var(--ma-blue)]" /> EMA 12
          </span>
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <span className="h-0.5 w-4 rounded bg-[var(--ma-orange)]" /> EMA 30
          </span>
        </div>
      </div>

      {/* Price chart */}
      <div className="relative min-h-0 flex-1">
        <div className="absolute inset-0 pr-14">
          {chartType === 'candle' ? (
            <CandleChart candles={candles} ema1={ema1} ema2={ema2} supports={supports} />
          ) : (
            <LineOnly candles={candles} />
          )}
        </div>

        {/* price axis */}
        <div className="pointer-events-none absolute inset-y-0 right-0 w-14 border-l border-border">
          {priceLabels.map((l, i) => (
            <span
              key={i}
              className="absolute right-1 -translate-y-1/2 font-mono text-[10px] tabular-nums text-muted-foreground"
              style={{ top: l.top }}
            >
              {l.p.toFixed(0)}
            </span>
          ))}
          <span
            className="absolute right-1 -translate-y-1/2 rounded bg-primary px-1 py-0.5 font-mono text-[10px] font-semibold tabular-nums text-primary-foreground"
            style={{ top: '31%' }}
          >
            {last.c.toFixed(0)}
          </span>
        </div>

        {/* month axis */}
        <div className="pointer-events-none absolute inset-x-0 bottom-1 flex justify-between px-6 pr-16">
          {MONTHS.map((m) => (
            <span key={m} className="font-mono text-[10px] text-muted-foreground">
              {m}
            </span>
          ))}
        </div>
      </div>

      {/* RSI pane */}
      <div className="border-t border-border">
        <div className="flex items-center gap-2 px-5 pb-1 pt-2 text-[11px]">
          <span className="font-medium text-foreground">RSI</span>
          <span className="text-muted-foreground">(14, close)</span>
          <span className="font-mono text-primary tabular-nums">{lastRsi.toFixed(2)}</span>
        </div>
        <div className="relative h-24 px-0.5 pb-1">
          <RsiChart values={rsiValues} />
          <span className="pointer-events-none absolute right-1 top-2 font-mono text-[10px] text-muted-foreground">
            70
          </span>
          <span className="pointer-events-none absolute bottom-4 right-1 font-mono text-[10px] text-muted-foreground">
            30
          </span>
        </div>
      </div>

      {/* Bottom summary bar */}
      <div className="grid grid-cols-2 gap-x-6 gap-y-2 border-t border-border px-5 py-3 sm:grid-cols-4 lg:grid-cols-8">
        {SUMMARY.map((item) => (
          <div key={item.label} className="flex flex-col">
            <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
              {item.label}
            </span>
            <span className="font-mono text-xs tabular-nums text-foreground">{item.value}</span>
          </div>
        ))}
      </div>
    </section>
  )
}

function LineOnly({ candles }: { candles: ReturnType<typeof generateCandles> }) {
  const { area, line } = useMemo(() => {
    const W = 1000
    const H = 420
    const highs = candles.map((c) => c.h)
    const lows = candles.map((c) => c.l)
    const max = Math.max(...highs)
    const min = Math.min(...lows)
    const range = max - min || 1
    const step = W / candles.length
    const y = (p: number) => ((max - p) / range) * H
    const pts = candles.map((c, i) => `${(i + 0.5) * step},${y(c.c).toFixed(1)}`)
    return { area: `M0,${H} L${pts.join(' L')} L${W},${H} Z`, line: pts.join(' ') }
  }, [candles])

  return (
    <svg viewBox="0 0 1000 420" preserveAspectRatio="none" className="h-full w-full" role="img" aria-label="Gold price line chart">
      <defs>
        <linearGradient id="lineFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.28" />
          <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.01" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#lineFill)" />
      <polyline
        points={line}
        fill="none"
        stroke="var(--primary)"
        strokeWidth={2}
        vectorEffect="non-scaling-stroke"
        strokeLinejoin="round"
      />
    </svg>
  )
}
