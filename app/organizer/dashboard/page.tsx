"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import { useOrganizerAuth } from "../auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import {
  Trophy,
  Users,
  FileCheck2,
  Clock,
  PlusCircle,
  ChevronRight,
  Calendar,
  Layers,
  Loader2,
  Building,
} from "lucide-react"

interface DashboardStats {
  totalOpportunities: number
  publishedOpportunities: number
  draftOpportunities: number
  underReviewOpportunities: number
  totalRegistrations: number
  teamRegistrations: number
  soloRegistrations: number
  totalSubmissions: number
  pendingReviews: number
  shortlistedCount: number
}

interface OpportunityItem {
  _id: string
  title: string
  slug: string
  category: string
  mode: string
  startDate: string
  endDate: string
  registrationDeadline: string
  status: "draft" | "under_review" | "published" | "completed" | "archived"
  isPublished: boolean
  registeredCount: number
  submissionCount: number
  roundsCount: number
}

export default function OrganizerDashboardPage() {
  const { organizer } = useOrganizerAuth()
  const { toast } = useToast()

  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [deadlines, setDeadlines] = useState<any[]>([])
  const [opportunities, setOpportunities] = useState<OpportunityItem[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    setLoading(true)
    try {
      const [statsRes, oppsRes] = await Promise.all([
        fetch("/api/organizer/dashboard/stats"),
        fetch("/api/organizer/opportunities"),
      ])

      const statsData = await statsRes.json()
      const oppsData = await oppsRes.json()

      if (statsRes.ok && statsData.success) {
        setStats(statsData.stats)
        setDeadlines(statsData.upcomingDeadlines || [])
      }

      if (oppsRes.ok && oppsData.success) {
        setOpportunities(oppsData.opportunities || [])
      }
    } catch {
      toast({
        title: "Error loading dashboard",
        description: "Failed to fetch live organizer statistics.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const isVerified = organizer?.verificationStatus === "verified"

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Welcome & Organization Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Organizer Overview
            </h1>
            {isVerified ? (
              <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 text-xs">
                Verified Organization
              </Badge>
            ) : (
              <Badge className="bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30 text-xs">
                Pending Verification
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1.5">
            <Building className="h-4 w-4" />
            <span>
              Managing opportunities for{" "}
              <strong className="text-foreground">
                {organizer?.organization?.name || organizer?.name}
              </strong>
            </span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/organizer/opportunities/create">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white font-medium gap-2 shadow-sm">
              <PlusCircle className="h-4 w-4" />
              <span>Create Opportunity</span>
            </Button>
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400" />
          <p className="text-sm text-muted-foreground">Loading accurate live metrics...</p>
        </div>
      ) : (
        <>
          {/* Top 4 Metrics Cards (Backend Driven) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Opportunities */}
            <Card className="hover:shadow-md transition-shadow border">
              <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Total Opportunities
                </CardTitle>
                <div className="h-8 w-8 rounded-lg bg-blue-100 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <Trophy className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-black text-foreground">
                  {stats?.totalOpportunities || 0}
                </div>
                <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                    {stats?.publishedOpportunities || 0} Live
                  </span>
                  <span>•</span>
                  <span>{stats?.draftOpportunities || 0} Drafts</span>
                  {stats && stats.underReviewOpportunities > 0 && (
                    <>
                      <span>•</span>
                      <span className="text-amber-600 dark:text-amber-400 font-semibold">
                        {stats.underReviewOpportunities} In Review
                      </span>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Card 2: Registrations */}
            <Card className="hover:shadow-md transition-shadow border">
              <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Total Registrations
                </CardTitle>
                <div className="h-8 w-8 rounded-lg bg-purple-100 dark:bg-purple-950/60 flex items-center justify-center text-purple-600 dark:text-purple-400">
                  <Users className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-black text-foreground">
                  {stats?.totalRegistrations || 0}
                </div>
                <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                  <span>{stats?.soloRegistrations || 0} Solo</span>
                  <span>•</span>
                  <span className="text-purple-600 dark:text-purple-400 font-semibold">
                    {stats?.teamRegistrations || 0} Teams
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Card 3: Submissions */}
            <Card className="hover:shadow-md transition-shadow border">
              <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Total Submissions
                </CardTitle>
                <div className="h-8 w-8 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <FileCheck2 className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-black text-foreground">
                  {stats?.totalSubmissions || 0}
                </div>
                <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                    {stats?.shortlistedCount || 0} Shortlisted
                  </span>
                  <span>across rounds</span>
                </div>
              </CardContent>
            </Card>

            {/* Card 4: Pending Reviews */}
            <Card className="hover:shadow-md transition-shadow border">
              <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Pending Reviews
                </CardTitle>
                <div className="h-8 w-8 rounded-lg bg-amber-100 dark:bg-amber-950/60 flex items-center justify-center text-amber-600 dark:text-amber-400">
                  <Clock className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-black text-amber-600 dark:text-amber-400">
                  {stats?.pendingReviews || 0}
                </div>
                <div className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground">
                  <span>Awaiting evaluation & scoring</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Deadlines Widget (if any) */}
          {deadlines.length > 0 && (
            <div className="rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50/60 dark:bg-blue-950/20 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400 font-semibold text-xs uppercase tracking-wider">
                  <Calendar className="h-4 w-4" />
                  <span>Upcoming Registration Deadlines</span>
                </div>
                <span className="text-xs text-blue-600 dark:text-blue-300 font-medium">Active Events</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {deadlines.map((d) => (
                  <div
                    key={d.id}
                    className="rounded-lg bg-card border p-3 flex flex-col justify-between shadow-sm"
                  >
                    <div>
                      <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 uppercase">
                        {d.category}
                      </span>
                      <h4 className="text-sm font-bold text-foreground truncate">{d.title}</h4>
                    </div>
                    <div className="mt-2 text-xs text-muted-foreground flex items-center justify-between border-t pt-2">
                      <span>Registration Closes:</span>
                      <span className="font-semibold text-amber-600 dark:text-amber-400">
                        {new Date(d.deadline).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Opportunities Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold tracking-tight text-foreground">Your Opportunities</h2>
                <p className="text-xs text-muted-foreground">
                  Manage rounds, view rosters, and evaluate submissions for your events.
                </p>
              </div>
              <Link href="/organizer/opportunities">
                <Button variant="ghost" size="sm" className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700">
                  <span>View All Opportunities</span>
                  <ChevronRight className="h-3.5 w-3.5 ml-1" />
                </Button>
              </Link>
            </div>

            {opportunities.length === 0 ? (
              <Card className="border-dashed p-10 text-center">
                <div className="mx-auto h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-3">
                  <Trophy className="h-6 w-6" />
                </div>
                <h3 className="text-base font-semibold text-foreground">No Opportunities Created Yet</h3>
                <p className="text-xs text-muted-foreground max-w-md mx-auto mt-1 mb-4">
                  Start by launching your first hackathon or technical quiz. You can save as a draft or
                  submit for verification.
                </p>
                <Link href="/organizer/opportunities/create">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs">
                    <PlusCircle className="h-3.5 w-3.5 mr-1.5" />
                    Create First Opportunity
                  </Button>
                </Link>
              </Card>
            ) : (
              <Card className="overflow-hidden border shadow-sm">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-muted/50">
                      <TableRow>
                        <TableHead className="text-xs">Opportunity</TableHead>
                        <TableHead className="text-xs">Status</TableHead>
                        <TableHead className="text-xs">Mode</TableHead>
                        <TableHead className="text-xs text-center">Rounds</TableHead>
                        <TableHead className="text-xs text-center">Registrations</TableHead>
                        <TableHead className="text-xs text-center">Submissions</TableHead>
                        <TableHead className="text-xs text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {opportunities.slice(0, 5).map((opp) => (
                        <TableRow key={opp._id} className="hover:bg-muted/40 transition-colors">
                          <TableCell className="font-medium">
                            <div className="font-semibold text-foreground text-sm">{opp.title}</div>
                            <div className="text-xs text-muted-foreground">{opp.category}</div>
                          </TableCell>

                          <TableCell>
                            {opp.status === "published" ? (
                              <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 text-[11px]">
                                Published
                              </Badge>
                            ) : opp.status === "under_review" ? (
                              <Badge className="bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30 text-[11px]">
                                Under Review
                              </Badge>
                            ) : (
                              <Badge className="bg-muted text-muted-foreground border text-[11px]">
                                Draft
                              </Badge>
                            )}
                          </TableCell>

                          <TableCell className="text-xs text-foreground">
                            {opp.mode}
                          </TableCell>

                          <TableCell className="text-xs text-center font-semibold">
                            {opp.roundsCount || 0}
                          </TableCell>

                          <TableCell className="text-xs text-center font-bold text-blue-600 dark:text-blue-400">
                            {opp.registeredCount || 0}
                          </TableCell>

                          <TableCell className="text-xs text-center font-bold text-indigo-600 dark:text-indigo-400">
                            {opp.submissionCount || 0}
                          </TableCell>

                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <Link href={`/organizer/opportunities/${opp._id}/rounds`}>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-7 text-[11px]"
                                >
                                  Rounds
                                </Button>
                              </Link>

                              <Link href={`/organizer/opportunities/${opp._id}/registrations`}>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-7 text-[11px] text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900"
                                >
                                  Roster ({opp.registeredCount})
                                </Button>
                              </Link>

                              <Link href={`/organizer/opportunities/${opp._id}/submissions`}>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-7 text-[11px] text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-900"
                                >
                                  Review ({opp.submissionCount})
                                </Button>
                              </Link>

                              <Link href={`/organizer/opportunities/${opp._id}/edit`}>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 text-[11px] text-muted-foreground hover:text-foreground"
                                >
                                  Edit
                                </Button>
                              </Link>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </Card>
            )}
          </div>
        </>
      )}
    </div>
  )
}
