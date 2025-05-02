import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

interface UserProfileProps {
  userId: string
}

export function UserProfile({ userId }: UserProfileProps) {
  // In a real app, you would fetch user data based on userId
  const user = {
    id: userId,
    name: "John Doe",
    phone: "+91 8779171731",
    email: "john.doe@example.com",
    joinedDate: "May 15, 2023",
    course: "Mindset Training",
    status: "active",
    avatar: "/placeholder.svg?height=128&width=128",
    initials: "JD",
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
        <CardDescription>User information and details</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4">
        <Avatar className="h-24 w-24">
          <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
          <AvatarFallback className="text-2xl">{user.initials}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col items-center gap-1">
          <h3 className="text-xl font-semibold">{user.name}</h3>
          <Badge variant={user.status === "active" ? "default" : "secondary"}>
            {user.status === "active" ? "Active" : "Completed"}
          </Badge>
        </div>
        <div className="w-full space-y-2">
          <div className="flex justify-between">
            <span className="text-sm font-medium text-muted-foreground">Phone</span>
            <span className="text-sm">{user.phone}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm font-medium text-muted-foreground">Email</span>
            <span className="text-sm">{user.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm font-medium text-muted-foreground">Joined</span>
            <span className="text-sm">{user.joinedDate}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm font-medium text-muted-foreground">Course</span>
            <span className="text-sm">{user.course}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
