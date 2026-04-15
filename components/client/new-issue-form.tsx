"use client"

import { useState, useEffect } from "react"
import { analyzeIssueRisk } from "@/lib/ai/gemini"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Loader2, 
  Building2, 
  Star, 
  AlertCircle, 
  Brain,
  Clock,
  Timer,
  CheckCircle2,
  Sparkles
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import type { Contract, IssuePriority } from "@/lib/types"

interface NewIssueFormProps {
  contracts: Contract[]
  preselectedContractId: string | null
}

const serviceTypes = [
  "Server Issue",
  "Payment Issue",
  "Minor Bug",
  "Security Incident",
  "Performance Issue",
  "Feature Request",
  "Data Issue",
  "Integration Issue",
  "Other"
]

// AI SLA Generation Logic
function generateSLA(serviceType: string, priority: IssuePriority): { responseTime: number; resolutionTime: number } {
  const baseSLA: Record<string, { response: number; resolution: number }> = {
    "Server Issue": { response: 15, resolution: 120 },
    "Payment Issue": { response: 30, resolution: 180 },
    "Minor Bug": { response: 120, resolution: 1440 },
    "Security Incident": { response: 5, resolution: 60 },
    "Performance Issue": { response: 30, resolution: 240 },
    "Feature Request": { response: 480, resolution: 10080 },
    "Data Issue": { response: 60, resolution: 480 },
    "Integration Issue": { response: 60, resolution: 360 },
    "Other": { response: 120, resolution: 720 },
  }

  const priorityMultiplier: Record<IssuePriority, number> = {
    critical: 0.5,
    high: 0.75,
    medium: 1,
    low: 1.5,
  }

  const base = baseSLA[serviceType] || baseSLA["Other"]
  const multiplier = priorityMultiplier[priority]

  return {
    responseTime: Math.round(base.response * multiplier),
    resolutionTime: Math.round(base.resolution * multiplier),
  }
}

