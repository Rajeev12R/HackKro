"use client"

import React, { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import {
  ArrowLeft,
  FileCheck2,
  Search,
  Github,
  Globe,
  FileText,
  Clock,
  Loader2,
  Award,
  History,
} from "lucide-react"

interface SubmissionItem {
  _id: string
  opportunityId: string
  roundNumber: number
  roundName: string
  registrationId: string
  participantName: string
  participantEmail: string
  teamName?: string
  title: string
  description: string
  links: {
    githubUrl?: string
    demoUrl?: string
    driveUrl?: string
    fileUrl?: string
  }
  submittedAt: string
  status: "pending" | "reviewed" | "shortlisted" | "rejected" | "needs_changes"
  score?: number
  feedback?: string
  reviewedBy?: string
  reviewedAt?: string
  auditHistory: {
    action: string
    changedBy: string
    previousStatus: string
    newStatus: string
    timestamp: string
    notes?: string
  }[]
}

export default function SubmissionsReviewPage() {
  const params = useParams()
  const { toast } = useToast()
  const oppId = params.id as string

  const [loading, setLoading] = useState(true)
  const [submittingReview, setSubmittingReview] = useState(false)
  const [opportunity, setOpportunity] = useState<any>(null)
  const [submissions, setSubmissions] = useState<SubmissionItem[]>([])

  // Filters
  const [selectedRound, setSelectedRound] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [search, setSearch] = useState<string>("")

  // Review Dialog State
  const [activeSub, setActiveSub] = useState<SubmissionItem | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [reviewStatus, setReviewStatus] = useState<SubmissionItem["status"]>("reviewed")
  const [reviewScore, setReviewScore] = useState<number | string>("")
  const [reviewFeedback, setReviewFeedback] = useState<string>("")

  const loadSubmissions = async () => {
    setLoading(true)
    try {
      const url = new URL(
        `/api/organizer/opportunities/${oppId}/submissions`,
        window.location.origin
      )
      if (selectedRound !== "all") url.searchParams.set("round", selectedRound)
      if (statusFilter !== "all") url.searchParams.set("status", statusFilter)
      if (search) url.searchParams.set("search", search)

      const res = await fetch(url.toString())
      const data = await res.json()

      if (res.ok && data.success) {
        setOpportunity(data.opportunity)
        setSubmissions(data.submissions || [])
      } else {
        toast({
          title: "Access Denied or Error",
          description: data.message || "Failed to load submissions.",
          variant: "destructive",
        })
      }
    } catch {
      toast({
        title: "Network Error",
        description: "Failed to connect to submission review service.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (oppId) loadSubmissions()
  }, [oppId, selectedRound, statusFilter])

  const openReviewDialog = (sub: SubmissionItem) => {
    setActiveSub(sub)
    setReviewStatus(sub.status)
    setReviewScore(sub.score !== undefined ? sub.score : "")
    setReviewFeedback(sub.feedback || "")
    setDialogOpen(true)
  }

  const handleSaveReview = async () => {
    if (!activeSub) return
    setSubmittingReview(true)

    try {
      const res = await fetch(`/api/organizer/submissions/${activeSub._id}/review`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: reviewStatus,
          score: reviewScore !== "" ? Number(reviewScore) : undefined,
          feedback: reviewFeedback,
        }),
      })

      const data = await res.json()
      if (res.ok && data.success) {
        toast({
          title: "Review Saved ✅",
          description: data.message,
        })
        setDialogOpen(false)
        loadSubmissions()
      } else {
        toast({
          title: "Review Error",
          description: data.message || "Failed to update review status.",
          variant: "destructive",
        })
      }
    } catch {
      toast({
        title: "Network Error",
        description: "Could not save review feedback.",
        variant: "destructive",
      })
    } finally {
      setSubmittingReview(false)
    }
  }

  // Quick stats
  const totalSubmissions = submissions.length
  const pendingCount = submissions.filter((s) => s.status === "pending").length
  const shortlistedCount = submissions.filter((s) => s.status === "shortlisted").length
  const reviewedCount = submissions.filter((s) => s.status === "reviewed").length

  const getStatusBadge = (status: SubmissionItem["status"]) => {
    switch (status) {
      case "shortlisted":
        return <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 text-[10px]">Shortlisted</Badge>
      case "reviewed":
        return <Badge className="bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30 text-[10px]">Reviewed</Badge>
      case "needs_changes":
        return <Badge className="bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30 text-[10px]">Needs Changes</Badge>
      case "rejected":
        return <Badge className="bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/30 text-[10px]">Rejected</Badge>
      default:
        return <Badge className="bg-muted text-muted-foreground border text-[10px]">Pending</Badge>
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Top Header */}
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
              Rounds Engine
            </Button>
          </Link>
          <Link href={`/organizer/opportunities/${oppId}/registrations`}>
            <Button variant="outline" size="sm" className="h-7 text-xs text-blue-600 dark:text-blue-400">
              Registrations Roster
            </Button>
          </Link>
        </div>
      </div>

      {/* Title */}
      <div>
        <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
          Evaluation & Audit Trail System
        </span>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Submissions Review: {opportunity?.title || "Loading..."}
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Review participant deliverables, score submissions, provide feedback, and record audit history.
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-4 border">
          <div className="text-xs text-muted-foreground font-medium">Total Submissions</div>
          <div className="text-2xl font-black text-foreground mt-1">{totalSubmissions}</div>
        </Card>
        <Card className="p-4 border">
          <div className="text-xs text-muted-foreground font-medium">Pending Evaluation</div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">{pendingCount}</div>
        </Card>
        <Card className="p-4 border">
          <div className="text-xs text-muted-foreground font-medium">Reviewed</div>
          <div className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">{reviewedCount}</div>
        </Card>
        <Card className="p-4 border">
          <div className="text-xs text-muted-foreground font-medium">Shortlisted</div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{shortlistedCount}</div>
        </Card>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by project title, participant name, or registration ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && loadSubmissions()}
            className="pl-9 text-xs h-9"
          />
        </div>

        {opportunity?.rounds && opportunity.rounds.length > 0 && (
          <Select value={selectedRound} onValueChange={setSelectedRound}>
            <SelectTrigger className="w-full sm:w-[180px] text-xs h-9">
              <SelectValue placeholder="All Rounds" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Rounds</SelectItem>
              {opportunity.rounds.map((r: any) => (
                <SelectItem key={r.roundNumber} value={String(r.roundNumber)}>
                  Round {r.roundNumber}: {r.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[160px] text-xs h-9">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="reviewed">Reviewed</SelectItem>
            <SelectItem value="shortlisted">Shortlisted</SelectItem>
            <SelectItem value="needs_changes">Needs Changes</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Submissions Table */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400" />
          <p className="text-sm text-muted-foreground">Loading submissions...</p>
        </div>
      ) : submissions.length === 0 ? (
        <Card className="border-dashed p-12 text-center">
          <div className="mx-auto h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-3">
            <FileCheck2 className="h-6 w-6" />
          </div>
          <h3 className="text-base font-semibold text-foreground">No Submissions Found</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1">
            {search || statusFilter !== "all" || selectedRound !== "all"
              ? "No submissions match your current filter settings."
              : "Participant project and round submissions will appear here once candidates start submitting."}
          </p>
        </Card>
      ) : (
        <Card className="overflow-hidden border shadow-sm">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="text-xs">Submission Title</TableHead>
                  <TableHead className="text-xs">Participant / Team</TableHead>
                  <TableHead className="text-xs">Round</TableHead>
                  <TableHead className="text-xs">Links</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  <TableHead className="text-xs text-center">Score</TableHead>
                  <TableHead className="text-xs text-right">Review Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {submissions.map((sub) => (
                  <TableRow key={sub._id} className="hover:bg-muted/40 transition-colors">
                    <TableCell className="font-medium max-w-[220px]">
                      <div className="font-bold text-foreground text-xs truncate">{sub.title}</div>
                      <div className="text-[11px] text-muted-foreground font-mono">{sub.registrationId}</div>
                    </TableCell>

                    <TableCell className="text-xs">
                      <div className="font-semibold text-foreground">{sub.participantName}</div>
                      {sub.teamName ? (
                        <div className="text-[10px] text-purple-600 dark:text-purple-300">Team: {sub.teamName}</div>
                      ) : (
                        <div className="text-[10px] text-muted-foreground">Solo</div>
                      )}
                    </TableCell>

                    <TableCell className="text-xs font-medium text-foreground">
                      <div>Round {sub.roundNumber}</div>
                      <div className="text-[10px] text-muted-foreground truncate max-w-[120px]">{sub.roundName}</div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        {sub.links?.githubUrl && (
                          <a
                            href={sub.links.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
                            title="GitHub"
                          >
                            <Github className="h-3.5 w-3.5" />
                          </a>
                        )}
                        {sub.links?.demoUrl && (
                          <a
                            href={sub.links.demoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 rounded hover:bg-muted text-blue-600 dark:text-blue-400"
                            title="Demo"
                          >
                            <Globe className="h-3.5 w-3.5" />
                          </a>
                        )}
                        {sub.links?.driveUrl && (
                          <a
                            href={sub.links.driveUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 rounded hover:bg-muted text-amber-600 dark:text-amber-400"
                            title="Drive"
                          >
                            <FileText className="h-3.5 w-3.5" />
                          </a>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>{getStatusBadge(sub.status)}</TableCell>

                    <TableCell className="text-center font-bold text-xs">
                      {sub.score !== undefined ? (
                        <span className="text-emerald-600 dark:text-emerald-400">{sub.score} / 100</span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>

                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openReviewDialog(sub)}
                        className="h-7 text-xs text-indigo-600 dark:text-indigo-400"
                      >
                        Evaluate
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      {/* Review Dialog & Audit Trail */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-base">Evaluate Submission</DialogTitle>
              {activeSub && getStatusBadge(activeSub.status)}
            </div>
            <DialogDescription className="text-xs text-muted-foreground">
              Round {activeSub?.roundNumber}: {activeSub?.roundName} • {activeSub?.participantName}
            </DialogDescription>
          </DialogHeader>

          {activeSub && (
            <div className="space-y-4 py-2 text-xs">
              {/* Submission Information */}
              <div className="p-3.5 rounded-lg bg-muted/40 border space-y-2">
                <div className="text-sm font-bold text-foreground">{activeSub.title}</div>
                <p className="text-foreground/85 whitespace-pre-wrap">{activeSub.description}</p>

                {/* Submitted Links */}
                <div className="flex items-center gap-3 pt-2 border-t">
                  {activeSub.links?.githubUrl && (
                    <a
                      href={activeSub.links.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 hover:underline font-medium"
                    >
                      <Github className="h-3.5 w-3.5" />
                      <span>Code Repository</span>
                    </a>
                  )}
                  {activeSub.links?.demoUrl && (
                    <a
                      href={activeSub.links.demoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 hover:underline font-medium"
                    >
                      <Globe className="h-3.5 w-3.5" />
                      <span>Live Demonstration</span>
                    </a>
                  )}
                  {activeSub.links?.driveUrl && (
                    <a
                      href={activeSub.links.driveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 hover:underline font-medium"
                    >
                      <FileText className="h-3.5 w-3.5" />
                      <span>Presentation / Drive</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Review Input Controls */}
              <div className="p-3.5 rounded-lg bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 space-y-3">
                <div className="font-bold text-blue-700 dark:text-blue-300 flex items-center gap-1.5">
                  <Award className="h-4 w-4" />
                  <span>Organizer Scoring & Status</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Decision Status *</Label>
                    <Select
                      value={reviewStatus}
                      onValueChange={(val: any) => setReviewStatus(val)}
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="shortlisted">Shortlisted for Next Round</SelectItem>
                        <SelectItem value="reviewed">Reviewed / Evaluated</SelectItem>
                        <SelectItem value="needs_changes">Needs Changes / Resubmission</SelectItem>
                        <SelectItem value="rejected">Rejected / Disqualified</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">Score (0 - 100)</Label>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      placeholder="e.g. 85"
                      value={reviewScore}
                      onChange={(e) => setReviewScore(e.target.value)}
                      className="h-9"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Organizer Feedback & Notes</Label>
                  <Textarea
                    rows={2}
                    placeholder="Enter constructive remarks, code review comments, or criteria met..."
                    value={reviewFeedback}
                    onChange={(e) => setReviewFeedback(e.target.value)}
                    className="text-xs"
                  />
                </div>
              </div>

              {/* Audit Trail History */}
              {activeSub.auditHistory && activeSub.auditHistory.length > 0 && (
                <div className="space-y-2 pt-2 border-t">
                  <div className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                    <History className="h-3.5 w-3.5" />
                    <span>Audit Trail History</span>
                  </div>

                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                    {activeSub.auditHistory.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-2 rounded bg-muted/60 border text-[11px] flex flex-col justify-between"
                      >
                        <div className="flex items-center justify-between text-muted-foreground">
                          <span className="font-medium text-foreground">
                            {item.changedBy} ({item.action})
                          </span>
                          <span>{new Date(item.timestamp).toLocaleString()}</span>
                        </div>
                        <div className="text-muted-foreground mt-0.5">
                          Status: <span className="text-foreground">{item.previousStatus}</span> →{" "}
                          <span className="text-blue-600 dark:text-blue-400 font-semibold">{item.newStatus}</span>
                          {item.notes && <span className="ml-2 text-muted-foreground">[{item.notes}]</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

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
              disabled={submittingReview}
              onClick={handleSaveReview}
              className="bg-blue-600 hover:bg-blue-700 text-white gap-1.5"
            >
              {submittingReview && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              <span>Save Evaluation</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
