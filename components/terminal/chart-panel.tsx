'use client'

import { useState } from 'react'
import { PriceChart, type ChartType } from './price-chart'
import { RsiPane } from './rsi-pane'
import { rsi } from '@/lib/market-data'
import { fmtPrice, fmtSigned, fmtVol, type Instrument } from '@/lib/instruments'

const CHART_TYPES: ChartType[] = ['Candles', 'Line', 'Area']
const TIMEFRAMES = ['1D', '1W', '1M', '3M', '1Y', 'All']

function Stat({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div className="flex flex-col">
      <span className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <span className={`font-mono text-[13px] tabular-nums ${tone ?? 'text-foreground'}`}>
        {value}
      </span>
    </div>
  )
}

export function ChartPanel({ instrument }: { instrument: Instrument }) {
  const [type, setType] = useState<ChartType>('Candles')
  const [tf, setTf] = useState('1D')
  const up = instrument.changePct >= 0
  const rsiValues = rsi(instrument.candles)

  return (
    <div className="flex h-full flex-col bg-surface">
      {/* instrument header */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3 border-b border-border px-4 py-3">
        <div className="flex items-center gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold tracking-tight text-foreground">
                {instrument.symbol}
              </span>
              <span className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                {instrument.klass}
              </span>
            </div>
            <div className="text-[11px] text-muted-foreground">{instrument.name}</div>
          </div>
          <div className="pl-2">
            <div className="font-mono text-2xl font-bold tabular-nums text-foreground">
              {fmtPrice(instrument.price, instrument.decimals)}
            </div>
            <div className={`font-mono text-[12px] tabular-nums ${up ? 'text-bull' : 'text-bear'}`}>
              {fmtSigned(instrument.change, instrument.decimals)} ({fmtSigned(instrument.changePct, 2)}%)
            </div>
          </div>
        </div>

        <div className="ml-auto grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-4">
          <Stat label="Day High" value={fmtPrice(instrument.dayHigh, instrument.decimals)} />
          <Stat label="Day Low" value={fmtPrice(instrument.dayLow, instrument.decimals)} />
          <Stat
            label="RSI 14"
            value={instrument.rsi.toFixed(1)}
            tone={
              instrument.rsi >= 70 ? 'text-accent' : instrument.rsi <= 30 ? 'text-bull' : 'text-foreground'
            }
          />
          <Stat label="Volume" value={fmtVol(instrument.volume)} />
        </div>
      </div>

      {/* toolbar */}
      <div className="flex items-center justify-between gap-2 border-b border-border px-3 py-2">
        <div className="flex items-center gap-1 rounded-md bg-background p-0.5">
          {CHART_TYPES.map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={`rounded px-2.5 py-1 text-xs font-medium transition-colors ${
                type === t ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-3 font-mono text-[10px] md:flex">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <span className="h-0.5 w-3 rounded bg-ma-fast" /> EMA 12
            </span>
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <span className="h-0.5 w-3 rounded bg-ma-slow" /> EMA 30
            </span>
          </div>
          <div className="flex items-center gap-0.5 rounded-md bg-background p-0.5">
            {TIMEFRAMES.map((t) => (
              <button
                key={t}
                onClick={() => setTf(t)}
                className={`rounded px-2 py-1 font-mono text-[11px] transition-colors ${
                  tf === t ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* chart */}
      <div className="min-h-0 flex-1 px-2 pt-2">
        <PriceChart candles={instrument.candles} type={type} decimals={instrument.decimals} />
      </div>
      <div className="h-[110px] border-t border-border px-2 py-1">
        <RsiPane values={rsiValues} />
      </div>
    </div>
  )
}
