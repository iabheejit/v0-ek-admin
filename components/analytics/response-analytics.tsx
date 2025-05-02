"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Pie, PieChart, Cell, ResponsiveContainer, Legend, Tooltip } from "@/components/ui/chart"

export function ResponseAnalytics() {
  const questionData = [
    {
      id: 1,
      question: "What is the most important aspect of mindset training?",
      correctAnswer: "Consistency",
      correctResponses: 78,
      incorrectResponses: 22,
      day: 1,
      module: 2,
    },
    {
      id: 2,
      question: "Which of the following is NOT a key habit for success?",
      correctAnswer: "Multitasking",
      correctResponses: 65,
      incorrectResponses: 35,
      day: 2,
      module: 1,
    },
    {
      id: 3,
      question: "What is the recommended daily practice duration?",
      correctAnswer: "15-20 minutes",
      correctResponses: 82,
      incorrectResponses: 18,
      day: 2,
      module: 3,
    },
    {
      id: 4,
      question: "Which technique is most effective for overcoming challenges?",
      correctAnswer: "Reframing",
      correctResponses: 58,
      incorrectResponses: 42,
      day: 3,
      module: 1,
    },
    {
      id: 5,
      question: "What percentage of success is attributed to mindset?",
      correctAnswer: "80%",
      correctResponses: 70,
      incorrectResponses: 30,
      day: 3,
      module: 2,
    },
  ]

  const COLORS = ["#4ade80", "#f87171"]

  const pieData = [
    { name: "Correct", value: 70.6 },
    { name: "Incorrect", value: 29.4 },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Question Response Analytics</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="table">
          <TabsList className="mb-4 grid w-full grid-cols-2">
            <TabsTrigger value="table">Table View</TabsTrigger>
            <TabsTrigger value="chart">Chart View</TabsTrigger>
          </TabsList>
          <TabsContent value="table">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Question</TableHead>
                  <TableHead>Day/Module</TableHead>
                  <TableHead>Correct Answer</TableHead>
                  <TableHead className="text-right">Correct %</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {questionData.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.question}</TableCell>
                    <TableCell>
                      Day {item.day} - Module {item.module}
                    </TableCell>
                    <TableCell>{item.correctAnswer}</TableCell>
                    <TableCell className="text-right">
                      {Math.round((item.correctResponses / (item.correctResponses + item.incorrectResponses)) * 100)}%
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>
          <TabsContent value="chart">
            <div className="flex h-[300px] items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
