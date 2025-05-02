<<<<<<< HEAD
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
=======
"use client"

import { useState, useEffect } from "react"
import { analyticsService } from "@/lib/services/analytics-service"

export default function Dashboard() {
  const [metrics, setMetrics] = useState({
    total_users: 0,
    new_users_percent: 0,
    active_courses: 0,
    messages_sent: 0,
    completion_rate: 0,
  })

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true)
        const dashboardMetrics = await analyticsService.getDashboardMetrics()
        setMetrics(dashboardMetrics)
        setError(null)
      } catch (err) {
        console.error("Error fetching dashboard data:", err)
        setError("Failed to load dashboard data. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">WhatsApp Education Dashboard</h1>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-sm font-medium text-gray-500 mb-2">Total Users</h2>
          <div className="text-3xl font-bold">{loading ? "..." : metrics.total_users}</div>
          <p className="text-sm text-gray-500">+{loading ? "..." : metrics.new_users_percent}% from last month</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-sm font-medium text-gray-500 mb-2">Active Courses</h2>
          <div className="text-3xl font-bold">{loading ? "..." : metrics.active_courses}</div>
          <p className="text-sm text-gray-500">+2 new courses this month</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-sm font-medium text-gray-500 mb-2">Messages Sent Today</h2>
          <div className="text-3xl font-bold">{loading ? "..." : metrics.messages_sent}</div>
          <p className="text-sm text-gray-500">+8% from yesterday</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-sm font-medium text-gray-500 mb-2">Completion Rate</h2>
          <div className="text-3xl font-bold">{loading ? "..." : metrics.completion_rate}%</div>
          <p className="text-sm text-gray-500">+5% from last month</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-xl font-semibold mb-4">Migration Status</h2>
        <p className="mb-4">
          Your database schema has been successfully created in Supabase. Use the migration utilities to import your
          data from Airtable.
        </p>
        <div className="flex space-x-4">
          <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Start Migration</button>
          <button className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50">View Migration Guide</button>
        </div>
>>>>>>> 1970ee7 (Initial commit)
      </div>
    </div>
  )
}
