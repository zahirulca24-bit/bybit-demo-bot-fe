'use client'

import { fmtSigned, type Breadth } from '@/lib/instruments'

export function BreadthCard({ breadth }: { breadth: Breadth }) {
  const advPct = (breadth.advancers / breadth.total) * 100

  return (
    <div className="flex flex-col gap-3 bg-surface p-4">
      <h2 className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
        Market Breadth
      </h2>

      {/* advancers vs decliners */}
      <div>
        <div className="mb-1 flex justify-between font-mono text-[11px]">
          <span className="text-bull">{breadth.advancers} Adv</span>
          <span className="text-bear">{breadth.decliners} Dec</span>
        </div>
        <div className="flex h-2 overflow-hidden rounded-full bg-bear/40">
          <div className="h-full bg-bull" style={{ width: `${advPct}%` }} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-md border border-border bg-border">
        <div className="bg-background p-2.5">
          <div className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
            Avg RSI
          </div>
          <div className="font-mono text-lg font-semibold tabular-nums text-foreground">
            {breadth.avgRsi.toFixed(1)}
          </div>
        </div>
        <div className="bg-background p-2.5">
          <div className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
            Signals
          </div>
          <div className="font-mono text-sm font-semibold tabular-nums">
            <span className="text-bull">{breadth.bullish}▲</span>{' '}
            <span className="text-bear">{breadth.bearish}▼</span>
          </div>
        </div>
        <div className="bg-background p-2.5">
          <div className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
            Top Gainer
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-[13px] font-semibold text-foreground">
              {breadth.topGainer.symbol}
            </span>
            <span className="font-mono text-[11px] tabular-nums text-bull">
              {fmtSigned(breadth.topGainer.changePct, 2)}%
            </span>
          </div>
        </div>
        <div className="bg-background p-2.5">
          <div className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
            Top Loser
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-[13px] font-semibold text-foreground">
              {breadth.topLoser.symbol}
            </span>
            <span className="font-mono text-[11px] tabular-nums text-bear">
              {fmtSigned(breadth.topLoser.changePct, 2)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
