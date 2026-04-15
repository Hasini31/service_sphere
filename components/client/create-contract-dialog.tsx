"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Building2, Star, Calendar, DollarSign } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import type { Service } from "@/lib/types"

interface CreateContractDialogProps {
  service: Service | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateContractDialog({ service, open, onOpenChange }: CreateContractDialogProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [duration, setDuration] = useState("12")
  const [cost, setCost] = useState("")
  const [userProfile, setUserProfile] = useState<any>(null)


  useEffect(() => {
    async function fetchUserProfile() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single()
        setUserProfile(data)
      }
    }
    fetchUserProfile()
  }, [])

  // Update cost whenever service or userProfile changes
  useEffect(() => {
    if (service && userProfile) {
      const size = userProfile.company_size || 'medium'
      const price = size === 'small' ? service.price_small : 
                    size === 'medium' ? service.price_medium : 
                    service.price_large
      
      setCost(price?.toString() || "0")
    }
  }, [service, userProfile])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!service) return

    setIsLoading(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        toast.error("Please log in to create a contract")
        return
      }

      const { error } = await supabase.from("contracts").insert({
        client_id: user.id,
        vendor_id: service.vendor_id,
        service_id: service.id,
        duration_months: parseInt(duration),
        cost: parseFloat(cost),
        status: "pending",
      })

      if (error) {
        toast.error(error.message)
        return
      }

      toast.success("Contract request sent to vendor!")
      onOpenChange(false)
      router.refresh()
    } catch {
      toast.error("Failed to create contract")
    } finally {
      setIsLoading(false)
    }
  }

  if (!service) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Contract</DialogTitle>
          <DialogDescription>
            Send a contract request to the vendor for approval.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {/* Service Info */}
            <div className="rounded-lg bg-muted p-4">
              <h4 className="font-medium text-foreground">{service.name}</h4>
              <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Building2 className="h-3 w-3" />
                  {service.vendor?.company_name}
                </span>
                {service.vendor?.rating && (
                  <span className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    {Number(service.vendor.rating).toFixed(1)}
                  </span>
                )}
              </div>
            </div>

            {/* Tier Selection */}
            <div className="space-y-3">
              <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Select Plan Tier</Label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'small', label: 'Small', price: service.price_small },
                  { id: 'medium', label: 'Medium', price: service.price_medium },
                  { id: 'large', label: 'Large', price: service.price_large }
                ].map((tier) => (
                  <button
                    key={tier.id}
                    type="button"
                    onClick={() => {
                      setUserProfile({ ...userProfile, company_size: tier.id })
                    }}
                    className={`flex flex-col items-center justify-center rounded-xl border-2 p-3 transition-all ${
                      userProfile?.company_size === tier.id 
                        ? "border-primary bg-primary/5 ring-1 ring-primary" 
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <span className="text-[10px] font-bold uppercase opacity-70">{tier.label}</span>
                    <span className="text-sm font-bold">${tier.price || "0"}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Duration */}
            <div className="space-y-2">
              <Label htmlFor="duration" className="font-bold">Contract Duration</Label>
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3 months</SelectItem>
                  <SelectItem value="6">6 months</SelectItem>
                  <SelectItem value="12">12 months</SelectItem>
                  <SelectItem value="24">24 months</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Cost Display */}
            <div className="space-y-2">
              <Label className="font-bold">Monthly Cost ($)</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary" />
                <Input
                  value={cost}
                  className="pl-10 h-11 bg-muted/30 font-bold text-lg"
                  readOnly
                />
              </div>
            </div>

            {/* Summary */}
            <div className="rounded-lg border border-border p-4">
              <h5 className="text-sm font-medium text-foreground">Contract Summary</h5>
              <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                <div className="flex justify-between">
                  <span>Duration:</span>
                  <span className="font-medium text-foreground">{duration} months</span>
                </div>
                <div className="flex justify-between">
                  <span>Monthly Cost:</span>
                  <span className="font-medium text-foreground">${cost || "0"}</span>
                </div>
                <div className="flex justify-between border-t border-border pt-1">
                  <span>Total Value:</span>
                  <span className="font-medium text-foreground">
                    ${((parseFloat(cost) || 0) * parseInt(duration)).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send Request"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
