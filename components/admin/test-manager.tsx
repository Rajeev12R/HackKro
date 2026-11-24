"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import {
  Loader2,
  Plus,
  RefreshCw,
  Search,
  Send,
  Mail,
  Key,
  Award,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  ShieldAlert,
  FileSpreadsheet,
  Download,
  Trash2,
  Copy,
  ExternalLink,
  Calendar,
  Settings,
  Megaphone,
  CheckCircle2,
} from "lucide-react"
import { EVENTS_DATA } from "@/lib/events-data"

interface TestItem {
  _id: string
  testId: string
  title: string
  eventId: string
  eventTitle: string
  durationMinutes: number
  totalMarks: number
  passingMarks?: number
  scheduledDate?: string
  startTime?: string
  endTime?: string
  isActive: boolean
  instructions?: string[]
  isResultDeclared?: boolean
  questions: any[]
  stats?: {
    totalCandidates: number
    eligibleCandidates: number
    submittedCandidates: number
    questionCount: number
  }
}

interface CandidateItem {
  _id: string
  testId: string
  name: string
  email: string
  loginId: string
  password: string
  college?: string
  registrationId?: string
  isEligible: boolean
  status: "not-started" | "in-progress" | "submitted"
  score?: number
  rank?: number
  timeTakenSeconds?: number
  tabSwitches?: number
  reminderEmailSent: boolean
  passwordEmailSent: boolean
  resultEmailSent: boolean
  submittedAt?: string
}

interface LeaderboardItem {
  id: string
  name: string
  email: string
  college: string
  score: number
  totalMarks: number
  rank: number
  timeTakenSeconds: number
  timeTakenFormatted: string
  submittedAt: string
  tabSwitches: number
  totalAnswered: number
}

