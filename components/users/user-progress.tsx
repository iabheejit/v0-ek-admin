"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Circle } from "lucide-react"

interface UserProgressProps {
  userId: string
}

export function UserProgress({ userId }: UserProgressProps) {
  // In a real app, you would fetch user progress data based on userId
  const progress = {
    currentDay: 3,
    currentModule: 2,
    totalDays: 5,
    completionPercentage: 52,
    modules: [
      { day: 1, module: 1, status: "completed", title: "Introduction" },
      { day: 1, module: 2, status: "completed", title: "Setting Goals" },
      { day: 1, module: 3, status: "completed", title: "Mindset Basics" },
      { day: 2, module: 1, status: "completed", title: "Building Habits" },
      { day: 2, module: 2, status: "completed", title: "Overcoming Challenges" },
      { day: 2, module: 3, status: "completed", title: "Daily Practice" },
      { day: 3, module: 1, status: "completed", title: "Advanced Techniques" },
      { day: 3, module: 2, status: "in-progress", title: "Case Studies" },
      { day: 3, module: 3, status: "pending", title: "Group Exercises" },
      { day: 4, module: 1, status: "pending", title: "Review and Reflect" },
      { day: 4, module: 2, status: "pending", title: "Application" },
      { day: 4, module: 3, status: "pending", title: "Next Steps" },
      { day: 5, module: 1, status: "pending", title: "Final Assessment" },
      { day: 5, module: 2, status: "pending", title: "Graduation" },
    ],
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Course Progress</CardTitle>
        <CardDescription>
          Day {progress.currentDay} - Module {progress.currentModule}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm font-medium">{progress.completionPercentage}% Complete</span>
              <span className="text-sm font-medium">
                Day {progress.currentDay}/{progress.totalDays}
              </span>
            </div>
            <Progress value={progress.completionPercentage} />
          </div>

          <div className="space-y-4">
            {Array.from({ length: progress.totalDays }).map((_, dayIndex) => {
              const dayNumber = dayIndex + 1
              const dayModules = progress.modules.filter((module) => module.day === dayNumber)

              return (
                <div key={dayNumber} className="space-y-2">
                  <h4 className="font-medium">Day {dayNumber}</h4>
                  <div className="space-y-2">
                    {dayModules.map((module) => (
                      <div
                        key={`${module.day}-${module.module}`}
                        className="flex items-center gap-2 rounded-md border p-2"
                      >
                        {module.status === "completed" ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : module.status === "in-progress" ? (
                          <Circle className="h-5 w-5 text-blue-500" />
                        ) : (
                          <Circle className="h-5 w-5 text-gray-300" />
                        )}
                        <span className="flex-1">
                          Module {module.module}: {module.title}
                        </span>
                        <Badge
                          variant={
                            module.status === "completed"
                              ? "success"
                              : module.status === "in-progress"
                                ? "default"
                                : "outline"
                          }
                        >
                          {module.status === "completed"
                            ? "Completed"
                            : module.status === "in-progress"
                              ? "In Progress"
                              : "Pending"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
