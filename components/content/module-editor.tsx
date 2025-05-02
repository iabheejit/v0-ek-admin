"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Save, Upload, Plus, Trash2 } from "lucide-react"

interface ModuleEditorProps {
  courseId: string
  day: number
  module: number
}

export function ModuleEditor({ courseId, day, module }: ModuleEditorProps) {
  // In a real app, you would fetch module data based on courseId, day, and module
  const [moduleData, setModuleData] = useState({
    title: `Module ${module}: ${module === 1 ? "Introduction" : module === 2 ? "Setting Goals" : "Mindset Basics"}`,
    text: "Welcome to this module! In this session, we'll explore the fundamentals of mindset training and how it can transform your daily life.\n\nWe'll cover key concepts and practical exercises that you can implement immediately.",
    question: "What is the most important aspect of mindset training?",
    options: ["Positive thinking", "Consistency", "Self-awareness", "Goal setting"],
    correctAnswer: "Consistency",
    mediaFiles: [
      { id: 1, name: "mindset_intro.jpg", type: "image" },
      { id: 2, name: "training_video.mp4", type: "video" },
    ],
  })

  const handleSave = () => {
    // In a real app, you would save the module data to the backend
    console.log("Saving module data:", moduleData)
  }

  return (
    <Tabs defaultValue="content">
      <TabsList className="mb-4 grid w-full grid-cols-4">
        <TabsTrigger value="content">Content</TabsTrigger>
        <TabsTrigger value="questions">Questions</TabsTrigger>
        <TabsTrigger value="media">Media</TabsTrigger>
        <TabsTrigger value="settings">Settings</TabsTrigger>
      </TabsList>

      <TabsContent value="content" className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Module Title</Label>
          <Input
            id="title"
            value={moduleData.title}
            onChange={(e) => setModuleData({ ...moduleData, title: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="content">Module Content</Label>
          <Textarea
            id="content"
            value={moduleData.text}
            onChange={(e) => setModuleData({ ...moduleData, text: e.target.value })}
            className="min-h-[200px]"
          />
        </div>
        <Button onClick={handleSave}>
          <Save className="mr-2 h-4 w-4" />
          Save Changes
        </Button>
      </TabsContent>

      <TabsContent value="questions" className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="question">Question</Label>
          <Textarea
            id="question"
            value={moduleData.question}
            onChange={(e) => setModuleData({ ...moduleData, question: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Answer Options</Label>
            <Button variant="outline" size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Option
            </Button>
          </div>
          <div className="space-y-2">
            {moduleData.options.map((option, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  value={option}
                  onChange={(e) => {
                    const newOptions = [...moduleData.options]
                    newOptions[index] = e.target.value
                    setModuleData({ ...moduleData, options: newOptions })
                  }}
                />
                <Button variant="ghost" size="icon">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="correct-answer">Correct Answer</Label>
          <Select
            value={moduleData.correctAnswer}
            onValueChange={(value) => setModuleData({ ...moduleData, correctAnswer: value })}
          >
            <SelectTrigger id="correct-answer">
              <SelectValue placeholder="Select the correct answer" />
            </SelectTrigger>
            <SelectContent>
              {moduleData.options.map((option, index) => (
                <SelectItem key={index} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={handleSave}>
          <Save className="mr-2 h-4 w-4" />
          Save Changes
        </Button>
      </TabsContent>

      <TabsContent value="media" className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Media Files</Label>
            <Button>
              <Upload className="mr-2 h-4 w-4" />
              Upload Media
            </Button>
          </div>
          <div className="space-y-2">
            {moduleData.mediaFiles.map((file) => (
              <div key={file.id} className="flex items-center justify-between rounded-md border p-2">
                <div className="flex items-center gap-2">
                  <div className="rounded-md bg-muted p-2">
                    {file.type === "image" ? (
                      <img src="/placeholder.svg?height=32&width=32" alt={file.name} className="h-8 w-8 object-cover" />
                    ) : (
                      <video src="#" className="h-8 w-8 object-cover"></video>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{file.type}</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
        <Button onClick={handleSave}>
          <Save className="mr-2 h-4 w-4" />
          Save Changes
        </Button>
      </TabsContent>

      <TabsContent value="settings" className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="module-type">Module Type</Label>
          <Select defaultValue="text">
            <SelectTrigger id="module-type">
              <SelectValue placeholder="Select module type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="text">Text</SelectItem>
              <SelectItem value="interactive">Interactive</SelectItem>
              <SelectItem value="quiz">Quiz</SelectItem>
              <SelectItem value="media">Media</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="next-action">Next Action</Label>
          <Select defaultValue="next-module">
            <SelectTrigger id="next-action">
              <SelectValue placeholder="Select next action" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="next-module">Next Module</SelectItem>
              <SelectItem value="finish-day">Finish Day</SelectItem>
              <SelectItem value="custom">Custom Message</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={handleSave}>
          <Save className="mr-2 h-4 w-4" />
          Save Changes
        </Button>
      </TabsContent>
    </Tabs>
  )
}
