import { VendorPerformance } from "@/components/vendor/vendor-performance"

export default function VendorPerformancePage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Performance Metrics</h1>
        <p className="text-muted-foreground">
          Track your SLA compliance and performance ratings with real-time analytics.
        </p>
      </div>
      <VendorPerformance />
    </div>
  )
}
