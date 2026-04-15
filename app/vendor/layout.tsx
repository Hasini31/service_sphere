import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { VendorSidebar } from "@/components/vendor/sidebar"

export default async function VendorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  if (profile?.role === "company" || profile?.role === "client") {
    redirect("/client/dashboard")
  }

  return (
    <div className="flex h-screen bg-[#f1f1f1]">
      <VendorSidebar profile={profile} />
      <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-10">
        <div className="min-h-full w-full rounded-[2.5rem] bg-background shadow-2xl shadow-black/5 ring-1 ring-black/5 overflow-hidden">
          <div className="px-8 py-4 lg:px-12 lg:py-6">
            {children}
          </div>
        </div>
      </main>
    </div>
  )
}
