"use client"

import React, { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import {
  ArrowLeft,
  Plus,
  Trash2,
  Calendar,
  Layers,
  Save,
  Loader2,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
} from "lucide-react"

interface RoundItem {
  roundNumber: number
  name: string
  type: "online_quiz" | "idea_submission" | "project_submission" | "offline_presentation" | "interview"
  description: string
  instructions?: string
  startDate: string
  endDate: string
  submissionRequirements?: string
  status?: "upcoming" | "active" | "completed"
}

export default function RoundsManagerPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()

  const oppId = params.id as string

  const [opportunityTitle, setOpportunityTitle] = useState("")
  const [rounds, setRounds] = useState<RoundItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Dialog State for Adding/Editing Round
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editIndex, setEditIndex] = useState<number | null>(null)
  const [roundName, setRoundName] = useState("")
  const [roundType, setRoundType] = useState<RoundItem["type"]>("idea_submission")
  const [roundDesc, setRoundDesc] = useState("")
  const [roundInstructions, setRoundInstructions] = useState("")
  const [roundStartDate, setRoundStartDate] = useState("")
  const [roundEndDate, setRoundEndDate] = useState("")
  const [roundReqs, setRoundReqs] = useState("")

  const loadRounds = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/organizer/opportunities/${oppId}/rounds`)
      const data = await res.json()
      if (res.ok && data.success) {
        setOpportunityTitle(data.opportunityTitle || "Opportunity")
        setRounds(
          (data.rounds || []).map((r: any) => ({
            roundNumber: r.roundNumber,
            name: r.name,
            type: r.type,
            description: r.description,
            instructions: r.instructions || "",
            startDate: r.startDate ? new Date(r.startDate).toISOString().split("T")[0] : "",
            endDate: r.endDate ? new Date(r.endDate).toISOString().split("T")[0] : "",
            submissionRequirements: r.submissionRequirements || "",
            status: r.status || "upcoming",
          }))
        )
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to load rounds.",
          variant: "destructive",
        })
      }
    } catch {
      toast({
        title: "Network Error",
        description: "Failed to connect to rounds service.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (oppId) loadRounds()
  }, [oppId])

  const openAddRoundDialog = () => {
    setEditIndex(null)
    const nextNumber = rounds.length + 1
    setRoundName(`Round ${nextNumber}: ${nextNumber === 1 ? "Idea Submission" : "Prototype Demo"}`)
    setRoundType(nextNumber === 1 ? "idea_submission" : "project_submission")
    setRoundDesc("Explain the problem statement, technical approach, and prototype demo.")
    setRoundInstructions("Submit your code repository link, live deployment URL, and presentation slide deck.")
    setRoundReqs("GitHub Repository URL, Demo Link, Readme file")

    // Default dates from previous round or today
    const lastRound = rounds[rounds.length - 1]
    if (lastRound && lastRound.endDate) {
      setRoundStartDate(lastRound.endDate)
      const nextWeek = new Date(new Date(lastRound.endDate).getTime() + 7 * 24 * 60 * 60 * 1000)
      setRoundEndDate(nextWeek.toISOString().split("T")[0])
    } else {
      const today = new Date().toISOString().split("T")[0]
      setRoundStartDate(today)
      const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
      setRoundEndDate(nextWeek)
    }

    setDialogOpen(true)
  }

  const openEditRoundDialog = (idx: number) => {
    const r = rounds[idx]
    setEditIndex(idx)
    setRoundName(r.name)
    setRoundType(r.type)
    setRoundDesc(r.description)
    setRoundInstructions(r.instructions || "")
    setRoundStartDate(r.startDate)
    setRoundEndDate(r.endDate)
    setRoundReqs(r.submissionRequirements || "")
    setDialogOpen(true)
  }

  const handleSaveRoundInDialog = () => {
    if (!roundName || !roundDesc || !roundStartDate || !roundEndDate) {
      toast({
        title: "Missing Fields",
        description: "Please fill in Round Name, Description, Start Date, and End Date.",
        variant: "destructive",
      })
      return
    }

    if (new Date(roundEndDate) < new Date(roundStartDate)) {
      toast({
        title: "Invalid Dates",
        description: "Round End Date cannot be before Start Date.",
        variant: "destructive",
      })
      return
    }

    const updatedRounds = [...rounds]
    const roundData: RoundItem = {
      roundNumber: editIndex !== null ? rounds[editIndex].roundNumber : rounds.length + 1,
      name: roundName.trim(),
      type: roundType,
      description: roundDesc.trim(),
      instructions: roundInstructions.trim(),
      startDate: roundStartDate,
      endDate: roundEndDate,
      submissionRequirements: roundReqs.trim(),
      status: "upcoming",
    }

    if (editIndex !== null) {
      updatedRounds[editIndex] = roundData
    } else {
      updatedRounds.push(roundData)
    }

    // Renumber rounds sequentially
    updatedRounds.forEach((r, i) => {
      r.roundNumber = i + 1
    })

    setRounds(updatedRounds)
    setDialogOpen(false)
  }

  const handleDeleteRound = (idx: number) => {
    if (rounds.length <= 1) {
      toast({
        title: "Cannot Delete",
        description: "Every opportunity must have at least one round.",
        variant: "destructive",
      })
      return
    }

    const updated = rounds.filter((_, i) => i !== idx)
    updated.forEach((r, i) => {
      r.roundNumber = i + 1
    })
    setRounds(updated)
  }

  const handleSaveAllRounds = async () => {
    setSaving(true)
    try {
      const res = await fetch(`/api/organizer/opportunities/${oppId}/rounds`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rounds }),
      })

      const data = await res.json()
      if (res.ok && data.success) {
        toast({
          title: "Rounds Saved! ✅",
          description: "Round configuration has been saved and validated on the backend.",
        })
        loadRounds()
      } else {
        toast({
          title: "Validation Error",
          description: data.message || "Failed to update rounds.",
          variant: "destructive",
        })
      }
    } catch {
      toast({
        title: "Network Error",
        description: "Failed to connect to rounds service.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const getRoundTypeLabel = (type: RoundItem["type"]) => {
    switch (type) {
      case "idea_submission":
        return "Idea / PPT Submission"
      case "project_submission":
        return "Project Prototype / Code"
      case "online_quiz":
        return "Online Technical Quiz"
      case "offline_presentation":
        return "In-Person Demo / Pitch"
      case "interview":
        return "Technical Interview / Viva"
      default:
        return type
    }
  }

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400" />
        <p className="text-sm text-muted-foreground">Loading round configurations...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 border-b">
        <Link
          href={`/organizer/opportunities/${oppId}/edit`}
          className="flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Opportunity Edit</span>
        </Link>
        <div className="flex items-center gap-2">
          <Link href={`/organizer/opportunities/${oppId}/submissions`}>
            <Button variant="outline" size="sm" className="h-7 text-xs text-indigo-600 dark:text-indigo-400">
              Review Submissions
            </Button>
          </Link>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
            Workflow & Progression Engine
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Rounds Manager: {opportunityTitle}
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Configure sequential evaluation rounds, start/end dates, and participant deliverables.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={openAddRoundDialog}
            variant="outline"
            size="sm"
            className="text-xs"
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            Add Round
          </Button>

          <Button
            onClick={handleSaveAllRounds}
            disabled={saving}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs gap-1.5 shadow-sm"
          >
            {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            <Save className="h-3.5 w-3.5" />
            <span>Save Configuration</span>
          </Button>
        </div>
      </div>

      {/* Rounds Sequential Pipeline View */}
      <div className="space-y-4">
        {rounds.map((round, idx) => (
          <Card
            key={idx}
            className="hover:shadow-md transition-all border overflow-hidden"
          >
            <div className="border-l-4 border-l-blue-600 dark:border-l-blue-500 p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-950/60 flex items-center justify-center font-bold text-sm text-blue-600 dark:text-blue-400">
                    {round.roundNumber}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-foreground">{round.name}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge className="bg-muted text-foreground border text-[10px]">
                        {getRoundTypeLabel(round.type)}
                      </Badge>
                      <span className="text-[11px] text-muted-foreground">
                        {round.status === "active" ? "🟢 Active" : "⏳ Upcoming"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditRoundDialog(idx)}
                    className="h-7 text-xs"
                  >
                    Edit Round
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteRound(idx)}
                    className="h-7 w-7 p-0 text-muted-foreground hover:text-rose-600"
                    title="Delete Round"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              <p className="text-xs text-foreground/80">{round.description}</p>

              {/* Round Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t text-xs">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />
                  <span>
                    <strong>Timeline:</strong> {round.startDate || "TBD"} → {round.endDate || "TBD"}
                  </span>
                </div>

                {round.submissionRequirements && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <FileText className="h-4 w-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                    <span className="truncate">
                      <strong>Deliverables:</strong> {round.submissionRequirements}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Add / Edit Round Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-base">
              {editIndex !== null ? `Edit Round ${editIndex + 1}` : "Add New Round"}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Define deliverables, submission dates, and round format.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Round Name *</Label>
              <Input
                value={roundName}
                onChange={(e) => setRoundName(e.target.value)}
                placeholder="e.g. Round 1: Idea & Synopsis"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Round Type *</Label>
              <Select value={roundType} onValueChange={(val: any) => setRoundType(val)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="idea_submission">Idea / PPT Submission</SelectItem>
                  <SelectItem value="project_submission">Project Prototype / Code Demo</SelectItem>
                  <SelectItem value="online_quiz">Online Technical Quiz</SelectItem>
                  <SelectItem value="offline_presentation">Offline Presentation / Demo</SelectItem>
                  <SelectItem value="interview">Technical Interview / Viva</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Start Date *</Label>
                <Input
                  type="date"
                  value={roundStartDate}
                  onChange={(e) => setRoundStartDate(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">End Date *</Label>
                <Input
                  type="date"
                  value={roundEndDate}
                  onChange={(e) => setRoundEndDate(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Round Description *</Label>
              <Textarea
                rows={2}
                value={roundDesc}
                onChange={(e) => setRoundDesc(e.target.value)}
                placeholder="Brief summary of what this round evaluates..."
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Submission Requirements</Label>
              <Input
                value={roundReqs}
                onChange={(e) => setRoundReqs(e.target.value)}
                placeholder="e.g. GitHub Link, Video Demo, PDF Presentation"
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Candidate Instructions (Optional)</Label>
              <Textarea
                rows={2}
                value={roundInstructions}
                onChange={(e) => setRoundInstructions(e.target.value)}
                placeholder="Detailed instructions visible to participants..."
                className="text-xs"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleSaveRoundInDialog}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Apply Round
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
