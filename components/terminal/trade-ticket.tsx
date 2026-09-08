'use client'

import { useState } from 'react'
import { Minus, Plus, ChevronDown } from 'lucide-react'
import {
  ORDER_TYPES,
  RISK,
  fmtPrice,
  fmtUsd,
  type Instrument,
  type OrderType,
} from '@/lib/instruments'

const PRESETS = [1, 5, 10, 25]

function ExposureMeter({ level }: { level: string }) {
  const filled = level === 'Low' ? 1 : level === 'Moderate' ? 2 : 3
  const tone = level === 'Low' ? 'bg-bull' : level === 'Moderate' ? 'bg-accent' : 'bg-bear'
  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className={`h-1.5 w-6 rounded-full ${i < filled ? tone : 'bg-muted'}`}
          />
        ))}
      </div>
      <span
        className={`font-mono text-[11px] font-semibold ${
          level === 'Low' ? 'text-bull' : level === 'Moderate' ? 'text-accent' : 'text-bear'
        }`}
      >
        {level}
      </span>
    </div>
  )
}

export function TradeTicket({ instrument }: { instrument: Instrument }) {
  const [side, setSide] = useState<'buy' | 'sell'>('buy')
  const [orderType, setOrderType] = useState<OrderType>('Market')
  const [qty, setQty] = useState(10)

  const estCost = qty * instrument.price
  const takeProfit = instrument.price * (1 + RISK.takeProfitPct / 100)
  const stopLoss = instrument.price * (1 - RISK.stopLossPct / 100)

  return (
    <div className="flex flex-col bg-surface">
      <div className="border-b border-border px-4 py-2.5">
        <h2 className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          Order Ticket
        </h2>
        <div className="mt-0.5 flex items-baseline justify-between">
          <span className="text-sm font-bold text-foreground">{instrument.symbol}</span>
          <span className="font-mono text-[12px] tabular-nums text-muted-foreground">
            {fmtPrice(instrument.price, instrument.decimals)}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-4 p-4">
        {/* side toggle */}
        <div className="grid grid-cols-2 gap-1 rounded-md bg-background p-1">
          <button
            onClick={() => setSide('buy')}
            className={`rounded py-2 text-sm font-semibold transition-colors ${
              side === 'buy'
                ? 'bg-bull text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Buy / Long
          </button>
          <button
            onClick={() => setSide('sell')}
            className={`rounded py-2 text-sm font-semibold transition-colors ${
              side === 'sell'
                ? 'bg-bear text-white'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Sell / Short
          </button>
        </div>

        {/* order type */}
        <label className="flex flex-col gap-1.5">
          <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            Order Type
          </span>
          <div className="relative">
            <select
              value={orderType}
              onChange={(e) => setOrderType(e.target.value as OrderType)}
              className="h-9 w-full appearance-none rounded-md border border-border bg-background px-3 pr-8 text-sm text-foreground outline-none focus:border-ring focus:ring-1 focus:ring-ring"
            >
              {ORDER_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          </div>
        </label>

        {orderType !== 'Market' && (
          <label className="flex flex-col gap-1.5">
            <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              Limit Price
            </span>
            <input
              type="text"
              defaultValue={fmtPrice(instrument.price, instrument.decimals)}
              className="h-9 w-full rounded-md border border-border bg-background px-3 text-right font-mono text-sm tabular-nums text-foreground outline-none focus:border-ring focus:ring-1 focus:ring-ring"
            />
          </label>
        )}

        {/* quantity */}
        <div className="flex flex-col gap-1.5">
          <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            Quantity ({instrument.unit})
          </span>
          <div className="flex items-center rounded-md border border-border bg-background">
            <button
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              className="flex h-9 w-9 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
              aria-label="Decrease quantity"
            >
              <Minus className="h-4 w-4" />
            </button>
            <input
              value={qty}
              onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))}
              className="h-9 w-full bg-transparent text-center font-mono text-sm tabular-nums text-foreground outline-none"
            />
            <button
              onClick={() => setQty((q) => q + 1)}
              className="flex h-9 w-9 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
              aria-label="Increase quantity"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <div className="grid grid-cols-4 gap-1">
            {PRESETS.map((p) => (
              <button
                key={p}
                onClick={() => setQty(p)}
                className={`rounded border py-1 font-mono text-[11px] transition-colors ${
                  qty === p
                    ? 'border-primary/50 bg-primary/10 text-primary'
                    : 'border-border bg-background text-muted-foreground hover:text-foreground'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* estimated cost */}
        <div className="flex items-center justify-between rounded-md border border-border bg-background px-3 py-2.5">
          <span className="text-[12px] text-muted-foreground">Estimated Cost</span>
          <span className="font-mono text-sm font-semibold tabular-nums text-foreground">
            {fmtUsd(estCost)}
          </span>
        </div>

        <button
          className={`rounded-md py-3 text-sm font-bold transition-opacity hover:opacity-90 ${
            side === 'buy' ? 'bg-bull text-primary-foreground' : 'bg-bear text-white'
          }`}
        >
          {side === 'buy' ? 'Open Long Position' : 'Open Short Position'}
        </button>

        {/* risk & performance (preserved rules) */}
        <div className="rounded-md border border-border bg-background p-3">
          <h3 className="mb-2.5 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            Risk &amp; Performance
          </h3>
          <dl className="flex flex-col gap-2 text-[12px]">
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground">Take Profit</dt>
              <dd className="font-mono tabular-nums text-bull">
                {fmtPrice(takeProfit, instrument.decimals)}{' '}
                <span className="text-muted-foreground">(+{RISK.takeProfitPct}%)</span>
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground">Stop Loss</dt>
              <dd className="font-mono tabular-nums text-bear">
                {fmtPrice(stopLoss, instrument.decimals)}{' '}
                <span className="text-muted-foreground">(-{RISK.stopLossPct}%)</span>
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground">Risk-Reward</dt>
              <dd className="font-mono tabular-nums text-foreground">{RISK.riskReward}</dd>
            </div>
            <div className="flex items-center justify-between border-t border-border pt-2">
              <dt className="text-muted-foreground">Portfolio Exposure</dt>
              <dd>
                <ExposureMeter level={RISK.exposure} />
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  )
}
