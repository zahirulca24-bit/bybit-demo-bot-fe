'use client'

import { useState } from 'react'
import { ArrowUpRight, Minus, Plus, ChevronDown } from 'lucide-react'

const PRICE = 2054.32
const ORDER_TYPES = ['Market Order', 'Limit Order', 'Stop-Limit']

export function OrderPanel() {
  const [side, setSide] = useState<'buy' | 'sell'>('buy')
  const [qty, setQty] = useState(10)
  const [orderType, setOrderType] = useState('Market Order')
  const [typeOpen, setTypeOpen] = useState(false)

  const isBuy = side === 'buy'
  const cost = qty * PRICE

  return (
    <aside className="flex w-80 shrink-0 flex-col gap-4 overflow-y-auto rounded-2xl border border-border bg-surface p-4">
      {/* live price recap */}
      <div className="flex items-center justify-between rounded-xl border border-border bg-background/40 px-3 py-2.5">
        <div>
          <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
            Gold Spot
          </div>
          <div className="font-mono text-lg font-semibold tabular-nums">
            ${PRICE.toLocaleString()}
          </div>
        </div>
        <span className="flex items-center gap-0.5 rounded-md bg-primary/15 px-1.5 py-1 text-xs font-medium text-primary">
          <ArrowUpRight className="h-3.5 w-3.5" />
          0.12%
        </span>
      </div>

      {/* Buy / Sell toggle */}
      <div className="grid grid-cols-2 gap-1 rounded-xl border border-border bg-background/40 p-1">
        <button
          onClick={() => setSide('buy')}
          className={`rounded-lg py-2 text-sm font-semibold transition-all ${
            isBuy
              ? 'bg-primary text-primary-foreground shadow-[0_0_18px_-4px_var(--primary)]'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Buy / Long
        </button>
        <button
          onClick={() => setSide('sell')}
          className={`rounded-lg py-2 text-sm font-semibold transition-all ${
            !isBuy
              ? 'bg-destructive text-destructive-foreground shadow-[0_0_18px_-4px_var(--destructive)]'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Sell / Short
        </button>
      </div>

      {/* Order type */}
      <div>
        <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
          Order Type
        </label>
        <div className="relative">
          <button
            onClick={() => setTypeOpen((o) => !o)}
            className="flex w-full items-center justify-between rounded-lg border border-border bg-background/40 px-3 py-2.5 text-sm transition-colors hover:border-primary/40"
          >
            {orderType}
            <ChevronDown
              className={`h-4 w-4 text-muted-foreground transition-transform ${typeOpen ? 'rotate-180' : ''}`}
            />
          </button>
          {typeOpen && (
            <div className="absolute z-10 mt-1 w-full overflow-hidden rounded-lg border border-border bg-popover shadow-xl">
              {ORDER_TYPES.map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    setOrderType(t)
                    setTypeOpen(false)
                  }}
                  className={`block w-full px-3 py-2 text-left text-sm transition-colors hover:bg-muted ${
                    t === orderType ? 'text-primary' : 'text-foreground'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quantity */}
      <div>
        <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
          Quantity (oz)
        </label>
        <div className="flex items-center rounded-lg border border-border bg-background/40">
          <button
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="flex h-10 w-10 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
            aria-label="Decrease quantity"
          >
            <Minus className="h-4 w-4" />
          </button>
          <input
            value={qty}
            onChange={(e) => setQty(Math.max(1, Number(e.target.value.replace(/\D/g, '')) || 1))}
            className="w-full bg-transparent text-center font-mono text-sm tabular-nums outline-none"
            inputMode="numeric"
          />
          <button
            onClick={() => setQty((q) => q + 1)}
            className="flex h-10 w-10 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
            aria-label="Increase quantity"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-2 grid grid-cols-4 gap-1">
          {[10, 25, 50, 100].map((v) => (
            <button
              key={v}
              onClick={() => setQty(v)}
              className="rounded-md border border-border bg-background/40 py-1 font-mono text-[11px] tabular-nums text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* Estimated cost */}
      <div className="flex items-center justify-between rounded-lg border border-dashed border-border px-3 py-2.5">
        <span className="text-xs text-muted-foreground">Estimated Cost</span>
        <span className="font-mono text-sm font-semibold tabular-nums">
          ${cost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      </div>

      {/* CTA */}
      <button
        className={`w-full rounded-xl py-3 text-sm font-semibold transition-all ${
          isBuy
            ? 'bg-primary text-primary-foreground shadow-[0_0_24px_-6px_var(--primary)] hover:brightness-110'
            : 'bg-destructive text-destructive-foreground shadow-[0_0_24px_-6px_var(--destructive)] hover:brightness-110'
        }`}
      >
        {isBuy ? 'Open a Position — Buy' : 'Open a Position — Sell'}
      </button>

      {/* Risk & performance */}
      <div className="rounded-xl border border-border bg-background/40 p-3">
        <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          Risk &amp; Performance
        </h3>

        <div className="space-y-2.5 text-sm">
          <Row label="Take Profit" value="$2,130.00" valueClass="text-primary" />
          <Row label="Stop Loss" value="$1,980.00" valueClass="text-destructive" />
          <Row label="Risk-Reward Ratio" value="1 : 2.3" valueClass="text-foreground" />
        </div>

        <div className="mt-4">
          <div className="mb-1.5 flex items-center justify-between text-[11px]">
            <span className="text-muted-foreground">Portfolio Exposure</span>
            <span className="font-medium text-[#f0a020]">Moderate</span>
          </div>
          <div className="flex h-2 gap-1 overflow-hidden rounded-full">
            <span className="flex-1 rounded-full bg-primary" />
            <span className="flex-1 rounded-full bg-[#f0a020]" />
            <span className="flex-1 rounded-full bg-destructive/30" />
          </div>
          <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
            <span>Low</span>
            <span>Moderate</span>
            <span>High</span>
          </div>
        </div>
      </div>
    </aside>
  )
}

function Row({
  label,
  value,
  valueClass,
}: {
  label: string
  value: string
  valueClass: string
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className={`font-mono font-semibold tabular-nums ${valueClass}`}>{value}</span>
    </div>
  )
}
