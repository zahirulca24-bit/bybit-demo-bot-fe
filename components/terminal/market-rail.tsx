'use client'

import { useMemo, useState } from 'react'
import { fmtPrice, fmtSigned, type Instrument, type Signal } from '@/lib/instruments'

function Sparkline({ data, up }: { data: number[]; up: boolean }) {
  const path = useMemo(() => {
    const min = Math.min(...data)
    const max = Math.max(...data)
    const range = max - min || 1
    const step = 100 / (data.length - 1)
    return data
      .map((v, i) => `${(i * step).toFixed(2)},${(20 - ((v - min) / range) * 20).toFixed(2)}`)
      .join(' ')
  }, [data])

  return (
    <svg viewBox="0 0 100 20" preserveAspectRatio="none" className="h-6 w-16" aria-hidden="true">
      <polyline
        points={path}
        fill="none"
        stroke={up ? 'var(--bull)' : 'var(--bear)'}
        strokeWidth={1.5}
        vectorEffect="non-scaling-stroke"
        strokeLinejoin="round"
      />
    </svg>
  )
}

const SIGNAL_STYLES: Record<Signal, string> = {
  'Momentum Up': 'bg-bull-soft text-bull',
  'Momentum Down': 'bg-bear-soft text-bear',
  Overbought: 'bg-accent/15 text-accent',
  Oversold: 'bg-primary/15 text-primary',
  Neutral: 'bg-muted text-muted-foreground',
}

export function MarketRail({
  universe,
  selected,
  onSelect,
}: {
  universe: Instrument[]
  selected: string
  onSelect: (symbol: string) => void
}) {
  const [tab, setTab] = useState<'watchlist' | 'scanner'>('watchlist')

  const scanner = useMemo(
    () =>
      universe
        .filter((i) => i.signal !== 'Neutral')
        .sort((a, b) => Math.abs(b.changePct) - Math.abs(a.changePct)),
    [universe],
  )

  return (
    <div className="flex h-full flex-col bg-surface">
      <div className="flex items-center gap-1 border-b border-border p-1.5">
        {(['watchlist', 'scanner'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 rounded-md px-3 py-1.5 text-xs font-semibold capitalize transition-colors ${
              tab === t
                ? 'bg-muted text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {t}
            {t === 'scanner' && (
              <span className="ml-1.5 rounded bg-accent/20 px-1 font-mono text-[10px] text-accent">
                {scanner.length}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {tab === 'watchlist' ? (
          <ul>
            <li className="grid grid-cols-[1fr_auto_auto] gap-2 border-b border-border/60 px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              <span>Symbol</span>
              <span className="text-right">Last</span>
              <span className="w-16 text-right">Chg%</span>
            </li>
            {universe.map((i) => {
              const up = i.changePct >= 0
              const active = i.symbol === selected
              return (
                <li key={i.symbol}>
                  <button
                    onClick={() => onSelect(i.symbol)}
                    className={`grid w-full grid-cols-[1fr_auto_auto] items-center gap-2 border-l-2 px-3 py-2 text-left transition-colors ${
                      active
                        ? 'border-primary bg-muted/60'
                        : 'border-transparent hover:bg-muted/30'
                    }`}
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-[13px] font-semibold text-foreground">
                        {i.symbol}
                      </span>
                      <span className="block truncate text-[11px] text-muted-foreground">
                        {i.name}
                      </span>
                    </span>
                    <span className="hidden sm:block">
                      <Sparkline data={i.spark} up={up} />
                    </span>
                    <span className="w-16 text-right">
                      <span className="block font-mono text-[12px] tabular-nums text-foreground">
                        {fmtPrice(i.price, i.decimals)}
                      </span>
                      <span
                        className={`block font-mono text-[11px] tabular-nums ${
                          up ? 'text-bull' : 'text-bear'
                        }`}
                      >
                        {fmtSigned(i.changePct, 2)}%
                      </span>
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        ) : (
          <ul className="divide-y divide-border/60">
            {scanner.map((i) => {
              const active = i.symbol === selected
              return (
                <li key={i.symbol}>
                  <button
                    onClick={() => onSelect(i.symbol)}
                    className={`flex w-full flex-col gap-1.5 border-l-2 px-3 py-2.5 text-left transition-colors ${
                      active
                        ? 'border-primary bg-muted/60'
                        : 'border-transparent hover:bg-muted/30'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[13px] font-semibold text-foreground">{i.symbol}</span>
                      <span
                        className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${SIGNAL_STYLES[i.signal]}`}
                      >
                        {i.signal}
                      </span>
                    </div>
                    <div className="flex items-center justify-between font-mono text-[11px] text-muted-foreground">
                      <span>RSI {i.rsi.toFixed(1)}</span>
                      <span
                        className={i.changePct >= 0 ? 'text-bull' : 'text-bear'}
                      >
                        {fmtSigned(i.changePct, 2)}%
                      </span>
                    </div>
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
