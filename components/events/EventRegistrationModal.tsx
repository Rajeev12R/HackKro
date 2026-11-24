"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import {
  Calendar,
  MapPin,
  Users,
  CheckCircle2,
  Copy,
  Check,
  AlertCircle,
  Loader2,
  Trophy,
  ExternalLink,
  Plus,
  Trash2,
} from "lucide-react"
import type { EventItem } from "@/lib/events-data"

interface EventRegistrationModalProps {
  event: EventItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: (registrationId: string) => void
}

interface TeamMemberInput {
  name: string
  email: string
}

export function EventRegistrationModal({
  event,
  open,
  onOpenChange,
  onSuccess,
}: EventRegistrationModalProps) {
  const { toast } = useToast()

  // Form states
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [college, setCollege] = useState("")
  const [graduationYear, setGraduationYear] = useState("2026")
  const [branch, setBranch] = useState("")
  const [participationType, setParticipationType] = useState<"solo" | "team">("solo")
  const [teamName, setTeamName] = useState("")
  const [teamMembers, setTeamMembers] = useState<TeamMemberInput[]>([
    { name: "", email: "" },
  ])
  const [domain, setDomain] = useState("Web/App Development")
  const [githubUrl, setGithubUrl] = useState("")
  const [linkedinUrl, setLinkedinUrl] = useState("")
  const [agreedToTerms, setAgreedToTerms] = useState(false)

  // Status states
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [registrationSuccess, setRegistrationSuccess] = useState<null | {
    registrationId: string
    name: string
    eventTitle: string
    participationType: string
    teamName?: string
  }>(null)
  const [copied, setCopied] = useState(false)

  if (!event) return null

  const handleAddTeamMember = () => {
    if (teamMembers.length < (event.teamSize?.max ? event.teamSize.max - 1 : 3)) {
      setTeamMembers([...teamMembers, { name: "", email: "" }])
    } else {
      toast({
        title: "Max Team Limit Reached",
        description: `This event allows a maximum of ${event.teamSize?.max || 1} members per team.`,
        variant: "destructive",
      })
    }
  }

  const handleRemoveTeamMember = (index: number) => {
    setTeamMembers(teamMembers.filter((_, i) => i !== index))
  }

  const handleUpdateTeamMember = (index: number, field: "name" | "email", value: string) => {
    const updated = [...teamMembers]
    updated[index][field] = value
    setTeamMembers(updated)
  }

  const handleCopyId = () => {
    if (registrationSuccess?.registrationId) {
      navigator.clipboard.writeText(registrationSuccess.registrationId)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      toast({
        title: "Pass ID Copied!",
        description: "Your registration pass ID has been copied to your clipboard.",
      })
    }
  }

  const resetForm = () => {
    setName("")
    setEmail("")
    setPhone("")
    setCollege("")
    setGraduationYear("2026")
    setBranch("")
    setParticipationType("solo")
    setTeamName("")
    setTeamMembers([{ name: "", email: "" }])
    setDomain("Web/App Development")
    setGithubUrl("")
    setLinkedinUrl("")
    setAgreedToTerms(false)
    setRegistrationSuccess(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim() || !email.trim() || !phone.trim() || !college.trim()) {
      toast({
        title: "Missing Required Fields",
        description: "Please fill in all mandatory fields: Name, Email, Phone, and College.",
        variant: "destructive",
      })
      return
    }

    if (participationType === "team") {
      if (!teamName.trim()) {
        toast({
          title: "Team Name Required",
          description: "Please specify a name for your team.",
          variant: "destructive",
        })
        return
      }
    }

    if (!agreedToTerms) {
      toast({
        title: "Agreement Required",
        description: "Please agree to the event rules and code of conduct.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/events/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: event.id,
          eventTitle: event.title,
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          college: college.trim(),
          graduationYear,
          branch: branch.trim(),
          participationType,
          teamName: participationType === "team" ? teamName.trim() : undefined,
          teamMembers: participationType === "team" ? teamMembers : [],
          domain,
          githubUrl: githubUrl.trim(), 
          linkedinUrl: linkedinUrl.trim(),
        }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setRegistrationSuccess({
          registrationId: data.registrationId,
          name: name.trim(),
          eventTitle: event.title,
          participationType,
          teamName: participationType === "team" ? teamName.trim() : undefined,
        })
        if (onSuccess) onSuccess(data.registrationId)
        toast({
          title: "Registration Confirmed! 🎉",
          description: `Pass ID: ${data.registrationId}. Confirmation email sent.`,
        })
      } else if (response.status === 409) {
        toast({
          title: "Already Registered!",
          description: data.message,
          variant: "destructive",
        })
        if (data.registrationId) {
          setRegistrationSuccess({
            registrationId: data.registrationId,
            name: name.trim() || "Participant",
            eventTitle: event.title,
            participationType,
            teamName: teamName.trim() || undefined,
          })
        }
      } else {
        toast({
          title: "Registration Failed",
          description: data.message || "Something went wrong. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Network Error",
        description: "Failed to connect to the server. Please check your internet connection.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    onOpenChange(false)
    if (registrationSuccess) {
      setTimeout(resetForm, 300)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto p-0 sm:rounded-2xl">
        {/* Header Banner */}
        <div className="relative bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 p-6 text-white sm:p-8">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-sm">
              {event.category}
            </span>
            <span className="rounded-full bg-emerald-400/20 px-3 py-1 text-xs font-semibold text-emerald-200 backdrop-blur-sm">
              {event.registrationFee || "Free Entry"}
            </span>
          </div>

          <DialogTitle className="mt-3 text-xl font-bold tracking-tight text-white sm:text-2xl">
            {event.title}
          </DialogTitle>
          <DialogDescription className="mt-1 text-sm text-blue-100">
            {event.tagline || event.description}
          </DialogDescription>

          <div className="mt-4 flex flex-wrap gap-4 text-xs font-medium text-blue-100 sm:text-sm">
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              <span>{event.date}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4" />
              <span>{event.mode} • {event.venue || event.location}</span>
            </div>
            {event.prizePool && (
              <div className="flex items-center gap-1.5">
                <Trophy className="h-4 w-4 text-amber-300" />
                <span>{event.prizePool}</span>
              </div>
            )}
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8">
          {registrationSuccess ? (
            /* Digital Pass Ticket Success Card */
            <div className="space-y-6 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-950/40 dark:text-green-400">
                <CheckCircle2 className="h-10 w-10 animate-bounce" />
              </div>

              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Registration Confirmed!
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Your spot for <strong>{registrationSuccess.eventTitle}</strong> is booked.
                </p>
              </div>

              {/* Ticket Card */}
              <div className="relative mx-auto max-w-md overflow-hidden rounded-xl border-2 border-dashed border-blue-500 bg-gradient-to-b from-blue-50/50 to-white p-6 shadow-sm dark:from-blue-950/20 dark:to-background">
                <div className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                  Official Registration Pass
                </div>
                <div className="my-2 flex items-center justify-center gap-2">
                  <span className="font-mono text-2xl font-black tracking-widest text-blue-700 dark:text-blue-300">
                    {registrationSuccess.registrationId}
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={handleCopyId}
                  >
                    {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>

                <div className="mt-4 border-t border-slate-200 pt-3 text-left text-xs space-y-1.5 dark:border-slate-800">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Participant:</span>
                    <span className="font-medium text-foreground">{registrationSuccess.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Type:</span>
                    <span className="font-medium capitalize text-foreground">
                      {registrationSuccess.participationType}
                    </span>
                  </div>
                  {registrationSuccess.teamName && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Team Name:</span>
                      <span className="font-medium text-foreground">{registrationSuccess.teamName}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Verification:</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">Verified ✅</span>
                  </div>
                </div>
              </div>

              <div className="rounded-lg bg-slate-50 p-4 text-xs text-muted-foreground dark:bg-slate-900/50">
                A confirmation has been sent to your registered email. Further updates, Discord server invites,
                and competition briefs will be shared closer to the date.
              </div>

              <div className="flex justify-center gap-3">
                <Button onClick={handleClose} className="bg-blue-600 hover:bg-blue-700 px-8">
                  Done
                </Button>
              </div>
            </div>
          ) : (
            /* Registration Form */
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Participation Mode */}
              <div className="space-y-3 rounded-xl border p-4 bg-muted/30">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-semibold">Participation Mode</Label>
                  <span className="rounded-full bg-blue-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-blue-600 dark:text-blue-400 border border-blue-500/20">
                    Solo Registration Active
                  </span>
                </div>

                <div className="grid sm:grid-cols-2 gap-3 pt-1">
                  <div className="flex items-start space-x-3 rounded-lg border-2 border-blue-600 bg-blue-50/60 p-3 dark:border-blue-500 dark:bg-blue-950/30">
                    <div className="h-4 w-4 rounded-full border-2 border-blue-600 bg-blue-600 flex items-center justify-center mt-0.5 shrink-0">
                      <div className="h-1.5 w-1.5 rounded-full bg-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-foreground">Individual (Solo)</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Register as an individual candidate for the assessment.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 rounded-lg border border-dashed border-muted-foreground/30 p-3 bg-muted/20 opacity-60 cursor-not-allowed">
                    <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/40 mt-0.5 shrink-0" />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <p className="font-semibold text-sm text-muted-foreground">Team Participation</p>
                        <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                          Coming Soon
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Team registration will be enabled for future hackathon rounds.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Primary Contact Details */}
              <div className="space-y-4">
                <div className="text-sm font-semibold text-foreground">
                  {participationType === "team" ? "Team Leader Details" : "Your Details"}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      placeholder="e.g. Rahul Sharma"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="e.g. rahul@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone / WhatsApp *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="10-digit mobile number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="college">College / University / Company *</Label>
                    <Input
                      id="college"
                      placeholder="e.g. Meerut Institute of Tech, AKTU"
                      value={college}
                      onChange={(e) => setCollege(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="graduationYear">Graduation Year</Label>
                    <Select value={graduationYear} onValueChange={setGraduationYear}>
                      <SelectTrigger id="graduationYear">
                        <SelectValue placeholder="Select year" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2025">2025</SelectItem>
                        <SelectItem value="2026">2026</SelectItem>
                        <SelectItem value="2027">2027</SelectItem>
                        <SelectItem value="2028">2028</SelectItem>
                        <SelectItem value="2029">2029+</SelectItem>
                        <SelectItem value="Graduated">Graduated / Working Professional</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="branch">Branch / Field of Study</Label>
                    <Input
                      id="branch"
                      placeholder="e.g. CSE, IT, ECE, BCA"
                      value={branch}
                      onChange={(e) => setBranch(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Technical Profile & Track */}
              <div className="space-y-4 border-t pt-4">
                <div className="text-sm font-semibold text-foreground">Track & Profiles</div>

                <div className="space-y-2">
                  <Label htmlFor="domain">Preferred Track / Tech Domain</Label>
                  <Select value={domain} onValueChange={setDomain}>
                    <SelectTrigger id="domain">
                      <SelectValue placeholder="Select track" />
                    </SelectTrigger>
                    <SelectContent>
                      {event.tracks && event.tracks.length > 0 ? (
                        event.tracks.map((t) => (
                          <SelectItem key={t} value={t}>
                            {t}
                          </SelectItem>
                        ))
                      ) : (
                        <>
                          <SelectItem value="Web/App Development">Web & Mobile Application</SelectItem>
                          <SelectItem value="AI/Machine Learning">AI & Machine Learning</SelectItem>
                          <SelectItem value="Cloud & DevOps">Cloud Computing & DevOps</SelectItem>
                          <SelectItem value="Cybersecurity">Cybersecurity & Forensics</SelectItem>
                          <SelectItem value="Open Innovation">Open Innovation / Other</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="githubUrl" className="text-xs">GitHub Profile URL (Optional)</Label>
                    <Input
                      id="githubUrl"
                      placeholder="https://github.com/username"
                      value={githubUrl}
                      onChange={(e) => setGithubUrl(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="linkedinUrl" className="text-xs">LinkedIn Profile URL (Optional)</Label>
                    <Input
                      id="linkedinUrl"
                      placeholder="https://linkedin.com/in/username"
                      value={linkedinUrl}
                      onChange={(e) => setLinkedinUrl(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Agreement */}
              <div className="flex items-start space-x-2 pt-2">
                <Checkbox
                  id="terms"
                  checked={agreedToTerms}
                  onCheckedChange={(checked) => setAgreedToTerms(Boolean(checked))}
                  className="mt-1"
                />
                <Label htmlFor="terms" className="text-xs text-muted-foreground leading-snug cursor-pointer">
                  I agree to abide by the HackKro Code of Conduct, confirm that all information provided is accurate,
                  and consent to receiving event communications.
                </Label>
              </div>

              {/* Submit Button */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t">
                <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || !agreedToTerms}
                  className="min-w-[160px] bg-blue-600 hover:bg-blue-700"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Registering...
                    </>
                  ) : (
                    "Complete Registration"
                  )}
                </Button>
              </div>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
  
