import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"

export function DashboardHeader() {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your WhatsApp education platform</p>
      </div>
      <Button>
        <PlusCircle className="mr-2 h-4 w-4" />
        New Course
      </Button>
    </div>
  )
}
