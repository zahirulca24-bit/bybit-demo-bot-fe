'use client'

import { useState } from 'react'
import {
  Compass,
  LineChart,
  Briefcase,
  ListOrdered,
  PieChart,
  Layers,
  Clock,
  Settings,
  LifeBuoy,
  type LucideIcon,
} from 'lucide-react'

type Item = { icon: LucideIcon; label: string }

const TOP: Item[] = [
  { icon: Compass, label: 'Discover' },
  { icon: LineChart, label: 'Charts' },
  { icon: Briefcase, label: 'Portfolio' },
  { icon: ListOrdered, label: 'Orders' },
  { icon: PieChart, label: 'Analytics' },
  { icon: Layers, label: 'Watchlists' },
  { icon: Clock, label: 'History' },
]

const BOTTOM: Item[] = [
  { icon: Settings, label: 'Settings' },
  { icon: LifeBuoy, label: 'Support' },
]

function NavButton({ item, active }: { item: Item; active: boolean }) {
  const Icon = item.icon
  return (
    <button
      className={`group relative flex h-10 w-10 items-center justify-center rounded-xl transition-colors ${
        active
          ? 'bg-primary/15 text-primary ring-1 ring-primary/30'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
      }`}
    >
      {active && (
        <span className="absolute -left-2.5 h-5 w-1 rounded-full bg-primary shadow-[0_0_10px_var(--primary)]" />
      )}
      <Icon className="h-[18px] w-[18px]" />
      <span className="pointer-events-none absolute left-12 z-20 whitespace-nowrap rounded-md border border-border bg-popover px-2 py-1 text-xs font-medium text-popover-foreground opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
        {item.label}
      </span>
    </button>
  )
}

export function LeftSidebar() {
  const [active] = useState('Charts')
  return (
    <aside className="flex w-14 shrink-0 flex-col items-center gap-1 border-r border-border bg-surface/60 py-3">
      {TOP.map((item) => (
        <NavButton key={item.label} item={item} active={item.label === active} />
      ))}
      <div className="mt-auto flex flex-col gap-1">
        {BOTTOM.map((item) => (
          <NavButton key={item.label} item={item} active={false} />
        ))}
      </div>
    </aside>
  )
}
