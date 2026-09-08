'use client'

import { fmtPrice, fmtSigned, type Instrument } from '@/lib/instruments'

export function TickerTape({ universe }: { universe: Instrument[] }) {
  const row = [...universe, ...universe]
  return (
    <div className="relative flex h-9 items-center overflow-hidden border-b border-border bg-surface">
      <div className="animate-ticker flex shrink-0 items-center whitespace-nowrap">
        {row.map((i, idx) => {
          const up = i.changePct >= 0
          return (
            <span
              key={`${i.symbol}-${idx}`}
              className="flex items-center gap-2 px-4 font-mono text-xs"
            >
              <span className="font-semibold text-foreground">{i.symbol}</span>
              <span className="text-muted-foreground">{fmtPrice(i.price, i.decimals)}</span>
              <span className={up ? 'text-bull' : 'text-bear'}>
                {fmtSigned(i.changePct, 2)}%
              </span>
              <span className="text-border-strong">|</span>
            </span>
          )
        })}
      </div>
    </div>
  )
}
