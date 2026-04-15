"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Package, DollarSign, Clock } from "lucide-react"
import type { Service } from "@/lib/types"

const categories = [
  "IT Support",
  "Cloud Services",
  "Security",
  "Consulting",
  "Development",
  "Maintenance",
  "Training",
  "Other"
]

export function VendorServices() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    price_small: "",
    price_medium: "",
    price_large: "",
    price_large: ""
  })
  const supabase = createClient()

  useEffect(() => {
    fetchServices()
  }, [])

  async function fetchServices() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .single()

    if (!profile) return

    const { data } = await supabase
      .from("services")
      .select("*")
      .eq("vendor_id", profile.id)
      .order("created_at", { ascending: false })

    if (data) setServices(data)
    setLoading(false)
  }

  async function createService(e: React.FormEvent) {
    e.preventDefault()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .single()

    if (!profile) return

    const { error } = await supabase.from("services").insert({
      vendor_id: profile.id,
      name: formData.name,
      description: formData.description,
      category: formData.category,
      price_small: parseFloat(formData.price_small),
      price_medium: parseFloat(formData.price_medium),
      price_large: parseFloat(formData.price_large)
    })

    if (!error) {
      setDialogOpen(false)
      setFormData({
        name: "",
        description: "",
        category: "",
        price_small: "",
        price_medium: "",
        price_large: ""
      })
      fetchServices()
    }
  }

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map(i => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-32 bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add New Service
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create New Service</DialogTitle>
              <DialogDescription>
                Add a new service that clients can subscribe to
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={createService} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Service Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Premium IT Support"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe what this service includes..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

              <div className="grid grid-cols-3 gap-4 pb-2">
                <div className="space-y-2">
                  <Label htmlFor="price_small font-semibold">Price (Small Corp)</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="price_small"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.price_small}
                      onChange={(e) => setFormData({ ...formData, price_small: e.target.value })}
                      placeholder="99"
                      className="pl-9"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price_medium font-semibold">Price (Medium Corp)</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="price_medium"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.price_medium}
                      onChange={(e) => setFormData({ ...formData, price_medium: e.target.value })}
                      placeholder="199"
                      className="pl-9"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price_large font-semibold">Price (Large Corp)</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="price_large"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.price_large}
                      onChange={(e) => setFormData({ ...formData, price_large: e.target.value })}
                      placeholder="499"
                      className="pl-9"
                      required
                    />
                  </div>
                </div>
              </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create Service</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {services.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No services yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Create your first service to start receiving contracts from clients
            </p>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add New Service
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 px-2">
          {services.map((service) => (
            <Card key={service.id} className="flex flex-col h-full hover:shadow-md transition-shadow">
              <CardHeader className="pb-3 px-6 flex flex-row items-start justify-between">
                <div>
                  <CardTitle className="text-lg font-bold leading-tight">{service.name}</CardTitle>
                  <CardDescription className="font-semibold text-primary/70 uppercase tracking-tighter text-[10px]">
                    {service.category}
                  </CardDescription>
                </div>
                <Badge variant={service.is_active ? "default" : "secondary"} className="text-[9px] px-1.5 uppercase shrink-0">
                  {service.is_active ? "Active" : "Inactive"}
                </Badge>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-between pt-0 px-6">
                <p className="text-sm text-muted-foreground mb-6 line-clamp-2">
                  {service.description || "No description provided"}
                </p>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-0 border rounded-xl overflow-hidden bg-muted/30">
                    <div className="flex flex-col items-center py-3 border-r">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-70">Small</p>
                      <p className="text-lg font-bold text-foreground">${service.price_small}</p>
                    </div>
                    <div className="flex flex-col items-center py-3 border-r bg-primary/5">
                      <p className="text-[10px] font-bold text-primary uppercase">Medium</p>
                      <p className="text-lg font-bold text-primary">${service.price_medium}</p>
                    </div>
                    <div className="flex flex-col items-center py-3">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-70">Large</p>
                      <p className="text-lg font-bold text-foreground">${service.price_large}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 py-2 text-muted-foreground border-t border-dashed">
                    <Package className="h-3 w-3" />
                    <span className="text-[10px] font-medium">Dynamic SLA Management</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
