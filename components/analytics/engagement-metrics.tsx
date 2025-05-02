"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Line, LineChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "@/components/ui/chart"

export function EngagementMetrics() {
  const data = [
    { date: "Mon", activeUsers: 120, messages: 450 },
    { date: "Tue", activeUsers: 132, messages: 489 },
    { date: "Wed", activeUsers: 145, messages: 521 },
    { date: "Thu", activeUsers: 140, messages: 510 },
    { date: "Fri", activeUsers: 135, messages: 498 },
    { date: "Sat", activeUsers: 110, messages: 380 },
    { date: "Sun", activeUsers: 105, messages: 370 },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily Engagement</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Line yAxisId="left" type="monotone" dataKey="activeUsers" stroke="#8884d8" name="Active Users" />
              <Line yAxisId="right" type="monotone" dataKey="messages" stroke="#82ca9d" name="Messages" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
