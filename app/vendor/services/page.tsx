import { VendorServices } from "@/components/vendor/vendor-services"

export default function VendorServicesPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">My Services</h1>
          <p className="text-muted-foreground">
            Manage the service catalog and tiered pricing packages.
          </p>
        </div>
      </div>
      <VendorServices />
    </div>
  )
}
