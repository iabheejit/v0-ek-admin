import { UserProfile } from "@/components/users/user-profile"
import { UserProgress } from "@/components/users/user-progress"
import { UserMessages } from "@/components/users/user-messages"
import { UserHeader } from "@/components/users/user-header"

export default function UserDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="flex flex-col gap-6">
      <UserHeader userId={params.id} />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="md:col-span-1">
          <UserProfile userId={params.id} />
        </div>
        <div className="md:col-span-2">
          <UserProgress userId={params.id} />
        </div>
      </div>
      <UserMessages userId={params.id} />
    </div>
  )
}
