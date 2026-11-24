"use client"

import React, { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { useOrganizerAuth } from "../../../auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Save, Send, Loader2, Sparkles, Calendar, Layers } from "lucide-react"

export default function EditOpportunityPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const { organizer } = useOrganizerAuth()

  const oppId = params.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Form State
  const [title, setTitle] = useState("")
  const [category, setCategory] = useState("Hackathon")
  const [tagline, setTagline] = useState("")
  const [description, setDescription] = useState("")
  const [mode, setMode] = useState<"Online" | "Offline" | "Hybrid">("Online")
  const [venue, setVenue] = useState("")
  const [location, setLocation] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [registrationDeadline, setRegistrationDeadline] = useState("")
  const [minTeamSize, setMinTeamSize] = useState(1)
  const [maxTeamSize, setMaxTeamSize] = useState(4)
  const [prizePool, setPrizePool] = useState("")
  const [registrationFee, setRegistrationFee] = useState("Free")
  const [eligibility, setEligibility] = useState("")
  const [tracksText, setTracksText] = useState("")
  const [rulesText, setRulesText] = useState("")
  const [perksText, setPerksText] = useState("")
  const [status, setStatus] = useState("draft")

  const isVerified = organizer?.verificationStatus === "verified"

  useEffect(() => {
    const fetchOpportunity = async () => {
      try {
        const res = await fetch(`/api/organizer/opportunities/${oppId}`)
        const data = await res.json()
        if (res.ok && data.success && data.opportunity) {
          const opp = data.opportunity
          setTitle(opp.title || "")
          setCategory(opp.category || "Hackathon")
          setTagline(opp.tagline || "")
          setDescription(opp.description || "")
          setMode(opp.mode || "Online")
          setVenue(opp.venue || "")
          setLocation(opp.location || "")
          setStartDate(opp.startDate ? new Date(opp.startDate).toISOString().split("T")[0] : "")
          setEndDate(opp.endDate ? new Date(opp.endDate).toISOString().split("T")[0] : "")
          setRegistrationDeadline(
            opp.registrationDeadline ? new Date(opp.registrationDeadline).toISOString().split("T")[0] : ""
          )
          setMinTeamSize(opp.teamSize?.min || 1)
          setMaxTeamSize(opp.teamSize?.max || 4)
          setPrizePool(opp.prizePool || "")
          setRegistrationFee(opp.registrationFee || "Free")
          setEligibility(opp.eligibility || "")
          setTracksText((opp.tracks || []).join(", "))
          setRulesText((opp.rules || []).join("\n"))
          setPerksText((opp.perks || []).join("\n"))
          setStatus(opp.status || "draft")
        } else {
          toast({
            title: "Error",
            description: data.message || "Failed to load opportunity details",
            variant: "destructive",
          })
          router.push("/organizer/opportunities")
        }
      } catch {
        toast({
          title: "Network Error",
          description: "Failed to connect to backend",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    if (oppId) {
      fetchOpportunity()
    }
  }, [oppId])

  const handleSave = async (newStatus?: string) => {
    setSaving(true)
    const tracks = tracksText.split(",").map((t) => t.trim()).filter(Boolean)
    const rules = rulesText.split("\n").map((r) => r.trim()).filter(Boolean)
    const perks = perksText.split("\n").map((p) => p.trim()).filter(Boolean)

    try {
      const res = await fetch(`/api/organizer/opportunities/${oppId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          category,
          tagline,
          description,
          mode,
          venue,
          location,
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
          status: newStatus || status,
        }),
      })

      const data = await res.json()
      if (res.ok && data.success) {
        toast({
          title: "Opportunity Updated ✅",
          description: "All changes have been saved successfully.",
        })
        router.push("/organizer/opportunities")
      } else {
        toast({
          title: "Save Failed",
          description: data.message || "Failed to update opportunity.",
          variant: "destructive",
        })
      }
    } catch {
      toast({
        title: "Network Error",
        description: "Could not connect to opportunity service.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400" />
        <p className="text-sm text-muted-foreground">Loading opportunity details...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl space-y-6">
      <div className="flex items-center justify-between pb-4 border-b">
        <Link
          href="/organizer/opportunities"
          className="flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Opportunities</span>
        </Link>
        <div className="flex items-center gap-2">
          <Link href={`/organizer/opportunities/${oppId}/rounds`}>
            <Button variant="outline" size="sm" className="h-7 text-xs">
              Manage Rounds
            </Button>
          </Link>
          <Link href={`/organizer/opportunities/${oppId}/registrations`}>
            <Button variant="outline" size="sm" className="h-7 text-xs text-blue-600 dark:text-blue-400">
              View Roster
            </Button>
          </Link>
        </div>
      </div>

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Edit Opportunity</h1>
        <p className="text-xs text-muted-foreground mt-1">Update details, dates, rules, or status.</p>
      </div>

      <Card className="shadow-sm border space-y-6">
        <CardContent className="pt-6 space-y-6">
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              <span>Basic Information</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2 space-y-1.5">
                <Label className="text-xs">Opportunity Title *</Label>
                <Input
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
              <Label className="text-xs">Tagline *</Label>
              <Input
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Description *</Label>
              <Textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="pt-4 border-t space-y-4">
            <h3 className="text-sm font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>Schedule & Deadlines</span>
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
                <Label className="text-xs">Location</Label>
                <Input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Venue</Label>
                <Input
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs">Registration Deadline</Label>
                <Input
                  type="date"
                  value={registrationDeadline}
                  onChange={(e) => setRegistrationDeadline(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Start Date</Label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">End Date</Label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t space-y-4">
            <h3 className="text-sm font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider flex items-center gap-2">
              <Layers className="h-4 w-4" />
              <span>Team Rules & Prizes</span>
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
                  value={prizePool}
                  onChange={(e) => setPrizePool(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Registration Fee</Label>
                <Input
                  value={registrationFee}
                  onChange={(e) => setRegistrationFee(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Eligibility</Label>
              <Input
                value={eligibility}
                onChange={(e) => setEligibility(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Tracks (comma separated)</Label>
              <Input
                value={tracksText}
                onChange={(e) => setTracksText(e.target.value)}
              />
            </div>
          </div>
        </CardContent>

        <CardFooter className="pt-4 border-t flex items-center justify-between">
          <div className="text-xs text-muted-foreground">
            Current Status: <span className="uppercase font-semibold text-foreground">{status}</span>
          </div>

          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              disabled={saving}
              onClick={() => handleSave("draft")}
              className="text-xs"
            >
              <Save className="h-3.5 w-3.5 mr-1.5" />
              Save Draft
            </Button>

            <Button
              type="button"
              disabled={saving}
              onClick={() => handleSave("published")}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs gap-1.5 shadow-sm"
            >
              {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              <Send className="h-3.5 w-3.5" />
              <span>{isVerified ? "Update & Publish" : "Update & Submit for Review"}</span>
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
