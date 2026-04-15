import { createClient } from "@/lib/supabase/server"
import { NotificationsList } from "@/components/shared/notifications-list"

export default async function NotificationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  // Fetch all notifications for this user
  const { data: notifications } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user?.id)
    .order("created_at", { ascending: false })

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Notifications</h1>
        <p className="text-muted-foreground">Stay updated with your contracts and issues.</p>
      </div>

      <NotificationsList notifications={notifications || []} />
    </div>
  )
}
