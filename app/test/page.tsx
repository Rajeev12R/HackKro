"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Loader2,
  Clock,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Award,
  BookOpen,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Bookmark,
  RotateCcw,
  Send,
  Lock,
  Mail,
  Building,
  HelpCircle,
  Eye,
  EyeOff,
  Maximize,
  Minimize,
} from "lucide-react"

interface QuestionOption {
  id: string
  text: string
}

interface SanitizedQuestion {
  id: string
  number: number
  question: string
  codeSnippet?: string
  options: QuestionOption[]
  points: number
}

interface CandidateData {
  id: string
  name: string
  email: string
  loginId: string
  college?: string
  registrationId?: string
  status: "not-started" | "in-progress" | "submitted"
  score?: number | null
  rank?: number | null
  timeTakenSeconds?: number
}

interface TestData {
  testId: string
  title: string
  eventId: string
  eventTitle: string
  description: string
  instructions: string[]
  durationMinutes: number
  totalMarks: number
  totalQuestions: number
  scheduledDate?: string
  startTime?: string
  endTime?: string
  isResultDeclared?: boolean
}

interface SubmissionResult {
  score?: number | null
  totalMarks?: number
  rank?: number | null
  timeTakenSeconds?: number
  timeTakenFormatted?: string
  submittedAt?: string
  status?: string
}

