"use client"

import { motion } from "framer-motion"
import { FileText, AlertCircle, Gauge, Flame } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface DashboardStatsProps {
  activeContracts: number
  totalIssues: number
  slaCompliance: number
  activeIssues: number
}

const stats = [
  { key: "contracts", label: "Active Contracts", icon: FileText, color: "text-primary" },
  { key: "issues", label: "Issues Raised", icon: AlertCircle, color: "text-chart-4" },
  { key: "sla", label: "SLA Compliance", icon: Gauge, color: "text-success", suffix: "%" },
]

export function DashboardStats({ activeContracts, totalIssues, slaCompliance, activeIssues }: DashboardStatsProps) {
  const statsList = [
    { 
      key: "contracts", 
      label: "Active Contracts", 
      value: activeContracts, 
      icon: FileText, 
      color: "text-primary" 
    },
    { 
      key: "issues", 
      label: "Issues Raised", 
      value: totalIssues, 
      icon: AlertCircle, 
      color: "text-orange-500" 
    },
    { 
      key: "sla", 
      label: "SLA Compliance", 
      value: `${slaCompliance}%`, 
      icon: Gauge, 
      color: "text-green-600" 
    },
    { 
      key: "activeIssues", 
      label: "Active Issues", 
      value: activeIssues, 
      icon: Flame, 
      color: "text-red-500" 
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
      {statsList.map((stat, index) => (
        <motion.div
          key={stat.key}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="aspect-square flex flex-col items-center justify-center text-center p-2 transition-all hover:shadow-md border-none">
            <CardContent className="p-0 flex flex-col items-center gap-4">
              <div className={`rounded-full bg-muted p-4 ${stat.color} shadow-sm`}>
                <stat.icon className="h-7 w-7" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{stat.label}</p>
                <p className="text-3xl font-black tracking-tight text-foreground">
                  {stat.value}
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}
