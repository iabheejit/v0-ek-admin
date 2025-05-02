import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardCards } from "@/components/dashboard/dashboard-cards"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { CompletionChart } from "@/components/dashboard/completion-chart"

export default function Home() {
  return (
    <div className="flex flex-col gap-6">
      <DashboardHeader />
      <DashboardCards />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <CompletionChart />
        <RecentActivity />
      </div>
    </div>
  )
}
