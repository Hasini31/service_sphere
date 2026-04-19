"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { 
  Brain, 
  Gauge, 
  LineChart, 
  Star, 
  ChevronRight, 
  Shield, 
  Zap,
  BarChart3
} from "lucide-react"
import { Button } from "@/components/ui/button"

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
}

const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
}

const features = [
  {
    icon: Brain,
    title: "AI-Based SLA Generation",
    description: "Intelligent SLA parameters generated automatically when issues are raised, based on service type and priority."
  },
  {
    icon: Gauge,
    title: "Real-Time Issue Tracking",
    description: "Monitor issue status in real-time with instant synchronization between clients and vendors."
  },
  {
    icon: LineChart,
    title: "Vendor Performance Analytics",
    description: "Comprehensive dashboards showing response times, resolution rates, and SLA compliance metrics."
  },
  {
    icon: Star,
    title: "Automated Rating System",
    description: "Vendor ratings automatically calculated based on issue handling, SLA compliance, and client feedback."
  }
]

const stats = [
  { value: "99.9%", label: "Uptime" },
  { value: "50ms", label: "Response Time" },
  { value: "10K+", label: "Issues Tracked" },
  { value: "500+", label: "Vendors" }
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="container mx-auto flex h-16 items-center justify-center px-4 relative">
          <Link href="/" className="flex items-center gap-2 absolute left-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
              <Shield className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">ServiceSphere</span>
          </Link>
          
          <div className="hidden items-center gap-8 md:flex">
            <Link href="/" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              Home
            </Link>
            <Link href="#features" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              Features
            </Link>
          </div>
          
          <div className="flex items-center gap-3 absolute right-4">
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-32 pb-20">
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-secondary/10 blur-3xl" />
        </div>
        
        <div className="container mx-auto px-4">
          <motion.div 
            className="mx-auto max-w-4xl text-center"
            initial="initial"
            animate="animate"
            variants={stagger}
          >
            <motion.div variants={fadeIn} className="mb-6">
              <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
                <Zap className="h-4 w-4" />
                AI-Powered SLA Management
              </span>
            </motion.div>
            
            <motion.h1 
              variants={fadeIn}
              className="mb-6 text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl text-balance"
            >
              Smart SLA Management{" "}
              <span className="text-primary">Powered by AI</span>
            </motion.h1>
            
            <motion.p 
              variants={fadeIn}
              className="mb-10 text-lg text-muted-foreground md:text-xl text-pretty"
            >
              Track issues, manage vendors, and ensure service quality in real-time. 
              Our AI automatically generates optimal SLA parameters for every issue.
            </motion.p>
            
            <motion.div 
              variants={fadeIn}
              className="flex flex-col items-center justify-center gap-4 sm:flex-row"
            >
              <Button size="lg" asChild className="min-w-[160px]">
                <Link href="/auth/login">
                  Get Started
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </motion.div>
          </motion.div>

          {/* Stats */}
          <motion.div 
            className="mx-auto mt-20 grid max-w-3xl grid-cols-2 gap-8 md:grid-cols-4"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-bold text-primary">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div 
            className="mx-auto mb-16 max-w-2xl text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl text-balance">
              Everything You Need for SLA Excellence
            </h2>
            <p className="text-muted-foreground text-pretty">
              A complete platform for managing service level agreements, tracking vendor performance, 
              and ensuring quality service delivery.
            </p>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                className="group rounded-2xl bg-card p-6 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-card-foreground">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div 
            className="mx-auto mb-16 max-w-2xl text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl text-balance">
              How ServiceSphere Works
            </h2>
            <p className="text-muted-foreground text-pretty">
              Simple workflow for both clients and vendors
            </p>
          </motion.div>

          <div className="mx-auto max-w-4xl">
            <div className="grid gap-8 md:grid-cols-3">
              {[
                { step: "01", title: "Create Contract", description: "Browse services and create contracts with vendors" },
                { step: "02", title: "Raise Issues", description: "When issues arise, AI generates optimal SLA parameters" },
                { step: "03", title: "Track & Resolve", description: "Monitor progress in real-time until resolution" }
              ].map((item, index) => (
                <motion.div
                  key={item.step}
                  className="relative text-center"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.15, duration: 0.6 }}
                >
                  <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
                    {item.step}
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-foreground">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Shield className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-semibold text-foreground">ServiceSphere</span>
            </div>
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} ServiceSphere. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
