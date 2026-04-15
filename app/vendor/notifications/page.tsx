import { NotificationsList } from "@/components/shared/notifications-list"
import { createClient } from "@/lib/supabase/server"

export default async function VendorNotificationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let notifications: any[] = []
  
  if (user) {
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      
    if (data) {
      notifications = data
    }
  }

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
        <p className="text-muted-foreground">
          Stay updated on issues, contracts, and SLA alerts
        </p>
      </div>
      <NotificationsList notifications={notifications} />
    </div>
  )
}