export function NewIssueForm({ contracts, preselectedContractId }: NewIssueFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showSLA, setShowSLA] = useState(false)
  const [generatedSLA, setGeneratedSLA] = useState<{ responseTime: number; resolutionTime: number } | null>(null)
  
  const [contractId, setContractId] = useState(preselectedContractId || "")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [priority, setPriority] = useState<IssuePriority>("medium")
  const [serviceType, setServiceType] = useState("")
  const [profile, setProfile] = useState<any>(null)
  const [aiAnalysis, setAiAnalysis] = useState<any>(null)

  useEffect(() => {
    async function fetchProfile() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single()
        setProfile(data)
      }
    }
    fetchProfile()
  }, [])

  const selectedContract = contracts.find(c => c.id === contractId)



  const handleGenerateSLA = async () => {
    if (!serviceType || !priority || !title || !description) {
      toast.error("Please fill in title and description first for AI analysis")
      return
    }

    setIsLoading(true)
    try {
      // Existing rule-based fallback
      const baseSLA = generateSLA(serviceType, priority)
      
      // AI Analysis
      const result = await analyzeIssueRisk(title, description, profile?.company_size)
      setAiAnalysis(result)
      
      // Automatically set priority from AI risk assessment
      if (result.riskLevel) {
        setPriority(result.riskLevel as IssuePriority)
      }
      
      setGeneratedSLA({
        responseTime: baseSLA.responseTime,
        resolutionTime: result.minutes || baseSLA.resolutionTime
      })
      setShowSLA(true)
    } catch (err) {
      console.error(err)
      const fallback = generateSLA(serviceType, priority)
      setGeneratedSLA(fallback)
      setShowSLA(true)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!generatedSLA) {
      toast.error("Please generate SLA first")
      return
    }

    if (!selectedContract) {
      toast.error("Please select a contract")
      return
    }

    setIsLoading(true)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        toast.error("Please log in")
        return
      }

      const { error } = await supabase.from("issues").insert({
        contract_id: contractId,
        client_id: user.id,
        vendor_id: selectedContract.vendor_id,
        title,
        description,
        risk_level: aiAnalysis?.riskLevel || "medium",
        risk_analysis: aiAnalysis?.analysis || null,
        priority,
        service_type: serviceType,
        status: "raised",
        ai_response_time_minutes: generatedSLA.responseTime,
        ai_resolution_time_minutes: generatedSLA.resolutionTime,
        raised_at: new Date().toISOString(),
      })

      if (error) {
        toast.error(error.message)
        return
      }

      toast.success("Issue raised successfully!")
      router.push("/client/issues")
    } catch {
      toast.error("Failed to create issue")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-primary" />
            Issue Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Contract Selection */}
            <div className="space-y-2">
              <Label htmlFor="contract">Select Contract</Label>
              <Select value={contractId} onValueChange={setContractId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a contract" />
                </SelectTrigger>
                <SelectContent>
                  {contracts.map(contract => (
                    <SelectItem key={contract.id} value={contract.id}>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        {contract.vendor?.company_name} - {contract.service?.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedContract && (
                <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Building2 className="h-3 w-3" />
                    {selectedContract.vendor?.company_name}
                  </span>
                  {selectedContract.vendor?.rating && (
                    <span className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      {Number(selectedContract.vendor.rating).toFixed(1)}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Issue Title</Label>
              <Input
                id="title"
                placeholder="Brief description of the issue"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Detailed Description</Label>
              <Textarea
                id="description"
                placeholder="Provide as much detail as possible..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                required
              />
            </div>

            {/* Service Type */}
            <div className="space-y-2">
              <Label htmlFor="serviceType">Service Type</Label>
              <Select value={serviceType} onValueChange={(v) => {
                setServiceType(v)
                setShowSLA(false)
                setGeneratedSLA(null)
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {serviceTypes.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Generate SLA Button */}
            {!showSLA && (
              <Button 
                type="button" 
                variant="secondary" 
                className="w-full"
                onClick={handleGenerateSLA}
                disabled={!serviceType || !title || !description}
              >
                <Brain className="mr-2 h-4 w-4" />
                Generate AI SLA
              </Button>
            )}

            {/* SLA Display */}
            <AnimatePresence>
              {showSLA && generatedSLA && (
                <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="rounded-xl border-2 border-primary/20 bg-primary/5 p-6"
                >
                  <div className="mb-4 flex items-center gap-2">
                    <motion.div
                      initial={{ rotate: 0 }}
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1 }}
                    >
                      <Sparkles className="h-5 w-5 text-primary" />
                    </motion.div>
                    <h3 className="font-semibold text-foreground">AI Generated SLA</h3>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                      className="flex items-center gap-3 rounded-lg bg-background p-4"
                    >
                      <div className="rounded-full bg-blue-100 p-2">
                        <Clock className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Response Time</p>
                        <p className="text-lg font-bold text-foreground">
                          {generatedSLA.responseTime < 60 
                            ? `${generatedSLA.responseTime} min`
                            : `${Math.floor(generatedSLA.responseTime / 60)}h ${generatedSLA.responseTime % 60}m`}
                        </p>
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                      className="flex items-center gap-3 rounded-lg bg-background p-4"
                    >
                      <div className="rounded-full bg-green-100 p-2">
                        <Timer className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Resolution Time</p>
                        <p className="text-lg font-bold text-foreground">
                          {generatedSLA.resolutionTime < 60 
                            ? `${generatedSLA.resolutionTime} min`
                            : generatedSLA.resolutionTime < 1440
                              ? `${Math.floor(generatedSLA.resolutionTime / 60)}h ${generatedSLA.resolutionTime % 60}m`
                              : `${Math.floor(generatedSLA.resolutionTime / 1440)}d ${Math.floor((generatedSLA.resolutionTime % 1440) / 60)}h`}
                        </p>
                      </div>
                    </motion.div>
                  </div>

                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="mt-4 text-sm text-muted-foreground"
                  >
                    SLA calculated based on {serviceType} with {priority} priority
                  </motion.p>

                  {aiAnalysis && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="mt-4 pt-4 border-t border-primary/10"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`h-2 w-2 rounded-full ${
                          aiAnalysis.riskLevel === 'high' ? 'bg-red-500 animate-pulse' : 
                          aiAnalysis.riskLevel === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                        }`} />
                        <span className="text-xs font-bold uppercase text-muted-foreground">
                          AI Risk Assessment: {aiAnalysis.riskLevel}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-relaxed italic">
                        "{aiAnalysis.analysis}"
                      </p>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit Button */}
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading || !generatedSLA || !contractId}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Issue...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Submit Issue
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