export default function TestPage() {
  const [phase, setPhase] = useState<"loading" | "login" | "instructions" | "exam" | "submitted">("loading")
  const [candidate, setCandidate] = useState<CandidateData | null>(null)
  const [test, setTest] = useState<TestData | null>(null)

  // Login form state
  const [loginId, setLoginId] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loginError, setLoginError] = useState("")
  const [isLoggingIn, setIsLoggingIn] = useState(false)

  // Instructions state
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [isStartingTest, setIsStartingTest] = useState(false)

  // Exam state
  const [questions, setQuestions] = useState<SanitizedQuestion[]>([])
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [markedForReview, setMarkedForReview] = useState<Set<string>>(new Set())
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [remainingSeconds, setRemainingSeconds] = useState(0)
  const [tabSwitches, setTabSwitches] = useState(0)
  const [showTabWarning, setShowTabWarning] = useState(false)
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Full Screen Proctoring State
  const [isFullscreen, setIsFullscreen] = useState(true)
  const [fullscreenExits, setFullscreenExits] = useState(0)
  const [showFullscreenModal, setShowFullscreenModal] = useState(false)

  // Result state
  const [result, setResult] = useState<SubmissionResult | null>(null)

  // Enter Full Screen Helper
  const enterFullscreen = async () => {
    try {
      const elem = document.documentElement as any
      if (elem.requestFullscreen) {
        await elem.requestFullscreen()
      } else if (elem.webkitRequestFullscreen) {
        await elem.webkitRequestFullscreen()
      } else if (elem.mozRequestFullScreen) {
        await elem.mozRequestFullScreen()
      } else if (elem.msRequestFullscreen) {
        await elem.msRequestFullscreen()
      }
      setIsFullscreen(true)
      setShowFullscreenModal(false)
    } catch (err) {
      console.warn("Fullscreen request error:", err)
    }
  }

  // Exit Full Screen Helper
  const exitFullscreen = async () => {
    try {
      const doc = document as any
      if (
        doc.fullscreenElement ||
        doc.webkitFullscreenElement ||
        doc.mozFullScreenElement ||
        doc.msFullscreenElement
      ) {
        if (doc.exitFullscreen) {
          await doc.exitFullscreen()
        } else if (doc.webkitExitFullscreen) {
          await doc.webkitExitFullscreen()
        } else if (doc.mozCancelFullScreen) {
          await doc.mozCancelFullScreen()
        } else if (doc.msExitFullscreen) {
          await doc.msExitFullscreen()
        }
      }
    } catch (err) {
      console.warn("Exit fullscreen error:", err)
    }
  }

  // Check initial session
  useEffect(() => {
    async function checkSession() {
      try {
        const res = await fetch("/api/test/details")
        const data = await res.json()
        if (data.authenticated && data.candidate && data.test) {
          setCandidate(data.candidate)
          setTest(data.test)
          if (data.candidate.status === "submitted") {
            setPhase("submitted")
            setResult({
              score: data.test?.isResultDeclared ? data.candidate.score : null,
              totalMarks: data.test.totalMarks || 10,
              rank: data.test?.isResultDeclared ? data.candidate.rank : null,
              timeTakenSeconds: data.candidate.timeTakenSeconds || 0,
              timeTakenFormatted: `${Math.floor((data.candidate.timeTakenSeconds || 0) / 60)}m ${(data.candidate.timeTakenSeconds || 0) % 60}s`,
              submittedAt: data.candidate.submittedAt || new Date().toISOString(),
            })
          } else if (data.candidate.status === "in-progress") {
            // Resume test
            startTestSession()
          } else {
            setPhase("instructions")
          }
        } else {
          setPhase("login")
        }
      } catch {
        setPhase("login")
      }
    }
    checkSession()
  }, [])

  // Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError("")
    if (!loginId.trim() || !password.trim()) {
      setLoginError("Please provide both your Login ID / Email and Test Password.")
      return
    }

    setIsLoggingIn(true)
    try {
      const res = await fetch("/api/test/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ loginId, password }),
      })
      const data = await res.json()

      if (!res.ok || !data.success) {
        setLoginError(data.message || "Login failed. Please verify your credentials.")
        return
      }

      setCandidate(data.candidate)
      setTest(data.test)

      if (data.candidate.status === "submitted") {
        setPhase("submitted")
        setResult({
          score: data.test?.isResultDeclared ? data.candidate.score : null,
          totalMarks: data.test.totalMarks || 10,
          rank: data.test?.isResultDeclared ? data.candidate.rank : null,
          timeTakenSeconds: data.candidate.timeTakenSeconds || 0,
          timeTakenFormatted: `${Math.floor((data.candidate.timeTakenSeconds || 0) / 60)}m ${(data.candidate.timeTakenSeconds || 0) % 60}s`,
          submittedAt: new Date().toISOString(),
        })
      } else if (data.candidate.status === "in-progress") {
        startTestSession()
      } else {
        setPhase("instructions")
      }
    } catch (err: any) {
      setLoginError(err.message || "An error occurred while logging in.")
    } finally {
      setIsLoggingIn(false)
    }
  }

  // Handle Logout
  const handleLogout = async () => {
    try {
      await exitFullscreen()
      await fetch("/api/test/auth/logout", { method: "POST" })
      setCandidate(null)
      setTest(null)
      setPhase("login")
    } catch (err) {
      console.error(err)
    }
  }

  // Start Test Session
  const startTestSession = async () => {
    setIsStartingTest(true)
    try {
      // Enter fullscreen mode upon starting test
      await enterFullscreen()

      const res = await fetch("/api/test/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })
      const data = await res.json()

      if (!res.ok || !data.success) {
        if (data.alreadySubmitted) {
          setPhase("submitted")
          return
        }
        alert(data.message || "Failed to start test session.")
        return
      }

      setQuestions(data.questions || [])
      setRemainingSeconds(data.remainingSeconds || (test?.durationMinutes || 30) * 60)

      // Restore existing answers if any
      if (Array.isArray(data.savedAnswers)) {
        const ansObj: Record<string, string> = {}
        data.savedAnswers.forEach((item: any) => {
          ansObj[item.questionId] = item.selectedOptionId
        })
        setAnswers(ansObj)
      }

      setPhase("exam")
    } catch (err: any) {
      alert(err.message || "Network error starting test.")
    } finally {
      setIsStartingTest(false)
    }
  }

  // Countdown timer
  useEffect(() => {
    if (phase !== "exam") return

    const timer = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          handleFinalSubmit(true) // Auto-submit when time expires
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [phase])

  // Anti-Cheat: Tab Switch Detection
  useEffect(() => {
    if (phase !== "exam") return

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitches((prev) => {
          const next = prev + 1
          setShowTabWarning(true)
          return next
        })
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [phase])

  // Anti-Cheat: Mandatory Full Screen Enforcement
  useEffect(() => {
    if (phase !== "exam") return

    const handleFullscreenChange = () => {
      const isFs = Boolean(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement
      )
      setIsFullscreen(isFs)
      if (!isFs) {
        setFullscreenExits((prev) => prev + 1)
        setTabSwitches((prev) => prev + 1)
        setShowFullscreenModal(true)
      }
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange)
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange)
    document.addEventListener("mozfullscreenchange", handleFullscreenChange)
    document.addEventListener("MSFullscreenChange", handleFullscreenChange)

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange)
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange)
      document.removeEventListener("mozfullscreenchange", handleFullscreenChange)
      document.removeEventListener("MSFullscreenChange", handleFullscreenChange)
    }
  }, [phase])

  // Select Option
  const handleSelectOption = (questionId: string, optionId: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }))
  }

  // Clear Option
  const handleClearAnswer = (questionId: string) => {
    setAnswers((prev) => {
      const next = { ...prev }
      delete next[questionId]
      return next
    })
  }

  // Toggle Mark for Review
  const toggleMarkForReview = (questionId: string) => {
    setMarkedForReview((prev) => {
      const next = new Set(prev)
      if (next.has(questionId)) {
        next.delete(questionId)
      } else {
        next.add(questionId)
      }
      return next
    })
  }

  // Submit Test
  const handleFinalSubmit = async (isAuto = false) => {
    if (isSubmitting) return
    setIsSubmitting(true)
    setShowSubmitConfirm(false)

    // Exit full screen upon submission
    await exitFullscreen()

    try {
      const answersPayload = Object.entries(answers).map(([questionId, selectedOptionId]) => ({
        questionId,
        selectedOptionId,
      }))

      const res = await fetch("/api/test/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers: answersPayload,
          tabSwitches,
        }),
      })

      const data = await res.json()
      if (data.success && data.result) {
        setResult(data.result)
        if (typeof data.isResultDeclared === "boolean" && test) {
          setTest({ ...test, isResultDeclared: data.isResultDeclared })
        }
        setPhase("submitted")
      } else {
        alert(data.message || "Failed to submit test. Please retry.")
      }
    } catch (err: any) {
      alert("Submission error: " + err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Format time
  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  // =========================================================================
  // RENDER: LOADING STATE
  // =========================================================================
  if (phase === "loading") {
    return (
      <div className="flex h-screen items-center justify-center flex-col gap-4 bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
        <p className="text-muted-foreground text-sm font-medium animate-pulse">Initializing HackKro Assessment Portal...</p>
      </div>
    )
  }

  // =========================================================================
  // RENDER: 1. LOGIN SCREEN
  // =========================================================================
  if (phase === "login") {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12 bg-gradient-to-b from-background via-muted/20 to-background">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500 text-xs font-semibold uppercase tracking-wider">
              <Lock className="w-3.5 h-3.5" /> HackKro Secure Exam Portal
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">Candidate Login</h1>
            <p className="text-muted-foreground text-sm">
              Enter your test credentials created from your event registration.
            </p>
          </div>

          <Card className="border-border shadow-xl backdrop-blur-sm bg-card/80">
            <form onSubmit={handleLogin}>
              <CardHeader className="space-y-1">
                <CardTitle className="text-lg">Assessment Sign In</CardTitle>
                <CardDescription>
                  Your password was dispatched to your registered email 1 hour prior to the test.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {loginError && (
                  <div className="p-3 text-sm rounded-lg bg-red-500/10 border border-red-500/30 text-red-500 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                    <span>{loginError}</span>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="loginId">Login ID / Registered Gmail</Label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                    <Input
                      id="loginId"
                      placeholder="e.g. coder@gmail.com"
                      value={loginId}
                      onChange={(e) => setLoginId(e.target.value)}
                      className="pl-9"
                      required
                      autoComplete="username"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Test Access Password</Label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="e.g. HK-A82X9"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-9 pr-10 font-mono"
                      required
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="bg-muted/50 p-3 rounded-lg text-xs text-muted-foreground space-y-1.5 border border-border/50">
                  <p className="font-semibold text-foreground">💡 Assessment Instructions:</p>
                  <p>• Multi-Event Portal: Supports CODESPRINT 2026 & BUSINESSSPRINT 2026.</p>
                  <p>• Full-Screen Mode is mandatory during the assessment.</p>
                  <p>• Final scores & ranks will be announced by the HackKro admin team after the event.</p>
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 font-semibold" disabled={isLoggingIn}>
                  {isLoggingIn ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Verifying Credentials...
                    </>
                  ) : (
                    "Enter Assessment Portal"
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    )
  }

  // =========================================================================
  // RENDER: 2. CANDIDATE PROFILE & INSTRUCTIONS SCREEN
  // =========================================================================
  if (phase === "instructions") {
    return (
      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Top Bar */}
          <div className="flex items-center justify-between border-b pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-600/30 flex items-center justify-center text-blue-500 font-bold">
                HK
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight">HackKro Assessment Hub</h1>
                <p className="text-xs text-muted-foreground">Proctored Candidate Environment</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout} className="text-xs">
              <LogOut className="w-3.5 h-3.5 mr-1" /> Sign Out
            </Button>
          </div>

          {/* Candidate Profile Details Card */}
          <Card className="border-blue-500/30 bg-blue-500/5">
            <CardHeader className="pb-3">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                <div>
                  <Badge variant="outline" className="border-blue-500/40 text-blue-500 mb-1">
                    Verified Candidate
                  </Badge>
                  <CardTitle className="text-2xl">{candidate?.name}</CardTitle>
                </div>
                <div className="text-sm text-muted-foreground flex flex-col md:items-end">
                  <span className="font-semibold text-foreground">{test?.eventTitle}</span>
                  <span>{test?.scheduledDate} | {test?.startTime}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-blue-500/10">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-blue-500 shrink-0" />
                <span className="truncate">{candidate?.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Building className="w-4 h-4 text-blue-500 shrink-0" />
                <span className="truncate">{candidate?.college || "College Registrant"}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <User className="w-4 h-4 text-blue-500 shrink-0" />
                <span>ID: {candidate?.registrationId || candidate?.loginId}</span>
              </div>
            </CardContent>
          </Card>

          {/* Test Specs Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-4 text-center">
              <p className="text-xs text-muted-foreground uppercase font-semibold">Test Duration</p>
              <p className="text-2xl font-bold text-foreground mt-1">{test?.durationMinutes || 30} Mins</p>
            </Card>
            <Card className="p-4 text-center">
              <p className="text-xs text-muted-foreground uppercase font-semibold">Total Questions</p>
              <p className="text-2xl font-bold text-foreground mt-1">{test?.totalQuestions || 10}</p>
            </Card>
            <Card className="p-4 text-center">
              <p className="text-xs text-muted-foreground uppercase font-semibold">Total Marks</p>
              <p className="text-2xl font-bold text-foreground mt-1">{test?.totalMarks || 10}</p>
            </Card>
            <Card className="p-4 text-center">
              <p className="text-xs text-muted-foreground uppercase font-semibold">Ranking Rule</p>
              <p className="text-sm font-bold text-amber-500 mt-2">Score + Speed</p>
            </Card>
          </div>

          {/* Instructions Box */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-500" /> Assessment Instructions & Rules
              </CardTitle>
              <CardDescription>
                Please review the guidelines carefully before launching your attempt.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <ul className="space-y-2.5 text-sm text-muted-foreground">
                {(test?.instructions && test.instructions.length > 0
                  ? test.instructions
                  : [
                      "The assessment is strictly timed. The countdown timer begins the moment you click Start.",
                      "Each question has 4 options with a single correct answer.",
                      "Tie-breaking: When two candidates achieve the same score, the candidate with less completion time achieves the higher rank.",
                      "Do NOT leave or switch tabs during the test. Proctoring records all tab switching events.",
                      "You can freely navigate between questions and mark questions for review.",
                      "The test auto-submits when the timer reaches 00:00. You may submit earlier if finished.",
                    ]
                ).map((inst, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-xs font-semibold shrink-0 text-foreground">
                      {idx + 1}
                    </span>
                    <span>{inst}</span>
                  </li>
                ))}
              </ul>

              <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs flex items-start gap-3 mt-4">
                <Maximize className="w-5 h-5 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Mandatory Full-Screen Mode:</p>
                  <p>
                    This assessment must be taken in Full-Screen Mode. The test will automatically enter Full-Screen when you start.
                    Exiting full-screen or switching windows will trigger an anti-cheat violation lock.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs flex items-start gap-3 mt-2">
                <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Automated Proctoring Active:</p>
                  <p>
                    Window unfocus, tab switches, and fullscreen exits are tracked in your submission log. Ensure notifications are silenced.
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="terms"
                  checked={agreedToTerms}
                  onCheckedChange={(checked) => setAgreedToTerms(Boolean(checked))}
                />
                <label
                  htmlFor="terms"
                  className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  I agree to take this test in full-screen mode and follow all examination rules.
                </label>
              </div>

              <Button
                onClick={startTestSession}
                disabled={!agreedToTerms || isStartingTest}
                className="w-full sm:w-auto bg-green-600 hover:bg-green-700 font-bold px-8 shadow-md"
              >
                {isStartingTest ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Preparing Test...
                  </>
                ) : (
                  "Start Assessment in Full Screen 🚀"
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    )
  }

  // =========================================================================
  // RENDER: 3. EXAM INTERFACE (TIMED & PROCTORED)
  // =========================================================================
  if (phase === "exam") {
    const currentQuestion = questions[currentQuestionIndex]
    const answeredCount = Object.keys(answers).length
    const isLastFiveMinutes = remainingSeconds < 300

    return (
      <div className="min-h-screen flex flex-col bg-background">
        {/* Top Floating Proctor Bar */}
        <header className="sticky top-0 z-40 border-b bg-card/95 backdrop-blur px-4 py-3 shadow-sm">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="font-black text-lg text-blue-600">HackKro</div>
              <div className="hidden sm:block border-l pl-3">
                <h2 className="text-sm font-semibold truncate max-w-xs">{test?.title}</h2>
                <p className="text-xs text-muted-foreground">{candidate?.name}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              {/* Fullscreen indicator & trigger */}
              <button
                type="button"
                onClick={enterFullscreen}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${
                  isFullscreen
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                    : "bg-red-500/10 text-red-500 border-red-500/30 animate-pulse"
                }`}
                title={isFullscreen ? "Full Screen Active" : "Click to enter full screen"}
              >
                {isFullscreen ? <Maximize className="w-3.5 h-3.5" /> : <Minimize className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">{isFullscreen ? "Full Screen Active" : "Enter Full Screen"}</span>
              </button>

              {/* Timer */}
              <div
                className={`flex items-center gap-2 px-4 py-1.5 rounded-full font-mono text-sm font-bold border transition-colors ${
                  isLastFiveMinutes
                    ? "bg-red-500/10 text-red-500 border-red-500/30 animate-pulse"
                    : "bg-muted text-foreground border-border"
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>{formatTimer(remainingSeconds)}</span>
              </div>

              {/* Submit Button */}
              <Button
                variant="default"
                size="sm"
                onClick={() => setShowSubmitConfirm(true)}
                className="bg-blue-600 hover:bg-blue-700 font-semibold"
              >
                <Send className="w-3.5 h-3.5 mr-1.5" /> Submit Test
              </Button>
            </div>
          </div>
        </header>

        {/* Main Examination Body */}
        <div className="flex-1 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-6 p-4 md:p-6">
          {/* Left Column: Active Question */}
          <div className="lg:col-span-8 space-y-4">
            {currentQuestion ? (
              <Card className="border-border">
                <CardHeader className="flex flex-row items-center justify-between pb-3 border-b">
                  <div className="space-y-1">
                    <Badge variant="secondary" className="font-semibold">
                      Question {currentQuestionIndex + 1} of {questions.length}
                    </Badge>
                    <span className="ml-2 text-xs text-muted-foreground">({currentQuestion.points} Mark)</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleMarkForReview(currentQuestion.id)}
                    className={`text-xs ${
                      markedForReview.has(currentQuestion.id) ? "text-purple-500 font-semibold" : "text-muted-foreground"
                    }`}
                  >
                    <Bookmark className="w-3.5 h-3.5 mr-1" />
                    {markedForReview.has(currentQuestion.id) ? "Marked for Review" : "Mark for Review"}
                  </Button>
                </CardHeader>

                <CardContent className="pt-6 space-y-6">
                  {/* Question Text */}
                  <h3 className="text-base md:text-lg font-medium leading-relaxed">
                    {currentQuestion.question}
                  </h3>

                  {/* Code Snippet Box (if present) */}
                  {currentQuestion.codeSnippet && (
                    <div className="rounded-xl overflow-hidden border border-border bg-[#0d1117] text-[#c9d1d9] font-mono text-xs md:text-sm p-4 leading-normal">
                      <pre className="overflow-x-auto whitespace-pre">{currentQuestion.codeSnippet}</pre>
                    </div>
                  )}

                  {/* Options List */}
                  <div className="space-y-3 pt-2">
                    {currentQuestion.options.map((opt, optIdx) => {
                      const isSelected = answers[currentQuestion.id] === opt.id
                      const optionLetters = ["A", "B", "C", "D", "E"]
                      return (
                        <div
                          key={opt.id}
                          onClick={() => handleSelectOption(currentQuestion.id, opt.id)}
                          className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                            isSelected
                              ? "border-blue-600 bg-blue-500/10 text-foreground ring-1 ring-blue-600"
                              : "border-border hover:bg-muted/50 hover:border-muted-foreground/30 text-foreground"
                          }`}
                        >
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                              isSelected ? "bg-blue-600 text-white" : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {optionLetters[optIdx]}
                          </div>
                          <div className="text-sm pt-0.5 leading-snug">{opt.text}</div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>

                {/* Bottom Navigation Buttons */}
                <CardFooter className="flex items-center justify-between border-t pt-4">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
                      disabled={currentQuestionIndex === 0}
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" /> Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentQuestionIndex((prev) => Math.min(questions.length - 1, prev + 1))}
                      disabled={currentQuestionIndex === questions.length - 1}
                    >
                      Next <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>

                  {answers[currentQuestion.id] && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleClearAnswer(currentQuestion.id)}
                      className="text-xs text-muted-foreground hover:text-red-500"
                    >
                      <RotateCcw className="w-3.5 h-3.5 mr-1" /> Clear Selection
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ) : null}
          </div>

          {/* Right Column: Question Palette */}
          <div className="lg:col-span-4 space-y-4">
            <Card>
              <CardHeader className="pb-3 border-b">
                <CardTitle className="text-sm font-semibold flex items-center justify-between">
                  <span>Question Palette</span>
                  <Badge variant="outline">{answeredCount} / {questions.length} Solved</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                {/* Legend */}
                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground pb-2 border-b">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded bg-green-500 inline-block" />
                    <span>Answered ({answeredCount})</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded bg-muted border inline-block" />
                    <span>Unanswered ({questions.length - answeredCount})</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded bg-purple-500 inline-block" />
                    <span>Review ({markedForReview.size})</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded border-2 border-blue-600 inline-block" />
                    <span>Current</span>
                  </div>
                </div>

                {/* Grid of question buttons */}
                <div className="grid grid-cols-5 gap-2">
                  {questions.map((q, idx) => {
                    const isAnswered = Boolean(answers[q.id])
                    const isReview = markedForReview.has(q.id)
                    const isCurrent = currentQuestionIndex === idx

                    let btnClass = "bg-muted text-muted-foreground hover:bg-muted/80"
                    if (isAnswered) {
                      btnClass = "bg-green-600 text-white hover:bg-green-700"
                    }
                    if (isReview) {
                      btnClass = "bg-purple-600 text-white hover:bg-purple-700"
                    }
                    if (isCurrent) {
                      btnClass += " ring-2 ring-blue-500 font-bold"
                    }

                    return (
                      <button
                        key={q.id}
                        type="button"
                        onClick={() => setCurrentQuestionIndex(idx)}
                        className={`h-9 rounded-lg text-xs font-semibold flex items-center justify-center transition-all ${btnClass}`}
                      >
                        {idx + 1}
                      </button>
                    )
                  })}
                </div>

                <div className="pt-2">
                  <Button
                    onClick={() => setShowSubmitConfirm(true)}
                    className="w-full bg-blue-600 hover:bg-blue-700 font-bold"
                  >
                    Finish & Submit Test
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Anti-cheat: Mandatory Full Screen Enforcement Alert */}
        <AlertDialog open={showFullscreenModal || (!isFullscreen && phase === "exam")}>
          <AlertDialogContent className="border-2 border-red-500/80 bg-card max-w-md">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-red-500 flex items-center gap-2 text-lg">
                <ShieldAlert className="w-6 h-6 animate-pulse" /> Full Screen Mode Required!
              </AlertDialogTitle>
              <AlertDialogDescription className="space-y-3 pt-2 text-foreground">
                <p className="text-sm">
                  You have exited full-screen mode. HackKro Assessment requires continuous full-screen view to ensure fair competition.
                </p>
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-red-500">
                  <strong>Proctoring Incident #{fullscreenExits}:</strong> Fullscreen exit has been logged in your assessment proctoring report.
                </div>
                <p className="text-xs text-muted-foreground">
                  Click the button below to re-enter full screen and resume your test questions immediately.
                </p>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <Button
                onClick={async () => {
                  await enterFullscreen()
                }}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold"
              >
                Return to Full Screen & Resume Test
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Anti-cheat Tab Warning Dialog */}
        <AlertDialog open={showTabWarning} onOpenChange={setShowTabWarning}>
          <AlertDialogContent className="border-red-500/50">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-red-500 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5" /> Tab Switch / Window Unfocus Detected!
              </AlertDialogTitle>
              <AlertDialogDescription className="space-y-2 pt-2">
                <p>
                  You have switched tabs or navigated away from the assessment window. This is incident{" "}
                  <strong>#{tabSwitches}</strong>.
                </p>
                <p className="text-xs text-muted-foreground">
                  HackKro proctoring tracks all browser events. Continued tab switching may lead to automatic disqualification.
                </p>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction onClick={() => setShowTabWarning(false)} className="bg-red-600 hover:bg-red-700">
                I Understand, Return to Test
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Submit Confirmation Dialog */}
        <Dialog open={showSubmitConfirm} onOpenChange={setShowSubmitConfirm}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Test Submission</DialogTitle>
              <DialogDescription>
                Are you sure you want to finish and submit your assessment?
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2 py-3 text-sm">
              <div className="flex justify-between py-1 border-b">
                <span className="text-muted-foreground">Total Questions:</span>
                <span className="font-semibold">{questions.length}</span>
              </div>
              <div className="flex justify-between py-1 border-b text-green-500">
                <span>Answered:</span>
                <span className="font-semibold">{answeredCount}</span>
              </div>
              <div className="flex justify-between py-1 border-b text-amber-500">
                <span>Unanswered:</span>
                <span className="font-semibold">{questions.length - answeredCount}</span>
              </div>
              <div className="flex justify-between py-1 text-purple-500">
                <span>Marked for Review:</span>
                <span className="font-semibold">{markedForReview.size}</span>
              </div>
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" onClick={() => setShowSubmitConfirm(false)}>
                Continue Test
              </Button>
              <Button
                onClick={() => handleFinalSubmit(false)}
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700 font-bold"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...
                  </>
                ) : (
                  "Yes, Submit Now"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  // =========================================================================
  // RENDER: 4. SUBMITTED VIEW (PENDING DECLARATION OR DECLARED RESULTS)
  // =========================================================================
  if (phase === "submitted") {
    const isDeclared = Boolean(test?.isResultDeclared && result?.score !== null && result?.score !== undefined)
    const percentage = isDeclared ? Math.round(((result?.score || 0) / (result?.totalMarks || 10)) * 100) : 0

    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-background via-muted/30 to-background">
        <div className="max-w-md w-full space-y-6">
          <Card className="border-border shadow-2xl text-center overflow-hidden">
            {isDeclared ? (
              // DECLARED RESULTS VIEW (Only when declared from Admin Panel)
              <>
                <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-6 text-white">
                  <div className="w-16 h-16 mx-auto rounded-full bg-white/20 backdrop-blur flex items-center justify-center mb-3">
                    <Award className="w-8 h-8 text-yellow-300" />
                  </div>
                  <h2 className="text-2xl font-black">Official Results Declared!</h2>
                  <p className="text-xs text-white/80 mt-1">{test?.title || "HackKro Technical Assessment"}</p>
                </div>

                <CardContent className="p-6 space-y-6">
                  {/* Rank Announcement */}
                  <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/30">
                    <p className="text-xs uppercase font-bold text-purple-400 tracking-wider">Your Official All-India Rank</p>
                    <div className="text-4xl font-black text-purple-600 dark:text-purple-400 mt-1">
                      #{result?.rank || 1}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Calculated based on total score and speed of completion.
                    </p>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-3 text-left">
                    <div className="p-3 rounded-lg border bg-card">
                      <span className="text-xs text-muted-foreground">Candidate</span>
                      <p className="font-semibold text-sm truncate">{candidate?.name}</p>
                    </div>
                    <div className="p-3 rounded-lg border bg-card">
                      <span className="text-xs text-muted-foreground">Score</span>
                      <p className="font-semibold text-sm">
                        {result?.score} / {result?.totalMarks} ({percentage}%)
                      </p>
                    </div>
                    <div className="p-3 rounded-lg border bg-card">
                      <span className="text-xs text-muted-foreground">Time Taken</span>
                      <p className="font-semibold text-sm">{result?.timeTakenFormatted}</p>
                    </div>
                    <div className="p-3 rounded-lg border bg-card">
                      <span className="text-xs text-muted-foreground">Status</span>
                      <p className="font-semibold text-sm text-green-500">Evaluated & Announced</p>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-xs text-blue-500 flex items-start gap-2 text-left">
                    <Mail className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>
                      Official score card and ranking details have been emailed to <strong>{candidate?.email}</strong>.
                    </span>
                  </div>
                </CardContent>
              </>
            ) : (
              // SUBMITTED - RESULTS PENDING ADMIN DECLARATION (Default after test completion!)
              <>
                <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 p-6 text-white">
                  <div className="w-16 h-16 mx-auto rounded-full bg-white/20 backdrop-blur flex items-center justify-center mb-3">
                    <CheckCircle2 className="w-9 h-9 text-white animate-bounce" />
                  </div>
                  <h2 className="text-2xl font-black">Assessment Submitted!</h2>
                  <p className="text-xs text-white/90 mt-1">{test?.title || "HackKro Technical Assessment"}</p>
                </div>

                <CardContent className="p-6 space-y-6">
                  {/* Status Banner */}
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400">
                    <div className="flex items-center justify-center gap-2 font-bold text-sm">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Responses Recorded Successfully</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1.5">
                      Your answers and completion time have been securely saved and submitted.
                    </p>
                  </div>

                  {/* Submission Summary Grid */}
                  <div className="grid grid-cols-2 gap-3 text-left">
                    <div className="p-3 rounded-lg border bg-card">
                      <span className="text-xs text-muted-foreground">Candidate</span>
                      <p className="font-semibold text-sm truncate">{candidate?.name}</p>
                    </div>
                    <div className="p-3 rounded-lg border bg-card">
                      <span className="text-xs text-muted-foreground">Event</span>
                      <p className="font-semibold text-sm truncate">{test?.eventTitle}</p>
                    </div>
                    <div className="p-3 rounded-lg border bg-card">
                      <span className="text-xs text-muted-foreground">Time Taken</span>
                      <p className="font-semibold text-sm">{result?.timeTakenFormatted || "Recorded"}</p>
                    </div>
                    <div className="p-3 rounded-lg border bg-card">
                      <span className="text-xs text-muted-foreground">Result Status</span>
                      <p className="font-semibold text-xs text-amber-500 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3.5 h-3.5" /> Pending Declaration
                      </p>
                    </div>
                  </div>

                  {/* Notice about Result Declaration */}
                  <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-left space-y-2">
                    <div className="font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1.5 text-sm">
                      📢 Official Result Declaration:
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                      Final scores, merit lists, and All-India ranks will be officially declared by the HackKro admin team once all participant events finish.
                    </p>
                    <p className="text-blue-600/90 dark:text-blue-400/90 font-medium pt-1">
                      ✉️ Your official score and rank card will be dispatched to <strong>{candidate?.email}</strong> when results are published.
                    </p>
                  </div>
                </CardContent>
              </>
            )}

            <CardFooter className="flex flex-col gap-2 p-6 pt-0">
              <Button variant="outline" className="w-full" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" /> Sign Out from Assessment
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    )
  }

  return null
}
