import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function RecentActivity() {
  const activities = [
    {
      id: 1,
      user: "John Doe",
      action: "completed Day 3 Module 2",
      time: "5 minutes ago",
      avatar: "/placeholder.svg?height=32&width=32",
      initials: "JD",
    },
    {
      id: 2,
      user: "Sarah Smith",
      action: "answered a question in Day 2 Module 4",
      time: "15 minutes ago",
      avatar: "/placeholder.svg?height=32&width=32",
      initials: "SS",
    },
    {
      id: 3,
      user: "Michael Brown",
      action: "started Day 1",
      time: "32 minutes ago",
      avatar: "/placeholder.svg?height=32&width=32",
      initials: "MB",
    },
    {
      id: 4,
      user: "Emily Johnson",
      action: "completed the course",
      time: "1 hour ago",
      avatar: "/placeholder.svg?height=32&width=32",
      initials: "EJ",
    },
    {
      id: 5,
      user: "David Wilson",
      action: "sent feedback on Day 4",
      time: "2 hours ago",
      avatar: "/placeholder.svg?height=32&width=32",
      initials: "DW",
    },
  ]

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Latest user interactions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-center gap-4">
              <Avatar className="h-8 w-8">
                <AvatarImage src={activity.avatar || "/placeholder.svg"} alt={activity.user} />
                <AvatarFallback>{activity.initials}</AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-none">{activity.user}</p>
                <p className="text-sm text-muted-foreground">{activity.action}</p>
              </div>
              <div className="text-xs text-muted-foreground">{activity.time}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
