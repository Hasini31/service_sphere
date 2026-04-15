"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { Shield, Mail, Lock, Loader2, Building2, Wrench, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import type { UserRole } from "@/lib/types"

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [role, setRole] = useState<UserRole>("company")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const supabase = createClient()
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        // Broadened Safe Mode fallback for all known demo accounts
        const demoEmails = [
          'jordan@retailcorp.com', 'mia@finedge.com', 'omar@logitrack.com',
          'alex@technova.com', 'priya@cloudbridge.com', 'client1@demo.com', 'vendor1@demo.com'
        ]
        
        if ((email.includes('@demo.com') || demoEmails.includes(email)) && password === 'Demo@123') {
          console.warn("Supabase auth failed, falling back to Demo Mock Mode", authError)
          document.cookie = `demo_email=${email}; path=/; max-age=86400`
          const fallbackRole = (email.includes('vendor') || email.includes('alex') || email.includes('priya')) ? 'vendor' : 'company'
          toast.success("Login successful (Demo Mode)")
          router.push(fallbackRole === 'vendor' ? "/vendor/dashboard" : "/client/dashboard")
          return
        }
        
        toast.error(`Auth Error: ${authError.message}`)
        return
      }

      if (data?.user) {
        // Safe Mode: Try to fetch profile, but fallback to email-based role if DB fails
        try {
          const { data: profile, error: dbError } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", data.user.id)
            .maybeSingle()

          if (dbError) throw dbError

          const userRole = profile?.role || (email.includes('vendor') ? 'vendor' : 'company')
          toast.success("Login successful!")
          router.push(userRole === 'vendor' ? "/vendor/dashboard" : "/client/dashboard")
        } catch (err) {
          console.error("Database schema error, using fallback login:", err)
          const fallbackRole = email.includes('vendor') ? 'vendor' : 'company'
          toast.success("Login successful (Safe Mode)")
          router.push(fallbackRole === 'vendor' ? "/vendor/dashboard" : "/client/dashboard")
        }
      }
    } catch (err) {
      toast.error("A system error occurred")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-secondary/5 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="glass border-border/50">
          <CardHeader className="text-center">
            <Link href="/" className="mx-auto mb-4 flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
                <Shield className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">ServiceSphere</span>
            </Link>
            <CardTitle className="text-2xl">Welcome Back</CardTitle>
            <CardDescription>Sign in to your account to continue</CardDescription>
          </CardHeader>
          
          <CardContent>
            <Tabs value={role} onValueChange={(v) => setRole(v as UserRole)} className="mb-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="company" className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Company
                </TabsTrigger>
                <TabsTrigger value="vendor" className="flex items-center gap-2">
                  <Wrench className="h-4 w-4" />
                  Vendor
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col gap-4">
            {/* Expanded Demo Credentials */}
            <div className="w-full rounded-xl border-2 border-dashed border-primary/20 bg-muted/50 p-4">
              <p className="text-center text-[10px] font-black uppercase tracking-widest text-primary mb-3">Quick Login (Seeded Data)</p>
              
              <Tabs defaultValue="clients" className="w-full">
                <TabsList className="grid w-full grid-cols-2 h-8 bg-background/50">
                  <TabsTrigger value="clients" className="text-[10px] font-bold">Clients (6)</TabsTrigger>
                  <TabsTrigger value="vendors" className="text-[10px] font-bold">Vendors (5)</TabsTrigger>
                </TabsList>
                
                <TabsContent value="clients" className="mt-2 h-[150px] overflow-y-auto pr-1 thin-scrollbar">
                  <div className="space-y-1.5">
                    {[
                      { name: "Jordan (RetailCorp)", email: "jordan@retailcorp.com" },
                      { name: "Mia (FinEdge)", email: "mia@finedge.com" },
                      { name: "Omar (LogiTrack)", email: "omar@logitrack.com" },
                      { name: "Ops (RetailCorp Sol.)", email: "ops@retailcorp.net" },
                      { name: "Mgr (GrowthNexus)", email: "mgr@growthnexus.com" },
                      { name: "Lead (Apex Logistics)", email: "lead@apexlogistics.com" }
                    ].map((acc, i) => (
                      <div key={i} className="flex justify-between items-center p-2 rounded-lg bg-background border border-border/50 hover:border-primary/50 transition-colors">
                        <div className="min-w-0">
                          <p className="font-bold text-[10px]">{acc.name}</p>
                          <p className="text-[10px] text-muted-foreground truncate">{acc.email}</p>
                        </div>
                        <Button 
                          type="button" 
                          variant="secondary" 
                          size="sm"
                          className="h-7 text-[10px] font-bold px-3 ml-2"
                          onClick={() => {
                            setEmail(acc.email)
                            setPassword("Demo@123")
                            setRole("company")
                          }}
                        >
                          Use
                        </Button>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="vendors" className="mt-2 h-[150px] overflow-y-auto pr-1 thin-scrollbar">
                  <div className="space-y-1.5">
                    {[
                      { name: "Alex (TechNova)", email: "alex@technova.com" },
                      { name: "Priya (CloudBridge)", email: "priya@cloudbridge.com" },
                      { name: "Admin (CyberGuard)", email: "admin@cyberguard.com" },
                      { name: "Admin (CloudScale)", email: "admin@cloudscale.com" },
                      { name: "Lead (DevOpsFlow)", email: "lead@devopsflow.com" }
                    ].map((acc, i) => (
                      <div key={i} className="flex justify-between items-center p-2 rounded-lg bg-background border border-border/50 hover:border-primary/50 transition-colors">
                        <div className="min-w-0">
                          <p className="font-bold text-[10px]">{acc.name}</p>
                          <p className="text-[10px] text-muted-foreground truncate">{acc.email}</p>
                        </div>
                        <Button 
                          type="button" 
                          variant="secondary" 
                          size="sm"
                          className="h-7 text-[10px] font-bold px-3 ml-2"
                          onClick={() => {
                            setEmail(acc.email)
                            setPassword("Demo@123")
                            setRole("vendor")
                          }}
                        >
                          Use
                        </Button>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
              
              <div className="mt-3 text-center border-t border-dashed border-primary/20 pt-2">
                <span className="text-[10px] text-muted-foreground bg-background px-2 py-0.5 rounded-full border">Password: <span className="font-bold text-foreground">Demo@123</span></span>
              </div>
            </div>

            <p className="text-center text-sm text-muted-foreground">
              {"Don't have an account? "}
              <Link href="/auth/sign-up" className="font-medium text-primary hover:underline">
                Sign up
              </Link>
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  )
}
