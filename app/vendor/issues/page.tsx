import { VendorIssues } from "@/components/vendor/vendor-issues"

export default function VendorIssuesPage() {
  return (
    <div className="space-y-6 px-6 py-4 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Issue Management</h1>
        <p className="text-muted-foreground">
          View and resolve assigned issues within SLA timelines
        </p>
      </div>
      <VendorIssues />
    </div>
  )
}
