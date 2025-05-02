"use client"

import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChevronRight, Plus, File, Folder } from "lucide-react"

interface CourseTreeProps {
  courseId: string
  onSelectModule: (day: number, module: number) => void
  selectedModule: { day: number; module: number } | null
}

export function CourseTree({ courseId, onSelectModule, selectedModule }: CourseTreeProps) {
  // In a real app, you would fetch course structure based on courseId
  const courseDays = [
    {
      day: 1,
      modules: [
        { module: 1, title: "Introduction" },
        { module: 2, title: "Setting Goals" },
        { module: 3, title: "Mindset Basics" },
      ],
    },
    {
      day: 2,
      modules: [
        { module: 1, title: "Building Habits" },
        { module: 2, title: "Overcoming Challenges" },
        { module: 3, title: "Daily Practice" },
      ],
    },
    {
      day: 3,
      modules: [
        { module: 1, title: "Advanced Techniques" },
        { module: 2, title: "Case Studies" },
        { module: 3, title: "Group Exercises" },
      ],
    },
    {
      day: 4,
      modules: [
        { module: 1, title: "Review and Reflect" },
        { module: 2, title: "Application" },
        { module: 3, title: "Next Steps" },
      ],
    },
    {
      day: 5,
      modules: [
        { module: 1, title: "Final Assessment" },
        { module: 2, title: "Graduation" },
      ],
    },
  ]

  return (
    <ScrollArea className="h-[500px] pr-4">
      <div className="space-y-2">
        {courseDays.map((day) => (
          <Collapsible key={day.day} defaultOpen>
            <div className="flex items-center justify-between">
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="flex w-full items-center justify-start gap-2 p-2">
                  <ChevronRight className="h-4 w-4 shrink-0" />
                  <Folder className="h-4 w-4 shrink-0" />
                  <span>Day {day.day}</span>
                </Button>
              </CollapsibleTrigger>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <CollapsibleContent>
              <div className="ml-6 space-y-1">
                {day.modules.map((module) => (
                  <Button
                    key={module.module}
                    variant={
                      selectedModule?.day === day.day && selectedModule?.module === module.module
                        ? "secondary"
                        : "ghost"
                    }
                    size="sm"
                    className="flex w-full items-center justify-start gap-2 p-2"
                    onClick={() => onSelectModule(day.day, module.module)}
                  >
                    <File className="h-4 w-4 shrink-0" />
                    <span>
                      Module {module.module}: {module.title}
                    </span>
                  </Button>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        ))}
      </div>
    </ScrollArea>
  )
}
