'use client'

import { useEffect, useState } from 'react'
import { Search, Command, ChevronDown } from 'lucide-react'
import { ACCOUNT, fmtUsd } from '@/lib/instruments'

export function TerminalHeader() {
  const [clock, setClock] = useState('')

  useEffect(() => {
    const tick = () =>
      setClock(
        new Date().toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        }),
      )
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <header className="flex h-14 items-center gap-3 border-b border-border bg-surface px-4">
      <div className="flex items-center gap-2 pr-3">
        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <span className="font-mono text-sm font-bold">A</span>
        </span>
        <div className="leading-none">
          <div className="text-sm font-bold tracking-[0.18em] text-foreground">AXIS</div>
          <div className="mt-0.5 font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
            Terminal
          </div>
        </div>
      </div>

      <div className="relative hidden max-w-sm flex-1 md:block">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          placeholder="Search symbols, markets, orders…"
          className="h-9 w-full rounded-md border border-border bg-background pl-9 pr-14 text-sm outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-1 focus:ring-ring"
        />
        <kbd className="pointer-events-none absolute right-2.5 top-1/2 flex -translate-y-1/2 items-center gap-0.5 rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
          <Command className="h-2.5 w-2.5" />K
        </kbd>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <div className="hidden items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1.5 lg:flex">
          <span className="h-1.5 w-1.5 animate-live rounded-full bg-bull" />
          <span className="font-mono text-[11px] font-medium text-muted-foreground">LIVE</span>
          <span className="font-mono text-[11px] tabular-nums text-foreground">{clock || '--:--:--'}</span>
          <span className="font-mono text-[10px] text-muted-foreground">EDT</span>
        </div>

        <div className="hidden items-center gap-2 rounded-md border border-border bg-background px-3 py-1.5 sm:flex">
          <div className="leading-tight">
            <div className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
              Equity
            </div>
            <div className="font-mono text-sm font-semibold tabular-nums text-foreground">
              {fmtUsd(ACCOUNT.balance)}
            </div>
          </div>
          <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
            {ACCOUNT.currency}
          </span>
        </div>

        <button className="flex items-center gap-2 rounded-md border border-border bg-background py-1 pl-1 pr-2.5 transition-colors hover:border-border-strong">
          <span className="flex h-7 w-7 items-center justify-center rounded bg-accent/20 font-mono text-xs font-semibold text-accent">
            MR
          </span>
          <span className="hidden text-left leading-tight lg:block">
            <span className="block text-[12px] font-medium text-foreground">{ACCOUNT.name}</span>
            <span className="block font-mono text-[9px] text-muted-foreground">
              #{ACCOUNT.number}
            </span>
          </span>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
      </div>
    </header>
  )
}
