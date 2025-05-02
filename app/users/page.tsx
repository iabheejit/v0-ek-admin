import { UsersList } from "@/components/users/users-list"
import { UsersHeader } from "@/components/users/users-header"

export default function UsersPage() {
  return (
    <div className="flex flex-col gap-6">
      <UsersHeader />
      <UsersList />
    </div>
  )
}
