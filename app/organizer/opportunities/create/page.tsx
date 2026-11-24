"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useOrganizerAuth } from "../../auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import {
  ArrowLeft,
  Calendar,
  Layers,
  Sparkles,
  Save,
  Send,
  Loader2,
  AlertTriangle,
} from "lucide-react"

export default function CreateOpportunityPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { organizer } = useOrganizerAuth()

  const [loading, setLoading] = useState(false)

  // Form State
  const [title, setTitle] = useState("")
  const [category, setCategory] = useState("Hackathon")
  const [tagline, setTagline] = useState("")
  const [description, setDescription] = useState("")
  const [longDescription, setLongDescription] = useState("")
  const [mode, setMode] = useState<"Online" | "Offline" | "Hybrid">("Online")
  const [venue, setVenue] = useState("")
  const [location, setLocation] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [registrationDeadline, setRegistrationDeadline] = useState("")
  const [minTeamSize, setMinTeamSize] = useState(1)
  const [maxTeamSize, setMaxTeamSize] = useState(4)
  const [prizePool, setPrizePool] = useState("₹50,000 + Swag & Cloud Credits")
  const [registrationFee, setRegistrationFee] = useState("Free")
  const [eligibility, setEligibility] = useState("Open to all student developers, BCA/MCA, B.Tech, and design innovators.")
  const [tracksText, setTracksText] = useState("AI/ML Innovation, Web3 & FinTech, Open Innovation, HealthTech")
  const [rulesText, setRulesText] = useState("Plagiarism leads to disqualification.\nAll code must be committed to GitHub during the hackathon window.\nInter-college teams are welcome.")
  const [perksText, setPerksText] = useState("Verified Certificate of Participation\nExclusive HackKro Hacker Swag Kit\nMentorship from Industry Leaders")
  const [image, setImage] = useState("https://res.cloudinary.com/payb7fsq/image/upload/v1793190149/1_1.png")

  const isVerified = organizer?.verificationStatus === "verified"

  const handleSubmit = async (isDraft: boolean) => {
    if (!title || !description || !startDate || !endDate || !registrationDeadline) {
      toast({
        title: "Required Fields Missing",
        description: "Please fill in Title, Description, Start Date, End Date, and Registration Deadline.",
        variant: "destructive",
      })
      return
    }

    if (new Date(endDate) < new Date(startDate)) {
      toast({
        title: "Invalid Dates",
        description: "End Date cannot be earlier than Start Date.",
        variant: "destructive",
      })
      return
    }

    if (Number(minTeamSize) > Number(maxTeamSize)) {
      toast({
        title: "Invalid Team Sizes",
        description: "Minimum team size cannot be greater than Maximum team size.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    const tracks = tracksText.split(",").map((t) => t.trim()).filter(Boolean)
    const rules = rulesText.split("\n").map((r) => r.trim()).filter(Boolean)
    const perks = perksText.split("\n").map((p) => p.trim()).filter(Boolean)

    try {
      const res = await fetch("/api/organizer/opportunities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          category,
          tagline,
          description,
          longDescription: longDescription || description,
          mode,
          venue: venue || (mode === "Online" ? "Virtual (Discord / Meet)" : ""),
          location: location || (mode === "Online" ? "Online" : ""),
          startDate,
          endDate,
          registrationDeadline,
          teamSize: { min: Number(minTeamSize), max: Number(maxTeamSize) },
          prizePool,
          registrationFee,
          eligibility,
          tracks,
          rules,
          perks,
          image,
          isDraft,
          rounds: [
            {
              roundNumber: 1,
              name: "Round 1: Idea & PPT Submission",
              type: "idea_submission",
              description: "Submit your problem statement synopsis, solution architecture, and proposed tech stack.",
              startDate,
              endDate: registrationDeadline,
              submissionRequirements: "Slide deck (PDF) or Notion doc explaining problem statement and technical architecture.",
            },
          ],
        }),
      })

      const data = await res.json()

      if (res.ok && data.success) {
        toast({
          title: isDraft ? "Draft Saved ✅" : isVerified ? "Opportunity Published! 🎉" : "Submitted for Review ⏳",
          description: data.message,
        })
        router.push(`/organizer/opportunities/${data.opportunity._id}/rounds`)
      } else {
        toast({
          title: "Submission Failed",
          description: data.message || "Failed to create opportunity.",
          variant: "destructive",
        })
      }
    } catch {
      toast({
        title: "Network Error",
        description: "Could not connect to opportunity creation service.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl space-y-6">
      {/* Back button */}
      <div className="flex items-center justify-between pb-4 border-b">
        <Link
          href="/organizer/opportunities"
          className="flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Opportunities</span>
        </Link>
        <span className="text-xs text-muted-foreground font-medium">Step 1 of 2: Details & Rules</span>
      </div>

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Create New Opportunity</h1>
        <p className="text-xs text-muted-foreground mt-1">
          Define event details, eligibility, team size constraints, and registration deadlines.
        </p>
      </div>

      {/* Notice about verification gate */}
      {!isVerified && (
        <div className="rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 p-4 flex items-start gap-3 text-xs text-amber-800 dark:text-amber-300">
          <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div>
            <strong>Organization Verification Pending:</strong> You can save this opportunity as a draft
            and configure rounds and tests. Submitting for publication will queue it for admin verification.
          </div>
        </div>
      )}

      <Card className="shadow-sm border space-y-6">
        <CardContent className="pt-6 space-y-6">
          {/* Section 1: Basic Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              <span>1. Basic Information</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2 space-y-1.5">
                <Label className="text-xs">Opportunity Title *</Label>
                <Input
                  placeholder="e.g. NATIONAL HACKATHON 2026"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Category *</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Hackathon">Hackathon</SelectItem>
                    <SelectItem value="Workshop & Masterclass">Workshop & Masterclass</SelectItem>
                    <SelectItem value="Pitching Challenge">Pitching Challenge</SelectItem>
                    <SelectItem value="Tech Conclave">Tech Conclave</SelectItem>
                    <SelectItem value="Innovation Expo">Innovation Expo</SelectItem>
                    <SelectItem value="Technical Quiz">Technical Quiz</SelectItem>
                    <SelectItem value="Business Quiz">Business Quiz</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Tagline / Catchphrase *</Label>
              <Input
                placeholder="e.g. India's premier 36-hour sprint for student builders and developers."
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Short Description (Overview) *</Label>
              <Textarea
                rows={3}
                placeholder="Describe the opportunity, theme, mission, and who should join..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Section 2: Mode, Dates & Deadlines */}
          <div className="pt-4 border-t space-y-4">
            <h3 className="text-sm font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>2. Mode, Schedule & Deadlines</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs">Mode</Label>
                <Select value={mode} onValueChange={(val: any) => setMode(val)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Online">Online / Virtual</SelectItem>
                    <SelectItem value="Offline">Offline / On-Campus</SelectItem>
                    <SelectItem value="Hybrid">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Location / City</Label>
                <Input
                  placeholder="e.g. Meerut, Uttar Pradesh / Remote"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Venue / Platform</Label>
                <Input
                  placeholder="e.g. Main Auditorium / Discord"
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs">Registration Deadline *</Label>
                <Input
                  type="date"
                  value={registrationDeadline}
                  onChange={(e) => setRegistrationDeadline(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Event Start Date *</Label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Event End Date *</Label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          {/* Section 3: Team Constraints & Rewards */}
          <div className="pt-4 border-t space-y-4">
            <h3 className="text-sm font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider flex items-center gap-2">
              <Layers className="h-4 w-4" />
              <span>3. Team Rules, Prizes & Eligibility</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs">Min Team Size</Label>
                <Input
                  type="number"
                  min={1}
                  max={10}
                  value={minTeamSize}
                  onChange={(e) => setMinTeamSize(Number(e.target.value))}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Max Team Size</Label>
                <Input
                  type="number"
                  min={1}
                  max={10}
                  value={maxTeamSize}
                  onChange={(e) => setMaxTeamSize(Number(e.target.value))}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Prize Pool</Label>
                <Input
                  placeholder="e.g. ₹50,000"
                  value={prizePool}
                  onChange={(e) => setPrizePool(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Registration Fee</Label>
                <Input
                  placeholder="Free"
                  value={registrationFee}
                  onChange={(e) => setRegistrationFee(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Eligibility Criteria</Label>
              <Input
                placeholder="e.g. Open to B.Tech, BCA, MCA and undergraduate student developers."
                value={eligibility}
                onChange={(e) => setEligibility(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Competition Tracks (comma separated)</Label>
              <Input
                placeholder="AI/ML, Web3, FinTech, HealthTech, Open Innovation"
                value={tracksText}
                onChange={(e) => setTracksText(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs">Rules & Guidelines (one per line)</Label>
                <Textarea
                  rows={4}
                  value={rulesText}
                  onChange={(e) => setRulesText(e.target.value)}
                  className="text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Perks & Swag (one per line)</Label>
                <Textarea
                  rows={4}
                  value={perksText}
                  onChange={(e) => setPerksText(e.target.value)}
                  className="text-xs"
                />
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter className="pt-4 border-t flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-muted-foreground">
            Next: You will configure round timelines and submission requirements.
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Button
              type="button"
              variant="outline"
              disabled={loading}
              onClick={() => handleSubmit(true)}
              className="text-xs flex-1 sm:flex-none"
            >
              <Save className="h-3.5 w-3.5 mr-1.5" />
              Save as Draft
            </Button>

            <Button
              type="button"
              disabled={loading}
              onClick={() => handleSubmit(false)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs flex-1 sm:flex-none gap-1.5 shadow-sm"
            >
              {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              <Send className="h-3.5 w-3.5" />
              <span>{isVerified ? "Publish Opportunity" : "Submit for Approval"}</span>
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
