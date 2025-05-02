"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CourseTree } from "@/components/content/course-tree"
import { ModuleEditor } from "@/components/content/module-editor"

export function ContentManager() {
  const [selectedCourse, setSelectedCourse] = useState("mindset-training")
  const [selectedModule, setSelectedModule] = useState<{
    day: number
    module: number
  } | null>(null)

  const courses = [
    { id: "mindset-training", name: "Mindset Training" },
    { id: "leadership-skills", name: "Leadership Skills" },
    { id: "communication", name: "Effective Communication" },
  ]

  return (
    <Tabs defaultValue={selectedCourse} onValueChange={setSelectedCourse}>
      <div className="flex flex-col gap-4">
        <TabsList className="grid w-full grid-cols-3">
          {courses.map((course) => (
            <TabsTrigger key={course.id} value={course.id}>
              {course.name}
            </TabsTrigger>
          ))}
        </TabsList>

        {courses.map((course) => (
          <TabsContent key={course.id} value={course.id} className="space-y-4">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <Card className="md:col-span-1">
                <CardHeader>
                  <CardTitle>Course Structure</CardTitle>
                  <CardDescription>Organize days and modules</CardDescription>
                </CardHeader>
                <CardContent>
                  <CourseTree
                    courseId={course.id}
                    onSelectModule={(day, module) => setSelectedModule({ day, module })}
                    selectedModule={selectedModule}
                  />
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>
                    {selectedModule ? `Day ${selectedModule.day} - Module ${selectedModule.module}` : "Module Editor"}
                  </CardTitle>
                  <CardDescription>
                    {selectedModule ? "Edit module content" : "Select a module to edit"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {selectedModule ? (
                    <ModuleEditor courseId={course.id} day={selectedModule.day} module={selectedModule.module} />
                  ) : (
                    <div className="flex h-[400px] items-center justify-center rounded-md border border-dashed">
                      <p className="text-sm text-muted-foreground">
                        Select a module from the course structure to edit its content
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        ))}
      </div>
    </Tabs>
  )
}
