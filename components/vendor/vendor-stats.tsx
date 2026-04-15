"use client"

import { motion } from "framer-motion"
import { AlertCircle, Gauge, AlertTriangle, Star, FileText, Briefcase } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface VendorStatsProps {
  totalIssuesHandled: number
  slaSuccessRate: number
  warnings: number
  penalties: number
  rating: number
  pendingContracts: number
  activeContracts: number
}

export function VendorStats({ 
  totalIssuesHandled, 
  slaSuccessRate, 
  warnings, 
  penalties, 
  rating,
  pendingContracts,
  activeContracts
}: VendorStatsProps) {
  const stats = [
    { 
      key: "issues", 
      label: "Issues Handled", 
      value: totalIssuesHandled, 
      icon: AlertCircle, 
      color: "text-primary" 
    },
    { 
      key: "sla", 
      label: "SLA Success Rate", 
      value: `${slaSuccessRate}%`, 
      icon: Gauge, 
      color: slaSuccessRate >= 90 ? "text-green-600" : slaSuccessRate >= 70 ? "text-yellow-600" : "text-red-600" 
    },
    { 
      key: "rating", 
      label: "Rating", 
      value: Number(rating).toFixed(1), 
      icon: Star, 
      color: "text-yellow-500",
      suffix: "/ 5.0"
    },
    { 
      key: "warnings", 
      label: "Warnings", 
      value: warnings, 
      icon: AlertTriangle, 
      color: warnings > 0 ? "text-yellow-600" : "text-muted-foreground" 
    },
    { 
      key: "penalties", 
      label: "Penalties", 
      value: penalties, 
      icon: AlertTriangle, 
      color: penalties > 0 ? "text-red-600" : "text-muted-foreground" 
    },
    { 
      key: "pending", 
      label: "Pending Contracts", 
      value: pendingContracts, 
      icon: FileText, 
      color: pendingContracts > 0 ? "text-blue-600" : "text-muted-foreground" 
    },
    { 
      key: "active", 
      label: "Active Contracts", 
      value: activeContracts, 
      icon: Briefcase, 
      color: "text-green-600" 
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.key}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <Card className="aspect-square flex flex-col items-center justify-center text-center p-2 transition-all hover:shadow-md">
            <CardContent className="p-0 flex flex-col items-center gap-3">
              <div className={`rounded-full bg-muted p-3 ${stat.color} mb-1 shadow-sm`}>
                <stat.icon className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                <p className="text-2xl font-bold tracking-tight text-foreground">
                  {stat.value}
                  {stat.suffix && <span className="text-sm font-normal text-muted-foreground ml-1">{stat.suffix}</span>}
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}
