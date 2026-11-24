"use client"

import React, { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import {
  ArrowLeft,
  Search,
  Download,
  Users,
  User,
  Eye,
  Loader2,
  Mail,
  Phone,
  Github,
  Linkedin,
} from "lucide-react"

export default function RegistrationsRosterPage() {
  const params = useParams()
  const { toast } = useToast()
  const oppId = params.id as string

  const [loading, setLoading] = useState(true)
  const [opportunity, setOpportunity] = useState<any>(null)
  const [registrations, setRegistrations] = useState<any[]>([])
  const [stats, setStats] = useState<any>({
    total: 0,
    soloCount: 0,
    teamCount: 0,
    confirmedCount: 0,
    waitlistCount: 0,
  })
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 15,
    total: 0,
    totalPages: 1,
  })

  // Search & Filter State
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")

  // Selected Registration Modal
  const [selectedReg, setSelectedReg] = useState<any | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)

  const loadRegistrations = async (page = 1) => {
    setLoading(true)
    try {
      const url = new URL(
        `/api/organizer/opportunities/${oppId}/registrations`,
        window.location.origin
      )
      url.searchParams.set("page", String(page))
      url.searchParams.set("limit", String(pagination.limit))
      if (search) url.searchParams.set("search", search)
      if (typeFilter !== "all") url.searchParams.set("type", typeFilter)
      if (statusFilter !== "all") url.searchParams.set("status", statusFilter)

      const res = await fetch(url.toString())
      const data = await res.json()

      if (res.ok && data.success) {
        setOpportunity(data.opportunity)
        setRegistrations(data.registrations || [])
        setPagination(data.pagination)
        if (data.stats) setStats(data.stats)
      } else {
        toast({
          title: "Access Denied or Error",
          description: data.message || "Failed to load registrations roster.",
          variant: "destructive",
        })
      }
    } catch {
      toast({
        title: "Network Error",
        description: "Failed to connect to registrations service.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (oppId) loadRegistrations(1)
  }, [oppId, typeFilter, statusFilter])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    loadRegistrations(1)
  }

  const handleExportCSV = () => {
    const exportUrl = `/api/organizer/opportunities/${oppId}/registrations?format=csv&search=${encodeURIComponent(
      search
    )}&type=${typeFilter}&status=${statusFilter}`
    window.open(exportUrl, "_blank")
    toast({
      title: "Downloading CSV Roster 📊",
      description: "Generating secure roster export scoped to your event.",
    })
  }

  const openDetails = (reg: any) => {
    setSelectedReg(reg)
    setDetailsOpen(true)
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between pb-4 border-b">
        <Link
          href={`/organizer/opportunities`}
          className="flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Opportunities</span>
        </Link>
        <div className="flex items-center gap-2">
          <Link href={`/organizer/opportunities/${oppId}/rounds`}>
            <Button variant="outline" size="sm" className="h-7 text-xs">
              Configure Rounds
            </Button>
          </Link>
          <Link href={`/organizer/opportunities/${oppId}/submissions`}>
            <Button variant="outline" size="sm" className="h-7 text-xs text-indigo-600 dark:text-indigo-400">
              Review Submissions
            </Button>
          </Link>
        </div>
      </div>

      {/* Title & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
            Applicant & Roster Management
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Registration Roster: {opportunity?.title || "Loading..."}
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Participant entries synced from the live HackKro registration portal.
          </p>
        </div>

        <Button
          onClick={handleExportCSV}
          disabled={stats.total === 0}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs gap-1.5 shadow-sm"
        >
          <Download className="h-3.5 w-3.5" />
          <span>Export CSV Roster</span>
        </Button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-4 border">
          <div className="text-xs text-muted-foreground font-medium">Total Registrations</div>
          <div className="text-2xl font-black text-foreground mt-1">{stats.total}</div>
        </Card>

        <Card className="p-4 border">
          <div className="text-xs text-muted-foreground font-medium">Solo Participants</div>
          <div className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">{stats.soloCount}</div>
        </Card>

        <Card className="p-4 border">
          <div className="text-xs text-muted-foreground font-medium">Team Registrations</div>
          <div className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1">{stats.teamCount}</div>
        </Card>

        <Card className="p-4 border">
          <div className="text-xs text-muted-foreground font-medium">Confirmed Passes</div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{stats.confirmedCount}</div>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by candidate name, email, pass ID, team name, or college..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 text-xs h-9"
          />
        </form>

        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-[150px] text-xs h-9">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="solo">Solo Only</SelectItem>
            <SelectItem value="team">Teams Only</SelectItem>
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[150px] text-xs h-9">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="waitlist">Waitlist</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table Roster */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400" />
          <p className="text-sm text-muted-foreground">Loading registrations roster...</p>
        </div>
      ) : registrations.length === 0 ? (
        <Card className="border-dashed p-12 text-center">
          <div className="mx-auto h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-3">
            <Users className="h-6 w-6" />
          </div>
          <h3 className="text-base font-semibold text-foreground">No Registrations Yet</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1">
            {search || typeFilter !== "all" || statusFilter !== "all"
              ? "No participants match the selected search or filter criteria."
              : "Registrations received through the HackKro public event page will appear here in real-time."}
          </p>
        </Card>
      ) : (
        <Card className="overflow-hidden border shadow-sm">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="text-xs">Pass ID</TableHead>
                  <TableHead className="text-xs">Participant / Leader</TableHead>
                  <TableHead className="text-xs">Type & Team</TableHead>
                  <TableHead className="text-xs">College / Institution</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  <TableHead className="text-xs">Registered</TableHead>
                  <TableHead className="text-xs text-right">Profile</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {registrations.map((reg) => (
                  <TableRow key={reg._id} className="hover:bg-muted/40 transition-colors">
                    <TableCell className="font-mono text-xs font-semibold text-blue-600 dark:text-blue-400">
                      {reg.registrationId}
                    </TableCell>

                    <TableCell>
                      <div className="font-semibold text-foreground text-xs">{reg.name}</div>
                      <div className="text-[11px] text-muted-foreground">{reg.email}</div>
                    </TableCell>

                    <TableCell className="text-xs">
                      {reg.participationType === "team" ? (
                        <div>
                          <Badge className="bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/30 text-[10px] gap-1">
                            <Users className="h-3 w-3" />
                            {reg.teamName || "Team"}
                          </Badge>
                          <div className="text-[10px] text-muted-foreground mt-0.5">
                            {1 + (reg.teamMembers?.length || 0)} members
                          </div>
                        </div>
                      ) : (
                        <Badge className="bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/30 text-[10px] gap-1">
                          <User className="h-3 w-3" />
                          Solo
                        </Badge>
                      )}
                    </TableCell>

                    <TableCell className="text-xs text-foreground/80 max-w-[200px] truncate">
                      {reg.college}
                    </TableCell>

                    <TableCell>
                      {reg.status === "confirmed" ? (
                        <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 text-[10px]">
                          Confirmed
                        </Badge>
                      ) : (
                        <Badge className="bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30 text-[10px]">
                          {reg.status}
                        </Badge>
                      )}
                    </TableCell>

                    <TableCell className="text-[11px] text-muted-foreground">
                      {new Date(reg.registeredAt).toLocaleDateString()}
                    </TableCell>

                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openDetails(reg)}
                        className="h-7 text-xs gap-1"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>View</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div className="p-3 border-t flex items-center justify-between text-xs text-muted-foreground">
              <div>
                Showing {(pagination.page - 1) * pagination.limit + 1} -{" "}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page <= 1}
                  onClick={() => loadRegistrations(pagination.page - 1)}
                  className="h-7 text-xs"
                >
                  Previous
                </Button>
                <span>
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => loadRegistrations(pagination.page + 1)}
                  className="h-7 text-xs"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Participant Profile Modal */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-base">Participant Profile</DialogTitle>
              <Badge className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30 text-xs font-mono">
                {selectedReg?.registrationId}
              </Badge>
            </div>
            <DialogDescription className="text-xs text-muted-foreground">
              Registered for {opportunity?.title}
            </DialogDescription>
          </DialogHeader>

          {selectedReg && (
            <div className="space-y-4 py-2 text-xs">
              <div className="p-3 rounded-lg bg-muted/50 border space-y-2">
                <div className="text-sm font-bold text-foreground">{selectedReg.name}</div>
                <div className="grid grid-cols-2 gap-2 text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                    <span>{selectedReg.email}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>{selectedReg.phone}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <span className="text-muted-foreground font-medium">College / University:</span>
                  <div className="text-foreground font-semibold">{selectedReg.college}</div>
                </div>
                <div className="space-y-1">
                  <span className="text-muted-foreground font-medium">Graduation & Branch:</span>
                  <div className="text-foreground">
                    {selectedReg.branch || "General"} ({selectedReg.graduationYear || "N/A"})
                  </div>
                </div>
              </div>

              {selectedReg.participationType === "team" && (
                <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 space-y-2">
                  <div className="font-bold text-purple-700 dark:text-purple-300 flex items-center gap-1.5">
                    <Users className="h-4 w-4" />
                    <span>Team: {selectedReg.teamName}</span>
                  </div>
                  {selectedReg.teamMembers && selectedReg.teamMembers.length > 0 ? (
                    <div className="space-y-1">
                      <span className="text-muted-foreground text-[11px]">Team Members:</span>
                      {selectedReg.teamMembers.map((m: any, i: number) => (
                        <div key={i} className="text-foreground pl-2 border-l border-purple-400">
                          {m.name} - <span className="text-muted-foreground">{m.email}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-muted-foreground text-[11px]">Leader registered solo for team</div>
                  )}
                </div>
              )}

              {(selectedReg.githubUrl || selectedReg.linkedinUrl) && (
                <div className="flex items-center gap-3 pt-2 border-t">
                  {selectedReg.githubUrl && (
                    <a
                      href={selectedReg.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-muted-foreground hover:text-foreground"
                    >
                      <Github className="h-3.5 w-3.5" />
                      <span>GitHub</span>
                    </a>
                  )}
                  {selectedReg.linkedinUrl && (
                    <a
                      href={selectedReg.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      <Linkedin className="h-3.5 w-3.5" />
                      <span>LinkedIn</span>
                    </a>
                  )}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
