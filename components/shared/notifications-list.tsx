"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Bell, Check, CheckCheck, Trash2, FileText, AlertCircle, Star } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import type { Notification } from "@/lib/types"
import { formatDistanceToNow } from "date-fns"

interface NotificationsListProps {
  notifications: Notification[]
}

const typeIcons: Record<string, typeof Bell> = {
  contract: FileText,
  issue: AlertCircle,
  rating: Star,
  default: Bell,
}

const typeColors: Record<string, string> = {
  contract: "bg-blue-100 text-blue-600",
  issue: "bg-orange-100 text-orange-600",
  rating: "bg-yellow-100 text-yellow-600",
  default: "bg-primary/10 text-primary",
}

export function NotificationsList({ notifications }: NotificationsListProps) {
  const router = useRouter()
  const [isMarkingAll, setIsMarkingAll] = useState(false)

  const markAsRead = async (notificationId: string) => {
    const supabase = createClient()
    await supabase
      .from("notifications")
      .update({ read: true })
      .eq("id", notificationId)
    
    router.refresh()
  }

  const markAllAsRead = async () => {
    setIsMarkingAll(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) return

      await supabase
        .from("notifications")
        .update({ read: true })
        .eq("user_id", user.id)
        .eq("read", false)

      toast.success("All notifications marked as read")
      router.refresh()
    } catch {
      toast.error("Failed to mark notifications as read")
    } finally {
      setIsMarkingAll(false)
    }
  }

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <div>
      {notifications.length > 0 && unreadCount > 0 && (
        <div className="mb-4 flex justify-end">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={markAllAsRead}
            disabled={isMarkingAll}
          >
            <CheckCheck className="mr-2 h-4 w-4" />
            Mark all as read
          </Button>
        </div>
      )}

      {notifications.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Bell className="mx-auto mb-4 h-12 w-12 text-muted-foreground opacity-50" />
            <p className="text-lg text-muted-foreground">No notifications yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification, index) => {
            const Icon = typeIcons[notification.type] || typeIcons.default
            const colorClass = typeColors[notification.type] || typeColors.default

            return (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
              >
                <Card 
                  className={`transition-colors ${!notification.read ? "bg-primary/5 border-primary/20" : ""}`}
                >
                  <CardContent className="flex items-start gap-4 p-4">
                    <div className={`rounded-full p-2 ${colorClass}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium text-foreground">{notification.title}</h4>
                          <p className="mt-1 text-sm text-muted-foreground">{notification.message}</p>
                        </div>
                        {!notification.read && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => markAsRead(notification.id)}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      <p className="mt-2 text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
