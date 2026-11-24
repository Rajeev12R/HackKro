"use client"

import type React from "react"
import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { 
  Rocket, 
  Users, 
  ShieldCheck, 
  Trophy, 
  CheckCircle, 
  Code, 
  Globe, 
  BarChart3, 
  Award, 
  Sparkles,
  Mail,
  Clock
} from "lucide-react"

export function HostContent() {
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    orgName: "",
    contactPerson: "",
    email: "",
    phone: "",
    eventType: "hackathon",
    estimatedParticipants: "100-500",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formSuccess, setFormSuccess] = useState(false)

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const res = await fetch("/api/host-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!res.ok) {
        throw new Error("Failed to submit request")
      }

      toast({
        title: "Request Received!",
        description: "Our Event Operations team will contact you within 24 hours.",
      })

      setFormData({
        orgName: "",
        contactPerson: "",
        email: "",
        phone: "",
        eventType: "hackathon",
        estimatedParticipants: "100-500",
        message: "",
      })
      setFormSuccess(true)
      setTimeout(() => setFormSuccess(false), 5000)
    } catch (error) {
      console.error("Error:", error)
      toast({
        title: "Submission Error",
        description: "Something went wrong. Please try again or email us directly.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-16 py-12">
      {/* Hero Banner */}
      <section className="relative h-[360px] w-full">
        <div className="hidden md:block h-full w-full relative">
          <Image
            src="https://res.cloudinary.com/payb7fsq/image/upload/v1792430791/WhatsApp_Image_2026-10-19_at_22.55.24.jpg"
            alt="HackKro For Organizations and Event Hosts Banner"
            fill
            className="object-cover brightness-50 dark:brightness-90"
            priority
          />
        </div>

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 py-8 bg-gradient-to-b from-black/80 via-black/60 to-black/80 text-white">
          <span className="px-3.5 py-1 bg-blue-600/90 text-xs font-semibold rounded-full mb-3 tracking-wider uppercase backdrop-blur-sm">
            For Colleges, Clubs & Enterprises
          </span>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-3">
            Host Powerful Hackathons & Coding Contests
          </h1>
          <p className="text-sm md:text-lg text-gray-200 max-w-2xl leading-relaxed drop-shadow-sm">
            Scale your tech events with HackKro's complete hosting ecosystem — custom microsites, automated judging, proctored submissions, and direct access to 100,000+ developers.
          </p>
        </div>
      </section>

      {/* Impact Stats */}
      <section className="container grid gap-6 md:grid-cols-4">
        <div className="p-6 rounded-xl border bg-card text-center space-y-2 shadow-sm">
          <Rocket className="h-8 w-8 text-blue-600 mx-auto" />
          <h3 className="font-bold text-2xl">1000+</h3>
          <p className="text-xs text-muted-foreground">Active Student & Developer Reach</p>
        </div>
        <div className="p-6 rounded-xl border bg-card text-center space-y-2 shadow-sm">
          <Users className="h-8 w-8 text-blue-600 mx-auto" />
          <h3 className="font-bold text-xl">10+</h3>
          <p className="text-xs text-muted-foreground">Campus Ambassador Partners</p>
        </div>
        <div className="p-6 rounded-xl border bg-card text-center space-y-2 shadow-sm">
          <ShieldCheck className="h-8 w-8 text-blue-600 mx-auto" />
          <h3 className="font-bold text-xl">Automated</h3>
          <p className="text-xs text-muted-foreground">Evaluation & Anti-Plagiarism Systems</p>
        </div>
        <div className="p-6 rounded-xl border bg-card text-center space-y-2 shadow-sm">
          <Trophy className="h-8 w-8 text-blue-600 mx-auto" />
          <h3 className="font-bold text-xl">Instant Payouts</h3>
          <p className="text-xs text-muted-foreground">Escrow Rewards & E-Certificates</p>
        </div>
      </section>

      {/* Key Features for Hosts */}
      <section className="container space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-3xl font-bold">Why Organizations Choose HackKro</h2>
          <p className="text-muted-foreground">
            Everything you need to plan, market, run, and evaluate high-impact developer competitions.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="p-6 space-y-3">
            <Globe className="h-8 w-8 text-blue-600" />
            <h3 className="font-bold text-lg">Custom Branded Microsite</h3>
            <p className="text-sm text-muted-foreground">
              Launch your event with branded landing pages, customizable registration forms, timeline widgets, and problem statement disclosures.
            </p>
          </Card>

          <Card className="p-6 space-y-3">
            <Code className="h-8 w-8 text-blue-600" />
            <h3 className="font-bold text-lg">Automated Test & Code Evaluation</h3>
            <p className="text-sm text-muted-foreground">
              Integrated test runners, GitHub code-checkers, and anti-plagiarism filters to evaluate hundreds of submissions effortlessly.
            </p>
          </Card>

          <Card className="p-6 space-y-3">
            <BarChart3 className="h-8 w-8 text-blue-600" />
            <h3 className="font-bold text-lg">Live Analytics & Dashboard</h3>
            <p className="text-sm text-muted-foreground">
              Track participant registrations, team formation status, submission rates, and leaderboard scores in real time.
            </p>
          </Card>

          <Card className="p-6 space-y-3">
            <Users className="h-8 w-8 text-blue-600" />
            <h3 className="font-bold text-lg">National Campus Promotions</h3>
            <p className="text-sm text-muted-foreground">
              Tap into HackKro's Ambassador Network across 200+ colleges to maximize student turnout and engagement.
            </p>
          </Card>

          <Card className="p-6 space-y-3">
            <Award className="h-8 w-8 text-blue-600" />
            <h3 className="font-bold text-lg">Automated E-Certificates & Badges</h3>
            <p className="text-sm text-muted-foreground">
              Distribute verified participation certificates and winner credentials directly to participants' profiles with one click.
            </p>
          </Card>

          <Card className="p-6 space-y-3">
            <Sparkles className="h-8 w-8 text-blue-600" />
            <h3 className="font-bold text-lg">Hiring & Talent Screening</h3>
            <p className="text-sm text-muted-foreground">
              Filter top-performing developers by skills, contest rank, and project quality to fast-track interview scheduling.
            </p>
          </Card>
        </div>
      </section>

      {/* Hosting Request / Coming Soon & Manual Verification Notice */}
      <section className="container">
        <div className="grid gap-8 md:grid-cols-2 items-stretch">
          <div className="space-y-6 flex flex-col justify-center">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 rounded-full text-xs font-semibold w-fit">
              <Clock className="h-3.5 w-3.5" /> Coming Soon
            </span>
            <h2 className="text-3xl font-bold">Host Your Next Tech Event With Us</h2>
            <p className="text-muted-foreground leading-relaxed">
              We are currently building our self-serve host dashboard so clubs and organizations can spin up hackathons instantly. 
            </p>
            <p className="text-muted-foreground leading-relaxed">
              In the meantime, if your college club, tech community, or organization wants to host an event on HackKro, please reach out to us directly. Our operations team will verify the details and set up your event microsite manually.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-sm font-medium">Manual verification & secure event setup by HackKro core team</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-sm font-medium">Custom branding, registration links & promotional support</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-sm font-medium">Dedicated support during contest days</span>
              </div>
            </div>
          </div>

          <Card className="border-2 border-blue-100 dark:border-blue-900/50 bg-gradient-to-br from-blue-50/50 via-white to-indigo-50/30 dark:from-blue-950/20 dark:via-background dark:to-indigo-950/20 flex flex-col justify-between">
            <CardContent className="p-8 text-center space-y-6 flex flex-col justify-center h-full">
              <div className="mx-auto h-16 w-16 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-inner">
                <Mail className="h-8 w-8" />
              </div>
              
              <div className="space-y-2">
                <span className="px-3 py-1 bg-blue-600 text-white rounded-full text-xs font-semibold uppercase tracking-wider">
                  Direct Verification & Setup
                </span>
                <h3 className="text-2xl font-bold pt-2">Want to List an Event?</h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
                  Direct self-creation is coming soon. To get your hackathon or coding contest hosted right now, email our operations team with your proposal.
                </p>
              </div>

              <div className="pt-2">
                <Button 
                  size="lg" 
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-6 rounded-full shadow-lg transition-all transform hover:scale-105"
                  asChild
                >
                  <a href="mailto:team@hackkro.com?subject=Host%20Event%20Request%20on%20HackKro&body=Hi%20HackKro%20Team,%0A%0AWe%20would%20like%20to%20host%20an%20event%20on%20your%20platform.%0A%0AOrganization/College%20Name:%0AContact%20Person:%0AEvent%20Type%20(Hackathon/Coding%20Contest):%0AExpected%20Participants:%0A%0APlease%20guide%20us%20through%20the%20verification%20and%20setup%20process.">
                    <Mail className="mr-2 h-4 w-4" /> Contact team@hackkro.com
                  </a>
                </Button>
              </div>

              <p className="text-xs text-muted-foreground">
                We typically review and respond to hosting inquiries within 24 hours.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Host FAQ Section */}
      <section className="container py-6 space-y-6">
        <div className="text-center max-w-xl mx-auto">
          <h2 className="text-2xl font-bold">Frequently Asked Questions</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Common queries about hosting on HackKro platform.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="p-6 border rounded-lg bg-card space-y-2">
            <h3 className="font-semibold text-base">Why is direct event creation currently disabled?</h3>
            <p className="text-sm text-muted-foreground">
              To ensure high quality, authenticity, and prevent spam, we manually verify all college clubs and organizations before launching their event microsites. Self-serve hosting is coming soon!
            </p>
          </div>

          <div className="p-6 border rounded-lg bg-card space-y-2">
            <h3 className="font-semibold text-base">How can student clubs and college fests list their events?</h3>
            <p className="text-sm text-muted-foreground">
              You can email us at team@hackkro.com with your fest details and expected turnout. Student societies get verified fast with subsidized packages and campus ambassador promotion.
            </p>
          </div>

          <div className="p-6 border rounded-lg bg-card space-y-2">
            <h3 className="font-semibold text-base">Can we host private/internal corporate hiring hackathons?</h3>
            <p className="text-sm text-muted-foreground">
              Yes, we set up private event modes with invite-only access, NDA acceptance gates, and custom candidate assessment filters upon request.
            </p>
          </div>

          <div className="p-6 border rounded-lg bg-card space-y-2">
            <h3 className="font-semibold text-base">How does automated judging work?</h3>
            <p className="text-sm text-muted-foreground">
              Our team configures test suites for code evaluation, integrated GitHub review checkers, and judging rubrics on your custom event page during setup.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
