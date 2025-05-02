import { AnalyticsHeader } from "@/components/analytics/analytics-header"
import { CompletionRates } from "@/components/analytics/completion-rates"
import { EngagementMetrics } from "@/components/analytics/engagement-metrics"
import { ResponseAnalytics } from "@/components/analytics/response-analytics"

export default function AnalyticsPage() {
  return (
    <div className="flex flex-col gap-6">
      <AnalyticsHeader />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <CompletionRates />
        <EngagementMetrics />
      </div>
      <ResponseAnalytics />
    </div>
  )
}
