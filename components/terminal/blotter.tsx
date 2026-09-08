'use client'

import { useState } from 'react'
import { fmtPrice, fmtSigned, fmtUsd, type Position } from '@/lib/instruments'

export function Blotter({
  positions,
  selected,
  onSelect,
}: {
  positions: Position[]
  selected: string
  onSelect: (symbol: string) => void
}) {
  const [tab, setTab] = useState<'positions' | 'orders'>('positions')
  const netPnl = positions.reduce((s, p) => s + p.pnl, 0)

  return (
    <div className="flex h-full flex-col bg-surface">
      <div className="flex items-center gap-1 border-b border-border px-1.5 py-1.5">
        {(['positions', 'orders'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-md px-3 py-1.5 text-xs font-semibold capitalize transition-colors ${
              tab === t ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {t}
            {t === 'positions' && (
              <span className="ml-1.5 rounded bg-muted px-1 font-mono text-[10px] text-muted-foreground">
                {positions.length}
              </span>
            )}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2 pr-2">
          <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            Net P/L
          </span>
          <span
            className={`font-mono text-sm font-semibold tabular-nums ${
              netPnl >= 0 ? 'text-bull' : 'text-bear'
            }`}
          >
            {netPnl >= 0 ? '+' : ''}
            {fmtUsd(netPnl)}
          </span>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-auto">
        {tab === 'positions' ? (
          <table className="w-full border-collapse text-[12px]">
            <thead className="sticky top-0 bg-surface">
              <tr className="border-b border-border font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                <th className="px-3 py-1.5 text-left font-medium">Symbol</th>
                <th className="px-3 py-1.5 text-left font-medium">Side</th>
                <th className="px-3 py-1.5 text-right font-medium">Qty</th>
                <th className="px-3 py-1.5 text-right font-medium">Entry</th>
                <th className="px-3 py-1.5 text-right font-medium">Mark</th>
                <th className="px-3 py-1.5 text-right font-medium">P/L (USD)</th>
                <th className="px-3 py-1.5 text-right font-medium">P/L %</th>
              </tr>
            </thead>
            <tbody>
              {positions.map((p) => {
                const win = p.pnl >= 0
                const active = p.symbol === selected
                return (
                  <tr
                    key={p.symbol}
                    onClick={() => onSelect(p.symbol)}
                    className={`cursor-pointer border-b border-border/50 transition-colors hover:bg-muted/30 ${
                      active ? 'bg-muted/40' : ''
                    }`}
                  >
                    <td className="px-3 py-2 font-semibold text-foreground">{p.symbol}</td>
                    <td className="px-3 py-2">
                      <span
                        className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                          p.side === 'Long' ? 'bg-bull-soft text-bull' : 'bg-bear-soft text-bear'
                        }`}
                      >
                        {p.side}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right font-mono tabular-nums text-muted-foreground">
                      {p.qty.toLocaleString('en-US')}
                    </td>
                    <td className="px-3 py-2 text-right font-mono tabular-nums text-muted-foreground">
                      {fmtPrice(p.entry, p.decimals)}
                    </td>
                    <td className="px-3 py-2 text-right font-mono tabular-nums text-foreground">
                      {fmtPrice(p.price, p.decimals)}
                    </td>
                    <td
                      className={`px-3 py-2 text-right font-mono tabular-nums ${
                        win ? 'text-bull' : 'text-bear'
                      }`}
                    >
                      {win ? '+' : ''}
                      {fmtUsd(p.pnl)}
                    </td>
                    <td
                      className={`px-3 py-2 text-right font-mono tabular-nums ${
                        win ? 'text-bull' : 'text-bear'
                      }`}
                    >
                      {fmtSigned(p.pnlPct, 2)}%
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        ) : (
          <div className="flex h-full items-center justify-center py-10 text-center text-[12px] text-muted-foreground">
            No working orders. Submit an order from the ticket to see it here.
          </div>
        )}
      </div>
    </div>
  )
}
