'use client'

import { TopNav } from '@/components/top-nav'
import { LeftSidebar } from '@/components/left-sidebar'
import { ChartWorkspace } from '@/components/chart-workspace'
import { OrderPanel } from '@/components/order-panel'

export default function Page() {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background text-foreground">
      <TopNav />
      <div className="flex min-h-0 flex-1 overflow-hidden">
        <LeftSidebar />
        <main className="flex min-w-0 flex-1 gap-3 overflow-hidden p-3">
          <ChartWorkspace />
          <div className="hidden xl:block">
            <OrderPanel />
          </div>
        </main>
      </div>
    </div>
  )
}
