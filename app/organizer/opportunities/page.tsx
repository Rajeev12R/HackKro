"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import {
  Trophy,
  PlusCircle,
  Search,
  Users,
  FileCheck,
  Calendar,
  Layers,
  Edit,
  Trash2,
  Loader2,
} from "lucide-react"

export default function OpportunitiesListPage() {
  const { toast } = useToast()
  const [opportunities, setOpportunities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const loadOpportunities = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/organizer/opportunities")
      const data = await res.json()
      if (res.ok && data.success) {
        setOpportunities(data.opportunities || [])
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to load opportunities",
          variant: "destructive",
        })
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to connect to backend",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadOpportunities()
  }, [])

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return

    try {
      const res = await fetch(`/api/organizer/opportunities/${id}`, {
        method: "DELETE",
      })
      const data = await res.json()
      if (res.ok && data.success) {
        toast({
          title: "Opportunity Deleted",
          description: `"${title}" has been deleted.`,
        })
        loadOpportunities()
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to delete opportunity",
          variant: "destructive",
        })
      }
    } catch {
      toast({
        title: "Error",
        description: "Network error while deleting opportunity",
        variant: "destructive",
      })
    }
  }

  const filtered = opportunities.filter((opp) => {
    const matchesSearch =
      opp.title.toLowerCase().includes(search.toLowerCase()) ||
      opp.category.toLowerCase().includes(search.toLowerCase()) ||
      opp.slug.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === "all" || opp.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Your Opportunities</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Create, configure rounds, and monitor applicant registrations and submissions.
          </p>
        </div>
        <Link href="/organizer/opportunities/create">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs gap-1.5 shadow-sm">
            <PlusCircle className="h-4 w-4" />
            <span>Create Opportunity</span>
          </Button>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search opportunities by title, category, or slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 text-xs h-9"
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px] text-xs h-9">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="draft">Drafts</SelectItem>
            <SelectItem value="under_review">Under Review</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Content */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400" />
          <p className="text-sm text-muted-foreground">Loading opportunities...</p>
        </div>
      ) : filtered.length === 0 ? (
        <Card className="border-dashed p-12 text-center">
          <div className="mx-auto h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-3">
            <Trophy className="h-6 w-6" />
          </div>
          <h3 className="text-base font-semibold text-foreground">No Opportunities Found</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1 mb-4">
            {search || statusFilter !== "all"
              ? "No opportunities match your current search or filter criteria."
              : "Launch your first opportunity to invite participants, evaluate rounds, and manage teams."}
          </p>
          <Link href="/organizer/opportunities/create">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs">
              <PlusCircle className="h-3.5 w-3.5 mr-1.5" />
              Create Opportunity
            </Button>
          </Link>
        </Card>
      ) : (
        <Card className="overflow-hidden border shadow-sm">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="text-xs">Title & Category</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  <TableHead className="text-xs">Mode & Dates</TableHead>
                  <TableHead className="text-xs text-center">Rounds</TableHead>
                  <TableHead className="text-xs text-center">Registrations</TableHead>
                  <TableHead className="text-xs text-center">Submissions</TableHead>
                  <TableHead className="text-xs text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((opp) => (
                  <TableRow key={opp._id} className="hover:bg-muted/40 transition-colors">
                    <TableCell className="font-medium max-w-[240px]">
                      <div className="font-bold text-foreground text-sm truncate">{opp.title}</div>
                      <div className="text-xs text-blue-600 dark:text-blue-400">{opp.category}</div>
                      <div className="text-[10px] text-muted-foreground font-mono">/{opp.slug}</div>
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
                      <div>
                        <span className="font-medium">{opp.mode}</span>
                        {opp.location && <span className="text-muted-foreground"> • {opp.location}</span>}
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        {new Date(opp.startDate).toLocaleDateString()} -{" "}
                        {new Date(opp.endDate).toLocaleDateString()}
                      </div>
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
                      <div className="flex items-center justify-end gap-1.5 flex-wrap">
                        <Link href={`/organizer/opportunities/${opp._id}/rounds`}>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-[11px]"
                          >
                            Rounds ({opp.roundsCount || 0})
                          </Button>
                        </Link>

                        <Link href={`/organizer/opportunities/${opp._id}/registrations`}>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-[11px] text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900"
                          >
                            Roster ({opp.registeredCount || 0})
                          </Button>
                        </Link>

                        <Link href={`/organizer/opportunities/${opp._id}/submissions`}>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-[11px] text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-900"
                          >
                            Review ({opp.submissionCount || 0})
                          </Button>
                        </Link>

                        <Link href={`/organizer/opportunities/${opp._id}/edit`}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                            title="Edit Opportunity"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                        </Link>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(opp._id, opp.title)}
                          className="h-7 w-7 p-0 text-muted-foreground hover:text-rose-600"
                          title="Delete"
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
        </Card>
      )}
    </div>
  )
}
