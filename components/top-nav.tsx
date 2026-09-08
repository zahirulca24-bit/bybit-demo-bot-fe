'use client'

import { useEffect, useState } from 'react'
import {
  Search,
  Bell,
  Wallet,
  ChevronDown,
  CandlestickChart as LogoIcon,
} from 'lucide-react'

const TABS = ['Summary', 'Live Chart', 'Technical Analysis', 'Fundamentals', 'News', 'Notes']

export function TopNav() {
  const [active, setActive] = useState('Live Chart')
  const [wallet, setWallet] = useState<number | null>(null)

  useEffect(() => {
    let live = true
    const pick = (v: any): number | null => {
      if (typeof v === 'number' && Number.isFinite(v)) return v
      if (typeof v === 'string' && v.trim() !== '' && Number.isFinite(Number(v))) return Number(v)
      if (v && typeof v === 'object') {
        for (const k of ['walletBalance','totalWalletBalance','balance','equity','totalEquity']) {
          const n = pick(v[k]); if (n !== null) return n
        }
        for (const x of Object.values(v)) { const n = pick(x); if (n !== null) return n }
      }
      return null
    }
    const load = async () => {
      try {
        const r = await fetch('/api/wallet', { cache: 'no-store' })
        if (!r.ok) return
        const j = await r.json()
        const n = pick(j)
        if (live && n !== null) setWallet(n)
      } catch {}
    }
    load(); const id = setInterval(load, 10000)
    return () => { live = false; clearInterval(id) }
  }, [])

  return (
    <header className="flex h-16 items-center gap-4 border-b border-border bg-surface/60 px-4 backdrop-blur">
      <div className="flex items-center gap-2 pr-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 text-primary ring-1 ring-primary/30">
          <LogoIcon className="h-4 w-4" />
        </span>
        <span className="text-[15px] font-semibold tracking-tight">BYBIT TERM</span>
      </div>

      <div className="relative hidden max-w-md flex-1 md:block">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          placeholder="Search markets, symbols, news…"
          className="h-9 w-full rounded-lg border border-border bg-background/60 pl-9 pr-16 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary/50 focus:ring-1 focus:ring-primary/30"
        />
        <kbd className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
          ⌘K
        </kbd>
      </div>

      <nav className="hidden items-center gap-1 xl:flex">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActive(tab)}
            className={`rounded-md px-3 py-1.5 text-[13px] font-medium transition-colors ${
              active === tab
                ? 'bg-primary/15 text-primary'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            {tab}
          </button>
        ))}
      </nav>

      <div className="ml-auto flex items-center gap-2">
        <button
          aria-label="Notifications"
          className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background/60 text-muted-foreground transition-colors hover:text-foreground"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-primary" />
        </button>

        <div className="hidden items-center gap-2 rounded-lg border border-border bg-background/60 px-3 py-1.5 sm:flex">
          <Wallet className="h-4 w-4 text-muted-foreground" />
          <div className="leading-tight">
            <div className="font-mono text-sm font-semibold tabular-nums">{wallet === null ? '—' : wallet.toLocaleString(undefined, { style: 'currency', currency: 'USD' })}</div>
          </div>
          <span className="flex items-center gap-1 rounded-md bg-muted px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground">
            USD <ChevronDown className="h-3 w-3" />
          </span>
        </div>

        <button className="flex items-center gap-2 rounded-lg border border-border bg-background/60 py-1 pl-1 pr-2.5 transition-colors hover:border-primary/40">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/20 text-xs font-semibold text-primary">
            MR
          </span>
          <span className="hidden text-left leading-tight sm:block">
            <span className="block text-[13px] font-medium">Demo Trading</span>
            <span className="block font-mono text-[10px] text-muted-foreground">
              Bybit Unified
            </span>
          </span>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
      </div>
    </header>
  )
}