export function TestManager() {
  const { toast } = useToast()

  const [tests, setTests] = useState<TestItem[]>([])
  const [selectedTestId, setSelectedTestId] = useState<string>("codesprint-2026-c-quiz")
  const [isLoadingTests, setIsLoadingTests] = useState(false)

  // Candidates state
  const [candidates, setCandidates] = useState<CandidateItem[]>([])
  const [isLoadingCandidates, setIsLoadingCandidates] = useState(false)
  const [candidateSearch, setCandidateSearch] = useState("")

  // Leaderboard state
  const [leaderboard, setLeaderboard] = useState<LeaderboardItem[]>([])
  const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState(false)

  // Import Dialog state
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [availableRegistrations, setAvailableRegistrations] = useState<any[]>([])
  const [selectedRegIds, setSelectedRegIds] = useState<string[]>([])
  const [selectedImportEventId, setSelectedImportEventId] = useState<string>("codefest-2026")
  const [isLoadingRegistrations, setIsLoadingRegistrations] = useState(false)
  const [isImporting, setIsImporting] = useState(false)

  // Add Candidate Dialog state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [newCandidateName, setNewCandidateName] = useState("")
  const [newCandidateEmail, setNewCandidateEmail] = useState("")
  const [newCandidateCollege, setNewCandidateCollege] = useState("")
  const [newCandidatePassword, setNewCandidatePassword] = useState("")

  // Email Action loading state
  const [isSendingEmails, setIsSendingEmails] = useState(false)
  const [isRecalculating, setIsRecalculating] = useState(false)

  // 1. Fetch Tests
  const fetchTests = async () => {
    setIsLoadingTests(true)
    try {
      const res = await fetch("/api/admin/tests")
      const data = await res.json()
      if (data.success && Array.isArray(data.tests)) {
        setTests(data.tests)
        if (data.tests.length > 0 && !selectedTestId) {
          setSelectedTestId(data.tests[0].testId)
        }
      }
    } catch (err: any) {
      toast({ title: "Error", description: "Failed to load tests", variant: "destructive" })
    } finally {
      setIsLoadingTests(false)
    }
  }

  // 2. Fetch Candidates
  const fetchCandidates = async (testId: string) => {
    if (!testId) return
    setIsLoadingCandidates(true)
    try {
      const res = await fetch(`/api/admin/tests/${testId}/candidates`)
      const data = await res.json()
      if (data.success && Array.isArray(data.candidates)) {
        setCandidates(data.candidates)
      }
    } catch (err: any) {
      toast({ title: "Error", description: "Failed to load candidates", variant: "destructive" })
    } finally {
      setIsLoadingCandidates(false)
    }
  }

  // 3. Fetch Leaderboard
  const fetchLeaderboard = async (testId: string) => {
    if (!testId) return
    setIsLoadingLeaderboard(true)
    try {
      const res = await fetch(`/api/admin/tests/${testId}/leaderboard`)
      const data = await res.json()
      if (data.success && Array.isArray(data.leaderboard)) {
        setLeaderboard(data.leaderboard)
      }
    } catch (err: any) {
      toast({ title: "Error", description: "Failed to load leaderboard", variant: "destructive" })
    } finally {
      setIsLoadingLeaderboard(false)
    }
  }

  useEffect(() => {
    fetchTests()
  }, [])

  // Active Test
  const currentTest = tests.find((t) => t.testId === selectedTestId) || tests[0]

  useEffect(() => {
    if (selectedTestId) {
      fetchCandidates(selectedTestId)
      fetchLeaderboard(selectedTestId)
      const t = tests.find((item) => item.testId === selectedTestId)
      if (t?.eventId) {
        setSelectedImportEventId(t.eventId)
      }
    }
  }, [selectedTestId, tests])

  // Edit Test Schedule state
  const [isEditScheduleOpen, setIsEditScheduleOpen] = useState(false)
  const [editDate, setEditDate] = useState("")
  const [editStartTime, setEditStartTime] = useState("")
  const [editEndTime, setEditEndTime] = useState("")
  const [editDuration, setEditDuration] = useState(30)
  const [editIsActive, setEditIsActive] = useState(true)
  const [editIsDeclared, setEditIsDeclared] = useState(false)
  const [isSavingSchedule, setIsSavingSchedule] = useState(false)
  const [isTogglingResult, setIsTogglingResult] = useState(false)

  const handleOpenEditSchedule = () => {
    if (!currentTest) return
    setEditDate(currentTest.scheduledDate || "")
    setEditStartTime(currentTest.startTime || "")
    setEditEndTime(currentTest.endTime || "")
    setEditDuration(currentTest.durationMinutes || 30)
    setEditIsActive(currentTest.isActive !== false)
    setEditIsDeclared(Boolean(currentTest.isResultDeclared))
    setIsEditScheduleOpen(true)
  }

  const handleSaveSchedule = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSavingSchedule(true)
    try {
      const res = await fetch(`/api/admin/tests/${selectedTestId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scheduledDate: editDate,
          startTime: editStartTime,
          endTime: editEndTime,
          durationMinutes: Number(editDuration),
          isActive: editIsActive,
          isResultDeclared: editIsDeclared,
        }),
      })
      const data = await res.json()
      if (data.success) {
        toast({ title: "Settings Saved", description: "Assessment schedule and configuration updated." })
        setIsEditScheduleOpen(false)
        fetchTests()
      } else {
        toast({ title: "Error", description: data.message, variant: "destructive" })
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" })
    } finally {
      setIsSavingSchedule(false)
    }
  }

  // Quick Declare / Conceal Results Toggle
  const handleToggleResultDeclaration = async () => {
    if (!currentTest) return
    const newDeclaredState = !currentTest.isResultDeclared
    const actionPrompt = newDeclaredState
      ? `Are you sure you want to declare results for "${currentTest.title}"? Candidates will now be able to view their scores and All-India ranks.`
      : `Hide results for "${currentTest.title}"? Scores and ranks will be concealed from candidates.`

    if (!confirm(actionPrompt)) return

    setIsTogglingResult(true)
    try {
      const res = await fetch(`/api/admin/tests/${selectedTestId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isResultDeclared: newDeclaredState }),
      })
      const data = await res.json()
      if (data.success) {
        toast({
          title: newDeclaredState ? "Results Declared! 📢" : "Results Concealed 🔒",
          description: newDeclaredState
            ? "Results are now published. You can now dispatch result emails to candidates."
            : "Results are now hidden from candidate view.",
        })
        fetchTests()
      } else {
        toast({ title: "Error", description: data.message, variant: "destructive" })
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" })
    } finally {
      setIsTogglingResult(false)
    }
  }

  // Toggle Eligibility (Whitelist feature)
  const handleToggleEligibility = async (candidateId: string) => {
    try {
      const res = await fetch(`/api/admin/tests/${selectedTestId}/candidates`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidateId,
          action: "toggle-eligibility",
        }),
      })
      const data = await res.json()
      if (data.success) {
        setCandidates((prev) =>
          prev.map((c) => (c._id === candidateId ? { ...c, isEligible: !c.isEligible } : c))
        )
        toast({ title: "Updated", description: "Candidate eligibility updated." })
      }
    } catch (err: any) {
      toast({ title: "Error", description: "Failed to update eligibility", variant: "destructive" })
    }
  }

  // Reset Password
  const handleResetPassword = async (candidateId: string) => {
    try {
      const res = await fetch(`/api/admin/tests/${selectedTestId}/candidates`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidateId,
          action: "reset-password",
        }),
      })
      const data = await res.json()
      if (data.success) {
        setCandidates((prev) =>
          prev.map((c) => (c._id === candidateId ? { ...c, password: data.newPassword } : c))
        )
        toast({
          title: "Password Reset",
          description: `New Password: ${data.newPassword}`,
        })
      }
    } catch (err: any) {
      toast({ title: "Error", description: "Failed to reset password", variant: "destructive" })
    }
  }

  // Delete Candidate
  const handleDeleteCandidate = async (candidateId: string) => {
    if (!confirm("Are you sure you want to remove this candidate from the test?")) return
    try {
      const res = await fetch(`/api/admin/tests/${selectedTestId}/candidates`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidateId,
          action: "delete",
        }),
      })
      const data = await res.json()
      if (data.success) {
        setCandidates((prev) => prev.filter((c) => c._id !== candidateId))
        toast({ title: "Removed", description: "Candidate removed from test." })
      }
    } catch (err: any) {
      toast({ title: "Error", description: "Failed to delete candidate", variant: "destructive" })
    }
  }

  // Open Import Modal & Load Event Registrations
  const handleOpenImportModal = async () => {
    setIsImportModalOpen(true)
    setIsLoadingRegistrations(true)
    try {
      const res = await fetch(`/api/admin/registrations?eventId=${selectedImportEventId}&limit=200`)
      const data = await res.json()
      if (data.success && Array.isArray(data.registrations)) {
        setAvailableRegistrations(data.registrations)
        setSelectedRegIds(data.registrations.map((r: any) => r._id))
      }
    } catch {
      toast({ title: "Error", description: "Failed to load registrations", variant: "destructive" })
    } finally {
      setIsLoadingRegistrations(false)
    }
  }

  // Submit Import
  const handleExecuteImport = async () => {
    if (selectedRegIds.length === 0) {
      toast({ title: "Warning", description: "No candidates selected.", variant: "destructive" })
      return
    }

    setIsImporting(true)
    try {
      const res = await fetch(`/api/admin/tests/${selectedTestId}/import-registrations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: selectedImportEventId,
          selectedRegistrationIds: selectedRegIds,
          defaultEligible: true,
        }),
      })
      const data = await res.json()
      if (data.success) {
        toast({ title: "Import Successful", description: data.message })
        setIsImportModalOpen(false)
        fetchCandidates(selectedTestId)
        fetchTests()
      } else {
        toast({ title: "Import Failed", description: data.message, variant: "destructive" })
      }
    } catch (err: any) {
      toast({ title: "Error", description: "Import failed: " + err.message, variant: "destructive" })
    } finally {
      setIsImporting(false)
    }
  }

  // Add Candidate Manually
  const handleAddCandidate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCandidateName || !newCandidateEmail) return

    try {
      const res = await fetch(`/api/admin/tests/${selectedTestId}/candidates`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newCandidateName,
          email: newCandidateEmail,
          college: newCandidateCollege,
          password: newCandidatePassword || undefined,
          isEligible: true,
        }),
      })
      const data = await res.json()
      if (data.success) {
        toast({ title: "Candidate Added", description: `${newCandidateName} is registered for test.` })
        setIsAddModalOpen(false)
        setNewCandidateName("")
        setNewCandidateEmail("")
        setNewCandidateCollege("")
        setNewCandidatePassword("")
        fetchCandidates(selectedTestId)
        fetchTests()
      } else {
        toast({ title: "Failed", description: data.message, variant: "destructive" })
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" })
    }
  }

  // Trigger 24h Reminder Emails
  const handleSendReminderEmails = async () => {
    if (!confirm("Send 24-Hour Test Details & Timing reminder email to all eligible candidates?")) return
    setIsSendingEmails(true)
    try {
      const res = await fetch(`/api/admin/tests/${selectedTestId}/email/send-reminder`, {
        method: "POST",
      })
      const data = await res.json()
      if (data.success) {
        toast({ title: "Reminder Emails Sent", description: data.message })
        fetchCandidates(selectedTestId)
      } else {
        toast({ title: "Email Error", description: data.message, variant: "destructive" })
      }
    } catch (err: any) {
      toast({ title: "Error", description: "Failed: " + err.message, variant: "destructive" })
    } finally {
      setIsSendingEmails(false)
    }
  }

  // Trigger 1h Password Emails
  const handleSendPasswordEmails = async () => {
    if (!confirm("Send 1-Hour Test Login Password emails to all eligible candidates?")) return
    setIsSendingEmails(true)
    try {
      const res = await fetch(`/api/admin/tests/${selectedTestId}/email/send-passwords`, {
        method: "POST",
      })
      const data = await res.json()
      if (data.success) {
        toast({ title: "Passwords Dispatched", description: data.message })
        fetchCandidates(selectedTestId)
      } else {
        toast({ title: "Email Error", description: data.message, variant: "destructive" })
      }
    } catch (err: any) {
      toast({ title: "Error", description: "Failed: " + err.message, variant: "destructive" })
    } finally {
      setIsSendingEmails(false)
    }
  }

  // Trigger Result Emails
  const handleSendResultEmails = async () => {
    const submittedCount = candidates.filter((c) => c.status === "submitted").length
    if (submittedCount === 0) {
      toast({
        title: "No Submissions",
        description: "No completed candidates have submitted this assessment yet.",
        variant: "destructive",
      })
      return
    }

    if (
      !confirm(
        `Send official Score and All-India Rank emails to all ${submittedCount} completed candidates for "${currentTest?.title}"?`
      )
    )
      return

    setIsSendingEmails(true)
    try {
      // Ensure results are officially marked declared when sending emails
      if (!currentTest?.isResultDeclared) {
        await fetch(`/api/admin/tests/${selectedTestId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isResultDeclared: true }),
        })
      }

      const res = await fetch(`/api/admin/tests/${selectedTestId}/email/send-results`, {
        method: "POST",
      })
      const data = await res.json()
      if (data.success) {
        toast({ title: "Results Dispatched! ✉️", description: data.message })
        fetchCandidates(selectedTestId)
        fetchTests()
      } else {
        toast({ title: "Email Error", description: data.message, variant: "destructive" })
      }
    } catch (err: any) {
      toast({ title: "Error", description: "Failed: " + err.message, variant: "destructive" })
    } finally {
      setIsSendingEmails(false)
    }
  }

  // Trigger Rank Recalculation
  const handleRecalculateRanks = async () => {
    setIsRecalculating(true)
    try {
      const res = await fetch(`/api/admin/tests/${selectedTestId}/recalculate-ranks`, {
        method: "POST",
      })
      const data = await res.json()
      if (data.success) {
        toast({ title: "Ranks Updated", description: data.message })
        fetchCandidates(selectedTestId)
        fetchLeaderboard(selectedTestId)
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" })
    } finally {
      setIsRecalculating(false)
    }
  }

  // Copy password to clipboard
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({ title: "Copied", description: "Password copied to clipboard." })
  }

  // Filter candidates
  const filteredCandidates = candidates.filter((c) => {
    if (!candidateSearch) return true
    const term = candidateSearch.toLowerCase()
    return (
      c.name.toLowerCase().includes(term) ||
      c.email.toLowerCase().includes(term) ||
      (c.college && c.college.toLowerCase().includes(term)) ||
      (c.registrationId && c.registrationId.toLowerCase().includes(term))
    )
  })

  return (
    <div className="space-y-6">
      {/* Test Selector & Action Header */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-xl">HackKro Assessment Control Center</CardTitle>
                <Badge variant="outline" className="text-blue-500 border-blue-500/30">
                  Secure Portal (/test)
                </Badge>
              </div>
              <CardDescription>
                Configure multi-event tests, student credentials, proctored full-screen exams, and official result declarations.
              </CardDescription>
            </div>

            <div className="flex items-center gap-2">
              <Select value={selectedTestId} onValueChange={setSelectedTestId}>
                <SelectTrigger className="w-[300px]">
                  <SelectValue placeholder="Select active test" />
                </SelectTrigger>
                <SelectContent>
                  {tests.map((t) => (
                    <SelectItem key={t.testId} value={t.testId}>
                      {t.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  fetchTests()
                  fetchCandidates(selectedTestId)
                  fetchLeaderboard(selectedTestId)
                }}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Test Event Info & Result Declaration Controls Bar */}
          <div className="mt-4 p-3 bg-muted/40 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5 font-semibold text-foreground">
                <Calendar className="w-4 h-4 text-blue-500" />
                <span>Test Date:</span>
                <span className="font-mono text-blue-600 dark:text-blue-400 font-bold">
                  {currentTest?.scheduledDate || "Not Set"}
                </span>
                <span className="text-muted-foreground font-normal">
                  ({currentTest?.startTime || "TBD"} - {currentTest?.endTime || "TBD"})
                </span>
              </div>

              <span className="text-muted-foreground hidden sm:inline">|</span>

              <div className="flex items-center gap-1.5">
                <span className="text-muted-foreground">Linked Event:</span>
                <Badge variant="outline" className="text-xs font-semibold">
                  {currentTest?.eventTitle || currentTest?.eventId}
                </Badge>
              </div>

              <span className="text-muted-foreground hidden sm:inline">|</span>

              <div className="flex items-center gap-1.5">
                <span className="text-muted-foreground">Results:</span>
                {currentTest?.isResultDeclared ? (
                  <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-xs font-bold">
                    🟢 Declared (Visible to Candidates)
                  </Badge>
                ) : (
                  <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 text-xs font-bold">
                    🟡 Pending / Concealed (Admin Only)
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleOpenEditSchedule}
                className="h-8 text-xs flex items-center gap-1.5"
              >
                <Settings className="w-3.5 h-3.5 text-muted-foreground" />
                Edit Schedule & Settings
              </Button>

              <Button
                size="sm"
                onClick={handleToggleResultDeclaration}
                disabled={isTogglingResult}
                className={`h-8 text-xs font-bold ${
                  currentTest?.isResultDeclared
                    ? "bg-amber-600 hover:bg-amber-700 text-white"
                    : "bg-emerald-600 hover:bg-emerald-700 text-white"
                }`}
              >
                {currentTest?.isResultDeclared ? (
                  <>
                    <Clock className="w-3.5 h-3.5 mr-1" /> Hide Results
                  </>
                ) : (
                  <>
                    <Megaphone className="w-3.5 h-3.5 mr-1" /> Declare Results
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>

        {/* Quick Stats Grid */}
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4 border-t pt-4">
          <div className="p-3 bg-muted/40 rounded-xl border">
            <span className="text-xs text-muted-foreground uppercase font-semibold">Total Candidates</span>
            <p className="text-2xl font-bold mt-1">{candidates.length}</p>
          </div>
          <div className="p-3 bg-muted/40 rounded-xl border">
            <span className="text-xs text-muted-foreground uppercase font-semibold">Eligible / Whitelisted</span>
            <p className="text-2xl font-bold mt-1 text-green-500">
              {candidates.filter((c) => c.isEligible).length}
            </p>
          </div>
          <div className="p-3 bg-muted/40 rounded-xl border">
            <span className="text-xs text-muted-foreground uppercase font-semibold">Submitted Tests</span>
            <p className="text-2xl font-bold mt-1 text-blue-500">
              {candidates.filter((c) => c.status === "submitted").length}
            </p>
          </div>
          <div className="p-3 bg-muted/40 rounded-xl border">
            <span className="text-xs text-muted-foreground uppercase font-semibold">Duration & Marks</span>
            <p className="text-2xl font-bold mt-1 text-purple-500">
              {currentTest?.durationMinutes || 30}m / {currentTest?.totalMarks || 10}pts
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Control Tabs */}
      <Tabs defaultValue="candidates" className="space-y-4">
        <TabsList>
          <TabsTrigger value="candidates" className="flex items-center gap-1.5">
            <Users className="w-4 h-4" /> Candidates & Passwords ({candidates.length})
          </TabsTrigger>
          <TabsTrigger value="leaderboard" className="flex items-center gap-1.5">
            <Award className="w-4 h-4" /> Live Leaderboard & Results ({leaderboard.length})
          </TabsTrigger>
          <TabsTrigger value="details" className="flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4" /> Test Rules & Questions ({currentTest?.questions?.length || 0})
          </TabsTrigger>
        </TabsList>

        {/* ================================================================= */}
        {/* SUBTAB 1: CANDIDATES & PASSWORDS                                  */}
        {/* ================================================================= */}
        <TabsContent value="candidates" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex items-center gap-2 flex-1 max-w-sm">
                  <div className="relative w-full">
                    <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                    <Input
                      placeholder="Search candidate by name, email, college..."
                      value={candidateSearch}
                      onChange={(e) => setCandidateSearch(e.target.value)}
                      className="pl-9 h-9"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleOpenImportModal}
                    className="flex items-center gap-1 text-xs"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-green-600" />
                    Import from Registrations
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex items-center gap-1 text-xs"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Candidate
                  </Button>
                </div>
              </div>

              {/* Automated Email Buttons Banner */}
              <div className="bg-muted/50 p-3 rounded-xl border mt-3 flex flex-wrap items-center justify-between gap-3">
                <div className="text-xs">
                  <span className="font-semibold text-foreground">Email Automations:</span>
                  <span className="text-muted-foreground ml-1">
                    Send reminders, access passwords, or results via API to candidates.
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={isSendingEmails}
                    onClick={handleSendReminderEmails}
                    className="h-8 text-xs border-blue-500/30 text-blue-500 hover:bg-blue-500/10"
                  >
                    <Mail className="w-3.5 h-3.5 mr-1" /> Send 24h Reminder
                  </Button>

                  <Button
                    size="sm"
                    disabled={isSendingEmails}
                    onClick={handleSendPasswordEmails}
                    className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    <Key className="w-3.5 h-3.5 mr-1" /> Send 1h Passwords
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    disabled={isSendingEmails}
                    onClick={handleSendResultEmails}
                    className="h-8 text-xs border-purple-500/30 text-purple-500 hover:bg-purple-500/10"
                  >
                    <Award className="w-3.5 h-3.5 mr-1" /> Send Results & Ranks
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              {isLoadingCandidates ? (
                <div className="py-12 flex justify-center items-center flex-col gap-2">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                  <p className="text-xs text-muted-foreground">Loading candidates...</p>
                </div>
              ) : filteredCandidates.length === 0 ? (
                <div className="py-12 text-center space-y-3">
                  <Users className="w-10 h-10 text-muted-foreground mx-auto opacity-50" />
                  <p className="text-sm font-medium">No candidates found for this test.</p>
                  <Button size="sm" onClick={handleOpenImportModal} className="bg-blue-600">
                    Import Registrations Now
                  </Button>
                </div>
              ) : (
                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Candidate</TableHead>
                        <TableHead>Login ID</TableHead>
                        <TableHead>Test Password</TableHead>
                        <TableHead>Conduct Test?</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Score / Rank</TableHead>
                        <TableHead>Emails Sent</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCandidates.map((cand) => (
                        <TableRow key={cand._id}>
                          <TableCell>
                            <div className="font-semibold text-sm">{cand.name}</div>
                            <div className="text-xs text-muted-foreground">{cand.college || "No college"}</div>
                          </TableCell>
                          <TableCell className="font-mono text-xs">{cand.loginId}</TableCell>
                          <TableCell>
                            <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-muted font-mono text-xs font-bold text-foreground">
                              {cand.password}
                              <button
                                type="button"
                                onClick={() => handleCopy(cand.password)}
                                className="text-muted-foreground hover:text-foreground"
                              >
                                <Copy className="w-3 h-3" />
                              </button>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={cand.isEligible}
                                onCheckedChange={() => handleToggleEligibility(cand._id)}
                              />
                              <span
                                className={`text-xs font-semibold ${
                                  cand.isEligible ? "text-green-500" : "text-muted-foreground"
                                }`}
                              >
                                {cand.isEligible ? "Allowed" : "Disabled"}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={
                                cand.status === "submitted"
                                  ? "border-green-500/40 text-green-500 bg-green-500/10"
                                  : cand.status === "in-progress"
                                  ? "border-amber-500/40 text-amber-500 bg-amber-500/10"
                                  : "border-muted-foreground/30 text-muted-foreground"
                              }
                            >
                              {cand.status === "submitted"
                                ? "Submitted"
                                : cand.status === "in-progress"
                                ? "In Progress"
                                : "Not Started"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {cand.status === "submitted" ? (
                              <div className="text-xs">
                                <span className="font-bold text-foreground">{cand.score} pts</span>
                                <span className="text-purple-500 font-semibold ml-1.5">Rank #{cand.rank}</span>
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1.5 text-xs">
                              <span
                                title="24h Reminder Email"
                                className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                  cand.reminderEmailSent ? "bg-blue-500/10 text-blue-500" : "bg-muted text-muted-foreground"
                                }`}
                              >
                                24h
                              </span>
                              <span
                                title="1h Password Email"
                                className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                  cand.passwordEmailSent ? "bg-emerald-500/10 text-emerald-500" : "bg-muted text-muted-foreground"
                                }`}
                              >
                                Pass
                              </span>
                              <span
                                title="Result Email"
                                className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                  cand.resultEmailSent ? "bg-purple-500/10 text-purple-500" : "bg-muted text-muted-foreground"
                                }`}
                              >
                                Result
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7 text-muted-foreground hover:text-foreground"
                                title="Reset Password"
                                onClick={() => handleResetPassword(cand._id)}
                              >
                                <RefreshCw className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-500/10"
                                title="Delete Candidate"
                                onClick={() => handleDeleteCandidate(cand._id)}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ================================================================= */}
        {/* SUBTAB 2: LIVE LEADERBOARD & RESULTS                              */}
        {/* ================================================================= */}
        <TabsContent value="leaderboard" className="space-y-4">
          <Card>
            <CardHeader className="pb-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Award className="w-5 h-5 text-yellow-500" /> Assessment Leaderboard & Results
                  </CardTitle>
                  {currentTest?.isResultDeclared ? (
                    <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[11px] font-bold">
                      Declared
                    </Badge>
                  ) : (
                    <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 text-[11px] font-bold">
                      Pending Declaration
                    </Badge>
                  )}
                </div>
                <CardDescription className="text-xs mt-1">
                  Rankings dynamically calculated based on Total Score (higher is better) and Completion Time (faster is better).
                </CardDescription>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleRecalculateRanks}
                  disabled={isRecalculating}
                  className="flex items-center gap-1.5 text-xs h-8"
                >
                  {isRecalculating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                  Recalculate Ranks
                </Button>

                <Button
                  size="sm"
                  onClick={handleToggleResultDeclaration}
                  disabled={isTogglingResult}
                  className={`h-8 text-xs font-bold ${
                    currentTest?.isResultDeclared
                      ? "bg-amber-600 hover:bg-amber-700 text-white"
                      : "bg-emerald-600 hover:bg-emerald-700 text-white"
                  }`}
                >
                  {currentTest?.isResultDeclared ? (
                    <>
                      <Clock className="w-3.5 h-3.5 mr-1" /> Hide Results
                    </>
                  ) : (
                    <>
                      <Megaphone className="w-3.5 h-3.5 mr-1" /> Declare Results
                    </>
                  )}
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  disabled={isSendingEmails}
                  onClick={handleSendResultEmails}
                  className="h-8 text-xs border-purple-500/40 text-purple-600 dark:text-purple-400 hover:bg-purple-500/10"
                >
                  <Mail className="w-3.5 h-3.5 mr-1" /> Send Result Emails
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingLeaderboard ? (
                <div className="py-12 flex justify-center items-center">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                </div>
              ) : leaderboard.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground text-sm">
                  No submissions recorded yet for this assessment.
                </div>
              ) : (
                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-16">Rank</TableHead>
                        <TableHead>Candidate</TableHead>
                        <TableHead>Score</TableHead>
                        <TableHead>Time Taken (Speed)</TableHead>
                        <TableHead>Tab Switches</TableHead>
                        <TableHead>Submission Time</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {leaderboard.map((item) => {
                        let rankBadge = (
                          <span className="font-bold text-muted-foreground">#{item.rank}</span>
                        )
                        if (item.rank === 1) {
                          rankBadge = (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-500 font-extrabold text-xs">
                              🏆 1st
                            </span>
                          )
                        } else if (item.rank === 2) {
                          rankBadge = (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-300/20 text-slate-300 font-bold text-xs">
                              🥈 2nd
                            </span>
                          )
                        } else if (item.rank === 3) {
                          rankBadge = (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-700/20 text-amber-500 font-bold text-xs">
                              🥉 3rd
                            </span>
                          )
                        }

                        return (
                          <TableRow key={item.id} className={item.rank <= 3 ? "bg-muted/20" : ""}>
                            <TableCell>{rankBadge}</TableCell>
                            <TableCell>
                              <div className="font-semibold text-sm">{item.name}</div>
                              <div className="text-xs text-muted-foreground">{item.email}</div>
                              <div className="text-[11px] text-muted-foreground/80">{item.college}</div>
                            </TableCell>
                            <TableCell>
                              <span className="font-bold text-base text-foreground">{item.score}</span>
                              <span className="text-xs text-muted-foreground ml-1">/ {item.totalMarks}</span>
                            </TableCell>
                            <TableCell className="font-mono text-sm text-foreground">
                              {item.timeTakenFormatted}
                            </TableCell>
                            <TableCell>
                              {item.tabSwitches > 0 ? (
                                <span className="inline-flex items-center gap-1 text-xs text-amber-500 font-semibold">
                                  <ShieldAlert className="w-3.5 h-3.5" /> {item.tabSwitches} switches
                                </span>
                              ) : (
                                <span className="text-xs text-green-500 font-medium">Clean (0)</span>
                              )}
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground">
                              {new Date(item.submittedAt).toLocaleTimeString()}
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ================================================================= */}
        {/* SUBTAB 3: TEST RULES & QUESTION BANK                              */}
        {/* ================================================================= */}
        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Assessment Configuration & Questions</CardTitle>
              <CardDescription>
                Review active questions and instructions configured for {currentTest?.title}.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Instructions list */}
              <div>
                <h4 className="font-semibold text-sm mb-2">Configured Instructions:</h4>
                <ul className="space-y-1.5 text-xs text-muted-foreground list-disc list-inside">
                  {currentTest?.instructions?.map((inst: string, idx: number) => (
                    <li key={idx}>{inst}</li>
                  ))}
                </ul>
              </div>

              {/* Questions Bank List */}
              <div className="space-y-3">
                <h4 className="font-semibold text-sm">Question Bank ({currentTest?.questions?.length || 0}):</h4>
                {currentTest?.questions?.map((q: any, idx: number) => (
                  <div key={q.id || idx} className="p-4 rounded-xl border bg-card space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">Question {idx + 1}</Badge>
                      <span className="text-xs text-muted-foreground">{q.points || 1} Point</span>
                    </div>
                    <p className="font-medium text-sm">{q.question}</p>
                    {q.codeSnippet && (
                      <pre className="p-3 bg-[#0d1117] text-[#c9d1d9] rounded-lg text-xs font-mono overflow-x-auto">
                        {q.codeSnippet}
                      </pre>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      {q.options?.map((opt: any) => {
                        const isCorrect = opt.id === q.correctOptionId
                        return (
                          <div
                            key={opt.id}
                            className={`p-2.5 rounded-lg border text-xs flex items-center justify-between ${
                              isCorrect
                                ? "border-green-500 bg-green-500/10 text-green-600 dark:text-green-400 font-semibold"
                                : "border-border text-muted-foreground"
                            }`}
                          >
                            <span>{opt.text}</span>
                            {isCorrect && <CheckCircle className="w-3.5 h-3.5 text-green-500 shrink-0" />}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* =================================================================== */}
      {/* DIALOG: IMPORT CANDIDATES FROM EVENT REGISTRATIONS                  */}
      {/* =================================================================== */}
      <Dialog open={isImportModalOpen} onOpenChange={setIsImportModalOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Import Candidates from Event Registrations</DialogTitle>
            <DialogDescription>
              Select an event to load registered students and generate test passwords for them automatically.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2 flex-1 overflow-hidden flex flex-col">
            <div className="flex items-center gap-3">
              <Label className="text-xs shrink-0">Source Event:</Label>
              <Select
                value={selectedImportEventId}
                onValueChange={(val) => {
                  setSelectedImportEventId(val)
                  handleOpenImportModal()
                }}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select event" />
                </SelectTrigger>
                <SelectContent>
                  {EVENTS_DATA.map((ev) => (
                    <SelectItem key={ev.id} value={ev.id}>
                      {ev.title} ({ev.id})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between text-xs text-muted-foreground border-b pb-2">
              <span>
                Found <strong>{availableRegistrations.length}</strong> registrants
              </span>
              <div className="space-x-2">
                <button
                  type="button"
                  onClick={() => setSelectedRegIds(availableRegistrations.map((r) => r._id))}
                  className="text-blue-500 hover:underline"
                >
                  Select All
                </button>
                <span>|</span>
                <button
                  type="button"
                  onClick={() => setSelectedRegIds([])}
                  className="text-muted-foreground hover:underline"
                >
                  Deselect All
                </button>
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 border rounded-lg p-2 max-h-[300px]">
              {isLoadingRegistrations ? (
                <div className="py-8 flex justify-center items-center">
                  <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                </div>
              ) : availableRegistrations.length === 0 ? (
                <div className="py-8 text-center text-xs text-muted-foreground">
                  No registrations found for event ID: {selectedImportEventId}
                </div>
              ) : (
                availableRegistrations.map((reg) => {
                  const isChecked = selectedRegIds.includes(reg._id)
                  return (
                    <div
                      key={reg._id}
                      onClick={() => {
                        setSelectedRegIds((prev) =>
                          isChecked ? prev.filter((id) => id !== reg._id) : [...prev, reg._id]
                        )
                      }}
                      className={`flex items-center gap-3 p-2.5 rounded-lg border cursor-pointer transition-colors ${
                        isChecked ? "border-blue-500 bg-blue-500/5" : "border-border hover:bg-muted/40"
                      }`}
                    >
                      <Checkbox checked={isChecked} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold truncate">{reg.name}</p>
                        <p className="text-[11px] text-muted-foreground truncate">{reg.email}</p>
                      </div>
                      <span className="text-[10px] text-muted-foreground truncate max-w-[120px]">
                        {reg.college || "Solo"}
                      </span>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button variant="outline" onClick={() => setIsImportModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleExecuteImport}
              disabled={isImporting || selectedRegIds.length === 0}
              className="bg-green-600 hover:bg-green-700"
            >
              {isImporting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Importing...
                </>
              ) : (
                `Import ${selectedRegIds.length} Candidates`
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* =================================================================== */}
      {/* DIALOG: ADD CANDIDATE MANUALLY                                      */}
      {/* =================================================================== */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent>
          <form onSubmit={handleAddCandidate}>
            <DialogHeader>
              <DialogTitle>Add Test Candidate</DialogTitle>
              <DialogDescription>
                Manually register a candidate and set their credentials for this assessment.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="candName">Candidate Name *</Label>
                <Input
                  id="candName"
                  placeholder="e.g. Rahul Sharma"
                  value={newCandidateName}
                  onChange={(e) => setNewCandidateName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="candEmail">Email Address (Login ID) *</Label>
                <Input
                  id="candEmail"
                  type="email"
                  placeholder="e.g. rahul@example.com"
                  value={newCandidateEmail}
                  onChange={(e) => setNewCandidateEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="candCollege">College / Institution</Label>
                <Input
                  id="candCollege"
                  placeholder="e.g. MIT Meerut"
                  value={newCandidateCollege}
                  onChange={(e) => setNewCandidateCollege(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="candPass">Test Password (Optional - auto-generated if blank)</Label>
                <Input
                  id="candPass"
                  placeholder="Leave blank for auto HK-XXXXX"
                  value={newCandidatePassword}
                  onChange={(e) => setNewCandidatePassword(e.target.value)}
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                Register Candidate
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* =================================================================== */}
      {/* DIALOG: EDIT SCHEDULE & TEST SETTINGS                               */}
      {/* =================================================================== */}
      <Dialog open={isEditScheduleOpen} onOpenChange={setIsEditScheduleOpen}>
        <DialogContent className="max-w-lg">
          <form onSubmit={handleSaveSchedule}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-blue-500" /> Assessment Schedule & Settings
              </DialogTitle>
              <DialogDescription>
                Configure schedule date, time window, and result visibility for <strong>{currentTest?.title}</strong>.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="editDate">Scheduled Assessment Date (YYYY-MM-DD) *</Label>
                <Input
                  id="editDate"
                  placeholder="e.g. 2026-10-30"
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                  required
                />
                <p className="text-[11px] text-muted-foreground">
                  Specify different dates for CODESPRINT and BUSINESSSPRINT assessments.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="editStartTime">Start Time *</Label>
                  <Input
                    id="editStartTime"
                    placeholder="e.g. 10:00 AM"
                    value={editStartTime}
                    onChange={(e) => setEditStartTime(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editEndTime">End Time *</Label>
                  <Input
                    id="editEndTime"
                    placeholder="e.g. 11:00 AM"
                    value={editEndTime}
                    onChange={(e) => setEditEndTime(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="editDuration">Duration (in Minutes) *</Label>
                <Input
                  id="editDuration"
                  type="number"
                  min="5"
                  max="300"
                  value={editDuration}
                  onChange={(e) => setEditDuration(Number(e.target.value))}
                  required
                />
              </div>

              <div className="p-3.5 rounded-xl border bg-muted/40 space-y-3 pt-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-semibold text-xs">Declare Assessment Results</Label>
                    <p className="text-[11px] text-muted-foreground">
                      Make score and All-India ranks visible to candidates on portal.
                    </p>
                  </div>
                  <Switch
                    checked={editIsDeclared}
                    onCheckedChange={setEditIsDeclared}
                  />
                </div>

                <div className="border-t pt-2 flex items-center justify-between">
                  <div>
                    <Label className="font-semibold text-xs">Test Active & Available</Label>
                    <p className="text-[11px] text-muted-foreground">
                      Allow candidates to access portal and login for this test.
                    </p>
                  </div>
                  <Switch
                    checked={editIsActive}
                    onCheckedChange={setEditIsActive}
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditScheduleOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSavingSchedule} className="bg-blue-600 hover:bg-blue-700">
                {isSavingSchedule ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
