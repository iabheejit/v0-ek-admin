"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MoreHorizontal, MessageSquare } from "lucide-react"
import Link from "next/link"
import { userApi } from "@/lib/api"
import { Skeleton } from "@/components/ui/skeleton"

interface User {
  id: string
  name: string
  phone: string
  currentDay: number
  currentModule: number
  lastActive: string
  status: string
  avatar?: string
  initials: string
}

export function UsersList() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true)
        const data = await userApi.getUsers()
        setUsers(data.users)
        setError(null)
      } catch (err) {
        console.error("Failed to fetch users:", err)
        setError("Failed to load users. Please try again later.")
        // Fallback to mock data for demo purposes
        setUsers([
          {
            id: "1",
            name: "John Doe",
            phone: "+91 8779171731",
            currentDay: 3,
            currentModule: 2,
            lastActive: "5 minutes ago",
            status: "active",
            initials: "JD",
          },
          {
            id: "2",
            name: "Sarah Smith",
            phone: "+91 9876543210",
            currentDay: 2,
            currentModule: 4,
            lastActive: "15 minutes ago",
            status: "active",
            initials: "SS",
          },
          {
            id: "3",
            name: "Michael Brown",
            phone: "+91 8765432109",
            currentDay: 1,
            currentModule: 1,
            lastActive: "32 minutes ago",
            status: "active",
            initials: "MB",
          },
          {
            id: "4",
            name: "Emily Johnson",
            phone: "+91 7654321098",
            currentDay: 4,
            currentModule: 0,
            lastActive: "1 hour ago",
            status: "completed",
            initials: "EJ",
          },
          {
            id: "5",
            name: "David Wilson",
            phone: "+91 6543210987",
            currentDay: 4,
            currentModule: 3,
            lastActive: "2 hours ago",
            status: "active",
            initials: "DW",
          },
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [])

  if (loading) {
    return <UsersListSkeleton />
  }

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Progress</TableHead>
            <TableHead>Last Active</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[80px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={user.avatar || "/placeholder.svg?height=40&width=40"} alt={user.name} />
                    <AvatarFallback>{user.initials}</AvatarFallback>
                  </Avatar>
                  <div>
                    <Link href={`/users/${user.id}`} className="font-medium hover:underline">
                      {user.name}
                    </Link>
                  </div>
                </div>
              </TableCell>
              <TableCell>{user.phone}</TableCell>
              <TableCell>
                Day {user.currentDay}
                {user.currentModule > 0 && ` - Module ${user.currentModule}`}
              </TableCell>
              <TableCell>{user.lastActive}</TableCell>
              <TableCell>
                <Badge variant={user.status === "active" ? "default" : "secondary"}>
                  {user.status === "active" ? "Active" : "Completed"}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center justify-end gap-2">
                  <Button variant="ghost" size="icon" asChild>
                    <Link href={`/users/${user.id}/messages`}>
                      <MessageSquare className="h-4 w-4" />
                    </Link>
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href={`/users/${user.id}`}>View Profile</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/users/${user.id}/messages`}>Send Message</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem>Reset Progress</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

function UsersListSkeleton() {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Progress</TableHead>
            <TableHead>Last Active</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[80px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 5 }).map((_, i) => (
            <TableRow key={i}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <Skeleton className="h-4 w-[120px]" />
                </div>
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-[120px]" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-[80px]" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-[100px]" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-6 w-[80px] rounded-full" />
              </TableCell>
              <TableCell>
                <div className="flex items-center justify-end gap-2">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-8 w-8 rounded-full" />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
