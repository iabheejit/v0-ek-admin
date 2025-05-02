import { Button } from "@/components/ui/button"
import { ArrowLeft, MessageSquare } from "lucide-react"
import Link from "next/link"

interface UserHeaderProps {
  userId: string
}

export function UserHeader({ userId }: UserHeaderProps) {
  // In a real app, you would fetch user data based on userId
  const user = {
    id: userId,
    name: "John Doe",
    phone: "+91 8779171731",
  }

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/users">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{user.name}</h1>
          <p className="text-muted-foreground">{user.phone}</p>
        </div>
      </div>
      <Button>
        <MessageSquare className="mr-2 h-4 w-4" />
        Send Message
      </Button>
    </div>
  )
}
