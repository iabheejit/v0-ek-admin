import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PlusCircle, Search } from "lucide-react"

export function ContentHeader() {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Content Management</h1>
        <p className="text-muted-foreground">Create and manage course content</p>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input type="search" placeholder="Search content..." className="w-full pl-8 sm:w-[300px]" />
        </div>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          New Course
        </Button>
      </div>
    </div>
  )
}
