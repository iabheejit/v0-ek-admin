"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Send } from "lucide-react"
import { userApi } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"

interface Message {
  id: number
  sender: "system" | "user"
  content: string
  timestamp: string
}

interface UserMessagesProps {
  userId: string
}

export function UserMessages({ userId }: UserMessagesProps) {
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setLoading(true)
        const data = await userApi.getUserMessages(userId)
        setMessages(data.messages)
      } catch (err) {
        console.error("Failed to fetch messages:", err)
        // Fallback to mock data for demo purposes
        setMessages([
          {
            id: 1,
            sender: "system",
            content: "Welcome to Day 3 of your Mindset Training course!",
            timestamp: "10:15 AM",
          },
          {
            id: 2,
            sender: "user",
            content: "Thank you! I'm excited to continue learning.",
            timestamp: "10:17 AM",
          },
          {
            id: 3,
            sender: "system",
            content: "Let's start with Module 1: Advanced Techniques",
            timestamp: "10:18 AM",
          },
          {
            id: 4,
            sender: "user",
            content: "The video was very helpful. I learned a lot!",
            timestamp: "10:45 AM",
          },
          {
            id: 5,
            sender: "system",
            content: "Great! Now let's move on to Module 2: Case Studies",
            timestamp: "10:46 AM",
          },
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchMessages()
  }, [userId])

  const handleSendMessage = async () => {
    if (message.trim()) {
      try {
        setSending(true)
        await userApi.sendMessage(userId, message)

        // Optimistically update the UI
        const newMessage = {
          id: Date.now(),
          sender: "system" as const,
          content: message,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        }

        setMessages([...messages, newMessage])
        setMessage("")

        toast({
          title: "Message sent",
          description: "Your message has been sent successfully.",
        })
      } catch (err) {
        console.error("Failed to send message:", err)
        toast({
          title: "Failed to send message",
          description: "Please try again later.",
          variant: "destructive",
        })
      } finally {
        setSending(false)
      }
    }
  }

  if (loading) {
    return <MessagesCardSkeleton />
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Message History</CardTitle>
        <CardDescription>Recent conversations with the user</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-3 ${msg.sender === "user" ? "justify-end" : ""}`}>
              {msg.sender !== "user" && (
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/placeholder.svg?height=32&width=32" alt="System" />
                  <AvatarFallback>SY</AvatarFallback>
                </Avatar>
              )}
              <div
                className={`rounded-lg px-4 py-2 ${
                  msg.sender === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                }`}
              >
                <div className="space-y-1">
                  <p className="text-sm">{msg.content}</p>
                  <p className="text-xs text-muted-foreground">{msg.timestamp}</p>
                </div>
              </div>
              {msg.sender === "user" && (
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/placeholder.svg?height=32&width=32" alt="User" />
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-center gap-2">
          <Textarea
            placeholder="Type your message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="min-h-[80px]"
            disabled={sending}
          />
          <Button
            size="icon"
            className="h-[80px] shrink-0"
            onClick={handleSendMessage}
            disabled={sending || !message.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}

function MessagesCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Message History</CardTitle>
        <CardDescription>Recent conversations with the user</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className={`flex gap-3 ${i % 2 === 1 ? "justify-end" : ""}`}>
              {i % 2 === 0 && <Skeleton className="h-8 w-8 rounded-full" />}
              <Skeleton className={`h-16 w-[70%] rounded-lg`} />
              {i % 2 === 1 && <Skeleton className="h-8 w-8 rounded-full" />}
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-center gap-2">
          <Skeleton className="h-[80px] w-full" />
          <Skeleton className="h-[80px] w-10" />
        </div>
      </CardFooter>
    </Card>
  )
}
