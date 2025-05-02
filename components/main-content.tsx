import type React from "react"
import { useSidebar } from "@/components/ui/sidebar"
import { SidebarTrigger } from "@/components/ui/sidebar"

export function MainContent({ children }: { children: React.ReactNode }) {
  const { isMobile } = useSidebar()

  return (
    <main className="flex-1 overflow-auto">
      <div className="container py-6">
        {isMobile && (
          <div className="mb-4">
            <SidebarTrigger />
          </div>
        )}
        {children}
      </div>
    </main>
  )
}
