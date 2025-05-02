import { ContentHeader } from "@/components/content/content-header"
import { ContentManager } from "@/components/content/content-manager"

export default function ContentPage() {
  return (
    <div className="flex flex-col gap-6">
      <ContentHeader />
      <ContentManager />
    </div>
  )
}
