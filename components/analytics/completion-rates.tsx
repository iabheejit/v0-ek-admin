"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "@/components/ui/chart"

export function CompletionRates() {
  const data = [
    {
      name: "Day 1",
      completed: 92,
      inProgress: 5,
      notStarted: 3,
    },
    {
      name: "Day 2",
      completed: 85,
      inProgress: 10,
      notStarted: 5,
    },
    {
      name: "Day 3",
      completed: 70,
      inProgress: 15,
      notStarted: 15,
    },
    {
      name: "Day 4",
      completed: 55,
      inProgress: 20,
      notStarted: 25,
    },
    {
      name: "Day 5",
      completed: 40,
      inProgress: 15,
      notStarted: 45,
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Completion Rates by Day</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="completed" stackId="a" fill="#4ade80" name="Completed" />
              <Bar dataKey="inProgress" stackId="a" fill="#60a5fa" name="In Progress" />
              <Bar dataKey="notStarted" stackId="a" fill="#e5e7eb" name="Not Started" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
