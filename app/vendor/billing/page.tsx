"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { 
  CreditCard, 
  TrendingUp, 
  Database, 
  Check, 
  ShieldCheck, 
  AlertCircle,
  ArrowUpRight,
  Download,
  Zap,
  Globe,
  Layers
} from "lucide-react"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

export default function BillingPage() {
  const [usage, setUsage] = useState({ current: 0, limit: 100, plan: "Standard (Growth)" })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchUsage() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        // Fetch data usage from the view we created (mocked if not exists yet)
        const { data, error } = await supabase
          .from("vendor_usage_stats")
          .select("*")
          .eq("vendor_id", user.id)
          .single()

        if (data) {
          setUsage({
            current: data.current_data_points || 0,
            limit: data.data_limit || 10,
            plan: data.plan_name || "Mini (Starter)"
          })
        }
      }
      setIsLoading(false)
    }

    fetchUsage()
  }, [])

  const plans = [
    {
      name: "Mini (Starter)",
      price: "$0",
      limit: 10,
      description: "Perfect for small vendors starting out",
      features: ["Up to 10 data points", "Basic SLA monitoring", "Email notifications", "Community support"],
      current: usage.plan === "Mini (Starter)"
    },
    {
      name: "Standard (Growth)",
      price: "$49",
      limit: 100,
      description: "For growing businesses with moderate data needs",
      features: ["Up to 100 data points", "Advanced AI SLA generation", "Priority support", "Historical performance logs"],
      current: usage.plan === "Standard (Growth)",
      popular: true
    },
    {
      name: "Enterprise (Huge)",
      price: "$199",
      limit: 1000,
      description: "Unlimited power for high-volume vendors",
      features: ["Up to 1000 data points", "Dedicated Account Manager", "Custom API access", "SLA violation insurance info"],
      current: usage.plan === "Enterprise (Huge)"
    }
  ]

  const usagePercent = Math.min((usage.current / usage.limit) * 100, 100)

  return (
    <div className="p-8 space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Billing & Subscription</h1>
        <p className="text-muted-foreground">Manage your vendor plan and monitor data usage based on "Data Hugeness".</p>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        {/* Current Plan & Usage */}
        <Card className="md:col-span-2 glass border-border/50">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-xl">Plan Usage</CardTitle>
                <CardDescription>Your current consumption of platform data points (Contracts + Issues)</CardDescription>
              </div>
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 py-1">
                {usage.plan}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Data Storage Usage</span>
                <span className="text-muted-foreground">{usage.current} / {usage.limit} data points</span>
              </div>
              <Progress value={usagePercent} className="h-3" />
              <p className="text-xs text-muted-foreground">
                {usagePercent > 80 ? "⚠️ You are approaching your plan limit." : "Your account has plenty of headroom."}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-border/50">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Database className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-bold">{usage.current}</p>
                  <p className="text-xs text-muted-foreground">Active Points</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-secondary/10 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-secondary" />
                </div>
                <div>
                  <p className="text-sm font-bold">Low</p>
                  <p className="text-xs text-muted-foreground">Usage Intensity</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center">
                  <Globe className="h-5 w-5 text-accent-foreground" />
                </div>
                <div>
                  <p className="text-sm font-bold">Standard</p>
                  <p className="text-xs text-muted-foreground">Storage Tier</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Stats */}
        <Card className="glass border-border/50 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-lg">Next Payment</CardTitle>
            <CardDescription>Expected on June 1, 2024</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-center py-6">
            <div className="flex flex-col items-center justify-center bg-background/50 rounded-2xl p-6 border border-primary/20">
              <span className="text-4xl font-bold text-primary">
                {plans.find(p => p.name === usage.plan)?.price || "$0"}
              </span>
              <span className="text-sm text-muted-foreground">per month</span>
            </div>
            <Button className="w-full gap-2 shadow-lg shadow-primary/20">
              <CreditCard className="h-4 w-4" />
              Manage Payment
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Pricing Tiers */}
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold">Switch Subscription Plans</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className={cn(
                "relative overflow-hidden flex flex-col h-full border-border/50",
                plan.popular && "border-primary shadow-lg shadow-primary/10",
                plan.current && "bg-accent/5"
              )}>
                {plan.popular && (
                  <div className="absolute top-0 right-0">
                    <div className="bg-primary text-primary-foreground text-[10px] font-bold px-3 py-1 rounded-bl-lg uppercase tracking-wider">
                      Most Popular
                    </div>
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-lg">{plan.name}</CardTitle>
                  <div className="flex items-baseline gap-1 mt-2">
                    <span className="text-3xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground text-sm">/month</span>
                  </div>
                  <CardDescription className="mt-2 line-clamp-2">{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 space-y-4">
                  <div className="space-y-2">
                    {plan.features.map(feature => (
                      <div key={feature} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-primary shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full" 
                    variant={plan.current ? "secondary" : (plan.popular ? "default" : "outline")}
                    disabled={plan.current}
                  >
                    {plan.current ? "Current Plan" : "Upgrade Plan"}
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Invoices */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-xl">Recent Invoices</CardTitle>
          <CardDescription>Download your previous billing statements</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-border/50">
            {[1, 2, 3].map(i => (
              <div key={i} className="py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded bg-muted flex items-center justify-center">
                    <ShieldCheck className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Invoice #SS-2024-00{i}</p>
                    <p className="text-xs text-muted-foreground">May {i}, 2024</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <span className="text-sm font-semibold">$49.00</span>
                  <Button size="icon" variant="ghost">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ")
}
